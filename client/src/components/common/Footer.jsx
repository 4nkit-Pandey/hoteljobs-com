import { Link } from 'react-router-dom'
import { GiCook } from 'react-icons/gi'
import { FiMail, FiPhone, FiMapPin, FiTwitter, FiLinkedin, FiFacebook, FiInstagram } from 'react-icons/fi'

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 dark:bg-charcoal-950 text-gray-300 pt-14 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-gold-500 to-maroon-600 rounded-xl flex items-center justify-center">
                <GiCook className="text-white text-lg" />
              </div>
              <span className="font-display text-xl font-bold text-white">HotelJobs<span className="text-gold-400">.com</span></span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">India's premier job portal for the hotel & hospitality industry. Connecting talent with top properties.</p>
            <div className="flex gap-3">
              {[FiTwitter, FiLinkedin, FiFacebook, FiInstagram].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-lg bg-charcoal-700 hover:bg-gold-500 flex items-center justify-center transition-colors">
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>
          {/* Jobs */}
          <div>
            <h4 className="font-semibold text-white mb-4">Browse Jobs</h4>
            <ul className="space-y-2 text-sm">
              {['Chef Jobs', 'Hotel Manager Jobs', 'Front Desk Jobs', 'Housekeeping Jobs', 'Bartender Jobs', 'F&B Manager Jobs'].map(l => (
                <li key={l}><Link to="/jobs" className="hover:text-gold-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              {[['About Us', '/about'], ['Contact Us', '/contact'], ['Post a Job', '/auth?tab=register'], ['Privacy Policy', '#'], ['Terms of Service', '#']].map(([l, to]) => (
                <li key={l}><Link to={to} className="hover:text-gold-400 transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><FiMail size={14} className="text-gold-400" /> support@hoteljobs.com</li>
              <li className="flex items-center gap-2"><FiPhone size={14} className="text-gold-400" /> +91 98765 43210</li>
              <li className="flex items-start gap-2"><FiMapPin size={14} className="text-gold-400 mt-0.5" /> <span>Level 5, Phoenix Mall,<br />Mumbai, Maharashtra 400001</span></li>
            </ul>
            <div className="mt-4 p-3 bg-charcoal-800 rounded-xl">
              <p className="text-xs text-gray-400 mb-2">Subscribe to job alerts</p>
              <div className="flex gap-2">
                <input type="email" placeholder="your@email.com" className="flex-1 px-3 py-1.5 text-xs bg-charcoal-700 rounded-lg border border-charcoal-600 text-white placeholder-gray-500 focus:outline-none focus:border-gold-500" />
                <button className="px-3 py-1.5 bg-gold-500 hover:bg-gold-600 text-white text-xs rounded-lg transition-colors font-medium">Go</button>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-charcoal-700 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© 2024 HotelJobs.com — All rights reserved.</p>
          <p>Made with ❤️ for India's hospitality industry</p>
        </div>
      </div>
    </footer>
  )
}
