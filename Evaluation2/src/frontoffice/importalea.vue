<script setup>
import { parseCSV } from '@/services/importServices'
import { processMouvement } from '@/services/sqlliteServices'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const file = ref()
const fileName = ref('')
const status = ref('')

function pickFile(event) {
  file.value = event.target.files[0]
  fileName.value = file.value?.name ?? ''
  status.value = ''
}

async function load_import() {
  if (!file.value) return
  status.value = 'Importing…'
  let data = await parseCSV(file.value)
  for (const mouvement of data) {
    await processMouvement(mouvement)
  }
  status.value = `Done — ${data.length} movement(s) processed.`
}

// manual entry
const ticket = ref('')
const mvt = ref('')
const valeur = ref('')

async function handleManuel() {
  if (!ticket.value || !mvt.value) return
  await processMouvement({ ticket: ticket.value, mvt: mvt.value, valeur: valeur.value })
  status.value = `Manual mouvement "${mvt.value}" applied to ticket ${ticket.value}.`
  ticket.value = ''
  mvt.value = ''
  valeur.value = ''
}
</script>

<template>
  <div class="page">

    <header class="topbar">
      <button class="back-btn" @click="router.push('/Catalogue')">← Catalogue</button>
      <div>
        <h2 class="page-title">Import mouvements</h2>
        <span class="page-sub">Import a CSV file or enter a movement manually</span>
      </div>
    </header>

    <!-- CSV import card -->
    <div class="card">
      <h3 class="card-title">CSV import</h3>

      <label class="file-pick">
        <span>{{ fileName || 'Choose a .csv file' }}</span>
        <input type="file" accept=".csv" @change="(e) => pickFile(e)" />
      </label>

      <button class="btn-primary" :disabled="!file" @click="load_import">
        Import mouvements
      </button>
    </div>


    <!-- Manual entry card -->
    <div class="card">
      <h3 class="card-title">Manual entry</h3>

      <div class="form-row">
        <input class="field" v-model="ticket" placeholder="Ticket (external id)" />
        <select class="field" v-model="mvt">
          <option value="">-- type --</option>
          <option value="open">open</option>
          <option value="close">close</option>
          <option value="cancel">cancel</option>
        </select>
        <input class="field" v-model="valeur" placeholder="Valeur (optional)" type="number" />
        <button class="btn-primary" :disabled="!ticket || !mvt" @click="handleManuel">Apply</button>
      </div>
    </div>

    <p v-if="status" class="status-msg">{{ status }}</p>

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
  transition: background 0.15s;
}
.back-btn:hover { background: #f3f4f6; }

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}
.page-sub { font-size: 13px; color: #64748b; }

/* ── Cards ── */
.card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  padding: 28px 32px;
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 680px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #0d1b3e;
}

/* ── File picker ── */
.file-pick {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: #f4f7fc;
  border: 1.5px dashed #cdd8ec;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #4a5a7a;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  width: fit-content;
}
.file-pick:hover { border-color: #0f4fa8; background: #eef3fd; }
.file-pick input { display: none; }

/* ── Manual form ── */
.form-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.field {
  background: #f4f7fc;
  border: 1.5px solid #e4eaf5;
  border-radius: 10px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 13px;
  color: #2d3a55;
  outline: none;
  transition: border-color 0.15s;
  flex: 1;
  min-width: 120px;
}
.field:focus { border-color: #0f4fa8; }

/* ── Primary button ── */
.btn-primary {
  background: #0f4fa8;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 22px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
  white-space: nowrap;
}
.btn-primary:hover:not(:disabled) { background: #0d4494; }
.btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Status message ── */
.status-msg {
  font-size: 13px;
  font-weight: 600;
  color: #0f4fa8;
  margin-top: 4px;
}
</style>
