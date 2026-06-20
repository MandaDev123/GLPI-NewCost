<script setup>
import { ref, computed, onMounted } from 'vue'
import { computer_count, monitor_count, printer_count, network_count, phone_count, software_count } from '@/services/parcServices'
import { ticket_total, ticket_incident_count, ticket_request_count } from '@/services/ticketServices'
import Navbar from '@/components/Navbar.vue'
import { Computer, Monitor, Printer, Network, Smartphone, Disc, Ticket, AlertCircle, CheckCircle } from 'lucide-vue-next'

const computer_number = ref(null)
const monitor_number = ref(null)
const printer_number = ref(null)
const network_number = ref(null)
const phone_number = ref(null)
const software_number = ref(null)
const ticket_number = ref(null)
const incident_number = ref(null)
const request_number = ref(null)

onMounted(async () => {
  computer_number.value = await computer_count()
  monitor_number.value = await monitor_count()
  printer_number.value = await printer_count()
  network_number.value = await network_count()
  phone_number.value = await phone_count()
  software_number.value = await software_count()
  ticket_number.value = await ticket_total()
  incident_number.value = await ticket_incident_count()
  request_number.value = await ticket_request_count()
})

const assetCards = [
  { label: 'Computers',         icon: Computer,   key: 'computer' },
  { label: 'Monitors',          icon: Monitor,    key: 'monitor'  },
  { label: 'Printers',          icon: Printer,    key: 'printer'  },
  { label: 'Network Devices',   icon: Network,    key: 'network'  },
  { label: 'Phones',            icon: Smartphone, key: 'phone'    },
  { label: 'Software',          icon: Disc,       key: 'software' },
]

const counts = { computer_number, monitor_number, printer_number, network_number, phone_number, software_number }

const total_assets = computed(() => {
  const values = [computer_number, monitor_number, printer_number, network_number, phone_number, software_number]
  if (values.some(v => v.value === null)) return null
  return values.reduce((sum, v) => sum + (v.value || 0), 0)
})
</script>

