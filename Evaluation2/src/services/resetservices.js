import { glpiFetch, glpiDelete } from '@/services/glpiServices'

const DEFAULT_USER_IDS = [2, 3, 4, 5, 6]

async function tryPurge(endpoint, id) {
  if (id === 0) return
  try {
    await glpiDelete(`${endpoint}/${id}?force_purge=1`)
  } catch (err) {
    console.warn(`Could not purge ${endpoint}/${id}:`, err.message)
  }
}

async function deleteAll(endpoint) {
  // fetch active + deleted in parallel
  const [res1, res2] = await Promise.all([
    glpiFetch(`${endpoint}?only_id=true`),
    glpiFetch(`${endpoint}?only_id=true&is_deleted=1`)
  ])

  const [items, deleted] = await Promise.all([res1.json(), res2.json()])
  const allIds = [...items, ...deleted].map(i => i.id)

  // purge all in parallel
  await Promise.all(allIds.map(id => tryPurge(endpoint, id)))
}

async function deleteAllUsers() {
  const [res1, res2] = await Promise.all([
    glpiFetch('/User?only_id=true'),
    glpiFetch('/User?only_id=true&is_deleted=1')
  ])

  const [users, deleted] = await Promise.all([res1.json(), res2.json()])
  const allIds = [...users, ...deleted]
    .map(u => u.id)
    .filter(id => !DEFAULT_USER_IDS.includes(id))

  await Promise.all(allIds.map(id => tryPurge('/User', id)))
}

export async function resetAllData(onProgress = () => {}) {
  // Step 1 — delete ticket costs and tickets in parallel
  onProgress('Deleting tickets & costs…')
  await Promise.all([
    deleteAll('/TicketCost'),
    deleteAll('/Ticket')
  ])

  // Step 2 — delete documents in parallel
  onProgress('Deleting documents…')
  await Promise.all([
    deleteAll('/Document_Item'),
    deleteAll('/Document')
  ])

  //  Step 3 — delete all assets in parallel
  onProgress('Deleting assets…')
  await Promise.all([
    deleteAll('/Computer'),
    deleteAll('/Monitor'),
    deleteAll('/Printer'),
    deleteAll('/NetworkEquipment'),
    deleteAll('/Phone'),
    deleteAll('/Software')
  ])

  //  Step 4 — delete all dropdowns in parallel
  onProgress('Deleting dropdowns…')
  await Promise.all([
    deleteAll('/Manufacturer'),
    deleteAll('/Location'),
    deleteAll('/State'),
    deleteAll('/ComputerModel'),
    deleteAll('/MonitorModel'),
    deleteAll('/PrinterModel'),
    deleteAll('/PhoneModel'),
    deleteAll('/NetworkEquipmentModel')
  ])

  // Step 5 — delete users last
  onProgress('Deleting users…')
  await deleteAllUsers()

  onProgress('Done ')
}