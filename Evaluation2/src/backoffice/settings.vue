<script setup>
import { ref, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import { Palette, Globe, Plus, Save } from 'lucide-vue-next'

const API = 'http://localhost:3001'

const colors = ref({})
const translations = ref({})
const selectedLang = ref('mg')
const availableLangs = ref([])
const labelKeys = ['label_nouveau', 'label_inprogress', 'label_termine']

const newLang = ref({
  code: '',
  labels: {
    label_nouveau: '',
    label_inprogress: '',
    label_termine: ''
  }
})

onMounted(async () => {
  await loadColors()
  await loadAvailableLangs()
})

async function loadAvailableLangs() {
  const res = await fetch(`${API}/translations`)
  const data = await res.json()
  // API returns either an array of codes or an object keyed by lang code
  availableLangs.value = Array.isArray(data) ? data : Object.keys(data)
  if (availableLangs.value.length > 0) {
    await loadTranslations(availableLangs.value[0])
  }
}

async function loadColors() {
  const res = await fetch(`${API}/colors`)
  colors.value = await res.json()
}

async function loadTranslations(lang) {
  selectedLang.value = lang
  const res = await fetch(`${API}/translations/${lang}`)
  translations.value = await res.json()
}

async function updateColor(key) {
  await fetch(`${API}/colors/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: colors.value[key] })
  })
}

async function updateTranslation(key) {
  await fetch(`${API}/translations/${selectedLang.value}/${key}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: translations.value[key] })
  })
}


</script>

<template>
  <Navbar />

  <div class="page">
    <div class="page-header">
      <h1 class="page-title">Settings</h1>
    </div>

    <!-- Column colours -->
    <div class="section-card">
      <div class="section-title">
        <Palette :size="16" />
        Column colours
      </div>
      <div class="row" v-for="(value, key) in colors" :key="key">
        <span class="row-label">{{ key }}</span>
        <input type="color" v-model="colors[key]" @change="updateColor(key)" class="color-swatch" />
        <span class="color-hex">{{ value }}</span>
      </div>
    </div>

    <!-- Translations -->
    <div class="section-card">
      <div class="section-title">
        <Globe :size="16" />
        Translations
      </div>
      <div class="lang-tabs">
        <button
          v-for="lang in availableLangs"
          :key="lang"
          class="lang-tab"
          :class="{ active: selectedLang === lang }"
          @click="loadTranslations(lang)"
        >
          {{ lang.toUpperCase() }}
        </button>
      </div>
      <div class="row" v-for="(value, key) in translations" :key="key">
        <span class="row-label">{{ key }}</span>
        <input type="text" v-model="translations[key]" class="text-input" />
        <button class="save-btn" @click="updateTranslation(key)">
          <Save :size="14" />
        </button>
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
  margin-bottom: 28px;
}

.page-title {
  font-size: 28px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.5px;
}

/* ── Cards ── */
.section-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  padding: 24px 28px;
  margin-bottom: 20px;
  max-width: 680px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #8a98b5;
  margin-bottom: 20px;
}

/* ── Rows ── */
.row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 0;
  border-bottom: 1px solid #f0f4fb;
}
.row:last-of-type { border-bottom: none; }

.row-label {
  width: 200px;
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: #2d3a55;
}

/* ── Color input ── */
.color-swatch {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  padding: 2px;
  background: #f4f7fc;
  flex-shrink: 0;
}

.color-hex {
  font-size: 12px;
  font-weight: 600;
  color: #8a98b5;
  font-family: monospace;
}

/* ── Text input ── */
.text-input {
  flex: 1;
  border: 1.5px solid #e4eaf6;
  border-radius: 10px;
  padding: 9px 14px;
  font-family: inherit;
  font-size: 13px;
  color: #2d3a55;
  background: #f7f9fd;
  outline: none;
  transition: border-color 0.15s;
}
.text-input:focus { border-color: #0f4fa8; background: white; }

.code-input {
  width: 100%;
  margin-bottom: 16px;
  flex: unset;
}

/* ── Save button ── */
.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: #eef3fd;
  color: #0f4fa8;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;
}
.save-btn:hover { background: #0f4fa8; color: white; }

/* ── Lang tabs ── */
.lang-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}

.lang-tab {
  padding: 6px 18px;
  border: 1.5px solid #e4eaf6;
  border-radius: 20px;
  background: white;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  color: #4a5a7a;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.lang-tab.active {
  background: #0f4fa8;
  color: white;
  border-color: #0f4fa8;
}
.lang-tab:not(.active):hover { background: #eef3fd; border-color: #c4d4f0; }

/* ── Add language button ── */
.add-lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 18px;
  background: #0f4fa8;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 10px 20px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.add-lang-btn:hover { background: #0d4494; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .page { margin-left: 70px; padding: 24px 20px; }
  .row-label { width: 140px; }
}
</style>
