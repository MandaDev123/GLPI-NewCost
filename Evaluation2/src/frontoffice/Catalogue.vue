<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { get_all_items, getItemImage } from '@/services/parcServices'
import { Search, MapPin, Factory, Tag, Cpu, Hash, ArrowLeft, Plus, Kanban, BarChart2, Computer, Monitor, Printer, Network, Smartphone } from 'lucide-vue-next'

const router = useRouter()

const items = ref([])
const loading = ref(true)
const search = ref('')
const filterType = ref('')
const filterManufacturer = ref('')
const filterLocation = ref('')
const filterStatus = ref('')

onMounted(async () => {
  const data = await get_all_items()

  // give every item an `image` slot we can fill in once it's loaded
  items.value = data.map(item => ({ ...item, image: null }))
  loading.value = false

  // load photos in the background, one by one, without blocking the list
  for (const item of items.value) {
    getItemImage(item.itemtype, item.id).then(url => {
      item.image = url
    })
  }
})

const typeIcons = {
  Computer: Computer,
  Monitor: Monitor,
  Printer: Printer,
  Phone: Smartphone,
  NetworkEquipment: Network,
}

const typeLabels = {
  Computer: 'Computer',
  Monitor: 'Monitor',
  Printer: 'Printer',
  Phone: 'Phone',
  NetworkEquipment: 'Network Equipment',
}

function getModel(item) {
  const key = `${item.itemtype.toLowerCase()}models_id`
  return item[key] || '—'
}

