import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useLanguage } from '../context/LanguageContext'
import { authenticateUser, createUser, getCurrentSessionUser, hasAnyUsers, hasSuperAdmin, logoutUser } from '../services/authService'
import type { AuthUser } from '../types/auth'

export default function AuthPage() {
  const { isUrdu, language, setLanguage } = useLanguage()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '', confirmPassword: '', identifier: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const sessionUser = getCurrentSessionUser()
    if (sessionUser) {
      setCurrentUser(sessionUser)
      navigate('/')
      return
    }

    const hasUsersFlag = hasAnyUsers()
    if (!hasUsersFlag) {
      setMode('register')
      setIsReady(true)
      return
    }

    if (!hasSuperAdmin()) {
      setMode('register')
      setIsReady(true)
      return
    }

    setMode('login')
    setIsReady(true)
  }, [navigate])

  const title = useMemo(() => {
    if (!isReady) return isUrdu ? 'لوڈ ہو رہا ہے…' : 'Loading...'
    if (mode === 'register') {
      return hasAnyUsers() ? (isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Account') : (isUrdu ? 'مالیک اکاؤنٹ بنائیں' : 'Create Owner Account')
    }
    return isUrdu ? 'لاگ ان' : 'Login'
  }, [hasAnyUsers, isReady, isUrdu, mode])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (mode === 'register') {
      if (!form.fullName.trim() || !form.username.trim() || !form.email.trim() || !form.password || !form.confirmPassword) {
        setError(isUrdu ? 'تمام خانے ضروری ہیں۔' : 'All fields are required.')
        return
      }
      if (form.password !== form.confirmPassword) {
        setError(isUrdu ? 'پاس ورڈ مماثل نہیں ہیں۔' : 'Passwords do not match.')
        return
      }
      try {
        const ownerMode = !hasAnyUsers()
        const user = createUser({
          fullName: form.fullName,
          username: form.username,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        }, ownerMode ? 'Super Admin' : 'Staff', ownerMode ? 'Approved' : 'Pending')
        if (ownerMode) {
          setSuccess(isUrdu ? 'مالک اکاؤنٹ کامیابی سے بنایا گیا۔' : 'Owner account created successfully.')
          setMode('login')
        } else {
          setSuccess(isUrdu ? 'آپ کا اکاؤنٹ کامیابی سے بنایا گیا۔ براہ کرم سپر ایڈمن کی منظوری کا انتظار کریں۔' : 'Your account has been created successfully. Please wait for a Super Admin to approve your account.')
          setForm({ ...form, fullName: '', username: '', email: '', password: '', confirmPassword: '', identifier: '' })
          setMode('login')
        }
        if (ownerMode) {
          const loggedIn = authenticateUser({ identifier: user.username, password: form.password })
          if (loggedIn) {
            setCurrentUser(loggedIn)
            navigate('/')
          }
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unable to create account')
      }
      return
    }

    if (!form.identifier || !form.password) {
      setError(isUrdu ? 'شناخت اور پاس ورڈ ضروری ہیں۔' : 'Username/Email and password are required.')
      return
    }

    const authenticated = authenticateUser({ identifier: form.identifier, password: form.password })
    if (!authenticated) {
      setError(isUrdu ? 'غلط صارف نام یا پاس ورڈ۔' : 'Invalid username or password.')
      return
    }
    setCurrentUser(authenticated)
    navigate('/')
  }

  if (!isReady) return null

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff6db,_#fff)] p-4 text-slate-900 md:p-8" dir={isUrdu ? 'rtl' : 'ltr'}>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 rounded-[32px] border border-slate-200 bg-white/90 p-4 shadow-soft md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-slate-500">Shaibah Warsha</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-950">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{isUrdu ? 'سیکیور لاگ ان اور صارف مینجمنٹ' : 'Secure access and user management for the workshop.'}</p>
          </div>
          <button type="button" onClick={() => setLanguage(language === 'en' ? 'ur' : 'en')} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900">
            {isUrdu ? 'English / اردو' : 'English / اردو'}
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-950">{mode === 'login' ? (isUrdu ? 'لاگ ان' : 'Login') : (isUrdu ? 'نیا اکاؤنٹ' : 'Create Account')}</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <>
                  <Input label={isUrdu ? 'پورا نام' : 'Full Name'} value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} />
                  <Input label={isUrdu ? 'صارف نام' : 'Username'} value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
                  <Input label={isUrdu ? 'ای میل' : 'Email'} type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                  <Input label={isUrdu ? 'پاس ورڈ' : 'Password'} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                  <Input label={isUrdu ? 'پاس ورڈ دوبارہ' : 'Confirm Password'} type="password" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} />
                </>
              )}
              {mode === 'login' && (
                <>
                  <Input label={isUrdu ? 'صارف نام یا ای میل' : 'Username or Email'} value={form.identifier} onChange={(event) => setForm({ ...form, identifier: event.target.value })} />
                  <Input label={isUrdu ? 'پاس ورڈ' : 'Password'} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
                </>
              )}

              {error ? <p className="rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p> : null}
              {success ? <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{success}</p> : null}

              <Button type="submit" className="w-full">
                {mode === 'login' ? (isUrdu ? 'لاگ ان' : 'Login') : (hasAnyUsers() ? (isUrdu ? 'اکاؤنٹ بنائیں' : 'Create Account') : (isUrdu ? 'مالیک اکاؤنٹ بنائیں' : 'Create Owner Account'))}
              </Button>
            </form>
            <div className="flex items-center justify-between text-sm text-slate-600">
              <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setSuccess('') }} className="font-medium text-gold">
                {mode === 'login' ? (isUrdu ? 'نیا اکاؤنٹ بنائیں' : 'Create Account') : (isUrdu ? 'پہلے سے اکاؤنٹ ہے؟ لاگ ان' : 'Already have an account? Login')}
              </button>
              {currentUser ? <button type="button" onClick={() => { logoutUser(); setCurrentUser(null); setMode('login') }} className="font-medium text-slate-700">{isUrdu ? 'لاگ آؤٹ' : 'Logout'}</button> : null}
            </div>
          </Card>
          <Card className="space-y-3">
            <h3 className="text-lg font-semibold text-slate-950">{isUrdu ? 'اہم معلومات' : 'Key information'}</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• {isUrdu ? 'پہلا اکاؤنٹ خود بخود سپر ایڈمن بن جاتا ہے۔' : 'The first account becomes the Super Admin automatically.'}</li>
              <li>• {isUrdu ? 'سپر ایڈمن کی منظوری کے بعد ہی اکاؤنٹس لاگ ان کر سکتے ہیں۔' : 'Accounts only login after Super Admin approval.'}</li>
              <li>• {isUrdu ? 'اجازت والے صارفین کو صرف اپنی اجازت کے مطابق رسائی حاصل ہوتی ہے۔' : 'Approved users can access only the areas allowed by their role.'}</li>
            </ul>
            <Link to="/" className="inline-flex text-sm font-medium text-gold">{isUrdu ? 'واپس ڈیش بورڈ' : 'Return to dashboard'}</Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
