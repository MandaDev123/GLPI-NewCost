<script setup>
import { LayoutDashboard, Server, Ticket, Users, Settings, RotateCcw, Upload, LogOut } from 'lucide-vue-next'
import { useRouter } from 'vue-router'

const router = useRouter()

function logout() {
  localStorage.removeItem('is_authenticated')
  router.push('/Login_Unique')
}

const navItems = [
  { label: 'Dashboard',  icon: LayoutDashboard, to: '/Dashboard' },
  { label: 'Assets',     icon: Server,          to: '/Assets'    },
  { label: 'Tickets',    icon: Ticket,          to: '/Tickets'   },
  { label: 'Users',      icon: Users,           to: '/Users'     },
  { label: 'Reset Data', icon: RotateCcw,       to: '/Reset'     },
  { label: 'Import Data',icon:Upload,          to: '/Import'    },
  { label: 'Settings',   icon: Settings,        to: '/Settings'  },
]
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-logo">
      <div class="logo-icon">G</div>
      <span class="logo-text">GLPI</span>
    </div>

    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.label"
        :to="item.to"
        class="nav-item"
        active-class="active"
      >
        <component :is="item.icon" :size="18" class="nav-icon" />
        <span>{{ item.label }}</span>
      </router-link>
    </nav>

    <div class="sidebar-footer">
      <div class="user-avatar">A</div>
      <div class="user-info">
        <span class="user-name">Admin</span>
        <span class="user-role">Super-Admin</span>
      </div>
    </div>

    <button class="logout-btn" @click="logout">
      <LogOut :size="18" class="nav-icon" />
      <span>Logout</span>
    </button>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 220px;
  background: #0f4fa8;
  display: flex;
  flex-direction: column;
  padding: 28px 16px;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  font-family: 'DM Sans', sans-serif;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 8px;
  margin-bottom: 36px;
}

.logo-icon {
  width: 36px; height: 36px;
  background: white;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  font-size: 18px;
  color: #0f4fa8;
}

.logo-text {
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: white;
  letter-spacing: 1px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.nav-item:hover { background: rgba(255,255,255,0.1); color: white; }
.nav-item.active { background: rgba(255,255,255,0.15); color: white; }

.nav-icon { flex-shrink: 0; }

.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
}

.user-avatar {
  width: 34px; height: 34px;
  background: white;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  color: #0f4fa8;
  font-size: 14px;
}

.user-info { display: flex; flex-direction: column; }
.user-name { font-size: 13px; font-weight: 600; color: white; }
.user-role { font-size: 11px; color: rgba(255,255,255,0.55); }

.logout-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  margin-top: 8px;
  border: none;
  border-radius: 10px;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.65);
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'DM Sans', sans-serif;
}
.logout-btn:hover { background: rgba(255,80,80,0.2); color: #ff6b6b; }

/* ── Responsive ── */
@media (max-width: 900px) {
  .sidebar { width: 70px; padding: 20px 10px; }
  .logo-text, .nav-item span:last-child, .user-info, .logout-btn span { display: none; }
}
</style>
