'use client'
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([])
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => { loadCharities() }, [])

  async function loadCharities() {
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false })
    setCharities(data || [])
  }

  async function addCharity() {
    if (!name) { setMessage('Name is required'); return }
    await supabase.from('charities').insert({ name, description, image_url: imageUrl, is_featured: isFeatured })
    setMessage('Charity added!')
    setName(''); setDescription(''); setImageUrl(''); setIsFeatured(false)
    loadCharities()
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('charities').update({ is_active: !current }).eq('id', id)
    loadCharities()
  }

  async function deleteCharity(id: string) {
    await supabase.from('charities').delete().eq('id', id)
    loadCharities()
  }

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Charities</h1>
      <p style={{ color: 'rgba(240,237,230,0.4)', fontSize: '0.88rem', marginBottom: '2rem' }}>Add and manage charity listings.</p>

      <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '1.25rem' }}>Add new charity</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Charity name"
            style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none' }} />
          <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" rows={3}
            style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: "'DM Sans', sans-serif" }} />
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="Image URL (optional)"
            style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.7rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none' }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'rgba(240,237,230,0.6)', cursor: 'pointer' }}>
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
            Featured charity
          </label>
          {message && <p style={{ color: '#c8e6a0', fontSize: '0.82rem' }}>{message}</p>}
          <button onClick={addCharity}
            style={{ background: '#c8e6a0', color: '#0a0f0d', border: 'none', borderRadius: '0.5rem', padding: '0.7rem 1.5rem', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer', alignSelf: 'flex-start' }}>
            Add charity
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {charities.map(c => (
          <div key={c.id} style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                {c.name}
                {c.is_featured && <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', background: 'rgba(200,230,160,0.15)', color: '#c8e6a0', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>Featured</span>}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'rgba(240,237,230,0.4)' }}>{c.description?.slice(0, 80)}...</p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => toggleActive(c.id, c.is_active)}
                style={{ background: c.is_active ? 'rgba(255,100,100,0.1)' : 'rgba(200,230,160,0.1)', border: `0.5px solid ${c.is_active ? 'rgba(255,100,100,0.3)' : 'rgba(200,230,160,0.3)'}`, color: c.is_active ? 'rgba(255,100,100,0.8)' : '#c8e6a0', padding: '0.4rem 0.9rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                {c.is_active ? 'Deactivate' : 'Activate'}
              </button>
              <button onClick={() => deleteCharity(c.id)}
                style={{ background: 'transparent', border: '0.5px solid rgba(255,100,100,0.3)', color: 'rgba(255,100,100,0.7)', padding: '0.4rem 0.9rem', borderRadius: '0.4rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}