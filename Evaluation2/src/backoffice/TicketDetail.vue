<script setup>
import { get_ticket_by_id, get_ticket_items, get_ticket_costs } from '@/services/ticketServices'
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { ArrowLeft, Computer, Monitor, Printer, Network, Smartphone } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const ticket = ref(null)
const linkedItems = ref([])
const costs = ref([])
const totalcosts = ref([])

onMounted(async () => {
  const id = route.params.id
  ticket.value = await get_ticket_by_id(id)
  linkedItems.value = await get_ticket_items(id)
  costs.value = await get_ticket_costs(id)

  //calculate total cost
  get_total_costs()
})

const typeIcons = {
  Computer: Computer,
  Monitor: Monitor,
  Printer: Printer,
  Phone: Smartphone,
  NetworkEquipment: Network,
}

// Convert seconds to readable duration (e.g. 600 → "10 min")
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0 s'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  const parts = []
  if (h) parts.push(`${h}h`)
  if (m) parts.push(`${m} min`)
  if (s) parts.push(`${s}s`)
  return parts.join(' ')
}

// Total = time worked (hours) × hourly rate + fixed cost + material cost
function computeTotal(cost) {
  const hours = Number(cost.actiontime ?? 0) / 3600
  return (hours * Number(cost.cost_time ?? 0)) + Number(cost.cost_fixed ?? 0) + Number(cost.cost_material ?? 0)
}

function fmt(n) {
  return Number(n ?? 0).toFixed(2)
}

function getType(type) {
  return type === 1 ? 'Incident' : 'Request'
}

function getStatus(status) {
  const map = { 1: 'New', 2: 'In Progress', 3: 'Pending', 4: 'Solved', 5: 'Closed' }
  return map[status] ?? 'Unknown'
}

const scale = { 1: 'Very Low', 2: 'Low', 3: 'Medium', 4: 'High', 5: 'Very High', 6: 'Critical' }
function getScale(value) {
  return scale[value] ?? 'Unknown'
}

function getDateTime(datetime) {
  return datetime && datetime !== '0000-00-00 00:00:00' ? datetime : '-'
}

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '').trim() || '-'
}

//calculate total costs
function get_total_costs() {
  let total_time_cost = 0    
  let total_action_time = 0
  let total_cost = 0
  let total_fixed_cost =0

  for (const cost of costs.value) {  
    total_action_time += parseFloat(cost.actiontime) || 0
    total_time_cost   += parseFloat(cost.cost_time)  || 0
    total_fixed_cost  += parseFloat(cost.cost_fixed) || 0
    total_cost        += computeTotal(cost)
  }

  let real_total_time_cost   = (parseFloat(total_action_time/3600) * parseFloat(total_time_cost)) || 0

 
  totalcosts.value = {
    total_action_time,
    total_time_cost,
    total_fixed_cost,
    total_cost,
    real_total_time_cost
  }
}
</script>

