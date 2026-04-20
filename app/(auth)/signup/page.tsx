'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSignup() {
    setLoading(true)
    setError('')

    if (!fullName || !email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0f0d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans', sans-serif", padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'Playfair Display, serif', fontSize: '1.8rem', fontWeight: 700, color: '#c8e6a0' }}>Golf Heroes</span>
          </Link>
          <p style={{ color: 'rgba(240,237,230,0.5)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Create your account</p>
        </div>

        {/* Card */}
        <div style={{ background: '#0f1510', border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: '1rem', padding: '2rem' }}>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,237,230,0.6)', marginBottom: '0.5rem' }}>Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="John Smith"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,237,230,0.6)', marginBottom: '0.5rem' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(240,237,230,0.6)', marginBottom: '0.5rem' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              onKeyDown={e => e.key === 'Enter' && handleSignup()}
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem', padding: '0.75rem 1rem', color: '#f0ede6', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(220,50,50,0.1)', border: '0.5px solid rgba(220,50,50,0.3)', borderRadius: '0.5rem', padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSignup}
            disabled={loading}
            style={{ width: '100%', background: '#c8e6a0', color: '#0a0f0d', border: 'none', borderRadius: '2rem', padding: '0.85rem', fontSize: '0.95rem', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontFamily: "'DM Sans', sans-serif" }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(240,237,230,0.4)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#c8e6a0', textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'rgba(240,237,230,0.3)', lineHeight: 1.6 }}>
          By signing up you agree to our terms. A subscription is required to access all features.
        </p>
      </div>
    </div>
  )
}