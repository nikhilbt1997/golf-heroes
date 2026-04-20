'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/login'); return }
      supabase.from('profiles').select('role').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.role !== 'admin') router.push('/dashboard')
        })
    })
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navItems = [
    { label: 'Overview', path: '/admin' },
    { label: 'Users', path: '/admin/users' },
    { label: 'Draws', path: '/admin/draws' },
    { label: 'Charities', path: '/admin/charities' },
    { label: 'Winners', path: '/admin/winners' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f0d', fontFamily: "'DM Sans', sans-serif", color: '#f0ede6' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem', borderBottom: '0.5px solid rgba(255,255,255,0.08)', position: 'sticky', top: 0, background: '#0a0f0d', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.1rem', fontWeight: 700, color: '#c8e6a0' }}>Golf Heroes</span>
          <span style={{ fontSize: '0.72rem', background: 'rgba(200,230,160,0.15)', color: '#c8e6a0', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>Admin</span>
        </div>
        <button onClick={handleLogout} style={{ background: 'transparent', border: '0.5px solid rgba(255,255,255,0.2)', color: '#f0ede6', padding: '0.4rem 1rem', borderRadius: '2rem', cursor: 'pointer', fontSize: '0.8rem' }}>Log out</button>
      </nav>

      <div style={{ display: 'flex', minHeight: 'calc(100vh - 57px)' }}>
        <aside style={{ width: '220px', borderRight: '0.5px solid rgba(255,255,255,0.08)', padding: '1.5rem 1rem', flexShrink: 0 }}>
          {navItems.map(item => (
            <button key={item.path} onClick={() => router.push(item.path)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.7rem 1rem', borderRadius: '0.5rem', marginBottom: '0.25rem', border: 'none', cursor: 'pointer', fontSize: '0.88rem', fontFamily: "'DM Sans', sans-serif",
                background: pathname === item.path ? 'rgba(200,230,160,0.15)' : 'transparent',
                color: pathname === item.path ? '#c8e6a0' : 'rgba(240,237,230,0.5)',
              }}>
              {item.label}
            </button>
          ))}
        </aside>

        <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}