<template>
  <Navbar />

  <div class="page">
    <div class="page-header">
      <button class="back-btn" @click="router.push('/Tickets')">
        <ArrowLeft :size="16" /> Back
      </button>
      <h1 class="page-title">Ticket detail</h1>
    </div>

    <div v-if="ticket" class="detail-card">
      <!-- Header -->
      <div class="detail-top">
        <div class="ref-tag">#{{ ticket.id }}</div>
        <h2 class="ticket-name">{{ ticket.name }}</h2>
        <div class="top-badges">
          <span class="badge" :class="ticket.type === 1 ? 'incident' : 'request'">
            {{ getType(ticket.type) }}
          </span>
          <span class="badge status">{{ getStatus(ticket.status) }}</span>
          <span class="badge priority">{{ getScale(ticket.priority) }}</span>
        </div>
      </div>

      <!-- Info grid -->
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Référence</span>
          <span class="info-value">#{{ ticket.id }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date d'ouverture</span>
          <span class="info-value">{{ getDateTime(ticket.date_creation) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Type</span>
          <span class="info-value">{{ getType(ticket.type) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Statut</span>
          <span class="info-value">{{ getStatus(ticket.status) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Priorité</span>
          <span class="info-value">{{ getScale(ticket.priority) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Urgence</span>
          <span class="info-value">{{ getScale(ticket.urgency) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Impact</span>
          <span class="info-value">{{ getScale(ticket.impact) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date de résolution</span>
          <span class="info-value">{{ getDateTime(ticket.solvedate) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Date de clôture</span>
          <span class="info-value">{{ getDateTime(ticket.closedate) }}</span>
        </div>
      </div>

      <!-- Description -->
      <div class="desc-block">
        <span class="info-label">Description</span>
        <p class="desc-text">{{ stripHtml(ticket.content) }}</p>
      </div>
    </div>

    <!-- Linked items -->
    <div v-if="linkedItems.length" class="section-card">
      <div class="section-title">Linked equipment</div>
      <div class="items-list">
        <div v-for="item in linkedItems" :key="`${item.itemtype}-${item.id}`" class="item-row">
          <div class="item-icon">
            <component :is="typeIcons[item.itemtype]" :size="18" />
          </div>
          <div class="item-info">
            <span class="item-name">{{ item.name }}</span>
            <span class="item-meta">{{ item.itemtype }} · {{ item.states_id || '—' }} · {{ item.locations_id || '—' }}</span>
          </div>
          <span class="item-serial">{{ item.otherserial || '—' }}</span>
        </div>
      </div>
    </div>

    <!-- Ticket costs -->
    <div v-if="costs.length" class="section-card">
      <div class="section-title">Ticket costs</div>
      <div class="table-wrapper">
        <table class="costs-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Duration</th>
              <th>Hourly rate</th>
              <th>Fixed cost</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cost in costs" :key="cost.id">
              <td class="cost-name">{{ cost.name || '—' }}</td>
              <td>{{ formatDuration(cost.actiontime) }}</td>
              <td>{{ fmt(cost.cost_time) }}</td>
              <td>{{ fmt(cost.cost_fixed) }}</td>
              <td class="cost-total">{{ fmt(computeTotal(cost)) }}</td>
            </tr>

            <tr>
               <th>Total</th>
               <td>{{formatDuration(totalcosts.total_action_time)}}</td>
               <td>{{fmt(totalcosts.real_total_time_cost)}}</td>
               <td>{{ fmt(totalcosts.total_fixed_cost) }}</td>
               <td>{{ fmt(totalcosts.total_cost )}}</td>
                
            </tr>

          </tbody>
        </table>
      </div>
    </div>

    <div v-else-if="!ticket" class="loading">Loading ticket…</div>
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

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  color: #4a5a7a;
  border: none;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: background 0.15s, color 0.15s;
}

.back-btn:hover { background: #0f4fa8; color: white; }

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.5px;
}

.detail-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 28px;
}

/* ── Top ── */
.detail-top {
  border-bottom: 1px solid #f0f4fb;
  padding-bottom: 20px;
  margin-bottom: 24px;
}

.ref-tag {
  display: inline-block;
  font-size: 13px;
  font-weight: 700;
  color: #0f4fa8;
  margin-bottom: 8px;
}

.ticket-name {
  font-size: 22px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.4px;
  margin-bottom: 14px;
}

.top-badges {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

/* ── Info grid ── */
.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px 24px;
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8a98b5;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: #2d3a55;
}

/* ── Description ── */
.desc-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f7f9fd;
  border-radius: 14px;
  padding: 18px;
}

.desc-text {
  font-size: 14px;
  line-height: 1.6;
  color: #2d3a55;
  white-space: pre-wrap;
}

/* ── Badges ── */
.badge {
  display: inline-block;
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: visible;
}

.badge.incident { background: #fff0ee; color: #e85d4a; }
.badge.request  { background: #eefaf3; color: #2ecc71; }
.badge.status   { background: #eef3fd; color: #0f4fa8; }
.badge.priority { background: #fdf6ee; color: #e8943a; }

.loading {
  color: #8a98b5;
  font-size: 15px;
  padding: 40px 0;
}

/* ── Shared section card ── */
.section-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 24px 28px;
  margin-top: 20px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8a98b5;
  margin-bottom: 18px;
}

/* ── Linked items ── */
.items-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  background: #f7f9fd;
  border-radius: 12px;
}

.item-icon {
  width: 38px; height: 38px;
  background: #eef3fd;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: #0f4fa8;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: #0d1b3e;
  margin-bottom: 2px;
}

.item-meta {
  font-size: 12px;
  color: #8a98b5;
}

.item-serial {
  font-size: 12px;
  font-weight: 600;
  color: #9aaac4;
  background: #eef3fd;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

/* ── Costs table ── */
.table-wrapper {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid #f0f4fb;
}

.costs-table {
  width: 100%;
  border-collapse: collapse;
}

.costs-table thead tr {
  background: #f7f9fd;
  border-bottom: 1px solid #e8edf8;
}

.costs-table th {
  padding: 11px 16px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8a98b5;
  text-align: left;
}

.costs-table tbody tr {
  border-bottom: 1px solid #f0f4fb;
  transition: background 0.12s;
}
.costs-table tbody tr:last-child { border-bottom: none; }
.costs-table tbody tr:hover { background: #f7f9fd; }

.costs-table td {
  padding: 12px 16px;
  font-size: 13px;
  color: #2d3a55;
}

.cost-name { font-weight: 600; }
.cost-total { font-weight: 700; color: #0f4fa8; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .info-grid { grid-template-columns: repeat(2, 1fr); }
  .page { margin-left: 70px; padding: 24px 20px; }
}
</style>
