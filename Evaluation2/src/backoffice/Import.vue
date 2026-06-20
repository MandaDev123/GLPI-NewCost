<script setup>
import { ref, reactive, computed } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { importAssets, importTickets, importTicketCosts, importImages } from '@/services/importServices'
import { HardDrive, Ticket, DollarSign, Image, Rocket, Upload } from 'lucide-vue-next'

// Per-step state: 'idle' | 'loading' | 'done' | 'error'
function makeStep() {
  return { file: null, fileName: '', state: 'idle', status: '', error: '' }
}

const assets = reactive(makeStep())
const tickets = reactive(makeStep())
const costs = reactive(makeStep())
const images = reactive(makeStep())

// idMap returned by the tickets import — required by the costs import
const idMap = ref(null)

const running = ref(false)

const allReady = computed(() => assets.file && tickets.file && costs.file && images.file)

function pickFile(step, event) {
  const file = event.target.files[0]
  step.file = file ?? null
  step.fileName = file?.name ?? ''
  if (step.state !== 'loading') step.state = 'idle'
}

// ── Individual imports ──
async function runAssets() {
  if (!assets.file || running.value) return
  await guard(assets, () => importAssets(assets.file, (m) => (assets.status = m)))
}

async function runTickets() {
  if (!tickets.file || running.value) return
  await guard(tickets, async () => {
    idMap.value = await importTickets(tickets.file, (m) => (tickets.status = m))
  })
}

async function runCosts() {
  if (!costs.file || running.value) return
  if (!idMap.value) {
    costs.state = 'error'
    costs.error = 'Import Tickets first — costs need the ticket IDs.'
    return
  }
  await guard(costs, () => importTicketCosts(costs.file, idMap.value, (m) => (costs.status = m)))
}

async function runImages() {
  if (!images.file || running.value) return
  await guard(images, () => importImages(images.file, (m) => (images.status = m)))
}

// ── Import everything at once (correct order: assets → tickets → costs → photos) ──
async function runAll() {
  if (!allReady.value || running.value) return
  running.value = true
  try {
    await guard(assets, () => importAssets(assets.file, (m) => (assets.status = m)), true)
    idMap.value = await guardReturn(tickets, () => importTickets(tickets.file, (m) => (tickets.status = m)))
    await guard(costs, () => importTicketCosts(costs.file, idMap.value, (m) => (costs.status = m)), true)
    await guard(images, () => importImages(images.file, (m) => (images.status = m)), true)
  } finally {
    running.value = false
  }
}

// Runs a step, managing its state. Rethrows when `chained` so runAll stops.
async function guard(step, fn, chained = false) {
  step.state = 'loading'
  step.error = ''
  try {
    await fn()
    step.state = 'done'
  } catch (err) {
    step.state = 'error'
    step.error = err?.message ?? 'Import failed'
    if (chained) throw err
  }
}

async function guardReturn(step, fn) {
  step.state = 'loading'
  step.error = ''
  try {
    const result = await fn()
    step.state = 'done'
    return result
  } catch (err) {
    step.state = 'error'
    step.error = err?.message ?? 'Import failed'
    throw err
  }
}

const stepDefs = [
  { key: assets,  icon: HardDrive,  num: 1, title: 'Assets',       hint: 'Computers, monitors, printers, phones…',        run: runAssets,  accept: '.csv' },
  { key: tickets, icon: Ticket,     num: 2, title: 'Tickets',      hint: 'Tickets and their linked items',                run: runTickets, accept: '.csv' },
  { key: costs,   icon: DollarSign, num: 3, title: 'Ticket Costs', hint: 'Requires Tickets to be imported first',         run: runCosts,   accept: '.csv' },
  { key: images,  icon: Image,      num: 4, title: 'Asset Photos', hint: 'ZIP of images named by asset name (e.g. PC-ADM-001.png)', run: runImages,  accept: '.zip' },
]
</script>

