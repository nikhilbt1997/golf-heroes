'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CharityPage() {
  const supabase = createClient()
  const [charities, setCharities] = useState<any[]>([])
  const [selected, setSelected] = useState('')
  const [percentage, setPercentage] = useState(10)
  const [userId, setUserId] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setUserId(user.id)
      supabase.from('profiles').select('charity_id, charity_percentage').eq('id', user.id).single()
        .then(({ data }) => {
          if (data?.charity_id) setSelected(data.charity_id)
          if (data?.charity_percentage) setPercentage(data.charity_percentage)
        })
    })
    supabase.from('charities').select('*').eq('is_active', true).then(({ data }) => setCharities(data || []))
  }, [])

  async function save() {
    setLoading(true)
    await supabase.from('profiles').update({ charity_id: selected, charity_percentage: percentage }).eq('id', userId)
    setSuccess('Saved!')
    setLoading(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Charity</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Choose a charity to support. Minimum 10% of your subscription goes to them.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {charities.map(c => (
          <div key={c.id} onClick={() => setSelected(c.id)}
            style={{ padding: '1.25rem', background: '#0f1510', border: selected === c.id ? '1.5px solid #c8e6a0' : '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', cursor: 'pointer' }}>
            {selected === c.id && <span style={{ fontSize: '0.72rem', background: 'rgba(200,230,160,0.2)', color: '#c8e6a0', padding: '0.2rem 0.6rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '0.5rem' }}>Selected</span>}
            <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.4rem' }}>{c.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.4)', lineHeight: 1.5 }}>{c.description}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Contribution percentage</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <input type="range" min="10" max="100" step="5" value={percentage} onChange={e => setPercentage(parseInt(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c8e6a0', minWidth: '60px' }}>{percentage}%</span>
        </div>
        <p style={{ fontSize: '0.78rem', color: 'rgba(240,237,230,0.3)', marginTop: '0.5rem' }}>Minimum 10% required</p>
      </div>

      {success && <p style={{ color: '#c8e6a0', fontSize: '0.85rem', marginBottom: '1rem' }}>✓ {success}</p>}

      <button onClick={save} disabled={!selected || loading}
        style={{ background: '#c8e6a0', color: '#0a0f0d', border: 'none', padding: '0.85rem 2rem', borderRadius: '2rem', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer', opacity: !selected ? 0.5 : 1 }}>
        {loading ? 'Saving...' : 'Save charity preference'}
      </button>
    </div>
  )
}