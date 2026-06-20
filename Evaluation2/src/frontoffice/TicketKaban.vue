
<script setup>
import { ref, onMounted } from 'vue'
import { get_all_ticket , update_ticket_status} from '@/services/ticketServices.js'
import { glpiPost } from '@/services/glpiServices.js'
import { getUsers } from '@/services/usersServices.js'
import draggable from 'vuedraggable'
import { useRouter } from 'vue-router'
import { getColors, getTranslations, getLangs, processMouvement } from '@/services/sqlliteServices'
import { Ticket } from 'lucide-vue-next'

// columns les status
const columns = ref([])
//langs
const availableLangs = ref([])
const selectedLang = ref(localStorage.getItem('kanban_lang') || 'fr')
const users = ref([])

const lastSuperCost = ref(localStorage.getItem('lastSupercost')) || 0
const activeTicket = ref()

const router = useRouter()


//delete last supercost
async function deleteLastSupercost(){
  await processMouvement({ mvt: 'cancel', ticket: activeTicket.value })
}

// Dialog
const dialog = ref({
  visible: false,
  ticketId: null,
  externalid: null,
  fromStatus: null,
  toStatus: null,
  resolutionText: '',
  selectedUserId: '',
  type: null,
  cost:'',
  reouverture:'',
  mode:''
})

//load langs 
async function loadLabels(lang) {
  selectedLang.value = lang
  localStorage.setItem('kanban_lang', lang)
  const labels = await getTranslations(lang)
  columns.value[0].label = labels.label_nouveau
  columns.value[1].label = labels.label_inprogress
  columns.value[2].label = labels.label_termine
} 

onMounted(async () => {
    // Load settings
  const colors = await getColors()
  availableLangs.value = await getLangs()
  const labels = await getTranslations(selectedLang.value)
 
  // Apply to columns
  columns.value = [
    { status: 1, label: labels.label_nouveau,    bgColor: colors.color_nouveau,    tickets: [] },
    { status: 2, label: labels.label_inprogress, bgColor: colors.color_inprogress, tickets: [] },
    { status: 6, label: labels.label_termine,    bgColor: colors.color_termine,    tickets: [] },
  ]

  users.value = await getUsers()
  const allTickets = await get_all_ticket()
  console.log('tickets',allTickets)
  allTickets.forEach(ticket => {
    const col = columns.value.find(c => c.status === ticket.status)
    if (col) col.tickets.push(ticket)
  })
})

function openTicket(ticket) {
  console.log('open ticket', ticket)
   router.push(`/Tickets/${ticket.id}`)
}

function openAddDialog() {
  console.log('add ticket')
   router.push('/NewTicket')
}


// Drag and drop to update status 
async function onDragEnd(event) {
  const ticketId = event.item._underlying_vm_.id
  const externalid = event.item._underlying_vm_.externalid

  const toCol = columns.value.find(col =>
    col.tickets.some(t => t.id === ticketId)
  )
  const fromStatus = event.item._underlying_vm_.status
  const toStatus = toCol?.status

  if (!toStatus || fromStatus === toStatus) return

  const base = { visible: true, ticketId, externalid, fromStatus, toStatus, resolutionText: '', selectedUserId: '' }

  if (fromStatus === 6) {
    // Terminé → any: optional followup comment
    dialog.value = { ...base, type: 'followup' }
    activeTicket.value = externalid

  } else if (toStatus === 6) {
    // any → Terminé: required resolution text
    dialog.value = { ...base, type: 'resolve' }
  } else if (fromStatus === 1 && toStatus === 2) {
    // New → In Progress: optional user assignment
    dialog.value = { ...base, type: 'assign' }
  } else {
    await applyStatusChange(ticketId, toStatus)
  }
}

// Apply status change
async function applyStatusChange(ticketId, newStatus) {
  try {
    await update_ticket_status(ticketId, newStatus)
    // update local ticket object status
    columns.value.forEach(col => {
      col.tickets.forEach(t => {
        if (t.id === ticketId) t.status = newStatus
      })
    })
  } catch (e) {
    console.error('Erreur mise à jour statut', e)
  }
}

