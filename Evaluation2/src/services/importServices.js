import Papa from 'papaparse'
import JSZip from 'jszip'
import { glpiFetch, glpiPost, glpiUploadDocument, glpiPut } from '@/services/glpiServices'

const ASSET_TYPES = ['Computer', 'Monitor', 'Printer', 'Phone', 'NetworkEquipment']

export function parseCSV(file) {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data)
    })
  })
}

// ── Cache layer ──────────────────────────────────────────────
// Avoids duplicate API calls for same name+endpoint within a single import run.
// Must be cleared at the start of every top-level import so stale IDs from a
// previous session (or after a data reset) are never reused.
const cache = {}

function clearCache() {
  Object.keys(cache).forEach(k => delete cache[k])
}

async function findOrCreate(endpoint, name) {
  const key = `${endpoint}::${name}`
  if (cache[key]) return cache[key]  // already fetched

  const res = await glpiFetch(`/${endpoint}?searchText[name]=${encodeURIComponent(name)}`)
  const items = await res.json()

  if (items.length > 0) {
    cache[key] = items[0].id
    return items[0].id
  }

  const created = await glpiPost(`/${endpoint}`, { name })
  cache[key] = created.id
  return created.id
}

async function findOrCreateUser(fullName) {
  const key = `User::${fullName}`
  if (cache[key]) return cache[key]  // already fetched

  const res = await glpiFetch(`/User?searchText[name]=${encodeURIComponent(fullName)}`)
  const items = await res.json()

  if (items.length > 0) {
    cache[key] = items[0].id
    return items[0].id
  }

  const created = await glpiPost('/User', {
    name: fullName,
    password: 'Glpi1234!',
    password2: 'Glpi1234!',
    is_active: 1
  })
  cache[key] = created.id
  return created.id
}

async function findAssetByName(name) {
  const key = `Asset::${name}`
  if (cache[key]) return cache[key]  // already fetched

  for (const type of ASSET_TYPES) {
    const res = await glpiFetch(`/${type}?searchText[name]=${encodeURIComponent(name)}`)
    const items = await res.json()
    if (items.length > 0) {
      cache[key] = { id: items[0].id, type }
      return cache[key]
    }
  }
  return null
}

// findAssetId is the same as findAssetByName — use one function
const findAssetId = findAssetByName

// ── Import Assets ─────────────────────────────────────────────
export async function importAssets(file, onProgress = () => {}) {
  clearCache()
  const rows = await parseCSV(file)

  for (const row of rows) {
    onProgress(`Importing ${row.Name}…`)

    //  parallel fetches for independent fields
    const [manufacturers_id, locations_id, states_id, models_id] = await Promise.all([
      findOrCreate('Manufacturer', row.Manufacturer),
      findOrCreate('Location', row.Location),
      findOrCreate('State', row.Status),
      findOrCreate(`${row.Item_Type}Model`, row.Model),
    ])

    const users_id = row.User ? await findOrCreateUser(row.User) : 0

    const payload = {
      name: row.Name,
      otherserial: row.Inventory_Number,
      manufacturers_id,
      locations_id,
      states_id,
      users_id,
      [`${row.Item_Type.toLowerCase()}models_id`]: models_id
    }

    await glpiPost(`/${row.Item_Type}`, payload)
  }

  onProgress('Assets done ')
}

