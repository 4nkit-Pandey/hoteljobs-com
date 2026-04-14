import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiBriefcase, FiCheck, FiX, FiSearch, FiShield, FiTrendingUp, FiPackage } from 'react-icons/fi'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import api from '../services/api'
import toast from 'react-hot-toast'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}><Icon size={20} className="text-white" /></div>
      <div><p className="text-2xl font-bold font-display text-charcoal-800 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500">{label}</p></div>
    </div>
  )
}

export default function AdminPanel() {
  const [tab, setTab] = useState('overview')
  const [analytics, setAnalytics] = useState(null)
  const [users, setUsers] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/analytics'),
      api.get('/admin/users?limit=50'),
      api.get('/admin/jobs?limit=50'),
    ]).then(([a, u, j]) => {
      setAnalytics(a.data.data)
      setUsers(u.data.data)
      setJobs(j.data.data)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const toggleUser = async (userId, isActive) => {
    try {
      await api.put(`/admin/users/${userId}`, { isActive: !isActive })
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u))
      toast.success(`User ${!isActive ? 'activated' : 'deactivated'}`)
    } catch { toast.error('Failed to update user') }
  }

  const approveJob = async (jobId, status) => {
    try {
      await api.put(`/admin/jobs/${jobId}/approve`, { status })
      setJobs(prev => prev.map(j => j._id === jobId ? { ...j, status } : j))
      toast.success(`Job ${status}`)
    } catch { toast.error('Failed to update job') }
  }

  const monthlyData = analytics?.monthlyJobs?.map(m => ({ month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][m._id - 1] || m._id, jobs: m.count })) || []

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase()))
  const filteredJobs = jobs.filter(j => j.title?.toLowerCase().includes(search.toLowerCase()) || j.companyName?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-500 to-maroon-600 flex items-center justify-center">
          <FiShield size={18} className="text-white" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-charcoal-800 dark:text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Platform management & moderation</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: FiUsers, label: 'Total Users', value: analytics?.totalUsers || 0, color: 'bg-blue-500' },
          { icon: FiBriefcase, label: 'Total Jobs', value: analytics?.totalJobs || 0, color: 'bg-gold-500' },
          { icon: FiCheck, label: 'Active Jobs', value: analytics?.activeJobs || 0, color: 'bg-green-500' },
          { icon: FiTrendingUp, label: 'Applications', value: analytics?.totalApplications || 0, color: 'bg-maroon-600' },
        ].map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-charcoal-800 rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide">
        {[{ key: 'overview', label: '📊 Overview' }, { key: 'users', label: `👥 Users (${users.length})` }, { key: 'jobs', label: `💼 Jobs (${jobs.length})` }, { key: 'subscriptions', label: '💳 Subscriptions' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${tab === t.key ? 'bg-white dark:bg-charcoal-700 text-gold-600 shadow-sm' : 'text-gray-500 hover:text-charcoal-700 dark:hover:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Search bar for users/jobs tabs */}
      {(tab === 'users' || tab === 'jobs') && (
        <div className="relative mb-4">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${tab}...`} className="input-field pl-11" />
        </div>
      )}

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card p-5">
            <h3 className="font-semibold text-charcoal-800 dark:text-white mb-4">Jobs Posted per Month</h3>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData}><XAxis dataKey="month" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} />
                  <Tooltip /><Bar dataKey="jobs" fill="#D4A843" radius={[4,4,0,0]} /></BarChart>
              </ResponsiveContainer>
            ) : <p className="text-sm text-gray-400 text-center py-10">No data yet</p>}
          </div>
          <div className="card p-5">
            <h3 className="font-semibold text-charcoal-800 dark:text-white mb-4">Platform Summary</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Job Seekers', val: analytics?.totalSeekers || 0, icon: FiUsers },
                { label: 'Recruiters', val: analytics?.totalRecruiters || 0, icon: FiBriefcase },
                { label: 'Pending Approval', val: analytics?.pendingJobs || 0, icon: FiTrendingUp, highlight: (analytics?.pendingJobs || 0) > 0 },
              ].map(item => (
                <div key={item.label} className={`flex items-center justify-between p-3 rounded-xl ${item.highlight ? 'bg-gold-50 dark:bg-gold-900/20' : 'bg-gray-50 dark:bg-charcoal-700'}`}>
                  <div className="flex items-center gap-2">
                    <item.icon size={15} className={item.highlight ? 'text-gold-500' : 'text-gray-400'} />
                    <span className="text-charcoal-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <span className={`font-bold ${item.highlight ? 'text-gold-600' : 'text-charcoal-800 dark:text-white'}`}>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-maroon-50 dark:bg-maroon-900/20 rounded-xl">
              <p className="text-xs text-maroon-600 font-medium">Recent Users</p>
              <div className="mt-2 space-y-1">
                {(analytics?.recentUsers || []).slice(0, 3).map(u => (
                  <div key={u._id} className="flex items-center justify-between text-xs">
                    <span className="text-charcoal-700 dark:text-gray-300">{u.name}</span>
                    <span className="badge badge-maroon text-[10px] capitalize">{u.role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="space-y-2">
          {filteredUsers.map(u => (
            <motion.div key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-maroon-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {u.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-charcoal-800 dark:text-white text-sm">{u.name}</p>
                  <span className={`badge text-[10px] capitalize ${u.role === 'admin' ? 'badge-maroon' : u.role === 'recruiter' ? 'badge-gold' : 'badge-blue'}`}>{u.role}</span>
                  {!u.isActive && <span className="badge bg-red-100 text-red-600 text-[10px]">Banned</span>}
                </div>
                <p className="text-xs text-gray-400">{u.email}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] text-gray-400">{new Date(u.createdAt).toLocaleDateString('en-IN')}</span>
                {u.role !== 'admin' && (
                  <button onClick={() => toggleUser(u._id, u.isActive)} className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
          {filteredUsers.length === 0 && <p className="text-center text-gray-400 py-10">No users found</p>}
        </div>
      )}

      {/* Jobs */}
      {tab === 'jobs' && (
        <div className="space-y-2">
          {filteredJobs.map(job => (
            <motion.div key={job._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-2xl flex-shrink-0">{job.companyLogo || '🏨'}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium text-charcoal-800 dark:text-white text-sm">{job.title}</p>
                  <span className={`badge text-[10px] ${job.status === 'approved' ? 'badge-green' : job.status === 'pending' ? 'badge-gold' : 'bg-red-100 text-red-600'}`}>{job.status}</span>
                </div>
                <p className="text-xs text-gray-400">{job.companyName} · {job.location} · {job.role}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {job.status !== 'approved' && (
                  <button onClick={() => approveJob(job._id, 'approved')} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors"><FiCheck size={14} /></button>
                )}
                {job.status !== 'rejected' && (
                  <button onClick={() => approveJob(job._id, 'rejected')} className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"><FiX size={14} /></button>
                )}
                <span className="text-[11px] text-gray-400">{new Date(job.createdAt).toLocaleDateString('en-IN')}</span>
              </div>
            </motion.div>
          ))}
          {filteredJobs.length === 0 && <p className="text-center text-gray-400 py-10">No jobs found</p>}
        </div>
      )}

      {/* Subscriptions */}
      {tab === 'subscriptions' && (
        <div className="card p-8 text-center">
          <FiPackage size={48} className="mx-auto text-gold-400 mb-3" />
          <h3 className="font-display text-xl font-bold text-charcoal-800 dark:text-white mb-2">Subscription Plans</h3>
          <p className="text-gray-500 mb-6">Manage recruiter subscriptions and billing</p>
          <div className="grid md:grid-cols-3 gap-4 text-left">
            {[
              { plan: 'Basic', price: '₹999/mo', features: ['5 Job Posts', 'Basic Analytics', 'Email Support'], color: 'border-gray-200' },
              { plan: 'Premium', price: '₹2,999/mo', features: ['25 Job Posts', '5 Featured Posts', 'Priority Support', 'Advanced Analytics'], color: 'border-gold-400', highlight: true },
              { plan: 'Enterprise', price: '₹7,999/mo', features: ['Unlimited Posts', '20 Featured Posts', 'Dedicated Manager', 'API Access'], color: 'border-maroon-400' },
            ].map(p => (
              <div key={p.plan} className={`p-5 rounded-2xl border-2 ${p.color} ${p.highlight ? 'bg-gold-50 dark:bg-gold-900/10' : ''}`}>
                <h4 className="font-display font-bold text-lg text-charcoal-800 dark:text-white">{p.plan}</h4>
                <p className="text-2xl font-bold text-gold-600 my-2">{p.price}</p>
                <ul className="space-y-1">{p.features.map(f => <li key={f} className="text-xs text-gray-500 flex items-center gap-1"><FiCheck size={11} className="text-green-500" />{f}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