//Confirm dialog
async function confirmDialog() {
  const { ticketId, externalid, toStatus, resolutionText, selectedUserId, type ,cost ,reouverture,mode} = dialog.value

  if (type === 'assign' && selectedUserId) {
    await glpiPost('/Ticket_User', { tickets_id: ticketId, users_id: selectedUserId, type: 2 })
  }

  if ((type === 'resolve') && resolutionText.trim()) {
    await glpiPost('/ITILFollowup', { items_id: ticketId, itemtype: 'Ticket', content: resolutionText })
    await processMouvement({ mvt: 'close', ticket: externalid, valeur: cost })
    localStorage.setItem('lastSupercost', cost)

  }

  if ((type === 'followup')  && resolutionText.trim()){
     await glpiPost('/ITILFollowup', { items_id: ticketId, itemtype: 'Ticket', content: resolutionText })

     if (reouverture !== '' && reouverture !== null && reouverture !== undefined) {
       await processMouvement({ mvt: 'open', ticket: externalid, valeur: reouverture ,mode:mode })
     }
     
     localStorage.removeItem('lastSupercost')

  }
  

  await applyStatusChange(ticketId, toStatus)
  dialog.value.visible = false
}

//Cancel dialog 
function cancelDialog() {
  // revert the drag — move ticket back to original column
  const { ticketId, fromStatus, toStatus } = dialog.value

  const fromCol = columns.value.find(c => c.status === fromStatus)
  const toCol = columns.value.find(c => c.status === toStatus)
  const ticket = toCol?.tickets.find(t => t.id === ticketId)

  if (ticket && fromCol && toCol) {
    toCol.tickets = toCol.tickets.filter(t => t.id !== ticketId)
    fromCol.tickets.push(ticket)
  }

  dialog.value.visible = false
}

</script>


<template>
  <div class="kanban-page">
    <header class="topbar">

      <button class="back-btn" @click="router.push('/Catalogue')">
        ← Catalogue
      </button>
      <div>
        <h2 class="page-title">Tickets</h2>
        <span class="page-sub">Drag cards to update their status</span>
      </div>
    </header>

       <div class="lang-selector">
  <button
    v-for="lang in availableLangs"
    :key="lang"
    :class="{ active: selectedLang === lang }"
    @click="loadLabels(lang)"
  >
    {{ lang.toUpperCase() }}
  </button>
</div>


    <div class="kanban-board">
      <div
        v-for="col in columns"
        :key="col.status"
        class="kanban-column"
         :style="{ background: col.bgColor }"
      >
        <div class="column-header">
          <span>{{ col.label }}</span>
          <span class="badge">{{ col.tickets.length }}</span>
        </div>

          <draggable
                v-model="col.tickets"
                group="tickets"
                item-key="id"
                @end="onDragEnd"
            >
            <template #item="{ element }">
            <div class="ticket-card" @click="openTicket(element)">
                {{ element.name }}
            </div>
            </template>
        </draggable>
        
        <button v-if="col.status === 1" class="add-btn" @click="openAddDialog">
          + Ajouter 1 ticket
        </button>
      </div>
    </div>

    <!-- Dialog overlay -->
<div v-if="dialog.visible" class="dialog-overlay">
  <div class="dialog-box">

    <!-- Assign: New → In Progress (optional) -->
    <template v-if="dialog.type === 'assign'">
      <h3>Assigner le ticket</h3>
      <p>Choisissez un technicien (optionnel) :</p>
      <select v-model="dialog.selectedUserId" class="dialog-select">
        <option value="">— Aucun —</option>
        <option v-for="user in users" :key="user.id" :value="user.id">{{ user.name }}</option>
      </select>
      <div class="dialog-actions">
        <button class="btn-cancel" @click="cancelDialog">Annuler</button>
        <button class="btn-skip" @click="confirmDialog">Passer</button>
        <button class="btn-confirm" @click="confirmDialog">Confirmer</button>
      </div>
    </template>

    <!-- Resolve: any → Terminé (required) -->
    <template v-else-if="dialog.type === 'resolve'">
      <h3>Clôturer le ticket</h3>
      <p>Veuillez saisir une description de résolution :</p>
      <textarea
        v-model="dialog.resolutionText"
        rows="4"
        placeholder="Décrivez la résolution..."
      />

      <input type="number"  placeholder="Super cost" v-model="dialog.cost">

      <div class="dialog-actions">
        <button class="btn-cancel" @click="cancelDialog">Annuler</button>
        <button
          class="btn-confirm"
          :disabled="!dialog.resolutionText.trim()"
          @click="confirmDialog"
        >Confirmer</button>
      </div>
    </template>

    <!-- Followup: Terminé → any (optional) -->
    <template v-else-if="dialog.type === 'followup'">
      <h3>Rouvrir le ticket</h3>
      <p>Ajoutez un commentaire de suivi (optionnel) :</p>
      <textarea
        v-model="dialog.resolutionText"
        rows="4"
        placeholder="Commentaire de suivi..."
      />
      
      <button @click="deleteLastSupercost()">anulation</button>
      <input type="text" v-model="dialog.reouverture" placeholder=" reouverture">

       <select v-model="dialog.mode" >
          <option value="">All mode</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>

           </select>

      <div class="dialog-actions">
        <button class="btn-cancel" @click="cancelDialog">Annuler</button>
        <button class="btn-skip" @click="confirmDialog">Passer</button>
        <button class="btn-confirm" @click="confirmDialog">Confirmer</button>
      </div>
    </template>

  </div>