const uniqueTypes = computed(() => [...new Set(items.value.map(i => i.itemtype).filter(Boolean))])
const uniqueManufacturers = computed(() => [...new Set(items.value.map(i => i.manufacturers_id).filter(Boolean))].sort())
const uniqueLocations = computed(() => [...new Set(items.value.map(i => i.locations_id).filter(Boolean))].sort())
const uniqueStatuses = computed(() => [...new Set(items.value.map(i => i.states_id).filter(Boolean))].sort())

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()

  return items.value.filter(item => {
    if (filterType.value && item.itemtype !== filterType.value) return false
    if (filterManufacturer.value && item.manufacturers_id !== filterManufacturer.value) return false
    if (filterLocation.value && item.locations_id !== filterLocation.value) return false
    if (filterStatus.value && item.states_id !== filterStatus.value) return false
    if (!query) return true

    const fields = [
      item.name,
      item.states_id,
      item.locations_id,
      item.manufacturers_id,
      typeLabels[item.itemtype],
      getModel(item),
      item.otherserial,
    ]
    return fields.some(field => field?.toString().toLowerCase().includes(query))
  })
})
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button class="back-btn" @click="router.push('/')">
        <ArrowLeft :size="16" />
        <span>Home</span>
      </button>

      <div class="topbar-title">
        <h1>Equipment Catalogue</h1>
        <span class="sub">Browse the company's equipment</span>
      </div>

      <span class="count-badge">{{ filteredItems.length }} item(s)</span>

      <button class="new-ticket-btn" @click="router.push('/NewTicket')">
        <Plus :size="16" />
        <span>New ticket</span>
      </button>

      <button class="kanban-btn" @click="router.push('/TicketKaban')">
        <Kanban :size="16" />
        <span>Kanban</span>
      </button>

      <button class="item-list-btn" @click="router.push('/ItemList')">
        <BarChart2 :size="16" />
        <span>Coûts</span>
      </button>

      <button class="item-list-btn" @click="router.push('/importalea')">
        <BarChart2 :size="16" />
        <span>Import alea</span>
      </button>
    </header>

     
    

    <div class="search-bar">
      <Search :size="18" />
      <input
        v-model="search"
        type="text"
        placeholder="Search by name, status, location, manufacturer, type, model, inventory number…"
      />
    </div>

    <div class="filters-row">
      <div class="filter-group">
        <label class="filter-label">Type</label>
        <select v-model="filterType" class="filter-select">
          <option value="">All types</option>
          <option v-for="t in uniqueTypes" :key="t" :value="t">{{ typeLabels[t] || t }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Manufacturer</label>
        <select v-model="filterManufacturer" class="filter-select">
          <option value="">All manufacturers</option>
          <option v-for="m in uniqueManufacturers" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Location</label>
        <select v-model="filterLocation" class="filter-select">
          <option value="">All locations</option>
          <option v-for="l in uniqueLocations" :key="l" :value="l">{{ l }}</option>
        </select>
      </div>

      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select v-model="filterStatus" class="filter-select">
          <option value="">All statuses</option>
          <option v-for="s in uniqueStatuses" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <button
        v-if="filterType || filterManufacturer || filterLocation || filterStatus"
        class="clear-btn"
        @click="filterType = ''; filterManufacturer = ''; filterLocation = ''; filterStatus = ''"
      >
        Clear filters
      </button>
    </div>

    <p v-if="loading" class="state-msg">Loading equipment…</p>
    <p v-else-if="filteredItems.length === 0" class="state-msg">No items match your search.</p>

    <div v-else class="items-grid">
      <div v-for="item in filteredItems" :key="`${item.itemtype}-${item.id}`" class="item-card">
        <div class="item-image">
          <img v-if="item.image" :src="item.image" :alt="item.name" />
          <div v-else class="item-image-placeholder">
            <component :is="typeIcons[item.itemtype]" :size="34" />
          </div>
          <span class="item-type-badge">{{ typeLabels[item.itemtype] }}</span>
        </div>

        <div class="item-body">
          <div class="item-name">{{ item.name }}</div>

          <div class="item-detail"><Tag :size="14" /><span>{{ item.states_id || '—' }}</span></div>
          <div class="item-detail"><MapPin :size="14" /><span>{{ item.locations_id || '—' }}</span></div>
          <div class="item-detail"><Factory :size="14" /><span>{{ item.manufacturers_id || '—' }}</span></div>
          <div class="item-detail"><Cpu :size="14" /><span>{{ getModel(item) }}</span></div>
          <div class="item-detail"><Hash :size="14" /><span>{{ item.otherserial || '—' }}</span></div>
        </div>
      </div>
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

/* ── Topbar ── */
.topbar {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #4a5a7a;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: color 0.15s, transform 0.1s;
  flex-shrink: 0;
}
.back-btn:hover { color: #0f4fa8; }
.back-btn:active { transform: scale(0.96); }

.topbar-title { flex: 1; min-width: 0; }
.topbar-title h1 {
  font-size: 26px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.5px;
  margin-bottom: 2px;
}
.topbar-title .sub { font-size: 13px; color: #8a98b5; }

.count-badge {
  background: #0f4fa8;
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 16px;
  border-radius: 20px;
  flex-shrink: 0;
}

.new-ticket-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #0f4fa8;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  flex-shrink: 0;
}
.new-ticket-btn:hover { background: #0d4494; }
.new-ticket-btn:active { transform: scale(0.96); }

.kanban-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  color: #0f4fa8;
  border: 1.5px solid #dce8fb;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.1s;
  flex-shrink: 0;
}
.kanban-btn:hover { background: #eef3fd; }
.kanban-btn:active { transform: scale(0.96); }

.item-list-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: white;
  color: #0f4fa8;
  border: 1.5px solid #dce8fb;
  border-radius: 12px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.1s;
  flex-shrink: 0;
}
.item-list-btn:hover { background: #eef3fd; }
.item-list-btn:active { transform: scale(0.96); }

/* ── Search ── */
.search-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 16px;
  padding: 14px 20px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  color: #8a98b5;
}
.search-bar input {
  flex: 1;
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 14px;
  color: #2d3a55;
  background: transparent;
}
.search-bar input::placeholder { color: #b7c2d6; }

/* ── Filters ── */
.filters-row {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-label {
  font-size: 11px;
  font-weight: 600;
  color: #8a98b5;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.filter-select {
  appearance: none;
  background: white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238a98b5' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E") no-repeat right 14px center;
  border: 1.5px solid #e4eaf5;
  border-radius: 12px;
  padding: 10px 38px 10px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #2d3a55;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.05);
  transition: border-color 0.2s;
  min-width: 170px;
}
.filter-select:focus { outline: none; border-color: #0f4fa8; }

.clear-btn {
  background: transparent;
  border: 1.5px solid #e4eaf5;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #8a98b5;
  font-family: inherit;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
  align-self: flex-end;
}
.clear-btn:hover { color: #e85d4a; border-color: #e85d4a; }

/* ── States ── */
.state-msg {
  text-align: center;
  color: #8a98b5;
  font-size: 14px;
  font-weight: 500;
  padding: 60px 0;
}

/* ── Grid of cards ── */
.items-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.item-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}
.item-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 28px rgba(15, 79, 168, 0.12);
}

.item-image {
  position: relative;
  height: 160px;
  background: #eef3fd;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.item-image-placeholder { color: #aac0e6; }

.item-type-badge {
  position: absolute;
  top: 12px; right: 12px;
  background: rgba(13, 27, 62, 0.6);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  backdrop-filter: blur(4px);
}

.item-body { padding: 18px 20px 22px; }

.item-name {
  font-size: 16px;
  font-weight: 700;
  color: #0d1b3e;
  margin-bottom: 10px;
}

.item-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  color: #647089;
  margin-bottom: 6px;
}
.item-detail svg { color: #0f4fa8; flex-shrink: 0; }
.item-detail span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* ── Responsive ── */
@media (max-width: 700px) {
  .page { padding: 24px 20px 40px; }
  .topbar { flex-wrap: wrap; }
  .items-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
}
</style>
