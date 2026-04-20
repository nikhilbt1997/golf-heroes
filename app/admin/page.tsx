'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const supabase = createClient()
  const router = useRouter()
  const [stats, setStats] = useState({ users: 0, active: 0, pool: 0, charityTotal: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { count: users } = await supabase.from('profiles').select('*', { count: 'exact', head: true })
      const { count: active } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_status', 'active')
      const { data: draws } = await supabase.from('draws').select('prize_pool_total')
      const pool = draws?.reduce((s, d) => s + (d.prize_pool_total || 0), 0) || 0
      const { data: charities } = await supabase.from('charities').select('total_received')
      const charityTotal = charities?.reduce((s, c) => s + (c.total_received || 0), 0) || 0
      setStats({ users: users || 0, active: active || 0, pool, charityTotal })
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ color: 'rgba(240,237,230,0.4)' }}>Loading...</div>

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Admin Overview</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Platform summary and quick actions.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {[
          { label: 'Total users', value: stats.users },
          { label: 'Active subscribers', value: stats.active },
          { label: 'Total prize pool', value: `£${stats.pool.toFixed(2)}` },
          { label: 'Charity raised', value: `£${stats.charityTotal.toFixed(2)}` },
        ].map(s => (
          <div key={s.label} style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(240,237,230,0.4)', marginBottom: '0.4rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c8e6a0', fontFamily: 'Playfair Display, serif' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Quick actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {[
          { label: 'Manage users', path: '/admin/users' },
          { label: 'Run draw', path: '/admin/draws' },
          { label: 'Manage charities', path: '/admin/charities' },
          { label: 'Verify winners', path: '/admin/winners' },
        ].map(a => (
          <button key={a.path} onClick={() => router.push(a.path)}
            style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem', textAlign: 'left', cursor: 'pointer', color: '#f0ede6', fontSize: '0.9rem', fontFamily: "'DM Sans', sans-serif" }}>
            {a.label} →
          </button>
        ))}
      </div>
    </div>
  )
}