import { motion } from 'framer-motion'
import { FiTarget, FiHeart, FiTrendingUp, FiUsers, FiStar, FiCheckCircle } from 'react-icons/fi'
import { GiCook } from 'react-icons/gi'
import { Link } from 'react-router-dom'


const VALUES = [
  { icon: FiTarget, title: 'Purpose-Driven', desc: 'We serve a specific industry because we know it inside-out. Specialization creates better outcomes.' },
  { icon: FiHeart, title: 'People First', desc: 'Every feature is built with the job seeker and recruiter at the center. Technology should serve humans.' },
  { icon: FiTrendingUp, title: 'Industry Impact', desc: 'We want to uplift the entire Indian hospitality sector by ensuring the best talent finds the best roles.' },
  { icon: FiCheckCircle, title: 'Trust & Quality', desc: 'We verify companies and curate listings so you can apply with confidence.' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-charcoal-900 via-maroon-950 to-charcoal-900 py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-maroon-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-gold">
            <GiCook size={30} className="text-white" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">About <span className="text-gradient">HotelJobs.com</span></h1>
          <p className="text-lg text-gray-300 leading-relaxed">
            We built the job board we wished existed — one exclusively for India's vibrant hotel and hospitality industry.
            From 5-star Michelin chefs to front desk executives, we connect passionate people with extraordinary properties.
          </p>
        </motion.div>
      </section>

      {/* Mission */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <span className="badge badge-gold mb-3">Our Mission</span>
            <h2 className="section-title mb-4">Elevating Careers in Indian Hospitality</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
              India's hospitality sector employs over 8 crore people, and yet finding the right role — or the right person — was a fragmented, inefficient process. General job boards don't understand the nuances of a banquet manager role vs. an F&B supervisor.
            </p>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              HotelJobs.com was built specifically for this industry. Our smart matching, location-based search, and skill scoring ensure hospitality professionals find roles where they truly thrive.
            </p>
          </motion.div>
          <div className="grid grid-cols-2 gap-4">
            {[{ n: '8CR+', l: 'Hospitality Workers in India' }, { n: '50K+', l: 'Candidates on Platform' }, { n: '850+', l: 'Partner Hotels' }, { n: '92%', l: 'Placement Success Rate' }].map((s, i) => (
              <motion.div key={s.l} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-5 text-center">
                <p className="font-display text-3xl font-bold text-gradient">{s.n}</p>
                <p className="text-xs text-gray-500 mt-1">{s.l}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-cream-100 dark:bg-charcoal-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="section-title">Our Core Values</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {VALUES.map((v, i) => (
              <motion.div key={v.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card p-6 flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-maroon-500 flex items-center justify-center flex-shrink-0">
                  <v.icon size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-800 dark:text-white mb-1">{v.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{v.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-14 px-4 bg-gradient-to-r from-gold-500 to-gold-600 text-center">
        <h2 className="font-display text-3xl font-bold text-white mb-3">Ready to join us?</h2>
        <p className="text-gold-100 mb-6">Whether you're hiring or job seeking, HotelJobs.com is your home.</p>
        <Link to="/auth?tab=register" className="inline-block px-8 py-3 bg-white text-gold-600 font-bold rounded-xl hover:bg-gold-50 transition-all hover:-translate-y-1 shadow-lg">Get Started Free</Link>
      </section>
    </div>
  )
}
