import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiBriefcase, FiUsers, FiEye, FiTrendingUp, FiPlus, FiCheck, FiX, FiEdit, FiTag, FiMapPin, FiDollarSign, FiEdit2, FiSave, FiGlobe, FiPhone } from 'react-icons/fi'
import { MdBusiness } from 'react-icons/md'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const STATUS_COLORS_MAP = { applied: '#3b82f6', viewed: '#D4A843', shortlisted: '#22c55e', rejected: '#ef4444', hired: '#10b981' }
const ROLE_OPTIONS = ['Chef', 'Sous Chef', 'Waiter', 'Waitress', 'Hotel Manager', 'General Manager', 'Housekeeping', 'Front Desk', 'Receptionist', 'Bartender', 'Concierge', 'F&B Manager', 'Kitchen Staff', 'Banquet Manager', 'Spa Therapist', 'Event Manager', 'Hospitality Executive']

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} className="text-white" /></div>
      <div><p className="text-2xl font-bold font-display text-charcoal-800 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p></div>
    </motion.div>
  )
}

function PostJobModal({ onClose, onCreate }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ title: '', role: 'Chef', location: '', salaryMin: '', salaryMax: '', experienceMin: 0, experienceMax: 3, description: '', jobType: 'full-time', openings: 1, skills: '', easyApply: true })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/recruiters/profile').then(r => setProfile(r.data.data)).catch(() => {})
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form, companyName: profile?.companyName || user?.name, companyLogo: profile?.companyLogo || '🏨', skills: form.skills.split(',').map(s => s.trim()).filter(Boolean), salaryMin: parseInt(form.salaryMin) || 0, salaryMax: parseInt(form.salaryMax) || 0 }
      const { data } = await api.post('/jobs', payload)
      toast.success('Job posted successfully!')
      onCreate(data.data)
      onClose()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post job')
    } finally { setSaving(false) }
  }

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 w-full max-w-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl font-bold text-charcoal-800 dark:text-white">Post a New Job</h2>
          <button onClick={onClose}><FiX size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Job Title *</label>
            <input required value={form.title} onChange={set('title')} placeholder="e.g. Senior Chef - Italian Cuisine" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Role *</label>
            <select required value={form.role} onChange={set('role')} className="input-field">
              {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Location *</label>
            <input required value={form.location} onChange={set('location')} placeholder="e.g. Mumbai" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Salary Min (₹/mo)</label>
            <input type="number" value={form.salaryMin} onChange={set('salaryMin')} placeholder="15000" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Salary Max (₹/mo)</label>
            <input type="number" value={form.salaryMax} onChange={set('salaryMax')} placeholder="35000" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Min Experience (yrs)</label>
            <input type="number" value={form.experienceMin} onChange={set('experienceMin')} min="0" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max Experience (yrs)</label>
            <input type="number" value={form.experienceMax} onChange={set('experienceMax')} min="0" className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Job Type</label>
            <select value={form.jobType} onChange={set('jobType')} className="input-field">
              {['full-time', 'part-time', 'contract', 'internship'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Openings</label>
            <input type="number" value={form.openings} onChange={set('openings')} min="1" className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Skills (comma-separated)</label>
            <input value={form.skills} onChange={set('skills')} placeholder="e.g. Indian Cuisine, HACCP, Menu Planning" className="input-field" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Job Description *</label>
            <textarea required value={form.description} onChange={set('description')} rows={4} placeholder="Describe the role, responsibilities, and ideal candidate..." className="input-field resize-none" />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="easyApply" checked={form.easyApply} onChange={e => setForm(f => ({ ...f, easyApply: e.target.checked }))} className="accent-gold-500" />
            <label htmlFor="easyApply" className="text-sm text-gray-600 dark:text-gray-300">Enable Easy Apply (one-click applications)</label>
          </div>
          <div className="md:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Posting...' : 'Post Job'}</button>
            <button type="button" onClick={onClose} className="btn-ghost px-6">Cancel</button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

function RecruiterProfileTab({ profile, onSave }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const EMOJI_LOGOS = ['🏨', '🏩', '🏪', '🍽️', '🍷', '🌴', '🏖️', '⭐', '🌟', '🎖️', '🏆', '🥂']
  const [form, setForm] = useState({
    companyName: profile?.companyName || '',
    companyLogo: profile?.companyLogo || '🏨',
    description: profile?.description || '',
    website: profile?.website || '',
    contactPhone: profile?.contactPhone || '',
    city: profile?.city || '',
  })

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/recruiters/profile', form)
      toast.success('Company profile updated!')
      setEditing(false)
      onSave(data.data)
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 dark:from-charcoal-700 dark:to-charcoal-600 flex items-center justify-center text-4xl border border-gold-200 dark:border-charcoal-600">
              {form.companyLogo}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-charcoal-800 dark:text-white">{form.companyName || 'Your Company'}</h2>
              <p className="text-sm text-gray-500">Hospitality · {form.city || 'India'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-1.5 text-sm">
                  <FiSave size={14} /> {saving ? 'Saving...' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-ghost text-sm"><FiX size={14} /></button>
              </>
            ) : (
              <button onClick={() => setEditing(true)} className="btn-outline flex items-center gap-1.5 text-sm">
                <FiEdit2 size={14} /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {editing && (
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-500 mb-2">Company Logo (choose emoji)</label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_LOGOS.map(em => (
                <button key={em} onClick={() => setForm(f => ({ ...f, companyLogo: em }))}
                  className={`text-2xl w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${
                    form.companyLogo === em ? 'border-gold-500 bg-gold-50 dark:bg-gold-900/20' : 'border-gray-200 dark:border-charcoal-600 hover:border-gold-300'
                  }`}>{em}</button>
              ))}
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: 'companyName', label: 'Company Name', placeholder: 'e.g. Taj Hotels & Resorts', icon: MdBusiness },
            { key: 'city', label: 'City / Location', placeholder: 'e.g. Mumbai, Goa', icon: FiMapPin },
            { key: 'website', label: 'Website', placeholder: 'https://yourhotel.com', icon: FiGlobe },
            { key: 'contactPhone', label: 'Contact Phone', placeholder: '+91 98765 43210', icon: FiPhone },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
              {editing ? (
                <div className="relative">
                  <field.icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input value={form[field.key]} onChange={set(field.key)} placeholder={field.placeholder}
                    className="input-field text-sm pl-9" />
                </div>
              ) : (
                <p className="text-sm font-medium text-charcoal-700 dark:text-gray-200 py-2">
                  {form[field.key] || <span className="text-gray-400 italic">Not set</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Company Description</label>
          {editing ? (
            <textarea value={form.description} onChange={set('description')} rows={4}
              placeholder="Describe your hotel, brand, culture, and what makes you a great employer..."
              className="input-field text-sm resize-none" />
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {form.description || <span className="text-gray-400 italic">No description added yet</span>}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [jobs, setJobs] = useState([])
  const [recruiterProfile, setRecruiterProfile] = useState(null)
  const [selectedJob, setSelectedJob] = useState(null)
  const [applicants, setApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPostJob, setShowPostJob] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/recruiters/analytics'), api.get('/recruiters/jobs'), api.get('/recruiters/profile')])
      .then(([a, j, p]) => { setAnalytics(a.data.data); setJobs(j.data.data); setRecruiterProfile(p.data.data) })
      .catch(() => {}).finally(() => setLoading(false))
  }, [])

  const loadApplicants = async (jobId) => {
    setSelectedJob(jobId)
    try {
      const { data } = await api.get(`/recruiters/applicants/${jobId}`)
      setApplicants(data.data)
      setTab('applicants')
    } catch { toast.error('Failed to load applicants') }
  }

  const updateStatus = async (applicationId, status) => {
    try {
      await api.put(`/recruiters/applicants/${applicationId}`, { status })
      setApplicants(prev => prev.map(a => a._id === applicationId ? { ...a, status } : a))
      toast.success(`Candidate ${status}`)
    } catch { toast.error('Failed to update') }
  }

  const pieData = analytics?.statusBreakdown?.map(s => ({ name: s._id, value: s.count, color: STATUS_COLORS_MAP[s._id] || '#888' })) || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div><h1 className="font-display text-2xl font-bold text-charcoal-800 dark:text-white">Recruiter Dashboard</h1>
          <p className="text-gray-500 text-sm">Manage your job postings and candidates</p></div>
        <button onClick={() => setShowPostJob(true)} className="btn-primary flex items-center gap-2"><FiPlus size={16} /> Post a Job</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiBriefcase, label: 'Total Jobs', value: analytics?.totalJobs || 0, color: 'bg-gold-500' },
          { icon: FiBriefcase, label: 'Active Jobs', value: analytics?.activeJobs || 0, color: 'bg-green-500' },
          { icon: FiEye, label: 'Total Views', value: analytics?.totalViews || 0, color: 'bg-blue-500' },
          { icon: FiUsers, label: 'Applications', value: analytics?.totalApplications || 0, color: 'bg-maroon-600' },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-charcoal-800 rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide">
        {[{ key: 'overview', label: '📊 Overview' }, { key: 'jobs', label: '💼 My Jobs' }, { key: 'applicants', label: '👥 Applicants' }, { key: 'profile', label: '🏨 Company Profile' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key ? 'bg-white dark:bg-charcoal-700 text-gold-600 shadow-sm' : 'text-gray-500 hover:text-charcoal-700 dark:hover:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-4 text-charcoal-800 dark:text-white">Application Status</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={11}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie><Tooltip /></PieChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-10">No applications yet</p>}
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-4 text-charcoal-800 dark:text-white">Recent Applications</h3>
            <div className="space-y-3">
              {(analytics?.recentApplications || []).slice(0, 5).map(app => (
                <div key={app._id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold-400 to-maroon-500 flex items-center justify-center text-white text-xs font-bold">
                    {app.seekerId?.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-700 dark:text-gray-200 truncate">{app.seekerId?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 truncate">Applied for {app.jobId?.title || 'position'}</p>
                  </div>
                  <span className={`badge text-[10px] ${app.status === 'applied' ? 'badge-blue' : app.status === 'shortlisted' ? 'badge-green' : 'badge-gold'}`}>{app.status}</span>
                </div>
              ))}
              {!analytics?.recentApplications?.length && <p className="text-sm text-gray-400 text-center py-6">No applications yet</p>}
            </div>
          </div>
        </div>
      )}

      {/* My Jobs */}
      {tab === 'jobs' && (
        <div className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-center py-16"><div className="text-5xl mb-3">📝</div>
              <p className="text-gray-500">No jobs posted yet</p>
              <button onClick={() => setShowPostJob(true)} className="btn-primary mt-4 text-sm">Post Your First Job</button>
            </div>
          ) : jobs.map(job => (
            <motion.div key={job._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-charcoal-800 dark:text-white">{job.title}</h3>
                  <span className={`badge text-[10px] ${job.status === 'approved' ? 'badge-green' : job.status === 'pending' ? 'badge-gold' : 'bg-red-100 text-red-600'}`}>{job.status}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><FiMapPin size={11} />{job.location}</span>
                  <span className="flex items-center gap-1"><FiEye size={11} />{job.views} views</span>
                  <span className="flex items-center gap-1"><FiUsers size={11} />{job.applicationCount} applied</span>
                </div>
              </div>
              <button onClick={() => loadApplicants(job._id)} className="btn-outline text-sm flex-shrink-0">
                View Applicants
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Applicants */}
      {tab === 'applicants' && (
        applicants.length === 0 ? (
          <div className="text-center py-16"><div className="text-5xl mb-3">👥</div>
            <p className="text-gray-500">{selectedJob ? 'No applicants yet for this job' : 'Select a job to view applicants'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {applicants.map(app => (
              <motion.div key={app._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-maroon-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {app.seekerId?.name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-charcoal-800 dark:text-white">{app.seekerId?.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-500">{app.seekerId?.email}</p>
                  {app.matchScore > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-500 rounded-full" style={{ width: `${app.matchScore}%` }} />
                      </div>
                      <span className="text-[11px] text-gold-600 font-medium">{app.matchScore}% match</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                  <span className={`badge text-[10px] ${app.status === 'shortlisted' ? 'badge-green' : app.status === 'rejected' ? 'bg-red-100 text-red-600' : 'badge-blue'}`}>{app.status}</span>
                  {app.status === 'applied' || app.status === 'viewed' ? (
                    <>
                      <button onClick={() => updateStatus(app._id, 'shortlisted')} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"><FiCheck size={14} /></button>
                      <button onClick={() => updateStatus(app._id, 'rejected')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><FiX size={14} /></button>
                    </>
                  ) : null}
                  {app.coverLetter && <span className="text-[10px] text-gray-400 italic truncate max-w-xs">"{app.coverLetter.slice(0, 40)}..."</span>}
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {/* Company Profile */}
      {tab === 'profile' && (
        loading ? <div className="skeleton h-64 rounded-2xl" /> :
          <RecruiterProfileTab profile={recruiterProfile} onSave={setRecruiterProfile} />
      )}

      {showPostJob && <PostJobModal onClose={() => setShowPostJob(false)} onCreate={j => setJobs(prev => [j, ...prev])} />}
    </div>
  )
}
