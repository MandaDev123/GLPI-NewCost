import { glpiFetch, glpiPost, glpiPut } from '@/services/glpiServices'

export async function ticket_total() {
  const res = await glpiFetch('/Ticket?only_id=true')
  const data = await res.json()
  return data.length
}

export async function ticket_incident_count() {
  const res = await glpiFetch('/Ticket?only_id=true&searchText[type]=1')
  const data = await res.json()
  return data.length
}

export async function ticket_request_count() {
  const res = await glpiFetch('/Ticket?only_id=true&searchText[type]=2')
  const data = await res.json()
  return data.length
}

// CRUD

// Get all
export async function get_all_ticket() {
  const res = await glpiFetch('/Ticket')
  const data = await res.json()
  console.log(data)
  return data
}

// Get by id
export async function get_ticket_by_id(id) {
  const res = await glpiFetch(`/Ticket/${id}`)
  const data = await res.json()
  return data
}

// Create a ticket and link it to one or several assets (Computer, Monitor…)
// `items` is a list of { id, itemtype } — exactly what get_all_items() returns.
// We post to the canonical /Item_Ticket endpoint with tickets_id explicit,
// the same fix that made importTickets() link items correctly.
export async function create_ticket(payload, items = []) {
  const created = await glpiPost('/Ticket', payload)
  const ticketId = created.id

  for (const item of items) {
    await glpiPost('/Item_Ticket', {
      tickets_id: ticketId,
      items_id: item.id,
      itemtype: item.itemtype
    })
  }

  return ticketId
}

// Get every asset linked to a ticket.
// /Ticket/{id}/Item_Ticket returns the join records (itemtype + items_id),
// then we fetch the actual item to get its name and other details.
export async function get_ticket_items(id) {
  const res = await glpiFetch(`/Ticket/${id}/Item_Ticket`)
  const links = await res.json()

  const items = []
  for (const link of links) {
    const itemRes = await glpiFetch(`/${link.itemtype}/${link.items_id}?expand_dropdowns=true`)
    const item = await itemRes.json()
    items.push({ ...item, itemtype: link.itemtype })
  }
  return items
}

// Get all costs attached to a ticket.
export async function get_ticket_costs(id) {
  const res = await glpiFetch(`/Ticket/${id}/TicketCost`)
  const data = await res.json()
  return data
}

// Get the Item_Ticket join records for a ticket (itemtype + items_id only, no full item fetch).
export async function getTicketItemLinks(id) {
  const res = await glpiFetch(`/Ticket/${id}/Item_Ticket`)
  return res.json()
}

// Status values used by GLPI:
// 1 = New  |  2 = In Progress  |  3 = Pending  |  4 = Solved  |  5 = Closed
export async function update_ticket_status(ticketId, toStatus) {
  return glpiPut(`/Ticket/${ticketId}`, { status: toStatus })
}