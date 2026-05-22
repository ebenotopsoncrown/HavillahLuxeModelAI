import { supabase } from './supabase'

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function isAdminUser() {
  const user = await getCurrentUser()
  if (!user) return false

  // Check 1: email matches VITE_ADMIN_EMAIL
  if (ADMIN_EMAIL && user.email === ADMIN_EMAIL) return true

  // Check 2: user metadata role
  const role = user.user_metadata?.role || user.app_metadata?.role || ''
  if (role === 'admin' || role === 'super_admin') return true

  // Check 3: user_credits table unlimited flag (if table exists)
  try {
    const { data } = await supabase
      .from('user_credits')
      .select('unlimited, plan')
      .eq('user_id', user.id)
      .single()
    if (data?.unlimited === true) return true
  } catch {}

  return false
}

export async function getUserCredits() {
  const user = await getCurrentUser()
  if (!user) return { credits: 0, unlimited: false, plan: 'free', isAdmin: false }

  const admin = await isAdminUser()
  if (admin) return { credits: 999999, unlimited: true, plan: 'unlimited', isAdmin: true }

  // Try user_credits table first
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('credits, plan, unlimited')
      .eq('user_id', user.id)
      .single()
    if (!error && data) {
      if (data.unlimited) return { ...data, credits: 999999, isAdmin: false }
      return { ...data, isAdmin: false }
    }
  } catch {}

  // Fall back to users table
  try {
    const { data } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()
    if (data) return { credits: data.credits ?? 0, unlimited: false, plan: 'free', isAdmin: false }
  } catch {}

  return { credits: 0, unlimited: false, plan: 'free', isAdmin: false }
}

export async function canGenerate(imageCount = 1) {
  const admin = await isAdminUser()
  if (admin) return true

  const { credits, unlimited } = await getUserCredits()
  if (unlimited) return true
  return credits >= imageCount
}

export async function deductCredits(imageCount = 1) {
  const admin = await isAdminUser()
  if (admin) return true // Never deduct from admin

  const user = await getCurrentUser()
  if (!user) return false

  // Fetch current balance then deduct
  const { data: row } = await supabase
    .from('users')
    .select('credits')
    .eq('id', user.id)
    .single()

  const current = row?.credits ?? 0
  const { error } = await supabase
    .from('users')
    .update({ credits: Math.max(0, current - imageCount) })
    .eq('id', user.id)

  return !error
}