<template>
  <div class="dashboard">

    <!-- Sidebar -->
    <Navbar />

    <!-- Main content -->
    <main class="main">

      <!-- Header -->
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">Dashboard</h1>
          <span class="page-sub">Overview of your IT infrastructure</span>
        </div>
        <div class="topbar-right">
          <div class="date-badge">{{ new Date().toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' }) }}</div>
        </div>
      </header>

      <!-- Summary -->
      <div class="summary-bar">
        <div class="summary-card">
          <div class="summary-label">Total Items</div>
          <div class="summary-value">
            <span v-if="total_assets !== null">{{ total_assets }}</span>
            <span v-else class="loading-dots">···</span>
          </div>
          <div class="summary-sub">All asset types combined</div>
        </div>
      </div>

      <!-- Section: Assets -->
      <section class="section">
        <div class="section-header">
          <div class="section-title">
            <span class="section-dot"></span>
            General Elements
          </div>
          <span class="section-sub">Details by type</span>
        </div>

        <div class="cards-grid">
          <div
            v-for="card in assetCards"
            :key="card.key"
            class="card"
          >
            <div class="card-icon"><component :is="card.icon" :size="26" /></div>
            <div class="card-body">
              <div class="card-label">{{ card.label }}</div>
              <div class="card-value">
                <span v-if="counts[card.key + '_number'].value !== null">
                  {{ counts[card.key + '_number'].value }}
                </span>
                <span v-else class="loading-dots">···</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Tickets -->
      <section class="section">
        <div class="section-header">
          <div class="section-title">
            <span class="section-dot accent"></span>
            Tickets
          </div>
          <span class="section-sub">Details by type</span>
        </div>

        <div class="tickets-grid">
          <div class="ticket-card total">
            <div class="ticket-icon"><Ticket :size="26" /></div>
            <div class="ticket-body">
              <div class="ticket-label">Total Tickets</div>
              <div class="ticket-value">
                <span v-if="ticket_number !== null">{{ ticket_number }}</span>
                <span v-else class="loading-dots">···</span>
              </div>
            </div>
          </div>

          <div class="ticket-card incident">
            <div class="ticket-icon"><AlertCircle :size="26" /></div>
            <div class="ticket-body">
              <div class="ticket-label">Incidents</div>
              <div class="ticket-value">
                <span v-if="incident_number !== null">{{ incident_number }}</span>
                <span v-else class="loading-dots">···</span>
              </div>
            </div>
            <div class="ticket-badge">Type 1</div>
          </div>

          <div class="ticket-card request">
            <div class="ticket-icon"><CheckCircle :size="26" /></div>
            <div class="ticket-body">
              <div class="ticket-label">Requests</div>
              <div class="ticket-value">
                <span v-if="request_number !== null">{{ request_number }}</span>
                <span v-else class="loading-dots">···</span>
              </div>
            </div>
            <div class="ticket-badge">Type 2</div>
          </div>
        </div>
      </section>

    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.dashboard {
  display: flex;
  min-height: 100vh;
  background: #f4f7fc;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ── Main ── */
.main {
  margin-left: 220px;
  flex: 1;
  padding: 32px 36px;
}

/* ── Topbar ── */
.topbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 36px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b3e;
  line-height: 1;
  margin-bottom: 4px;
  letter-spacing: -0.5px;
}

.page-sub {
  font-size: 13px;
  color: #7a8aaa;
}

.date-badge {
  background: white;
  border: none;
  border-radius: 20px;
  padding: 8px 18px;
  font-size: 13px;
  color: #4a5a7a;
  font-weight: 500;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

/* ── Summary Bar ── */
.summary-bar {
  margin-bottom: 32px;
}

.summary-card {
  background: linear-gradient(135deg, #0f4fa8 0%, #1a6fd8 100%);
  border-radius: 20px;
  padding: 28px 36px;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  box-shadow: 0 8px 28px rgba(15, 79, 168, 0.25);
  min-width: 220px;
}

.summary-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.summary-value {
  font-size: 52px;
  font-weight: 800;
  color: white;
  line-height: 1;
  letter-spacing: -2px;
}

.summary-sub {
  font-size: 12px;
  color: rgba(255,255,255,0.55);
  margin-top: 2px;
}

/* ── Section ── */
.section { margin-bottom: 40px; }

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 700;
  color: #0d1b3e;
}

.section-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #0f4fa8;
  display: inline-block;
}

.section-dot.accent { background: #e85d4a; }

.section-sub {
  font-size: 12px;
  color: #9aaac4;
  font-weight: 500;
}

/* ── Asset Cards ── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(15, 79, 168, 0.12);
}

.card-icon {
  width: 54px; height: 54px;
  background: #eef3fd;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: #0f4fa8;
}

.card-label {
  font-size: 12px;
  font-weight: 600;
  color: #8a98b5;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 6px;
}

.card-value {
  font-size: 34px;
  font-weight: 800;
  color: #0d1b3e;
  line-height: 1;
  letter-spacing: -1px;
}

/* ── Ticket Cards ── */
.tickets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.ticket-card {
  background: white;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: none;
  position: relative;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.ticket-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(15, 79, 168, 0.12);
}

.ticket-icon {
  width: 54px; height: 54px;
  background: #eef3fd;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: #0f4fa8;
}

.ticket-card.incident .ticket-icon { background: #fdecea; color: #e85d4a; }
.ticket-card.request .ticket-icon { background: #e8f8ee; color: #2ecc71; }

.ticket-label {
  font-size: 12px;
  font-weight: 600;
  color: #8a98b5;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 6px;
}

.ticket-value {
  font-size: 34px;
  font-weight: 800;
  color: #0d1b3e;
  line-height: 1;
  letter-spacing: -1px;
}

.ticket-badge {
  position: absolute;
  top: 12px; right: 12px;
  font-size: 10px;
  font-weight: 600;
  color: #9aaac4;
  background: #f0f4fb;
  border-radius: 20px;
  padding: 3px 8px;
}

/* ── Loading ── */
.loading-dots {
  color: #c0ccdd;
  font-size: 20px;
  letter-spacing: 2px;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .cards-grid, .tickets-grid { grid-template-columns: repeat(2, 1fr); }
  .sidebar { width: 70px; padding: 20px 10px; }
  .logo-text, .nav-item span:last-child, .user-info { display: none; }
  .main { margin-left: 70px; padding: 24px 20px; }
}
</style>