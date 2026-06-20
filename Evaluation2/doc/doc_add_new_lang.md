 
 async function addLanguage() {
  if (!newLang.value.code) return
  await fetch(`${API}/translations/${newLang.value.code}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ labels: newLang.value.labels })
  })
  const code = newLang.value.code
  availableLangs.value.push(code)
  newLang.value = { code: '', labels: { label_nouveau: '', label_inprogress: '', label_termine: '' } }
  await loadTranslations(code)
}
 
 
 
 
  <!-- Add language -->
    <div class="section-card">
      <div class="section-title">
        <Plus :size="16" />
        Add a language
      </div>
      <input v-model="newLang.code" placeholder="Language code (e.g. en)" class="text-input code-input" />
      <div class="row" v-for="key in labelKeys" :key="key">
        <span class="row-label">{{ key }}</span>
        <input v-model="newLang.labels[key]" :placeholder="key" class="text-input" />
      </div>
      <button class="add-lang-btn" @click="addLanguage">
        <Plus :size="15" />
        Add language
      </button>
    </div>