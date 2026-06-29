import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

    if (!supabaseUrl || !anonKey) {
      return res.status(500).json({ error: 'Supabase URL or anon key not configured on server' })
    }

    if (!serviceKey) {
      return res.status(500).json({
        error:
          'SUPABASE_SERVICE_ROLE_KEY is not set. Add it in Vercel → Settings → Environment Variables (never expose it in the browser).',
      })
    }

    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' })
    }

    const supabaseClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const supabaseAdmin = createClient(supabaseUrl, serviceKey)

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create users' })
    }

    const { email, password, full_name, role, department_ids } = req.body ?? {}

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' })
    }

    const deptIds = Array.isArray(department_ids) ? department_ids : []
    const primaryDept = deptIds[0] ?? null

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: role ?? 'employee' },
    })

    if (error) {
      return res.status(400).json({ error: error.message })
    }

    await supabaseAdmin
      .from('profiles')
      .update({ role: role ?? 'employee', department_id: primaryDept })
      .eq('id', data.user.id)

    if (deptIds.length > 0) {
      const { error: deptError } = await supabaseAdmin.from('profile_departments').insert(
        deptIds.map((department_id) => ({
          profile_id: data.user.id,
          department_id,
        }))
      )

      if (deptError) {
        return res.status(400).json({ error: deptError.message })
      }
    }

    return res.status(200).json({ user: data.user })
  } catch (err) {
    return res.status(500).json({ error: err.message ?? 'Internal server error' })
  }
}