</div>

  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ── Page ── */
.kanban-page {
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
  border: none;
  border-radius: 12px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  color: #4a5a7a;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
  transition: color 0.15s, transform 0.1s;
  flex-shrink: 0;
}
.back-btn:hover { color: #0f4fa8; }
.back-btn:active { transform: scale(0.96); }

.page-title {
  font-size: 26px;
  font-weight: 800;
  color: #0d1b3e;
  letter-spacing: -0.5px;
  margin-bottom: 2px;
}
.page-sub { font-size: 13px; color: #8a98b5; }

/* ── Board ── */
.kanban-board {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

/* ── Columns ── */
.kanban-column {
  flex: 1;
  min-width: 220px;
  border-radius: 20px;
  padding: 18px 16px;
}
.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.column-header span:first-child {
  font-size: 14px;
  font-weight: 700;
  color: #0d1b3e;
}

.badge {
  background: white;
  color: #4a5a7a;
  font-size: 11px;
  font-weight: 700;
  width: 22px; height: 22px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

/* ── Ticket cards ── */
.ticket-card {
  background: white;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #2d3a55;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  transition: transform 0.15s, box-shadow 0.15s;
  user-select: none;
}
.ticket-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(15, 79, 168, 0.12);
}

/* ── Add button ── */
.add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  background: transparent;
  border: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #0f4fa8;
  cursor: pointer;
  padding: 6px 2px;
  transition: color 0.15s;
}
.add-btn:hover { color: #0d4494; }

/* ── Close-ticket dialog ── */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog-box {
  background: white;
  border-radius: 20px;
  padding: 28px;
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  box-shadow: 0 16px 40px rgba(0,0,0,0.16);
}

.dialog-box h3 {
  font-size: 17px;
  font-weight: 800;
  color: #0d1b3e;
}

.dialog-box p {
  font-size: 13px;
  color: #8a98b5;
}

.dialog-box textarea {
  width: 100%;
  background: #f4f7fc;
  border: 1.5px solid #e4eaf6;
  border-radius: 12px;
  padding: 12px 14px;
  font-family: inherit;
  font-size: 14px;
  color: #2d3a55;
  resize: vertical;
  outline: none;
  transition: border-color 0.15s;
}
.dialog-box textarea:focus { border-color: #0f4fa8; }

.dialog-select {
  width: 100%;
  background: #f4f7fc;
  border: 1.5px solid #e4eaf6;
  border-radius: 12px;
  padding: 10px 14px;
  font-family: inherit;
  font-size: 14px;
  color: #2d3a55;
  outline: none;
  transition: border-color 0.15s;
  appearance: none;
}
.dialog-select:focus { border-color: #0f4fa8; }

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-cancel {
  background: #f4f7fc;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #4a5a7a;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-cancel:hover { background: #e8edf8; }

.btn-skip {
  background: #f4f7fc;
  border: 1.5px solid #e4eaf6;
  padding: 10px 18px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #4a5a7a;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-skip:hover { background: #e8edf8; }

.btn-confirm {
  background: #2ecc71;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 10px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}
.btn-confirm:hover:not(:disabled) { background: #27ae60; }
.btn-confirm:disabled { opacity: 0.45; cursor: not-allowed; }

/* ── Responsive ── */
@media (max-width: 700px) {
  .kanban-page { padding: 24px 20px 40px; }
  .kanban-board { flex-direction: column; }
  .kanban-column { min-width: unset; }
}


 
/* ── Lang selector ── */
.lang-selector {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
}
.lang-selector button {
  padding: 6px 14px;
  border: 1.5px solid #e4eaf6;
  border-radius: 8px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  background: white;
  color: #4a5a7a;
  transition: all 0.15s;
}
.lang-selector button.active {
  background: #0f4fa8;
  color: white;
  border-color: #0f4fa8;
}
</style>