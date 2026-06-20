<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { get_all_ticket, get_ticket_costs, getTicketItemLinks } from '@/services/ticketServices'
import { getAllCosts, getAllReouverture } from '@/services/sqlliteServices'
import { get_all_items } from '@/services/parcServices'

const route  = useRoute()
const router = useRouter()

// The asset type comes from the URL: /ItemDetail/Computer, /ItemDetail/Monitor, etc.
const type = route.params.type

const TYPE_LABELS = {
  Computer: 'Ordinateur',
  Monitor:  'Moniteur',
  Phone:    'Téléphone'
}

const loading = ref(true)
const assets  = ref([])   // [{ name, glpi, supercost, reouverture, total }]

// ── helpers ──────────────────────────────────────────────────────────────────

function computeGlpiCost(costs) {
  return costs.reduce((sum, c) => {
    const hours = Number(c.actiontime ?? 0) / 3600
    return sum + (hours * Number(c.cost_time ?? 0)) + Number(c.cost_fixed ?? 0) + Number(c.cost_material ?? 0)
  }, 0)
}

function fmt(n) {
  return Number(n).toFixed(2)
}

// ── data loading ──────────────────────────────────────────────────────────────

onMounted(async () => {
  try {
    // Step 1 — load everything in parallel
    const [tickets, allCosts, allReouverture, allItems] = await Promise.all([
      get_all_ticket(),
      getAllCosts().catch(() => ({})),
      getAllReouverture().catch(() => ({})),
      get_all_items()
    ])

    // Step 2 — build a name lookup: "Computer-5" → "PC-ADM-001"
    const nameMap = {}
    for (const item of allItems) {
      nameMap[`${item.itemtype}-${item.id}`] = item.name
    }

    // Step 3 — per-asset cost accumulator
    const assetMap = {}

    // Step 4 — for every ticket, fetch its item links + GLPI costs in parallel
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

    // Step 5 — distribute each ticket's costs across its linked items of this type
    for (const { ticket, links, costs } of ticketData) {
      if (links.length === 0) continue

      const glpiTotal   = computeGlpiCost(costs)
      const supercost   = Number(allCosts[String(ticket.externalid)]       ?? 0)
      const reouverture = Number(allReouverture[String(ticket.externalid)] ?? 0)
      const count       = links.length   // split equally across all linked items

      for (const link of links) {
        if (link.itemtype !== type) continue   // skip other asset types

        const key = `${link.itemtype}-${link.items_id}`
        if (!assetMap[key]) {
          assetMap[key] = {
            name:        nameMap[key] ?? `#${link.items_id}`,
            glpi:        0,
            supercost:   0,
            reouverture: 0
          }
        }
        assetMap[key].glpi        += glpiTotal   / count
        assetMap[key].supercost   += supercost   / count
        assetMap[key].reouverture += reouverture / count
      }
    }

    // Step 6 — turn map into sorted array and add total column
    assets.value = Object.values(assetMap)
      .map(a => ({ ...a, total: a.glpi + a.supercost + a.reouverture }))
      .sort((a, b) => a.name.localeCompare(b.name))

  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button class="back-btn" @click="router.push('/ItemList')">← Coûts</button>
      <div>
        <h2 class="page-title">{{ TYPE_LABELS[type] ?? type }} — détail par équipement</h2>
        <span class="page-sub">Coût réparti proportionnellement par ticket lié</span>
      </div>
    </header>

    <div v-if="loading" class="loading">Chargement…</div>

    <div v-else-if="assets.length === 0" class="loading">Aucun équipement trouvé.</div>

    <div v-else class="table-wrapper">
      <table class="cost-table">
        <thead>
          <tr>
            <th>Équipement</th>
            <th>Coût GLPI (€)</th>
            <th>Supercost (€)</th>
            <th>Réouverture (€)</th>
            <th>Total (€)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="asset in assets" :key="asset.name">
            <td class="name-cell">{{ asset.name }}</td>
            <td>{{ fmt(asset.glpi) }}</td>
            <td>{{ fmt(asset.supercost) }}</td>
            <td>{{ fmt(asset.reouverture) }}</td>
            <td>{{ fmt(asset.total) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td>Total</td>
            <td>{{ fmt(assets.reduce((s, a) => s + a.glpi,        0)) }}</td>
            <td>{{ fmt(assets.reduce((s, a) => s + a.supercost,   0)) }}</td>
            <td>{{ fmt(assets.reduce((s, a) => s + a.reouverture, 0)) }}</td>
            <td>{{ fmt(assets.reduce((s, a) => s + a.total,       0)) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.page {
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
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
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

.name-cell {
  font-weight: 600;
  color: #1e293b;
}

.total-row td {
  font-weight: 700;
  color: #1e293b;
  background: #f8fafc;
  border-top: 2px solid #e5e7eb;
}
</style>
