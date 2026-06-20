<script setup>
import { useRouter } from 'vue-router'
import { Globe, ShieldCheck, ArrowRight } from 'lucide-vue-next'

const router = useRouter()

const choices = [
  {
    key: 'front',
    subtitle: 'FrontOffice',
    title: 'User space',
    description: "Browse the company's equipment catalogue: photos, statuses, locations…",
    icon: Globe,
    to: '/Catalogue',
  },
  {
    key: 'back',
    subtitle: 'BackOffice',
    title: 'Admin space',
    description: 'Manage tickets, IT assets, imports and users.',
    icon: ShieldCheck,
    to: '/Login_Unique',
  },
]

function goTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="portal">
    <div class="portal-intro">
      <div class="portal-logo">G</div>
      <h1>GLPI</h1>
      <p>IT asset and helpdesk management platform</p>
    </div>

    <div class="choice-grid">
      <button
        v-for="choice in choices"
        :key="choice.key"
        class="choice-card"
        :class="choice.key"
        @click="goTo(choice.to)"
      >
        <div class="choice-icon"><component :is="choice.icon" :size="26" /></div>
        <div class="choice-subtitle">{{ choice.subtitle }}</div>
        <div class="choice-title">{{ choice.title }}</div>
        <p class="choice-desc">{{ choice.description }}</p>
        <span class="choice-cta">Continue <ArrowRight :size="15" /></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.portal {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 48px;
  background: linear-gradient(160deg, #0f4fa8 0%, #0a3d87 45%, #0d1b3e 100%);
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 40px 20px;
}

.portal-intro { text-align: center; color: white; }

.portal-logo {
  width: 64px; height: 64px;
  margin: 0 auto 20px;
  background: white;
  border-radius: 18px;
  display: flex; align-items: center; justify-content: center;
  font-size: 28px;
  font-weight: 800;
  color: #0f4fa8;
  box-shadow: 0 12px 32px rgba(0,0,0,0.25);
}

.portal-intro h1 {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.portal-intro p {
  font-size: 14px;
  color: rgba(255,255,255,0.7);
}

.choice-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(250px, 320px));
  gap: 24px;
}

.choice-card {
  text-align: left;
  background: white;
  border: none;
  border-radius: 22px;
  padding: 28px;
  cursor: pointer;
  font-family: inherit;
  box-shadow: 0 16px 40px rgba(0,0,0,0.18);
  transition: transform 0.2s, box-shadow 0.2s;
}
.choice-card:hover { transform: translateY(-5px); box-shadow: 0 22px 48px rgba(0,0,0,0.24); }
.choice-card:active { transform: scale(0.98); }

.choice-icon {
  width: 52px; height: 52px;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 18px;
  background: #eef3fd;
  color: #0f4fa8;
}
.choice-card.back .choice-icon { background: #fdecea; color: #e85d4a; }

.choice-subtitle {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #9aaac4;
  margin-bottom: 4px;
}

.choice-title {
  font-size: 19px;
  font-weight: 800;
  color: #0d1b3e;
  margin-bottom: 10px;
}

.choice-desc {
  font-size: 13px;
  color: #8a98b5;
  line-height: 1.5;
  margin-bottom: 20px;
}

.choice-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #0f4fa8;
}
.choice-card.back .choice-cta { color: #e85d4a; }

@media (max-width: 640px) {
  .choice-grid { grid-template-columns: 1fr; width: 100%; max-width: 340px; }
}
</style>
