<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { get_all_ticket, get_ticket_costs, getTicketItemLinks } from '@/services/ticketServices'
import { getAllCosts ,  getAllReouverture } from '@/services/sqlliteServices'


// details par item

const computerdetail = ref({
  item:'computer',
  glpi:[],
  supercost:[],
  reouverture:[]


})

const Monitordetail = ref({
  item:'Monitor',
  glpi:[],
  supercost:[],
  reouverture:[]


})


const Phonedetail = ref({
  item:'Monitor',
  glpi:[],
  supercost:[],
  reouverture:[]


})



const router = useRouter()
const loading = ref(true)
const summary = ref([])

const ITEM_TYPES = ['Computer', 'Monitor', 'Phone']

const TYPE_LABELS = {
  Computer: 'Ordinateur',
  Monitor: 'Moniteur',
  Phone: 'Téléphone'
}

function computeGlpiCost(costs) {
  return costs.reduce((sum, c) => {
    const hours = Number(c.actiontime ?? 0) / 3600
    return sum + (hours * Number(c.cost_time ?? 0)) + Number(c.cost_fixed ?? 0) + Number(c.cost_material ?? 0)
  }, 0)
}

function fmt(n) {
  return Number(n).toFixed(2)
}

onMounted(async () => {
  try {
    const [tickets, allCosts,AllReouverture] = await Promise.all([
      get_all_ticket(),
      getAllCosts().catch(() => ({})),   // supercost server may be down — degrade to GLPI-only
       getAllReouverture().catch(() => ({}))

    ])

    const totals = {}
    for (const type of ITEM_TYPES) {
      totals[type] = { glpi: 0, newCost: 0 , reouverture: 0}
    }

    // Fetch item links + GLPI costs for all tickets in parallel
    const ticketData = await Promise.all(
      tickets.map(async ticket => {
        const [links, costs] = await Promise.all([
          getTicketItemLinks(ticket.id),
          get_ticket_costs(ticket.id)
        ])
        return {
          ticket,
          links: Array.isArray(links) ? links : [],
          costs: Array.isArray(costs) ? costs : []
        }
      })
    )

    for (const { ticket, links, costs } of ticketData) {
      if (links.length === 0) continue

      const glpiTotal = computeGlpiCost(costs)
      const newTotal = Number(allCosts[String(ticket.externalid)] ?? 0)
      const reouverture = Number(AllReouverture[String(ticket.externalid)] ?? 0)
      const count = links.length

      for (const link of links) {
        if (totals[link.itemtype]) {
          totals[link.itemtype].glpi    += glpiTotal / count
          totals[link.itemtype].newCost += newTotal  / count
          totals[link.itemtype].reouverture += reouverture / count

          if(link.itemtype == 'Computer'){
            computerdetail.value.glpi.push(glpiTotal / count)
          }
           if(link.itemtype == 'Phone'){
            Phonedetail.value.glpi.push(glpiTotal / count)
          }
           if(link.itemtype == 'Monitor'){
            Monitordetail.value.glpi.push(glpiTotal / count)
          }

        }
      }
    }

    summary.value = ITEM_TYPES.map(type => ({
      type,
      label: TYPE_LABELS[type],
      glpi: totals[type].glpi,
      newCost: totals[type].newCost,
      reouverture: totals[type].reouverture,
      total: totals[type].glpi + totals[type].newCost + totals[type].reouverture
    }))
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="item-list-page">
    <header class="topbar">
      <button class="back-btn" @click="router.push('/Catalogue')">← Catalogue</button>
      <div>
        <h2 class="page-title">Coût par type d'équipement</h2>
        <span class="page-sub">Répartition des coûts tickets sur les éléments du parc</span>
      </div>
    </header>

    <div v-if="loading" class="loading">Chargement en cours…</div>

    <div v-else class="table-wrapper">
      <table class="cost-table">
        <thead>
          <tr>
            <th>Équipement</th>
            <th>Coût total GLPI (€)</th>
            <th>Coût total Supercost (€)</th>
            <th>reouverture</th>
            <th>total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in summary" :key="row.type" class="clickable-row" @click="router.push(`/ItemDetail/${row.type}`)">
            <td class="type-cell">{{ row.label }}</td>
            <td>{{ fmt(row.glpi) }}</td>
            <td>{{ fmt(row.newCost) }}</td>
             <td>{{  fmt(row.reouverture)}}</td>
            <td>{{ fmt(row.total)  }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td>Total</td>
            <td>{{ fmt(summary.reduce((s, r) => s + r.glpi, 0)) }}</td>
            <td>{{ fmt(summary.reduce((s, r) => s + r.newCost, 0)) }}</td>
            <td>{{ fmt(summary.reduce((s, r) => s + r.reouverture, 0)) }}</td>
            <td>{{ fmt(summary.reduce((s, r) => s + r.total, 0)) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.item-list-page {
  min-height: 100vh;
  background: #f4f7fc;
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 32px 48px 60px;
}

.topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 32px;
}

.back-btn {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  color: #374151;
}
.back-btn:hover { background: #f3f4f6; }

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
}
.page-sub {
  font-size: 13px;
  color: #64748b;
}

.loading {
  text-align: center;
  padding: 80px;
  color: #64748b;
  font-size: 16px;
}

.table-wrapper {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.cost-table {
  width: 100%;
  border-collapse: collapse;
}

.cost-table th {
  background: #f8fafc;
  padding: 14px 20px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e5e7eb;
  white-space: nowrap;
}

.cost-table td {
  padding: 14px 20px;
  font-size: 14px;
  color: #374151;
  border-bottom: 1px solid #f1f5f9;
  white-space: nowrap;
}

.cost-table tbody tr:last-child td { border-bottom: none; }

.type-cell {
  font-weight: 500;
  color: #1e293b;
}

.total-row td {
  font-weight: 700;
  color: #1e293b;
  background: #f8fafc;
  border-top: 2px solid #e5e7eb;
}

.clickable-row {
  cursor: pointer;
  transition: background 0.15s;
}
.clickable-row:hover { background: #f0f4ff; }
</style>
