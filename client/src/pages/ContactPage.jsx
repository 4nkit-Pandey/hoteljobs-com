import { useState } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin, FiSend, FiMessageCircle, FiClock } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSending(true)
    await new Promise(r => setTimeout(r, 1500))
    toast.success("Message sent! We'll get back within 24 hours. 📩")
    setForm({ name: '', email: '', subject: '', message: '' })
    setSending(false)
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-charcoal-900 to-maroon-950 py-20 px-4 text-center">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <span className="badge badge-gold mb-3">Contact Us</span>
          <h1 className="font-display text-4xl font-bold text-white mb-3">We'd Love to <span className="text-gradient">Hear from You</span></h1>
          <p className="text-gray-300 max-w-xl mx-auto">Have a question, feedback, or want to partner with us? Our team is ready to help.</p>
        </motion.div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div>
            <h2 className="font-display text-2xl font-bold text-charcoal-800 dark:text-white mb-6">Get in Touch</h2>
            <div className="space-y-5">
              {[
                { icon: FiMail, title: 'Email Us', val: 'support@hoteljobs.com', sub: 'For general inquiries' },
                { icon: FiPhone, title: 'Call Us', val: '+91 98765 43210', sub: 'Mon–Fri, 9AM–6PM IST' },
                { icon: FiMapPin, title: 'Office', val: 'Level 5, Phoenix Mall, LBS Marg', sub: 'Mumbai, Maharashtra 400001' },
                { icon: FiClock, title: 'Support Hours', val: 'Mon – Sat: 9AM – 7PM', sub: 'Sunday: 10AM – 4PM' },
              ].map(item => (
                <motion.div key={item.title} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex gap-4 items-start">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gold-100 to-gold-200 dark:from-charcoal-700 dark:to-charcoal-600 flex items-center justify-center flex-shrink-0">
                    <item.icon size={18} className="text-gold-600 dark:text-gold-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal-800 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.val}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-5 card">
              <div className="flex items-center gap-2 mb-2">
                <FiMessageCircle size={16} className="text-gold-500" />
                <p className="font-semibold text-charcoal-800 dark:text-white">Frequent Questions</p>
              </div>
              {['How do I post a job?', 'Is it free for job seekers?', 'How long until my profile is visible?'].map(q => (
                <p key={q} className="text-sm text-gray-500 py-2 border-b border-gray-100 dark:border-charcoal-700 last:border-0 hover:text-gold-600 cursor-pointer transition-colors">{q}</p>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6">
            <h2 className="font-display text-xl font-bold text-charcoal-800 dark:text-white mb-5">Send a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
                <input required value={form.name} onChange={set('name')} placeholder="Rahul Sharma" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
                <input required type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" className="input-field" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Subject</label>
                <select value={form.subject} onChange={set('subject')} className="input-field">
                  <option value="">Select a subject...</option>
                  <option>Job Posting Inquiry</option>
                  <option>Technical Support</option>
                  <option>Partnership Opportunity</option>
                  <option>Account Issue</option>
                  <option>General Question</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Message</label>
                <textarea required value={form.message} onChange={set('message')} rows={5} placeholder="Tell us how we can help..." className="input-field resize-none" />
              </div>
              <button type="submit" disabled={sending} className="btn-primary w-full flex items-center justify-center gap-2">
                {sending ? (
                  <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" /></svg> Sending...</>
                ) : <><FiSend size={16} /> Send Message</>}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
