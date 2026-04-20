'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function SubscribePage() {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleSubscribe(plan: 'monthly' | 'yearly') {
    setLoading(plan)
    setError('')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const endDate = plan === 'yearly'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      const { error } = await supabase.from('profiles').update({
        subscription_status: 'active',
        subscription_plan: plan,
        subscription_end_date: endDate.toISOString(),
      }).eq('id', user.id)

      if (error) { setError(error.message); setLoading(null); return }

      router.push('/dashboard?subscribed=true')
    } catch {
      setError('Something went wrong')
      setLoading(null)
    }
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Subscribe</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '0.5rem' }}>Choose a plan to start playing and supporting charities.</p>
      <p style={{ color: 'rgba(240,230,160,0.6)', fontSize: '0.78rem', marginBottom: '2.5rem', background: 'rgba(200,230,160,0.08)', border: '0.5px solid rgba(200,230,160,0.2)', borderRadius: '0.5rem', padding: '0.5rem 1rem', display: 'inline-block' }}>
        Demo mode — subscription activates instantly without payment
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', maxWidth: '600px' }}>
        {/* Monthly */}
        <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.5)', marginBottom: '0.5rem' }}>Monthly</p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 700, color: '#f0ede6', marginBottom: '0.25rem' }}>£9.99</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.4)', marginBottom: '1.5rem' }}>per month · cancel anytime</p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
            {['Monthly prize draw entry', 'Score tracking', 'Charity contributions', 'Winner eligibility'].map(f => (
              <li key={f} style={{ fontSize: '0.85rem', color: 'rgba(240,237,230,0.6)', marginBottom: '0.5rem' }}>✓ {f}</li>
            ))}
          </ul>
          <button onClick={() => handleSubscribe('monthly')} disabled={loading === 'monthly'}
            style={{ width: '100%', background: 'transparent', border: '0.5px solid rgba(200,230,160,0.4)', color: '#c8e6a0', borderRadius: '2rem', padding: '0.85rem', fontSize: '0.95rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            {loading === 'monthly' ? 'Activating...' : 'Choose monthly'}
          </button>
        </div>

        {/* Yearly */}
        <div style={{ background: '#c8e6a0', borderRadius: '1rem', padding: '2rem' }}>
          <p style={{ fontSize: '0.8rem', color: 'rgba(10,15,13,0.6)', marginBottom: '0.5rem' }}>Yearly — best value</p>
          <p style={{ fontFamily: 'Playfair Display, serif', fontSize: '2.5rem', fontWeight: 700, color: '#0a0f0d', marginBottom: '0.25rem' }}>£99.99</p>
          <p style={{ fontSize: '0.8rem', color: 'rgba(10,15,13,0.5)', marginBottom: '1.5rem' }}>per year · save 2 months free</p>
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
            {['All monthly features', '2 months free', 'Priority support', 'Early draw access'].map(f => (
              <li key={f} style={{ fontSize: '0.85rem', color: 'rgba(10,15,13,0.7)', marginBottom: '0.5rem' }}>✓ {f}</li>
            ))}
          </ul>
          <button onClick={() => handleSubscribe('yearly')} disabled={loading === 'yearly'}
            style={{ width: '100%', background: '#0a0f0d', border: 'none', color: '#c8e6a0', borderRadius: '2rem', padding: '0.85rem', fontSize: '0.95rem', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            {loading === 'yearly' ? 'Activating...' : 'Choose yearly'}
          </button>
        </div>
      </div>

      {error && <p style={{ color: '#ff6b6b', fontSize: '0.85rem', marginTop: '1rem' }}>{error}</p>}

      <button onClick={() => router.push('/dashboard')}
        style={{ marginTop: '2rem', background: 'transparent', border: 'none', color: 'rgba(240,237,230,0.4)', cursor: 'pointer', fontSize: '0.85rem' }}>
        ← Back to dashboard
      </button>
    </div>
  )
}