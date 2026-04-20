'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function WinningsPage() {
  const supabase = createClient()
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('draw_results').select('*, draws(month, year)').eq('user_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => { setResults(data || []); setLoading(false) })
    })
  }, [])

  const total = results.filter(r => r.payment_status === 'paid').reduce((sum, r) => sum + r.prize_amount, 0)

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Winnings</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Your draw results and prize history.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total won', value: `£${total.toFixed(2)}` },
          { label: 'Draws entered', value: results.length },
          { label: 'Pending payouts', value: results.filter(r => r.payment_status === 'pending').length },
        ].map(s => (
          <div key={s.label} style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <p style={{ fontSize: '0.75rem', color: 'rgba(240,237,230,0.4)', marginBottom: '0.4rem' }}>{s.label}</p>
            <p style={{ fontSize: '1.4rem', fontWeight: 700, color: '#c8e6a0', fontFamily: 'Playfair Display, serif' }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1rem' }}>Draw history</h2>
        {loading ? (
          <p style={{ color: 'rgba(240,237,230,0.3)', fontSize: '0.85rem' }}>Loading...</p>
        ) : results.length === 0 ? (
          <p style={{ color: 'rgba(240,237,230,0.3)', fontSize: '0.85rem' }}>No winnings yet. Keep playing!</p>
        ) : (
          results.map(r => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 0', borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}>
              <div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>{r.match_type} — {r.draws?.month}/{r.draws?.year}</p>
                <p style={{ fontSize: '0.78rem', color: 'rgba(240,237,230,0.4)', marginTop: '0.2rem' }}>Verification: {r.verification_status}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1rem', fontWeight: 700, color: '#c8e6a0' }}>£{r.prize_amount.toFixed(2)}</p>
                <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: r.payment_status === 'paid' ? 'rgba(200,230,160,0.2)' : 'rgba(255,200,0,0.1)', color: r.payment_status === 'paid' ? '#c8e6a0' : '#ffd700' }}>
                  {r.payment_status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}