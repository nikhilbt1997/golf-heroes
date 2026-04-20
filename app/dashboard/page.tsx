'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const supabase = createClient()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [scores, setScores] = useState<any[]>([])
  const [charity, setCharity] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(prof)

      const { data: sc } = await supabase.from('scores').select('*').eq('user_id', user.id).order('score_date', { ascending: false })
      setScores(sc || [])

      if (prof?.charity_id) {
        const { data: ch } = await supabase.from('charities').select('*').eq('id', prof.charity_id).single()
        setCharity(ch)
      }

      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div style={{ color: 'rgba(240,237,230,0.4)', padding: '2rem' }}>Loading...</div>

  const isActive = profile?.subscription_status === 'active'

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Welcome back, {profile?.full_name || 'Player'}</p>

      {/* Subscription Banner */}
      {!isActive && (
        <div style={{ background: 'rgba(200,230,160,0.1)', border: '0.5px solid rgba(200,230,160,0.3)', borderRadius: '0.75rem', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 500, color: '#c8e6a0', marginBottom: '0.2rem' }}>No active subscription</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.5)' }}>Subscribe to enter draws and support charities</p>
          </div>
          <button onClick={() => router.push('/dashboard/subscribe')} style={{ background: '#c8e6a0', color: '#0a0f0d', border: 'none', padding: '0.6rem 1.25rem', borderRadius: '2rem', fontSize: '0.85rem', fontWeight: 500, cursor: 'pointer' }}>
            Subscribe now
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Subscription', value: profile?.subscription_status || 'inactive', accent: isActive },
          { label: 'Plan', value: profile?.subscription_plan || '—' },
          { label: 'Scores entered', value: scores.length + ' / 5' },
          { label: 'Charity share', value: (profile?.charity_percentage || 10) + '%' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(240,237,230,0.4)', marginBottom: '0.4rem' }}>{stat.label}</p>
            <p style={{ fontSize: '1.2rem', fontWeight: 500, color: stat.accent ? '#c8e6a0' : '#f0ede6', textTransform: 'capitalize' }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Scores */}
      <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500 }}>Recent scores</h2>
          <button onClick={() => router.push('/dashboard/scores')} style={{ background: 'transparent', border: 'none', color: '#c8e6a0', fontSize: '0.8rem', cursor: 'pointer' }}>Manage →</button>
        </div>
        {scores.length === 0 ? (
          <p style={{ color: 'rgba(240,237,230,0.3)', fontSize: '0.85rem' }}>No scores yet. Add your first score!</p>
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {scores.map(s => (
              <div key={s.id} style={{ background: 'rgba(200,230,160,0.1)', border: '0.5px solid rgba(200,230,160,0.2)', borderRadius: '0.5rem', padding: '0.6rem 1rem', textAlign: 'center' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c8e6a0', display: 'block' }}>{s.score}</span>
                <span style={{ fontSize: '0.7rem', color: 'rgba(240,237,230,0.4)' }}>{new Date(s.score_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charity */}
      <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500 }}>My charity</h2>
          <button onClick={() => router.push('/dashboard/charity')} style={{ background: 'transparent', border: 'none', color: '#c8e6a0', fontSize: '0.8rem', cursor: 'pointer' }}>Change →</button>
        </div>
        {charity ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: 48, height: 48, borderRadius: '0.5rem', background: 'rgba(200,230,160,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🎗</div>
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>{charity.name}</p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(240,237,230,0.4)', marginTop: '0.2rem' }}>{profile?.charity_percentage}% of your subscription</p>
            </div>
          </div>
        ) : (
          <p style={{ color: 'rgba(240,237,230,0.3)', fontSize: '0.85rem' }}>No charity selected yet. <button onClick={() => router.push('/dashboard/charity')} style={{ background: 'none', border: 'none', color: '#c8e6a0', cursor: 'pointer', fontSize: '0.85rem' }}>Choose one →</button></p>
        )}
      </div>
    </div>
  )
}