// ── Import Tickets ────────────────────────────────────────────
export async function importTickets(file, onProgress = () => {}) {
  clearCache()
  const idMap = {}
  const rows = await parseCSV(file)

  const statusMap = { 
    'New': 1, 
    'In Progress': 2, 'Processing (assigned)': 2, 'Processing': 2, 'In progress (assigned)': 2,
    'Pending': 4, 
    'Solved': 5, 
    'Closed': 6, 'Clos': 6 
  }
  const priorityMap = { 'Low': 2, 'Medium': 3, 'High': 4, 'Very High': 5 }
  const typeMap = { 'Incident': 1, 'Request': 2 }

  for (const row of rows) {
    onProgress(`Importing ticket: ${row.Titre}…`)

   // Découpe la date "03/06/2026"
const [day, month, year] = row.Date.trim().split('/')
const cleanYear = year // S'assure que l'année est propre

// Nettoie l'heure pour éviter les doubles secondes (ex: "13:45" ou "13:45:00")
let cleanTime = row.Heure.trim()
if ((cleanTime.match(/:/g) || []).length === 1) {
  cleanTime += ':00' // Ajoute les secondes uniquement s'il n'y a qu'un seul ":"
}

// Format final attendu par GLPI : YYYY-MM-DD HH:mm:ss
const date = `${cleanYear}-${month}-${day} ${cleanTime}`

    const created = await glpiPost('/Ticket', {
      name: row.Titre,
      content: row.Description,
      type: typeMap[row.Type] ?? 1,
      status: 1,
      priority: priorityMap[row.Priority] ?? 3,
      date : date,
      externalid: row.Ref_Ticket,
    })

    const ticketId = created.id
    idMap[row.Ref_Ticket] = ticketId

    //  link all assets in parallel
    if (row.Items) {
      const itemNames = JSON.parse(row.Items)
      const assets = await Promise.all(itemNames.map(name => findAssetId(name)))

      await Promise.all(assets.map(asset => {
        if (!asset) return
        return glpiPost('/Item_Ticket', {
          tickets_id: ticketId,
          items_id: asset.id,
          itemtype: asset.type
        }).catch(err => console.error('Item linking failed:', err.message))
      }))
    }

    // update to real status
    const realStatus = statusMap[row.Status] ?? 1
    if (realStatus !== 1) {
      await glpiPut(`/Ticket/${ticketId}`, { status: realStatus })
    }
  }

  onProgress('Tickets done ')
  return idMap
}

// ── Import Ticket Costs ───────────────────────────────────────
function toNumber(value) {
  if (value === undefined || value === null || value === '') return 0
  const num = Number(String(value).trim().replace(',', '.'))
  return Number.isFinite(num) ? num : 0
}

export async function importTicketCosts(file, idMap, onProgress = () => {}) {
  const rows = await parseCSV(file)

  for (const row of rows) {
    const realId = idMap[row.Num_Ticket]
    if (!realId) {
      console.warn(`No ticket found for Num_Ticket ${row.Num_Ticket} — skipping`)
      continue
    }

    onProgress(`Importing cost for ticket #${realId}…`)

    await glpiPost('/TicketCost', {
      tickets_id: realId,
      name: `Cost for ticket ${realId}`,
      actiontime: toNumber(row.Duration_second),
      cost_time: toNumber(row.Time_Cost),
      cost_fixed: toNumber(row.Fixed_Cost),
    })
  }

  onProgress('Costs done ')
}

// ── Import Images ─────────────────────────────────────────────
export async function importImages(zipFile, onProgress = () => {}) {
  clearCache()
  const zip = await JSZip.loadAsync(zipFile)

  const imageFiles = Object.values(zip.files).filter(f =>
    !f.dir &&
    !f.name.startsWith('__MACOSX') &&
    !f.name.split('/').pop().startsWith('.')
  )

  for (const zipEntry of imageFiles) {
    const filename = zipEntry.name.split('/').pop()
    const assetName = filename.replace(/\.[^.]+$/, '')

    onProgress(`Processing ${filename}…`)

    const asset = await findAssetByName(assetName)
    if (!asset) {
      onProgress(`⚠ No asset found for ${assetName}, skipping`)
      continue
    }

    const arrayBuffer = await zipEntry.async('arraybuffer')
    const result = getRealMimeType(arrayBuffer)

    if (result.ext === 'bin') {
      onProgress(`⚠ ${filename} is not a recognized image, skipping`)
      continue
    }

    const { mime: mimeType, ext } = result
    const correctedFilename = `${assetName}.${ext}`
    const blob = new Blob([arrayBuffer], { type: mimeType })

    const doc = await glpiUploadDocument(correctedFilename, blob, mimeType)

    await glpiPost('/Document_Item', {
      documents_id: doc.id,
      items_id: asset.id,
      itemtype: asset.type
    })

    onProgress(` ${correctedFilename} → ${asset.type} #${asset.id}`)
  }

  onProgress('Images done ')
}

// ── Magic bytes ───────────────────────────────────────────────
function getRealMimeType(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer.slice(0, 4))

  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47)
    return { mime: 'image/png', ext: 'png' }
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF)
    return { mime: 'image/jpeg', ext: 'jpg' }
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38)
    return { mime: 'image/gif', ext: 'gif' }
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46)
    return { mime: 'image/webp', ext: 'webp' }

  return { mime: 'application/octet-stream', ext: 'bin' }
}