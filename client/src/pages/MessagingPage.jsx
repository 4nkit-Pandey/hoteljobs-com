import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiSend, FiSearch, FiMessageSquare, FiArrowLeft } from 'react-icons/fi'
import api from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

function timeAgo(date) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function MessagingPage() {
  const { user } = useAuth()
  const [conversations, setConversations] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedConv, setSelectedConv] = useState(null)
  const [newMsg, setNewMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const [mobileView, setMobileView] = useState('list') // 'list' | 'chat'
  const messagesEndRef = useRef(null)

  useEffect(() => {
    api.get('/messages/conversations')
      .then(({ data }) => setConversations(data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const openConversation = async (conv) => {
    setSelectedConv(conv)
    setMobileView('chat')
    try {
      const otherId = conv.participants?.find(p => p._id !== user?.id)?._id || conv.otherUserId
      if (!otherId) return
      const { data } = await api.get(`/messages/${otherId}`)
      setMessages(data.data || [])
    } catch { toast.error('Failed to load messages') }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMsg.trim() || !selectedConv) return
    setSending(true)
    try {
      const otherId = selectedConv.participants?.find(p => p._id !== user?.id)?._id || selectedConv.otherUserId
      const { data } = await api.post('/messages', { recipientId: otherId, content: newMsg.trim() })
      setMessages(prev => [...prev, data.data])
      setNewMsg('')
      // Update conversation list
      setConversations(prev => prev.map(c =>
        c._id === selectedConv._id ? { ...c, lastMessage: data.data.content, updatedAt: new Date() } : c
      ))
    } catch { toast.error('Failed to send') } finally { setSending(false) }
  }

  const otherUser = selectedConv?.participants?.find(p => p._id !== user?.id)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="font-display text-2xl font-bold text-charcoal-800 dark:text-white mb-6">Messages</h1>

      <div className="card overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`w-full md:w-80 border-r border-gray-100 dark:border-charcoal-700 flex flex-col ${mobileView === 'chat' ? 'hidden md:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 border-b border-gray-100 dark:border-charcoal-700">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input placeholder="Search conversations..." className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400" />
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-charcoal-700 flex-shrink-0" />
                      <div className="flex-1 space-y-2 pt-1">
                        <div className="h-3 bg-gray-200 dark:bg-charcoal-700 rounded w-3/4" />
                        <div className="h-2.5 bg-gray-200 dark:bg-charcoal-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <FiMessageSquare size={32} className="text-gray-300 dark:text-charcoal-600 mb-3" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">Messages from recruiters will appear here</p>
                </div>
              ) : (
                conversations.map(conv => {
                  const other = conv.participants?.find(p => p._id !== user?.id)
                  const isSelected = selectedConv?._id === conv._id
                  return (
                    <button key={conv._id} onClick={() => openConversation(conv)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gold-50 dark:hover:bg-charcoal-700 transition-colors text-left ${isSelected ? 'bg-gold-50 dark:bg-charcoal-700 border-r-2 border-gold-500' : ''}`}>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-maroon-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {other?.name?.[0] || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-charcoal-800 dark:text-gray-200 truncate">{other?.name || 'Unknown'}</p>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(conv.updatedAt)}</span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{conv.lastMessage || 'Start conversation'}</p>
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${mobileView === 'list' ? 'hidden md:flex' : 'flex'}`}>
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 dark:border-charcoal-700">
                  <button className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-charcoal-700 rounded-lg" onClick={() => setMobileView('list')}>
                    <FiArrowLeft size={18} />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-maroon-500 flex items-center justify-center text-white font-bold text-sm">
                    {otherUser?.name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-charcoal-800 dark:text-white">{otherUser?.name || 'Unknown'}</p>
                    <p className="text-xs text-gray-400 capitalize">{otherUser?.role || 'User'}</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {messages.map((msg, i) => {
                      const isMe = msg.senderId === user?.id || msg.senderId?._id === user?.id
                      return (
                        <motion.div key={msg._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${isMe
                            ? 'bg-gradient-to-br from-gold-500 to-gold-600 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-charcoal-700 text-charcoal-800 dark:text-gray-200 rounded-bl-sm'
                            }`}>
                            <p className="leading-relaxed">{msg.content}</p>
                            <p className={`text-[10px] mt-1 ${isMe ? 'text-gold-100' : 'text-gray-400'}`}>{timeAgo(msg.createdAt || msg.sentAt)}</p>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                  {messages.length === 0 && (
                    <div className="text-center py-10 text-sm text-gray-400">
                      No messages yet. Start the conversation!
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t border-gray-100 dark:border-charcoal-700">
                  <input value={newMsg} onChange={e => setNewMsg(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-charcoal-900 border border-gray-200 dark:border-charcoal-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gold-400" />
                  <button type="submit" disabled={sending || !newMsg.trim()}
                    className="w-10 h-10 bg-gold-500 hover:bg-gold-600 disabled:bg-gray-300 dark:disabled:bg-charcoal-600 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0">
                    <FiSend size={16} />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-20 h-20 bg-gradient-to-br from-gold-100 to-gold-200 dark:from-charcoal-700 dark:to-charcoal-600 rounded-3xl flex items-center justify-center mb-4">
                  <FiMessageSquare size={32} className="text-gold-500" />
                </div>
                <h3 className="font-display text-lg font-semibold text-charcoal-800 dark:text-white mb-2">Select a Conversation</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose a conversation from the list to start messaging</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
