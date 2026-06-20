import { glpiFetch } from '@/services/glpiServices'

export async function getUsers() {
  const res = await glpiFetch('/User?range=0-9999')
  return res.json()
}
