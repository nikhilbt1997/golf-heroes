'use client'
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadWinners() }, [])

  async function loadWinners() {
    const { data } = await supabase
      .from('draw_results')
      .select('*, profiles(full_name, email), draws(month, year)')
      .order('created_at', { ascending: false })
    setWinners(data || [])
    setLoading(false)
  }

  async function updateVerification(id: string, status: string) {
    await supabase.from('draw_results').update({ verification_status: status }).eq('id', id)
    loadWinners()
  }

  async function updatePayment(id: string, status: string) {
    await supabase.from('draw_results').update({ payment_status: status }).eq('id', id)
    loadWinners()
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Winners</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Verify submissions and manage payouts.</p>

      {loading ? <p style={{ color: 'rgba(240,237,230,0.4)' }}>Loading...</p> : winners.length === 0 ? (
        <p style={{ color: 'rgba(240,237,230,0.3)', fontSize: '0.85rem' }}>No winners yet. Run a draw first.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {winners.map(w => (
            <div key={w.id} style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{w.profiles?.full_name || 'Unknown'}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.4)', marginBottom: '0.4rem' }}>{w.profiles?.email}</p>
                  <p style={{ fontSize: '0.82rem', color: 'rgba(240,237,230,0.6)' }}>
                    {w.match_type} · {w.draws?.month}/{w.draws?.year} · £{w.prize_amount.toFixed(2)}
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem',
                      background: w.verification_status === 'approved' ? 'rgba(200,230,160,0.15)' : w.verification_status === 'rejected' ? 'rgba(255,100,100,0.1)' : 'rgba(255,200,0,0.1)',
                      color: w.verification_status === 'approved' ? '#c8e6a0' : w.verification_status === 'rejected' ? 'rgba(255,100,100,0.8)' : '#ffd700' }}>
                      {w.verification_status}
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem',
                      background: w.payment_status === 'paid' ? 'rgba(200,230,160,0.15)' : 'rgba(255,255,255,0.05)',
                      color: w.payment_status === 'paid' ? '#c8e6a0' : 'rgba(240,237,230,0.4)' }}>
                      {w.payment_status}
                    </span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {w.verification_status === 'unverified' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => updateVerification(w.id, 'approved')}
                        style={{ background: 'rgba(200,230,160,0.15)', border: '0.5px solid rgba(200,230,160,0.3)', color: '#c8e6a0', padding: '0.4rem 0.9rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                        Approve
                      </button>
                      <button onClick={() => updateVerification(w.id, 'rejected')}
                        style={{ background: 'rgba(255,100,100,0.1)', border: '0.5px solid rgba(255,100,100,0.3)', color: 'rgba(255,100,100,0.8)', padding: '0.4rem 0.9rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                        Reject
                      </button>
                    </div>
                  )}
                  {w.verification_status === 'approved' && w.payment_status === 'pending' && (
                    <button onClick={() => updatePayment(w.id, 'paid')}
                      style={{ background: 'rgba(200,230,160,0.15)', border: '0.5px solid rgba(200,230,160,0.3)', color: '#c8e6a0', padding: '0.4rem 0.9rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                      Mark as paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}