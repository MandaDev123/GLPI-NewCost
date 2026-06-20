<script setup>
import {ref} from "vue"
import { useRouter } from 'vue-router'
import {initSession} from '@/services/glpiServices'
import { Lock, ArrowRight } from 'lucide-vue-next'

const password = ref("glpi")
const router = useRouter()

async function check_Password(){
    if (password.value == 'glpi'){
       console.log("user is Authentificated")
       await initSession()
       // Auth track
       localStorage.setItem('is_authenticated', 'true') 
       router.push('/Dashboard')
    }else{
        console.log("wrong password")
        alert("wrong password")
    }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-logo">G</div>
      <h2 class="login-title">Backoffice access</h2>
      <p class="login-sub">Enter the access code to continue</p>

      <label class="login-label">Access code</label>
      <div class="login-input-wrap">
        <Lock :size="16" />
        <input
          type="password"
          v-model="password"
          placeholder="Enter code"
          @keyup.enter="check_Password()"
        />
      </div>

      <button class="login-btn" @click="check_Password()">
        <span>Access</span>
        <ArrowRight :size="16" />
      </button>

      <router-link to="/" class="login-back">← Back to home</router-link>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #0f4fa8 0%, #0a3d87 45%, #0d1b3e 100%);
  font-family: 'Plus Jakarta Sans', sans-serif;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 360px;
  background: white;
  border-radius: 22px;
  padding: 36px 32px;
  box-shadow: 0 20px 48px rgba(0,0,0,0.22);
  text-align: center;
}

.login-logo {
  width: 56px; height: 56px;
  margin: 0 auto 20px;
  background: #eef3fd;
  border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
  font-weight: 800;
  color: #0f4fa8;
}

.login-title {
  font-size: 20px;
  font-weight: 800;
  color: #0d1b3e;
  margin-bottom: 6px;
}

.login-sub {
  font-size: 13px;
  color: #8a98b5;
  margin-bottom: 28px;
}

.login-label {
  display: block;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #4a5a7a;
  margin-bottom: 8px;
}

.login-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f4f7fc;
  border: 1.5px solid #e4eaf6;
  border-radius: 12px;
  padding: 12px 16px;
  margin-bottom: 22px;
  color: #8a98b5;
  transition: border-color 0.15s, color 0.15s;
}
.login-input-wrap:focus-within { border-color: #0f4fa8; color: #0f4fa8; }

.login-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  color: #2d3a55;
}
.login-input-wrap input::placeholder { color: #b7c2d6; }

.login-btn {
  width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #0f4fa8;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 13px;
  font-size: 14px;
  font-weight: 700;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
}
.login-btn:hover { background: #0d4494; }
.login-btn:active { transform: scale(0.98); }

.login-back {
  display: inline-block;
  margin-top: 22px;
  font-size: 12.5px;
  font-weight: 600;
  color: #8a98b5;
  text-decoration: none;
  transition: color 0.15s;
}
.login-back:hover { color: #0f4fa8; }
</style>