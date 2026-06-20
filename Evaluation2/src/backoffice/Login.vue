<template>
  <div class="login-wrap">

    <!-- Left Panel -->
    <div class="left-panel">
      <div class="brand">
        <div class="brand-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="#0f4fa8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/>
            <path d="M19.622 10.395l-1.097-2.65L20 6l-2-2-1.735 1.483-2.707-1.113L12.935 2h-1.954l-.632 2.401-2.645 1.115L6 4 4 6l1.453 1.789-1.08 2.657L2 11v2l2.401.655L5.516 16.3 4 18l2 2 1.791-1.46 2.606 1.072L11 22h2l.604-2.387 2.651-1.098C16.697 19.AbL 18 20l2-2-1.46-1.791 1.073-2.606L22 13v-2l-2.378-.605z"/>
          </svg>
        </div>
        <span class="brand-name">GLPI</span>
      </div>

      <div class="left-bottom">
        <div class="left-headline">IT Asset &amp;<br />Helpdesk Platform</div>
        <div class="left-sub">Manage your infrastructure,<br />tickets, and assets — all in one place.</div>
        <div class="dots">
          <div class="dot active"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>
    </div>

    <!-- Right Panel -->
    <div class="right-panel">
    <!-- <div class="right-top">
        <button class="lang-btn" type="button">
          <Globe :size="14" /> FR
        </button>
      </div> -->

      <div class="greeting">Welcome back</div>
      <div class="heading">Sign in to GLPI</div>
      <div class="subhead">Enter your credentials to continue</div>

      <form @submit.prevent="handleLogin">

        <!-- Identifier -->
        <div class="field-group">
          <label class="field-label" for="identifier">Identifier</label>
          <div class="field-box" :class="{ 'field-error': errors.identifier }">
            <span class="field-icon"><User :size="18" /></span>
            <input
              id="identifier"
              v-model="form.identifier"
              type="text"
              placeholder="your.name or email"
              autocomplete="username"
            />
          </div>
          <span v-if="errors.identifier" class="error-msg">{{ errors.identifier }}</span>
        </div>

        <!-- Password -->
        <div class="field-group">
          <label class="field-label" for="password">Password</label>
          <div class="field-box" :class="{ 'field-error': errors.password }">
            <span class="field-icon"><Lock :size="18" /></span>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••••"
              autocomplete="current-password"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'">
              <EyeOff v-if="showPassword" :size="18" />
              <Eye v-else :size="18" />
            </button>
          </div>
          <span v-if="errors.password" class="error-msg">{{ errors.password }}</span>
        </div>

        <!-- Remember + Forgot -->
        <div class="row-meta">
          <label class="remember">
            <input type="checkbox" v-model="form.remember" /> Remember me
          </label>
          <a class="forgot" href="#">Forgot password?</a>
        </div>

        <!-- Error banner -->
        <div v-if="loginError" class="login-error-banner">
          {{ loginError }}
        </div>

        <!-- Submit -->
        <button class="login-btn" type="submit" :disabled="loading">
          <span v-if="loading">Signing in...</span>
          <span v-else>Sign in <ArrowRight :size="16" /></span>
        </button>

      </form>

      <div class="divider">
        <div class="divider-line"></div>
        <span class="divider-text">or</span>
        <div class="divider-line"></div>
      </div>

      <button class="sso-btn" type="button">
        <Building2 :size="16" /> Sign in with SSO / LDAP
      </button>

      <div class="version-tag">GLPI v10 · © 2024 by Andry</div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Globe, User, Lock, Eye, EyeOff, ArrowRight, Building2 } from 'lucide-vue-next'

const router = useRouter()

const form = reactive({
  identifier: '',
  password: '',
  remember: false
})

