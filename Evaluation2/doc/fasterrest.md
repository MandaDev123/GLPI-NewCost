import { glpiFetch, glpiDelete } from '@/services/glpiServices'

const DEFAULT_USER_IDS = [2, 3, 4, 5, 6]

// How many delete requests may be in flight at the same time.
// Higher = faster, but too high can overload the GLPI/Apache/MySQL stack.
const CONCURRENCY = 12

// Run async tasks with at most `concurrency` running at once.
async function runPool(tasks, concurrency = CONCURRENCY) {
  let index = 0
  const workers = Array.from(
    { length: Math.min(concurrency, tasks.length) },
    async () => {
      while (index < tasks.length) {
        const task = tasks[index++]
        await task()
      }
    }
  )
  await Promise.all(workers)
}

// Fetch active + soft-deleted ids of an endpoint (the two lists in parallel).
async function collectIds(endpoint) {
  const [activeRes, deletedRes] = await Promise.all([
    glpiFetch(`${endpoint}?only_id=true`),
    glpiFetch(`${endpoint}?only_id=true&is_deleted=1`),
  ])
  const [active, deleted] = await Promise.all([activeRes.json(), deletedRes.json()])
  return [...active, ...deleted].map((item) => item.id)
}

// Purge every item across a group of endpoints through ONE shared pool,
// so total concurrency stays bounded no matter how many endpoints there are.
async function purgeEndpoints(endpoints) {
  const idLists = await Promise.all(
    endpoints.map(async (endpoint) => {
      const ids = await collectIds(endpoint)
      return ids.map((id) => () => glpiDelete(`${endpoint}/${id}?force_purge=1`))
    })
  )
  await runPool(idLists.flat())
}

async function purgeUsers() {
  const ids = (await collectIds('/User')).filter((id) => !DEFAULT_USER_IDS.includes(id))
  await runPool(ids.map((id) => () => glpiDelete(`/User/${id}?force_purge=1`)))
}

export async function resetAllData(onProgress = () => {}) {
  // Tickets first — they link to assets via Item_Ticket.
  onProgress('Deleting tickets…')
  await purgeEndpoints(['/Ticket'])

  // Assets (independent of each other → purged together).
  onProgress('Deleting assets…')
  await purgeEndpoints([
    '/Computer',
    '/Monitor',
    '/Printer',
    '/NetworkEquipment',
    '/Phone',
    '/Software',
  ])

  // Dropdown data created during import.
  onProgress('Deleting dropdown data…')
  await purgeEndpoints([
    '/Manufacturer',
    '/Location',
    '/State',
    '/ComputerModel',
    '/MonitorModel',
    '/PrinterModel',
    '/PhoneModel',
    '/NetworkEquipmentModel',
  ])

  // Custom users last (assets reference users_id).
  onProgress('Deleting users…')
  await purgeUsers()

  onProgress('Done')
}
