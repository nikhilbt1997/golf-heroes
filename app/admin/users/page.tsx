'use client'
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  async function updateSubscription(id: string, status: string) {
    await supabase.from('profiles').update({ subscription_status: status }).eq('id', id)
    loadUsers()
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Users</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Manage all registered users.</p>

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
        style={{ width: '100%', maxWidth: '400px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none', marginBottom: '1.5rem', boxSizing: 'border-box' }} />

      {loading ? <p style={{ color: 'rgba(240,237,230,0.4)' }}>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(u => (
            <div key={u.id} style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{u.full_name || 'No name'}</p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.4)' }}>{u.email}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: u.subscription_status === 'active' ? 'rgba(200,230,160,0.15)' : 'rgba(255,255,255,0.05)', color: u.subscription_status === 'active' ? '#c8e6a0' : 'rgba(240,237,230,0.4)' }}>
                    {u.subscription_status}
                  </span>
                  <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(240,237,230,0.4)' }}>
                    {u.role}
                  </span>
                  {u.subscription_plan && (
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.05)', color: 'rgba(240,237,230,0.4)' }}>
                      {u.subscription_plan}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {u.subscription_status !== 'active' && (
                  <button onClick={() => updateSubscription(u.id, 'active')}
                    style={{ background: 'rgba(200,230,160,0.15)', border: '0.5px solid rgba(200,230,160,0.3)', color: '#c8e6a0', padding: '0.4rem 0.9rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                    Activate
                  </button>
                )}
                {u.subscription_status === 'active' && (
                  <button onClick={() => updateSubscription(u.id, 'cancelled')}
                    style={{ background: 'rgba(255,100,100,0.1)', border: '0.5px solid rgba(255,100,100,0.3)', color: 'rgba(255,100,100,0.8)', padding: '0.4rem 0.9rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}