const errors = reactive({
  identifier: '',
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)
const loginError = ref('')

function validate() {
  errors.identifier = ''
  errors.password = ''
  let valid = true

  if (!form.identifier.trim()) {
    errors.identifier = 'Identifier is required.'
    valid = false
  }

  if (!form.password) {
    errors.password = 'Password is required.'
    valid = false
  } else if (form.password.length < 4) {
    errors.password = 'Password must be at least 4 characters.'
    valid = false
  }

  return valid
}

async function handleLogin() {
  loginError.value = ''
  if (!validate()) return

  loading.value = true
  try {
    // TODO: replace with your real API call
    // const response = await authService.login(form.identifier, form.password)
    await new Promise(resolve => setTimeout(resolve, 800)) // simulated delay

    // On success, redirect to dashboard
    router.push('/')
  } catch (err) {
    loginError.value = 'Invalid identifier or password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.login-wrap {
  display: flex;
  min-height: 100vh;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}

/* ── Left Panel ── */
.left-panel {
  width: 42%;
  background: #0f4fa8;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
  overflow: hidden;
}

.left-panel::before {
  content: '';
  position: absolute;
  top: -80px; left: -80px;
  width: 320px; height: 320px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
}

.left-panel::after {
  content: '';
  position: absolute;
  bottom: -60px; right: -60px;
  width: 240px; height: 240px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  z-index: 1;
}

.brand-icon {
  width: 40px; height: 40px;
  background: white;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}

.brand-name {
  font-size: 20px;
  font-weight: 600;
  color: white;
  letter-spacing: 0.5px;
}

.left-bottom {
  z-index: 1;
}

.left-headline {
  font-size: 30px;
  font-weight: 700;
  color: white;
  line-height: 1.3;
  margin-bottom: 12px;
}

.left-sub {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.6;
}

.dots {
  display: flex; gap: 6px; margin-top: 24px;
}

.dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.dot.active {
  background: white;
  width: 18px;
  border-radius: 3px;
}

/* ── Right Panel ── */
.right-panel {
  flex: 1;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 48px 60px;
}

.right-top {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 40px;
}

.lang-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #555;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 5px 14px;
  cursor: pointer;
}

.greeting {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: #0f4fa8;
  margin-bottom: 8px;
}

.heading {
  font-size: 28px;
  font-weight: 700;
  color: #111;
  margin-bottom: 6px;
}

.subhead {
  font-size: 14px;
  color: #888;
  margin-bottom: 32px;
}

/* ── Fields ── */
.field-group {
  margin-bottom: 18px;
}

.field-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #555;
  margin-bottom: 7px;
  letter-spacing: 0.3px;
}

.field-box {
  display: flex;
  align-items: center;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  padding: 0 14px;
  height: 48px;
  background: #f9f9f9;
  transition: border-color 0.2s, background 0.2s;
}

.field-box:focus-within {
  border-color: #0f4fa8;
  background: #fff;
}

.field-box.field-error {
  border-color: #e24b4a;
}

.field-icon {
  display: flex;
  align-items: center;
  margin-right: 10px;
  color: #999;
  flex-shrink: 0;
}

.field-box:focus-within .field-icon {
  color: #0f4fa8;
}

.field-box input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 14px;
  color: #111;
  font-family: inherit;
  outline: none;
}

.field-box input::placeholder {
  color: #bbb;
}

.eye-btn {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 0;
  line-height: 1;
}

.eye-btn:hover { color: #0f4fa8; }

.error-msg {
  display: block;
  font-size: 12px;
  color: #e24b4a;
  margin-top: 5px;
}

/* ── Meta row ── */
.row-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.remember {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: #555;
  cursor: pointer;
}

.remember input[type='checkbox'] {
  accent-color: #0f4fa8;
  width: 14px; height: 14px;
}

.forgot {
  font-size: 13px;
  color: #0f4fa8;
  text-decoration: none;
  cursor: pointer;
}

.forgot:hover { text-decoration: underline; }

/* ── Error banner ── */
.login-error-banner {
  background: #fff0f0;
  border: 1px solid #f7c1c1;
  color: #a32d2d;
  font-size: 13px;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 16px;
}

/* ── Buttons ── */
.login-btn {
  width: 100%;
  height: 50px;
  background: #0f4fa8;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  margin-bottom: 20px;
  transition: background 0.2s, opacity 0.2s;
}

.login-btn span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.login-btn:hover { background: #0d4494; }
.login-btn:disabled { opacity: 0.6; cursor: not-allowed; }

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e0e0e0;
}

.divider-text {
  font-size: 12px;
  color: #aaa;
}

.sso-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 46px;
  background: transparent;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s;
}

.sso-btn:hover { background: #f5f5f5; }

.version-tag {
  text-align: center;
  font-size: 11px;
  color: #bbb;
  margin-top: 24px;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .login-wrap { flex-direction: column; }
  .left-panel { width: 100%; min-height: 200px; padding: 28px; }
  .left-headline { font-size: 22px; }
  .right-panel { padding: 32px 24px; }
}
</style>