import { glpiFetch, glpiDownloadDocument } from '@/services/glpiServices'

// Every asset type shown in the FrontOffice catalogue
const ITEM_TYPES = ['Computer', 'Monitor', 'Printer', 'Phone', 'NetworkEquipment']



export async function computer_count() {
  const res = await glpiFetch('/Computer?only_id=true')
  const data = await res.json()
  return data.length
}

export async function monitor_count() {
  const res = await glpiFetch('/Monitor?only_id=true')
  const data = await res.json()
  return data.length
}

export async function printer_count() {
  const res = await glpiFetch('/Printer?only_id=true')
  const data = await res.json()
  return data.length
}

export async function network_count() {
  const res = await glpiFetch('/NetworkEquipment?only_id=true')
  const data = await res.json()
  return data.length
}

export async function phone_count() {
  const res = await glpiFetch('/Phone?only_id=true')
  const data = await res.json()
  return data.length
}

export async function software_count() {
  const res = await glpiFetch('/Software?only_id=true')
  const data = await res.json()
  return data.length
}


// FrontOffice catalogue helpers

// Get every asset (all types merged into one flat list).
// `expand_dropdowns=true` makes GLPI return readable names (e.g. "Dell")
// instead of raw ids (e.g. manufacturers_id: 3) for Status, Location, Manufacturer, Model…
export async function get_all_items() {
  let all = []

  for (const type of ITEM_TYPES) {
    const res = await glpiFetch(`/${type}?expand_dropdowns=true`)
    const data = await res.json()

    for (const item of data) {
      all.push({ ...item, itemtype: type })
    }
  }

  return all
}

export async function all_items() {
  let all = []

  for (const type of ITEM_TYPES) {
    const res = await glpiFetch(`/${type}?expand_dropdowns=true`)
    const data = await res.json()

    for (const item of data) {
      all.push({ ...item, itemtype: type })
    }
  }

  return all
}

// Get the first photo linked to an asset, ready to use as an <img> src.
// Returns null when the asset has no document attached.
export async function getItemImage(itemtype, itemId) {
  const res = await glpiFetch(`/${itemtype}/${itemId}/Document_Item`)
  const links = await res.json()

  if (links.length === 0) return null

  const blob = await glpiDownloadDocument(links[0].documents_id)
  return URL.createObjectURL(blob)
}