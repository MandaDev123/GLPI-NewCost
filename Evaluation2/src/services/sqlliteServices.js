const BASE_URL = 'http://localhost:3001'

// Base fetch
async function sqliteFetch(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) options.body = JSON.stringify(body)
  const res = await fetch(`${BASE_URL}${endpoint}`, options)
  return res.json()
}

// ── Colors ──
export async function getColors() {
  return sqliteFetch('/colors')
}

export async function updateColor(key, value) {
  return sqliteFetch(`/colors/${key}`, 'PUT', { value })
}

// ── Translations ──
export async function getLangs() {
  return sqliteFetch('/translations')
}

export async function getTranslations(lang) {
  return sqliteFetch(`/translations/${lang}`)
}

export async function updateTranslation(lang, key, value) {
  return sqliteFetch(`/translations/${lang}/${key}`, 'PUT', { value })
}

export async function addLanguage(lang, labels) {
  return sqliteFetch(`/translations/${lang}`, 'POST', { labels })
}

export async function addCost(idticket, cost){
    console.log(idticket,cost)
    return sqliteFetch(`/supercost/${idticket}`, 'POST', { cost })
}

export async function getCosts(idticket) {
  return sqliteFetch(`/supercost/${idticket}`)
}

export async function getAllCosts() {
  return sqliteFetch('/supercost')
}

export async function getlastCost(idticket){
  const result = await sqliteFetch(`/supercost/Last/${idticket}`)
  return result.data
}

export async function getFirstCost(idticket){
  const result = await sqliteFetch(`/supercost/First/${idticket}`)
  return result.data.cost
}

export async function getCountCost(idticket){
  const result = await sqliteFetch(`/supercost/count/${idticket}`)
  return result.data.count
}

export async function getSommeCost(idticket){
  const result = await sqliteFetch(`/supercost/Somme/${idticket}`)
  return result.data.somme
}

export async function deletelastCost(value){
    return sqliteFetch(`/supercost/delete/${value}`, 'DELETE')
}

export async function addReouverture(ticket , pourcentage){
    return sqliteFetch(`/coutReouverture/${ticket}`, 'POST', { pourcentage })
}
export async function getReouverture(idticket) {
  return sqliteFetch(`/coutReouverture${idticket}`)
}

export async function getAllReouverture() {
  return sqliteFetch('/coutReouverture')
}

//  LA FONCTION MÉTIER 
export async function processMouvement(mouvement) {
  let reouverture = 0
  let count = await getCountCost(mouvement.ticket)
  if (mouvement.mvt == 'open') {
    if(mouvement.mode == '1'){
    let lastcost = await getlastCost(mouvement.ticket)
     reouverture = (Number(lastcost.cost) * Number(mouvement.valeur)) / 100
    }
    if(mouvement.mode == '2'){
      let Firstcost = await getFirstCost(mouvement.ticket)
      reouverture = (Number(Firstcost) * Number(mouvement.valeur)) / 100
    }
    if(mouvement.mode == '3'){
      let sommecost = await getSommeCost(mouvement.ticket)
      reouverture = ((Number(sommecost)/count) * Number(mouvement.valeur)) / 100
    }
    if(mouvement.mode == '4'){
      let sommecost = await getSommeCost(mouvement.ticket)
      reouverture = (Number(sommecost) * Number(mouvement.valeur)) / 100
    }
    await addReouverture(mouvement.ticket, reouverture)
  }
  if (mouvement.mvt == 'cancel') {
    await deletelastCost(mouvement.ticket)
  }
  if (mouvement.mvt == 'close') {
    await addCost(mouvement.ticket, mouvement.valeur)
  }
}