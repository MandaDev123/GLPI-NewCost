<script setup>
import { ref } from 'vue'
import { resetAllData } from '@/services/resetservices'
import Navbar from '@/components/Navbar.vue'
import { RotateCcw, AlertTriangle } from 'lucide-vue-next'

// 'idle' | 'loading' | 'done' | 'error'
const state = ref('idle')
const status = ref('')
const errorMsg = ref('')

async function handleReset() {
  if (state.value === 'loading') return
  if (!confirm('This will permanently delete all tickets, assets and custom users. Continue?')) return

  state.value = 'loading'
  errorMsg.value = ''
  try {
    await resetAllData((msg) => { status.value = msg })
    state.value = 'done'
  } catch (err) {
    errorMsg.value = err?.message ?? 'Reset failed'
    state.value = 'error'
  }
}

function reset() {
  state.value = 'idle'
  status.value = ''
  errorMsg.value = ''
}
</script>

<template>
  <Navbar />

  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Reset data</h1>
      <span class="page-sub">Reinitialize the GLPI database</span>
    </div>

    <div class="reset-card">

      <!-- Idle -->
      <template v-if="state === 'idle'">
        <div class="warn-icon"><AlertTriangle :size="30" /></div>
        <h2 class="card-title">Reset all data</h2>
        <p class="card-text">
          This permanently deletes all tickets, assets (computers, monitors, printers,
          network equipment, phones, software) and custom users. This action cannot be undone.
        </p>
        <button class="reset-btn" @click="handleReset">
          <RotateCcw :size="18" /> Réinitialiser les données
        </button>
      </template>

      <!-- Loading -->
      <template v-else-if="state === 'loading'">
        <div class="spinner"></div>
        <h2 class="card-title">Resetting…</h2>
        <p class="status-text">{{ status }}</p>
      </template>

      <!-- Done -->
      <template v-else-if="state === 'done'">
        <div class="success-circle">
          <svg viewBox="0 0 52 52" class="check-svg">
            <circle class="check-circle" cx="26" cy="26" r="25" fill="none" />
            <path class="check-mark" fill="none" d="M14 27 l8 8 l16 -18" />
          </svg>
        </div>
        <h2 class="card-title">All data reset</h2>
        <p class="card-text">The database has been reinitialized successfully.</p>
        <button class="ghost-btn" @click="reset">Done</button>
      </template>

      <!-- Error -->
      <template v-else>
        <div class="warn-icon error"><AlertTriangle :size="30" /></div>
        <h2 class="card-title">Reset failed</h2>
        <p class="card-text">{{ errorMsg }}</p>
        <button class="reset-btn" @click="handleReset">Try again</button>
      </template>

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

.page-header { margin-bottom: 24px; }

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.5px;
  line-height: 1;
  margin-bottom: 4px;
}

.page-sub {
  font-size: 13px;
  color: #8a98b5;
}

/* ── Card ── */
.reset-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 48px 40px;
  max-width: 460px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.card-title {
  font-size: 20px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.3px;
}

.card-text {
  font-size: 14px;
  line-height: 1.6;
  color: #8a98b5;
  max-width: 360px;
}

/* ── Warning icon ── */
.warn-icon {
  width: 64px; height: 64px;
  border-radius: 18px;
  background: #fdf6ee;
  color: #e8943a;
  display: flex; align-items: center; justify-content: center;
}

.warn-icon.error { background: #fdecea; color: #e85d4a; }

/* ── Reset button ── */
.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #e85d4a;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.2s, transform 0.1s;
}

.reset-btn:hover { background: #d44a38; }
.reset-btn:active { transform: scale(0.97); }

.ghost-btn {
  background: #eef3fd;
  color: #0f4fa8;
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  margin-top: 6px;
  transition: background 0.2s;
}

.ghost-btn:hover { background: #0f4fa8; color: white; }

/* ── Spinner ── */
.spinner {
  width: 56px; height: 56px;
  border: 5px solid #eef3fd;
  border-top-color: #0f4fa8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.status-text {
  font-size: 14px;
  font-weight: 600;
  color: #0f4fa8;
  min-height: 20px;
}

/* ── Success check ── */
.success-circle {
  width: 84px; height: 84px;
}

.check-svg {
  width: 100%; height: 100%;
}

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
}
</style>
