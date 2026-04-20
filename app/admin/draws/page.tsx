'use client'
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random')
  const [prizePool, setPrizePool] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => { loadDraws() }, [])

  async function loadDraws() {
    const { data } = await supabase.from('draws').select('*').order('created_at', { ascending: false })
    setDraws(data || [])
  }

  async function createDraw() {
    setLoading(true)
    setMessage('')
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    const { data: existing } = await supabase.from('draws').select('id').eq('month', month).eq('year', year).single()
    if (existing) { setMessage('A draw for this month already exists!'); setLoading(false); return }

    await supabase.from('draws').insert({ month, year, draw_type: drawType, prize_pool_total: parseFloat(prizePool) || 0, status: 'pending' })
    setMessage('Draw created!')
    loadDraws()
    setLoading(false)
  }

  async function runDraw(drawId: string, type: string) {
    setLoading(true)
    setMessage('')

    let drawnNumbers: number[]

    if (type === 'random') {
      const nums = new Set<number>()
      while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1)
      drawnNumbers = [...nums]
    } else {
      const { data: allScores } = await supabase.from('scores').select('score')
      const freq: Record<number, number> = {}
      allScores?.forEach(s => { freq[s.score] = (freq[s.score] || 0) + 1 })
      const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([n]) => parseInt(n))
      drawnNumbers = sorted.length === 5 ? sorted : [...Array(5)].map(() => Math.floor(Math.random() * 45) + 1)
    }

    await supabase.from('draws').update({ drawn_numbers: drawnNumbers, status: 'simulated' }).eq('id', drawId)

    const { data: allScores } = await supabase.from('scores').select('user_id, score')
    const userScores: Record<string, number[]> = {}
    allScores?.forEach(({ user_id, score }) => {
      if (!userScores[user_id]) userScores[user_id] = []
      userScores[user_id].push(score)
    })

    const results = []
    for (const [user_id, uScores] of Object.entries(userScores)) {
      const matches = uScores.filter(s => drawnNumbers.includes(s)).length
      let match_type = null
      if (matches >= 5) match_type = '5-match'
      else if (matches === 4) match_type = '4-match'
      else if (matches === 3) match_type = '3-match'
      if (match_type) results.push({ draw_id: drawId, user_id, match_type, matched_numbers: uScores.filter(s => drawnNumbers.includes(s)) })
    }

    if (results.length > 0) {
      await supabase.from('draw_results').insert(results)
    }

    setMessage(`Draw simulated! Numbers: ${drawnNumbers.join(', ')}. Winners found: ${results.length}`)
    loadDraws()
    setLoading(false)
  }

  async function publishDraw(drawId: string) {
    await supabase.from('draws').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', drawId)
    setMessage('Draw published!')
    loadDraws()
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Draw Management</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Create, simulate and publish monthly draws.</p>

      <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.25rem' }}>Create new draw</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(240,237,230,0.5)', marginBottom: '0.4rem' }}>Draw type</label>
            <select value={drawType} onChange={e => setDrawType(e.target.value as 'random' | 'algorithmic')}
              style={{ width: '100%', background: '#0a0f0d', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none' }}>
              <option value="random">Random</option>
              <option value="algorithmic">Algorithmic</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(240,237,230,0.5)', marginBottom: '0.4rem' }}>Prize pool (£)</label>
            <input type="number" value={prizePool} onChange={e => setPrizePool(e.target.value)} placeholder="e.g. 1000"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={createDraw} disabled={loading}
            style={{ background: '#c8e6a0', color: '#0a0f0d', border: 'none', borderRadius: '0.5rem', padding: '0.7rem 1.5rem', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer' }}>
            Create
          </button>
        </div>
        {message && <p style={{ color: '#c8e6a0', fontSize: '0.82rem', marginTop: '0.75rem' }}>{message}</p>}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {draws.map(d => (
          <div key={d.id} style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
                  {new Date(d.year, d.month - 1).toLocaleString('en-GB', { month: 'long', year: 'numeric' })}
                  <span style={{ marginLeft: '0.75rem', fontSize: '0.72rem', padding: '0.2rem 0.6rem', borderRadius: '1rem', background: d.status === 'published' ? 'rgba(200,230,160,0.15)' : 'rgba(255,200,0,0.1)', color: d.status === 'published' ? '#c8e6a0' : '#ffd700' }}>
                    {d.status}
                  </span>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.4)' }}>
                  Type: {d.draw_type} · Pool: £{d.prize_pool_total}
                  {d.drawn_numbers && ` · Numbers: ${d.drawn_numbers.join(', ')}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {d.status === 'pending' && (
                  <button onClick={() => runDraw(d.id, d.draw_type)} disabled={loading}
                    style={{ background: 'rgba(255,200,0,0.1)', border: '0.5px solid rgba(255,200,0,0.3)', color: '#ffd700', padding: '0.4rem 0.9rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                    Simulate
                  </button>
                )}
                {d.status === 'simulated' && (
                  <button onClick={() => publishDraw(d.id)}
                    style={{ background: 'rgba(200,230,160,0.15)', border: '0.5px solid rgba(200,230,160,0.3)', color: '#c8e6a0', padding: '0.4rem 0.9rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                    Publish
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {draws.length === 0 && <p style={{ color: 'rgba(240,237,230,0.3)', fontSize: '0.85rem' }}>No draws yet. Create one above.</p>}
      </div>
    </div>
  )
}