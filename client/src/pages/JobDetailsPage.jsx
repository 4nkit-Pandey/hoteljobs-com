import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiMapPin, FiBriefcase, FiBookmark, FiShare2, FiZap, FiArrowLeft, FiUsers, FiDollarSign, FiCheck } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import JobCard from '../components/jobs/JobCard'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

function formatSalary(min, max) {
  const fmt = n => n >= 100000 ? `₹${(n/100000).toFixed(1)}L` : `₹${(n/1000).toFixed(0)}K`
  if (!min && !max) return 'Not disclosed'
  if (min && max) return `${fmt(min)} – ${fmt(max)}/mo`
  return `${fmt(min || max)}/mo`
}

export default function JobDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [job, setJob] = useState(null)
  const [similar, setSimilar] = useState([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [saved, setSaved] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [showApplyModal, setShowApplyModal] = useState(false)

  useEffect(() => {
    api.get(`/jobs/${id}`).then(({ data }) => {
      setJob(data.data)
      setSimilar(data.similarJobs || [])
    }).catch(() => navigate('/jobs')).finally(() => setLoading(false))
  }, [id])

  const handleApply = async () => {
    if (!isAuthenticated) { toast.error('Please login to apply'); navigate('/auth'); return }
    if (user?.role !== 'seeker') { toast.error('Only job seekers can apply'); return }
    setApplying(true)
    try {
      await api.post(`/jobs/${job._id}/apply`, { coverLetter })
      setApplied(true); setShowApplyModal(false)
      toast.success('Application submitted! 🎉')
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply')
    } finally { setApplying(false) }
  }

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error('Please login to save jobs'); return }
    try {
      const { data } = await api.post(`/seekers/saved-jobs/${job._id}`)
      setSaved(data.saved); toast.success(data.message)
    } catch { toast.error('Failed to save') }
  }

  const salaryData = similar.filter(j => j.salaryMin).slice(0, 4).map(j => ({
    name: j.companyName?.split(' ')[0] || 'Co.',
    avg: Math.round((j.salaryMin + j.salaryMax) / 2 / 1000)
  }))
  if (job?.salaryMin) salaryData.unshift({ name: 'This', avg: Math.round((job.salaryMin + job.salaryMax) / 2 / 1000) })

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="skeleton h-8 w-40 rounded mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="skeleton h-64 rounded-2xl" /><div className="skeleton h-40 rounded-2xl" />
        </div>
        <div className="skeleton h-80 rounded-2xl" />
      </div>
    </div>
  )
  if (!job) return null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <button onClick={() => navigate('/jobs')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gold-600 transition-colors mb-6">
        <FiArrowLeft size={16} /> Back to Jobs
      </button>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-200 dark:from-charcoal-700 dark:to-charcoal-600 flex items-center justify-center text-4xl border border-gold-200 dark:border-charcoal-600 flex-shrink-0">
                {job.companyLogo || '🏨'}
              </div>
              <div className="flex-1">
                <h1 className="font-display text-2xl font-bold text-charcoal-800 dark:text-white mb-1">{job.title}</h1>
                <p className="text-gold-600 dark:text-gold-400 font-medium">{job.companyName}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="badge badge-gold">{job.role}</span>
                  <span className="badge badge-blue">{job.jobType}</span>
                  {job.easyApply && <span className="badge badge-green"><FiZap size={10} /> Easy Apply</span>}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-gray-100 dark:border-charcoal-700 mb-4">
              {[
                { icon: FiMapPin, label: 'Location', val: job.location },
                { icon: FiDollarSign, label: 'Salary', val: formatSalary(job.salaryMin, job.salaryMax) },
                { icon: FiBriefcase, label: 'Experience', val: `${job.experienceMin}–${job.experienceMax} yrs` },
                { icon: FiUsers, label: 'Openings', val: `${job.openings} position${job.openings > 1 ? 's' : ''}` },
              ].map(item => (
                <div key={item.label} className="text-center">
                  <item.icon size={18} className="text-gold-500 mx-auto mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
                  <p className="text-sm font-semibold text-charcoal-700 dark:text-gray-200">{item.val}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {applied ? (
                <div className="flex items-center gap-2 px-6 py-2.5 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">
                  <FiCheck size={16} /> Applied Successfully
                </div>
              ) : (
                <button onClick={() => job.easyApply ? handleApply() : setShowApplyModal(true)} disabled={applying} className="btn-primary flex items-center gap-2">
                  <FiZap size={16} /> {applying ? 'Applying...' : 'Apply Now'}
                </button>
              )}
              <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-medium ${saved ? 'border-gold-400 text-gold-600 bg-gold-50' : 'border-gray-300 dark:border-charcoal-600 hover:border-gold-400'}`}>
                <FiBookmark size={16} fill={saved ? 'currentColor' : 'none'} /> {saved ? 'Saved' : 'Save Job'}
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Link copied!') }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-charcoal-600 hover:border-gold-400 text-sm font-medium transition-all">
                <FiShare2 size={16} /> Share
              </button>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-6">
            <h2 className="font-display text-xl font-bold text-charcoal-800 dark:text-white mb-4">Job Description</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line mb-5">{job.description}</p>
            {job.requirements?.length > 0 && (
              <><h3 className="font-semibold text-charcoal-800 dark:text-white mb-3">Requirements</h3>
              <ul className="space-y-2 mb-5">{job.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-300">
                  <FiCheck size={15} className="text-gold-500 mt-0.5 flex-shrink-0" /> {r}
                </li>
              ))}</ul></>
            )}
            {job.skills?.length > 0 && (
              <><h3 className="font-semibold text-charcoal-800 dark:text-white mb-3">Required Skills</h3>
              <div className="flex flex-wrap gap-2 mb-5">{job.skills.map(s => (
                <span key={s} className="px-3 py-1 bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400 rounded-full text-xs font-medium border border-gold-200 dark:border-gold-800">{s}</span>
              ))}</div></>
            )}
            {job.benefits?.length > 0 && (
              <><h3 className="font-semibold text-charcoal-800 dark:text-white mb-3">Benefits</h3>
              <div className="flex flex-wrap gap-2">{job.benefits.map(b => (
                <span key={b} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 rounded-full text-xs font-medium"><FiCheck className="inline mr-1" size={11} />{b}</span>
              ))}</div></>
            )}
          </motion.div>

          {salaryData.length > 1 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
              <h2 className="font-display text-xl font-bold text-charcoal-800 dark:text-white mb-1">Salary Insights</h2>
              <p className="text-sm text-gray-500 mb-5">Average monthly salary (₹K) for {job.role} roles</p>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={salaryData}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={v => [`₹${v}K`, 'Avg Salary']} /><Bar dataKey="avg" fill="#D4A843" radius={[6,6,0,0]} /></BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        <div className="space-y-5">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="card p-5">
            <h3 className="font-semibold text-charcoal-800 dark:text-white mb-4">About Company</h3>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{job.companyLogo || '🏨'}</span>
              <div><p className="font-semibold text-charcoal-700 dark:text-gray-200">{job.companyName}</p>
              <p className="text-xs text-gray-500">Hospitality</p></div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <p className="flex items-center gap-2"><FiMapPin size={13} className="text-gold-500" />{job.location}</p>
            </div>
            <p className="text-xs text-gray-500 mt-3">{job.views} views · {job.applicationCount} applied</p>
          </motion.div>
          {similar.length > 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="card p-5">
              <h3 className="font-semibold text-charcoal-800 dark:text-white mb-4">Similar Jobs</h3>
              <div className="space-y-3">
                {similar.slice(0, 3).map(sj => (
                  <Link key={sj._id} to={`/jobs/${sj._id}`} className="flex gap-3 p-2 hover:bg-gold-50 dark:hover:bg-charcoal-700 rounded-xl transition-colors">
                    <span className="text-xl">{sj.companyLogo || '🏨'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-700 dark:text-gray-200 line-clamp-1">{sj.title}</p>
                      <p className="text-xs text-gray-500">{sj.location}</p>
                      <p className="text-xs text-gold-600 font-medium">₹{Math.round(sj.salaryMin/1000)}K–₹{Math.round(sj.salaryMax/1000)}K/mo</p>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 w-full max-w-lg">
            <h3 className="font-display text-xl font-bold mb-4">Apply to {job.title}</h3>
            <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={5} placeholder="Write a brief cover letter (optional)..." className="input-field mb-4 resize-none" />
            <div className="flex gap-3">
              <button onClick={handleApply} disabled={applying} className="btn-primary flex-1">{applying ? 'Submitting...' : 'Submit Application'}</button>
              <button onClick={() => setShowApplyModal(false)} className="btn-ghost px-6">Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
