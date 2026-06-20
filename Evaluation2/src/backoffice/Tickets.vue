<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { get_all_ticket } from '@/services/ticketServices'
import { useRouter } from 'vue-router'
import {glpiFetch} from '@/services/glpiServices'


const router = useRouter()
const tickets = ref([])

onMounted(async () => {
  tickets.value = await get_all_ticket()

  console.log('test debug')

  //  const res = await glpiFetch('/Phone/1')
  // const data = await res.json()
  // console.log(data)

})

function getType(type) {
  return type === 1 ? 'Incident' : 'Request'
}

function getStatus(status) {
  const map = { 1: 'New', 2: 'In Progress','Processing (assigned)': 2,'Processing' :2, 3: 'Pending', 4: 'Solved', 6: 'Closed' }
  return map[status] ?? 'Unknown'
}

function getPriority(priority) {
  const map = { 1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Very High', 6: 'Critical' }
  return map[priority] ?? 'Unknown'
}

function getDate(datetime) {
  return datetime?.split(' ')[0] ?? '-'
}

function getTime(datetime) {
  return datetime?.split(' ')[1] ?? '-'
}

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') ?? '-'
}
</script>

<template>
  <Navbar />

  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Tickets</h1>
      <span class="ticket-count">{{ tickets.length }} ticket(s)</span>
    </div>

    <div class="table-wrapper">
      <table class="ticket-table">
        <thead>
          <tr>
            <th>Ref</th>
            <th>Date</th>
            <th>Heure</th>
            <th>Type</th>
            <th>Titre</th>
            <th>Description</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ticket in tickets" :key="ticket.id">
            <td class="ref">#{{ ticket.id }}</td>
            <td>{{ getDate(ticket.date_creation) }}</td>
            <td>{{ getTime(ticket.date_creation) }}</td>
            <td>
              <span class="badge" :class="ticket.type === 1 ? 'incident' : 'request'">
                {{ getType(ticket.type) }}
              </span>
            </td>
            <td class="titre">{{ ticket.name }}</td>
            <td class="desc">{{ stripHtml(ticket.content) }}</td>
            <td>
              <span class="badge status">{{ getStatus(ticket.status) }}</span>
            </td>
            <td>
              <span class="badge priority">{{ getPriority(ticket.priority) }}</span>
            </td>
            <td>
              <button class="detail-btn" @click="router.push(`/Tickets/${ticket.id}`)">
                View detail
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
  padding: 32px 36px;
  background: #f4f7fc;
  min-height: 100vh;
  font-family: 'Plus Jakarta Sans', sans-serif;
  margin-left: 220px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.5px;
}

.ticket-count {
  background: #0f4fa8;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 5px 14px;
  border-radius: 20px;
}

.table-wrapper {
  background: white;
  border-radius: 20px;
  border: none;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.ticket-table {
  width: 100%;
  border-collapse: collapse;
}

.ticket-table thead tr {
  background: #f7f9fd;
  border-bottom: 1px solid #e8edf8;
}

.ticket-table th {
  padding: 14px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8a98b5;
  text-align: left;
}

.ticket-table tbody tr {
  border-bottom: 1px solid #f0f4fb;
  transition: background 0.15s;
  cursor: pointer;
}

.ticket-table tbody tr:hover { background: #f7f9fd; }
.ticket-table tbody tr:last-child { border-bottom: none; }

.ticket-table td {
  padding: 14px 16px;
  font-size: 13px;
  color: #2d3a55;
}

.ref { font-weight: 700; color: #0f4fa8; }
.titre { font-weight: 600; max-width: 160px; }
.desc { color: #8a98b5; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge.incident { background: #fff0ee; color: #e85d4a; }
.badge.request  { background: #eefaf3; color: #2ecc71; }
.badge.status   { background: #eef3fd; color: #0f4fa8; }
.badge.priority { background: #fdf6ee; color: #e8943a; }

.detail-btn {
  background: #eef3fd;
  color: #0f4fa8;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.detail-btn:hover { background: #0f4fa8; color: white; }
</style>