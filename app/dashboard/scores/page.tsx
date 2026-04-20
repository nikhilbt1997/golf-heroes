'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ScoresPage() {
  const supabase = createClient()
  const [scores, setScores] = useState<any[]>([])
  const [newScore, setNewScore] = useState('')
  const [newDate, setNewDate] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setUserId(user.id); loadScores(user.id) }
    })
  }, [])

  async function loadScores(uid: string) {
    const { data } = await supabase.from('scores').select('*').eq('user_id', uid).order('score_date', { ascending: false })
    setScores(data || [])
  }

  async function addScore() {
    setError(''); setSuccess('')
    const score = parseInt(newScore)
    if (!newScore || !newDate) { setError('Please fill in both score and date'); return }
    if (score < 1 || score > 45) { setError('Score must be between 1 and 45'); return }
    setLoading(true)

    if (scores.length >= 5) {
      const oldest = [...scores].sort((a, b) => new Date(a.score_date).getTime() - new Date(b.score_date).getTime())[0]
      await supabase.from('scores').delete().eq('id', oldest.id)
    }

    const { error } = await supabase.from('scores').insert({ user_id: userId, score, score_date: newDate })
    if (error) {
      setError(error.message.includes('unique') ? 'A score for this date already exists' : error.message)
    } else {
      setSuccess('Score added!')
      setNewScore(''); setNewDate('')
      loadScores(userId)
    }
    setLoading(false)
  }

  async function deleteScore(id: string) {
    await supabase.from('scores').delete().eq('id', id)
    loadScores(userId)
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Scores</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Enter your Stableford scores (1–45). Only your latest 5 are kept.</p>

      <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.25rem' }}>Add a score</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(240,237,230,0.5)', marginBottom: '0.4rem' }}>Stableford score (1–45)</label>
            <input type="number" min="1" max="45" value={newScore} onChange={e => setNewScore(e.target.value)} placeholder="e.g. 32"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(240,237,230,0.5)', marginBottom: '0.4rem' }}>Date played</label>
            <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <button onClick={addScore} disabled={loading}
            style={{ background: '#c8e6a0', color: '#0a0f0d', border: 'none', borderRadius: '0.5rem', padding: '0.7rem 1.5rem', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            {loading ? 'Adding...' : 'Add score'}
          </button>
        </div>
        {error && <p style={{ color: '#ff6b6b', fontSize: '0.82rem', marginTop: '0.75rem' }}>{error}</p>}
        {success && <p style={{ color: '#c8e6a0', fontSize: '0.82rem', marginTop: '0.75rem' }}>{success}</p>}
      </div>

      <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 500 }}>Your scores</h2>
          <span style={{ fontSize: '0.78rem', color: 'rgba(240,237,230,0.4)' }}>{scores.length} / 5 slots used</span>
        </div>
        {scores.length === 0 ? (
          <p style={{ color: 'rgba(240,237,230,0.3)', fontSize: '0.85rem' }}>No scores yet. Add your first score above.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {scores.map((s, i) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.9rem 1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.5rem', border: '0.5px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'rgba(240,237,230,0.3)', width: 20 }}>#{i + 1}</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#c8e6a0', fontFamily: 'Playfair Display, serif' }}>{s.score}</span>
                  <span style={{ fontSize: '0.82rem', color: 'rgba(240,237,230,0.4)' }}>{new Date(s.score_date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <button onClick={() => deleteScore(s.id)} style={{ background: 'transparent', border: '0.5px solid rgba(255,100,100,0.3)', color: 'rgba(255,100,100,0.7)', padding: '0.3rem 0.75rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}