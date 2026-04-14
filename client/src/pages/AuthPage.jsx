import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiBriefcase } from 'react-icons/fi'
import { GiCook } from 'react-icons/gi'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'register' ? 'register' : 'login')
  const [role, setRole] = useState('seeker')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login, register, user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', companyName: '' })

  useEffect(() => { if (user) navigate(user.role === 'seeker' ? '/dashboard' : user.role === 'recruiter' ? '/recruiter' : '/admin') }, [user])

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      let u
      if (tab === 'login') {
        u = await login(form.email, form.password)
      } else {
        u = await register({ ...form, role })
      }
      toast.success(`Welcome${tab === 'login' ? ' back' : ''}, ${u.name}! 🎉`)
      navigate(u.role === 'seeker' ? '/dashboard' : u.role === 'recruiter' ? '/recruiter' : '/admin')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-charcoal-900 via-maroon-950 to-charcoal-900 p-4">
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-maroon-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-gold">
            <GiCook size={28} className="text-white" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">HotelJobs<span className="text-gold-400">.com</span></h1>
          <p className="text-gray-400 text-sm mt-1">India's #1 Hospitality Job Portal</p>
        </div>

        <div className="card p-6 dark:bg-charcoal-800">
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-charcoal-700 rounded-xl p-1 mb-6">
            {['login', 'register'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white dark:bg-charcoal-600 text-charcoal-800 dark:text-white shadow-sm' : 'text-gray-500 hover:text-charcoal-700 dark:hover:text-gray-300'}`}>
                {t === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {/* Role selector (register only) */}
          <AnimatePresence mode="wait">
            {tab === 'register' && (
              <motion.div key="role" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">I am a...</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'seeker', label: 'Job Seeker', icon: FiUser, desc: 'Find my dream job' },
                    { val: 'recruiter', label: 'Recruiter', icon: FiBriefcase, desc: 'Hire great talent' },
                  ].map(r => (
                    <button key={r.val} onClick={() => setRole(r.val)} type="button"
                      className={`p-3 rounded-xl border-2 text-left transition-all ${role === r.val ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-gray-200 dark:border-charcoal-600 hover:border-gold-300'}`}>
                      <r.icon size={18} className={role === r.val ? 'text-gold-600' : 'text-gray-400'} />
                      <p className={`text-sm font-semibold mt-1 ${role === r.val ? 'text-gold-700 dark:text-gold-400' : 'text-charcoal-700 dark:text-gray-300'}`}>{r.label}</p>
                      <p className="text-[11px] text-gray-400">{r.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input required value={form.name} onChange={set('name')} placeholder="Full Name" className="input-field pl-11" />
              </div>
            )}
            {tab === 'register' && role === 'recruiter' && (
              <div className="relative">
                <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input value={form.companyName} onChange={set('companyName')} placeholder="Company Name" className="input-field pl-11" />
              </div>
            )}
            <div className="relative">
              <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input required type="email" value={form.email} onChange={set('email')} placeholder="Email Address" className="input-field pl-11" />
            </div>
            {tab === 'register' && (
              <div className="relative">
                <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input value={form.phone} onChange={set('phone')} placeholder="Mobile Number" className="input-field pl-11" />
              </div>
            )}
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input required type={showPass ? 'text' : 'password'} value={form.password} onChange={set('password')} placeholder="Password" className="input-field pl-11 pr-11" />
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>

            {tab === 'login' && (
              <div className="text-right">
                <button type="button" className="text-xs text-gold-600 hover:underline">Forgot password?</button>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg> Processing...
                </span>
              ) : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>

            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-charcoal-600" /></div>
              <div className="relative flex justify-center"><span className="bg-white dark:bg-charcoal-800 px-3 text-xs text-gray-400">Demo Accounts</span></div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Seeker', email: 'rahul.sharma@gmail.com', pass: 'seeker123' },
                { label: 'Recruiter', email: 'hr@tajhotels.com', pass: 'recruiter123' },
                { label: 'Admin', email: 'admin@hoteljobs.com', pass: 'admin123' },
              ].map(d => (
                <button key={d.label} type="button" onClick={() => { setForm(f => ({ ...f, email: d.email, password: d.pass })); setTab('login') }}
                  className="text-[11px] px-2 py-2 rounded-lg border border-gray-200 dark:border-charcoal-600 hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-900/10 transition-all text-gray-600 dark:text-gray-400">
                  {d.label}
                </button>
              ))}
            </div>
          </form>

          <p className="text-center text-xs text-gray-500 mt-5">
            {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button onClick={() => setTab(tab === 'login' ? 'register' : 'login')} className="text-gold-600 font-semibold hover:underline">
              {tab === 'login' ? 'Register' : 'Sign In'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
