import {createRouter , createWebHistory} from 'vue-router'
import Portal from '@/Portal.vue'
import Dashboard from "@/backoffice/Dashboard.vue"
import Login from "@/backoffice/Login.vue"
import Login_Unique from '@/backoffice/Login_Unique.vue'
import Tickets from '@/backoffice/Tickets.vue'
import TicketDetail from '@/backoffice/TicketDetail.vue'
import Reinitialization from '@/backoffice/Reinitialization.vue'
import Import from '@/backoffice/Import.vue'
import Catalogue from '@/frontoffice/Catalogue.vue'
import NewTicket from '@/frontoffice/NewTicket.vue'
import TicketKaban from '@/frontoffice/TicketKaban.vue'
import settings from '@/backoffice/settings.vue'
import { compile } from 'vue'
import ItemList from '@/frontoffice/ItemList.vue'
import ItemTypeDetail from '@/frontoffice/ItemTypeDetail.vue'
import importalea from '@/frontoffice/importalea.vue'

// protected routes
const protectedRoutes = [
  '/Dashboard',
  '/Tickets',
  '/Reset',
  '/Import',
  '/Settings'
]

const routes =[
    {path: '/', component: Portal },
    {path: '/Login', component: Login},
    {path: '/Login_Unique', component: Login_Unique},
    {path: '/Dashboard', component: Dashboard},
    {path: '/Tickets', component: Tickets},
    {path: '/Tickets/:id', component:TicketDetail},
    {path: '/Reset', component: Reinitialization},
    {path: '/Import', component: Import},
    {path: '/Catalogue', component: Catalogue},
    {path: '/NewTicket', component: NewTicket},
    {path: '/TicketKaban', component:TicketKaban},
    {path: '/Settings' , component:settings},
    {path: '/ItemList' , component:ItemList},
    {path: '/ItemDetail/:type' , component:ItemTypeDetail},
    {path: '/importalea' , component:importalea}


]

const router= createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('is_authenticated') === 'true'
  const isProtected = protectedRoutes.includes(to.path)

  if (isProtected && !isAuthenticated) {
    next('/Login_Unique') 
  } else {
    next() 
  }
})



export default router