<template>
  <Navbar />

  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Import data</h1>
        <span class="page-sub">Import your files one by one, or all at once</span>
      </div>
      <button class="all-btn" :disabled="!allReady || running" @click="runAll">
        <Rocket :size="18" />
        <span v-if="running">Importing…</span>
        <span v-else>Let's go — import all</span>
      </button>
    </div>

    <p v-if="!allReady" class="all-hint">
      Select all four files to enable “import all”. The correct order (Assets → Tickets → Costs → Photos) is handled for you.
    </p>

    <div class="steps">
      <div
        v-for="def in stepDefs"
        :key="def.num"
        class="step-card"
        :class="def.key.state"
      >
        <!-- Left: icon + number -->
        <div class="step-icon">
          <component :is="def.icon" :size="22" />
          <span class="step-num">{{ def.num }}</span>
        </div>

        <!-- Middle: info + file -->
        <div class="step-body">
          <div class="step-title">{{ def.title }}</div>
          <div class="step-hint">{{ def.hint }}</div>

          <label class="file-pick">
            <Upload :size="14" />
            <span>{{ def.key.fileName || `Choose ${def.accept} file` }}</span>
            <input type="file" :accept="def.accept" @change="(e) => pickFile(def.key, e)" />
          </label>

          <div v-if="def.key.state === 'loading'" class="step-status">{{ def.key.status }}</div>
          <div v-else-if="def.key.state === 'error'" class="step-status err">{{ def.key.error }}</div>
        </div>

        <!-- Right: action / state indicator -->
        <div class="step-action">
          <div v-if="def.key.state === 'loading'" class="spinner"></div>

          <div v-else-if="def.key.state === 'done'" class="success-circle">
            <svg viewBox="0 0 52 52" class="check-svg">
              <circle class="check-circle" cx="26" cy="26" r="25" fill="none" />
              <path class="check-mark" fill="none" d="M14 27 l8 8 l16 -18" />
            </svg>
          </div>

          <button
            v-else
            class="step-btn"
            :disabled="!def.key.file || running"
            @click="def.run"
          >
            Import
          </button>
        </div>
      </div>
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
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.5px;
  line-height: 1;
  margin-bottom: 4px;
}

.page-sub { font-size: 13px; color: #8a98b5; }

/* ── Import all ── */
.all-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #0f4fa8;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s, opacity 0.2s;
  flex-shrink: 0;
}

.all-btn:hover:not(:disabled) { background: #0d4494; }
.all-btn:active:not(:disabled) { transform: scale(0.97); }
.all-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.all-hint {
  font-size: 12px;
  color: #9aaac4;
  margin-bottom: 20px;
}

/* ── Steps ── */
.steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 8px;
}

.step-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 22px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  border-left: 4px solid transparent;
  transition: border-color 0.3s;
}

.step-card.loading { border-left-color: #0f4fa8; }
.step-card.done    { border-left-color: #2ecc71; }
.step-card.error   { border-left-color: #e85d4a; }

/* Left icon */
.step-icon {
  position: relative;
  width: 54px; height: 54px;
  border-radius: 16px;
  background: #eef3fd;
  color: #0f4fa8;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}

.step-num {
  position: absolute;
  top: -6px; right: -6px;
  width: 20px; height: 20px;
  border-radius: 50%;
  background: #0f4fa8;
  color: white;
  font-size: 11px;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}

/* Middle */
.step-body { flex: 1; min-width: 0; }

.step-title {
  font-size: 16px;
  font-weight: 700;
  color: #0d1b3e;
}

.step-hint {
  font-size: 12px;
  color: #8a98b5;
  margin-bottom: 10px;
}

.file-pick {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  background: #f4f7fc;
  border: 1.5px dashed #cdd8ec;
  border-radius: 10px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: #4a5a7a;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.file-pick:hover { border-color: #0f4fa8; background: #eef3fd; }
.file-pick span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.file-pick input { display: none; }

.step-status {
  font-size: 12px;
  font-weight: 600;
  color: #0f4fa8;
  margin-top: 10px;
}

.step-status.err { color: #e85d4a; }

/* Right action */
.step-action {
  flex-shrink: 0;
  width: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.step-btn {
  background: #eef3fd;
  color: #0f4fa8;
  border: none;
  border-radius: 10px;
  padding: 10px 20px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, opacity 0.2s;
}

.step-btn:hover:not(:disabled) { background: #0f4fa8; color: white; }
.step-btn:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Spinner ── */
.spinner {
  width: 34px; height: 34px;
  border: 4px solid #eef3fd;
  border-top-color: #0f4fa8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Success check ── */
.success-circle { width: 44px; height: 44px; }
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

/* ── Responsive ── */
@media (max-width: 900px) {
  .page { margin-left: 70px; padding: 24px 20px; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>
