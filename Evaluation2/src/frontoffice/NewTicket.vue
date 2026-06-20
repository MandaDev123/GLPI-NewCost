<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { create_ticket } from '@/services/ticketServices'
import { get_all_items } from '@/services/parcServices'
import { ArrowLeft, Send, Search, X, Computer, Monitor, Printer, Network, Smartphone } from 'lucide-vue-next'

const router = useRouter()

// ── Form fields ──
const form = reactive({
  title: '',
  description: '',
  type: 1,     // 1 = Incident, 2 = Request
  priority: 3, // 2 Low … 5 Very High
})

const typeOptions = [
  { value: 1, label: 'Incident' },
  { value: 2, label: 'Request' },
]

const priorityOptions = [
  { value: 2, label: 'Low' },
  { value: 3, label: 'Medium' },
  { value: 4, label: 'High' },
  { value: 5, label: 'Very High' },
]

const typeIcons = {
  Computer: Computer,
  Monitor: Monitor,
  Printer: Printer,
  Phone: Smartphone,
  NetworkEquipment: Network,
}

// ── Asset picker — search the catalogue, link several to the ticket ──
const allItems = ref([])
const itemSearch = ref('')
const selectedItems = ref([])

onMounted(async () => {
  allItems.value = await get_all_items()
})

const filteredItems = computed(() => {
  const query = itemSearch.value.trim().toLowerCase()
  if (!query) return []

  const pickedKeys = new Set(selectedItems.value.map(item => `${item.itemtype}-${item.id}`))

  return allItems.value
    .filter(item => !pickedKeys.has(`${item.itemtype}-${item.id}`))
    .filter(item => item.name.toLowerCase().includes(query))
    .slice(0, 6)
})

function pickItem(item) {
  selectedItems.value.push(item)
  itemSearch.value = ''
}

function removeItem(item) {
  selectedItems.value = selectedItems.value.filter(
    i => !(i.itemtype === item.itemtype && i.id === item.id)
  )
}

// ── Submit ──
const state = ref('idle') // idle | loading | done | error
const errorMsg = ref('')

const canSubmit = computed(() => form.title.trim().length > 0)

async function submit() {
  if (!canSubmit.value || state.value === 'loading') return

  state.value = 'loading'
  errorMsg.value = ''

  try {
    await create_ticket(
      {
        name: form.title,
        content: form.description,
        type: form.type,
        priority: form.priority,
        status: 1, // New
      },
      selectedItems.value
    )

    state.value = 'done'
  } catch (err) {
    state.value = 'error'
    errorMsg.value = err?.message ?? 'Could not create the ticket'
  }
}

function resetForm() {
  form.title = ''
  form.description = ''
  form.type = 1
  form.priority = 3
  selectedItems.value = []
  itemSearch.value = ''
  state.value = 'idle'
}
</script>

<template>
  <div class="page">
    <header class="topbar">
      <button class="back-btn" @click="router.push('/Catalogue')">
        <ArrowLeft :size="16" />
        <span>Catalogue</span>
      </button>

      <div class="topbar-title">
        <h1>New ticket</h1>
        <span class="sub">Describe the issue and link the equipment involved</span>
      </div>
    </header>

    <!-- Success state -->
    <div v-if="state === 'done'" class="result-card">
      <div class="success-circle">
        <svg viewBox="0 0 52 52" class="check-svg">
          <circle class="check-circle" cx="26" cy="26" r="25" fill="none" />
          <path class="check-mark" fill="none" d="M14 27 l8 8 l16 -18" />
        </svg>
      </div>
      <h2>Ticket created</h2>
      <p>
        Your request has been submitted{{ selectedItems.length ? ` with ${selectedItems.length} linked item(s)` : '' }}.
      </p>
      <button class="primary-btn" @click="resetForm">Create another ticket</button>
    </div>

    <!-- Form -->
    <form v-else class="ticket-form" @submit.prevent="submit">
      <div class="form-card">
        <label class="field-label">Title</label>
        <input v-model="form.title" type="text" class="field-input" placeholder="Short summary of the issue" />

        <label class="field-label">Description</label>
        <textarea v-model="form.description" class="field-textarea" rows="4" placeholder="Explain what's happening…"></textarea>

        <div class="field-row">
          <div class="field-col">
            <label class="field-label">Type</label>
            <select v-model.number="form.type" class="field-input">
              <option v-for="opt in typeOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="field-col">
            <label class="field-label">Priority</label>
            <select v-model.number="form.priority" class="field-input">
              <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>
      </div>

      <div class="form-card">
        <label class="field-label">Linked equipment <span class="optional">(optional — you can add several)</span></label>

        <div class="picker-search">
          <Search :size="16" />
          <input v-model="itemSearch" type="text" placeholder="Search equipment by name…" />
        </div>

        <ul v-if="filteredItems.length" class="picker-results">
          <li v-for="item in filteredItems" :key="`${item.itemtype}-${item.id}`" @click="pickItem(item)">
            <component :is="typeIcons[item.itemtype]" :size="16" />
            <span class="picker-name">{{ item.name }}</span>
            <span class="picker-type">{{ item.itemtype }}</span>
          </li>
        </ul>

        <div v-if="selectedItems.length" class="selected-chips">
          <span v-for="item in selectedItems" :key="`${item.itemtype}-${item.id}`" class="chip">
            <component :is="typeIcons[item.itemtype]" :size="14" />
            {{ item.name }}
            <button type="button" class="chip-remove" @click="removeItem(item)"><X :size="12" /></button>
          </span>
        </div>
        <p v-else class="empty-hint">No equipment linked yet — search above to add some.</p>
      </div>

      <p v-if="state === 'error'" class="error-msg">{{ errorMsg }}</p>

      <button type="submit" class="submit-btn" :disabled="!canSubmit || state === 'loading'">
        <span v-if="state === 'loading'" class="spinner"></span>
        <template v-else>
          <Send :size="16" />
          <span>Submit ticket</span>
        </template>
      </button>
    </form>
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

