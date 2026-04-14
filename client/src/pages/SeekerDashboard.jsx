import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiBriefcase, FiBookmark, FiUser, FiStar, FiTrendingUp, FiCheck, FiClock, FiX, FiEdit2, FiSave, FiPlus, FiUpload } from 'react-icons/fi'
import SkeletonLoader from '../components/common/SkeletonLoader'
import JobCard from '../components/jobs/JobCard'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  applied: 'badge-blue', viewed: 'badge-gold', shortlisted: 'badge-green',
  rejected: 'bg-red-100 text-red-700', hired: 'bg-emerald-100 text-emerald-700'
}
const STATUS_ICONS = { applied: FiClock, viewed: FiStar, shortlisted: FiCheck, rejected: FiX, hired: FiStar }

const ROLE_OPTIONS = ['Chef', 'Sous Chef', 'Waiter', 'Waitress', 'Hotel Manager', 'General Manager',
  'Housekeeping', 'Front Desk', 'Receptionist', 'Bartender', 'Concierge', 'F&B Manager',
  'Kitchen Staff', 'Banquet Manager', 'Spa Therapist', 'Event Manager', 'Hospitality Executive']

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold font-display text-charcoal-800 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </motion.div>
  )
}

function ProfileEditTab({ profile, user, onSave }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: profile?.name || user?.name || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    totalExperience: profile?.totalExperience || 0,
    skills: [...(profile?.skills || [])],
    preferredRoles: [...(profile?.preferredRoles || [])],
  })
  const [skillInput, setSkillInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }))
    setSkillInput('')
  }

  const removeSkill = (s) => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))

  const toggleRole = (r) => setForm(f => ({
    ...f,
    preferredRoles: f.preferredRoles.includes(r)
      ? f.preferredRoles.filter(x => x !== r)
      : [...f.preferredRoles, r]
  }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/seekers/profile', form)
      toast.success('Profile updated!')
      setEditing(false)
      onSave(data.data)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save')
    } finally { setSaving(false) }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('resume', file)
    try {
      await api.post('/seekers/resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Resume uploaded!')
    } catch { toast.error('Upload failed') } finally { setUploading(false) }
  }

  const completion = profile?.profileCompletion || 0

  return (
    <div className="space-y-5">
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-maroon-500 flex items-center justify-center text-white text-2xl font-bold shadow-gold">
              {(form.name || user?.name)?.[0]?.toUpperCase()}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-charcoal-800 dark:text-white">{form.name || user?.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-1.5 bg-gray-200 dark:bg-charcoal-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full" style={{ width: `${completion}%` }} />
                </div>
                <span className="text-xs text-gold-600 font-medium">{completion}% complete</span>
              </div>
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

        <div className="grid md:grid-cols-2 gap-4">
          {[
            { key: 'name', label: 'Full Name', placeholder: 'Your full name' },
            { key: 'phone', label: 'Phone', placeholder: '+91 98765 43210' },
            { key: 'location', label: 'Location', placeholder: 'City, State' },
            { key: 'totalExperience', label: 'Experience (years)', placeholder: '3', type: 'number' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">{field.label}</label>
              {editing ? (
                <input type={field.type || 'text'} value={form[field.key]} onChange={set(field.key)}
                  placeholder={field.placeholder} className="input-field text-sm" />
              ) : (
                <p className="text-sm font-medium text-charcoal-700 dark:text-gray-200 py-2">
                  {form[field.key] || <span className="text-gray-400 italic">Not set</span>}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Bio / Summary</label>
          {editing ? (
            <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Brief professional summary..."
              className="input-field text-sm resize-none" />
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-300">{form.bio || <span className="text-gray-400 italic">No bio added yet</span>}</p>
          )}
        </div>

        <div className="mt-5 p-4 bg-gold-50 dark:bg-gold-900/10 border border-gold-200 dark:border-gold-800 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-charcoal-700 dark:text-gray-200">Resume</p>
            <p className="text-xs text-gray-500 mt-0.5">{profile?.resume ? '✅ Resume uploaded' : 'No resume uploaded yet'}</p>
          </div>
          <>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleResumeUpload} />
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="btn-outline text-xs flex items-center gap-1.5 flex-shrink-0">
              <FiUpload size={12} /> {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-charcoal-800 dark:text-white mb-4 flex items-center gap-2">
          <FiStar size={16} className="text-gold-500" /> Skills
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {form.skills.map(s => (
            <span key={s} className="badge badge-gold flex items-center gap-1">
              {s}
              {editing && (
                <button onClick={() => removeSkill(s)} className="ml-0.5 hover:text-red-500 transition-colors">
                  <FiX size={10} />
                </button>
              )}
            </span>
          ))}
          {!form.skills.length && <p className="text-sm text-gray-400 italic">No skills added</p>}
        </div>
        {editing && (
          <div className="flex gap-2">
            <input value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              placeholder="Add a skill (e.g. HACCP, Menu Planning)" className="input-field text-sm flex-1" />
            <button onClick={addSkill} className="btn-primary px-4 flex items-center gap-1 text-sm">
              <FiPlus size={14} /> Add
            </button>
          </div>
        )}
      </div>

      <div className="card p-6">
        <h3 className="font-semibold text-charcoal-800 dark:text-white mb-4 flex items-center gap-2">
          <FiBriefcase size={16} className="text-maroon-500" /> Preferred Roles
        </h3>
        {editing ? (
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map(r => (
              <button key={r} onClick={() => toggleRole(r)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all font-medium ${form.preferredRoles.includes(r)
                  ? 'bg-maroon-600 text-white border-maroon-600'
                  : 'border-gray-300 dark:border-charcoal-600 text-gray-600 dark:text-gray-300 hover:border-maroon-400'
                  }`}>
                {r}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {form.preferredRoles.length
              ? form.preferredRoles.map(r => <span key={r} className="badge badge-maroon">{r}</span>)
              : <p className="text-sm text-gray-400 italic">No preferred roles selected</p>
            }
          </div>
        )}
      </div>
    </div>
  )
}

export default function SeekerDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState('applications')
  const [applications, setApplications] = useState([])
  const [savedJobs, setSavedJobs] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/seekers/applications'),
      api.get('/seekers/saved-jobs'),
      api.get('/seekers/recommendations'),
      api.get('/seekers/profile'),
    ]).then(([apps, saved, recs, prof]) => {
      setApplications(apps.data.data)
      setSavedJobs(saved.data.data)
      setRecommendations(recs.data.data)
      setProfile(prof.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const completion = profile?.profileCompletion || 0
  const stats = [
    { icon: FiBriefcase, label: 'Applied', value: applications.length, color: 'bg-blue-500' },
    { icon: FiBookmark, label: 'Saved Jobs', value: savedJobs.length, color: 'bg-gold-500' },
    { icon: FiCheck, label: 'Shortlisted', value: applications.filter(a => a.status === 'shortlisted').length, color: 'bg-green-500' },
    { icon: FiStar, label: 'Profile Score', value: `${completion}%`, color: 'bg-maroon-600' },
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800 dark:text-white">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Welcome back, {user?.name}</p>
        </div>
        <Link to="/jobs" className="btn-primary text-sm">Browse Jobs</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {completion < 100 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-5 mb-6 border-l-4 border-gold-500">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FiUser size={16} className="text-gold-500" />
              <span className="font-semibold text-sm text-charcoal-800 dark:text-white">Complete your profile for better job matches</span>
            </div>
            <span className="text-sm font-bold text-gold-600">{completion}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-charcoal-700 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full" />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Go to <button onClick={() => setTab('profile')} className="text-gold-600 font-medium hover:underline">My Profile</button> to add skills, experience and resume
          </p>
        </motion.div>
      )}

      <div className="flex overflow-x-auto gap-1 bg-gray-100 dark:bg-charcoal-800 rounded-xl p-1 mb-6 scrollbar-hide">
        {[
          { key: 'applications', label: 'Applications', icon: FiBriefcase },
          { key: 'saved', label: 'Saved Jobs', icon: FiBookmark },
          { key: 'recommended', label: '✨ Recommended', icon: FiTrendingUp },
          { key: 'profile', label: 'My Profile', icon: FiUser },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? 'bg-white dark:bg-charcoal-700 text-gold-600 shadow-sm' : 'text-gray-500 hover:text-charcoal-700 dark:hover:text-gray-300'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'applications' && (
        loading ? <SkeletonLoader count={4} type="card" /> : applications.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">📋</div>
            <p className="text-gray-500 dark:text-gray-400">No applications yet</p>
            <Link to="/jobs" className="btn-primary mt-4 inline-block text-sm">Start Applying</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map(app => {
              const job = app.jobId
              if (!job) return null
              const StatusIcon = STATUS_ICONS[app.status] || FiClock
              return (
                <motion.div key={app._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">{job.companyLogo || '🏨'}</span>
                    <div className="min-w-0">
                      <Link to={`/jobs/${job._id}`} className="font-semibold text-charcoal-800 dark:text-white hover:text-gold-600 transition-colors line-clamp-1">{job.title}</Link>
                      <p className="text-xs text-gray-500">{job.companyName} · {job.location}</p>
                      {job.salaryMin ? <p className="text-xs text-gold-600 font-medium">₹{Math.round(job.salaryMin/1000)}K–₹{Math.round(job.salaryMax/1000)}K/mo</p> : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {app.matchScore > 0 && (
                      <div className="text-center">
                        <div className="text-sm font-bold text-gold-600">{app.matchScore}%</div>
                        <div className="text-[10px] text-gray-400">Match</div>
                      </div>
                    )}
                    <span className={`badge ${STATUS_COLORS[app.status] || 'badge-blue'} gap-1`}>
                      <StatusIcon size={10} /> {app.status}
                    </span>
                    <span className="text-[11px] text-gray-400">{new Date(app.appliedAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )
      )}

      {tab === 'saved' && (
        loading ? <SkeletonLoader count={4} type="card" /> : savedJobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔖</div>
            <p className="text-gray-500">No saved jobs yet</p>
            <Link to="/jobs" className="btn-primary mt-4 inline-block text-sm">Browse Jobs</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {savedJobs.map(s => s.jobId && <JobCard key={s._id} job={s.jobId} />)}
          </div>
        )
      )}

      {tab === 'recommended' && (
        loading ? <SkeletonLoader count={6} type="job" /> : recommendations.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🤖</div>
            <p className="text-gray-500">Complete your profile to get AI-powered recommendations</p>
            <button onClick={() => setTab('profile')} className="btn-primary mt-4 text-sm">Edit Profile</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {recommendations.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
          </div>
        )
      )}

      {tab === 'profile' && (
        loading ? <SkeletonLoader count={3} type="card" /> :
          <ProfileEditTab profile={profile} user={user} onSave={setProfile} />
      )}
    </div>
  )
}