.topbar-title h1 {
  font-size: 26px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.5px;
  margin-bottom: 2px;
}
.topbar-title .sub { font-size: 13px; color: #8a98b5; }

/* ── Form layout ── */
.ticket-form {
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-card {
  background: white;
  border-radius: 20px;
  padding: 26px 28px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #4a5a7a;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.field-label:not(:first-child) { margin-top: 18px; }
.field-label .optional {
  text-transform: none;
  font-weight: 500;
  letter-spacing: normal;
  color: #b7c2d6;
}

.field-input,
.field-textarea {
  width: 100%;
  background: #f4f7fc;
  border: 1.5px solid #e4eaf6;
  border-radius: 12px;
  padding: 12px 16px;
  font-family: inherit;
  font-size: 14px;
  color: #2d3a55;
  outline: none;
  transition: border-color 0.15s;
}
.field-input:focus,
.field-textarea:focus { border-color: #0f4fa8; }
.field-input::placeholder,
.field-textarea::placeholder { color: #b7c2d6; }
.field-textarea { resize: vertical; line-height: 1.5; }

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

select.field-input { cursor: pointer; }

/* ── Asset picker ── */
.picker-search {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f4f7fc;
  border: 1.5px solid #e4eaf6;
  border-radius: 12px;
  padding: 11px 16px;
  color: #8a98b5;
  transition: border-color 0.15s, color 0.15s;
}
.picker-search:focus-within { border-color: #0f4fa8; color: #0f4fa8; }
.picker-search input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: #2d3a55;
}
.picker-search input::placeholder { color: #b7c2d6; }

.picker-results {
  list-style: none;
  margin-top: 8px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #eef3fd;
}
.picker-results li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  font-size: 13px;
  color: #2d3a55;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f0f4fb;
}
.picker-results li:last-child { border-bottom: none; }
.picker-results li:hover { background: #f7f9fd; }
.picker-results li svg { color: #0f4fa8; flex-shrink: 0; }
.picker-name { font-weight: 600; flex: 1; }
.picker-type { font-size: 11px; color: #9aaac4; }

.selected-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #eef3fd;
  color: #0f4fa8;
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 8px 6px 12px;
  border-radius: 20px;
}
.chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px; height: 18px;
  border: none;
  border-radius: 50%;
  background: rgba(15, 79, 168, 0.15);
  color: #0f4fa8;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.chip-remove:hover { background: #0f4fa8; color: white; }

.empty-hint {
  margin-top: 14px;
  font-size: 12.5px;
  color: #b7c2d6;
}

/* ── Submit ── */
.error-msg {
  font-size: 13px;
  font-weight: 600;
  color: #e85d4a;
  background: #fff0ee;
  border-radius: 12px;
  padding: 12px 16px;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-start;
  background: #0f4fa8;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 13px 28px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, opacity 0.2s;
}
.submit-btn:hover:not(:disabled) { background: #0d4494; }
.submit-btn:active:not(:disabled) { transform: scale(0.97); }
.submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.spinner {
  width: 18px; height: 18px;
  border: 3px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Success state ── */
.result-card {
  max-width: 420px;
  background: white;
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}
.result-card h2 {
  font-size: 20px;
  font-weight: 800;
  color: #0d1b3e;
  margin: 18px 0 8px;
}
.result-card p {
  font-size: 13px;
  color: #8a98b5;
  margin-bottom: 22px;
  line-height: 1.5;
}

.success-circle { width: 64px; height: 64px; margin: 0 auto; }
.check-svg { width: 100%; height: 100%; }
.check-circle {
  stroke: #2ecc71;
  stroke-width: 2.5;
  stroke-dasharray: 160;
  stroke-dashoffset: 160;
  animation: draw-circle 0.5s ease-out forwards;
}
.check-mark {
  stroke: #2ecc71;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  animation: draw-check 0.35s 0.45s ease-out forwards;
}
@keyframes draw-circle { to { stroke-dashoffset: 0; } }
@keyframes draw-check  { to { stroke-dashoffset: 0; } }

.primary-btn {
  background: #eef3fd;
  color: #0f4fa8;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 13px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.primary-btn:hover { background: #0f4fa8; color: white; }

/* ── Responsive ── */
@media (max-width: 700px) {
  .page { padding: 24px 20px 40px; }
  .field-row { grid-template-columns: 1fr; }
}
</style>
