import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../store/authStore'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../../services/api'
import { GraduationCap, Eye, EyeOff, AlertCircle, Loader2, ChevronRight, X, CheckCircle2, Copy } from 'lucide-react'

export default function LoginPage() {
  const { t, i18n } = useTranslation()
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [matricule, setMatricule] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)
  const [forgotIdentifier, setForgotIdentifier] = useState('')
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forgotError, setForgotError] = useState('')
  const [forgotResult, setForgotResult] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      if (user.role === 'admin') navigate('/admin/dashboard', { replace: true })
      else if (user.role === 'teacher') navigate('/teacher/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!matricule.trim() || !password.trim()) {
      setError(t('auth.requiredFields'))
      return
    }
    setLoading(true)
    try {
      const userData = await login(matricule.trim(), password)
      if (remember) {
        localStorage.setItem('rememberedMatricule', matricule.trim())
      } else {
        localStorage.removeItem('rememberedMatricule')
      }
      navigate(userData.role === 'admin' ? '/admin/dashboard' : '/teacher/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || t('auth.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex relative">
      <div className="fixed top-5 right-6 z-20 flex items-center gap-1 bg-white border border-[#E5E9F2] rounded-lg px-2.5 py-1.5 shadow-sm">
        <button
          onClick={() => i18n.changeLanguage('fr')}
          className={`text-xs font-medium px-2 py-0.5 rounded-md transition-all duration-150 ${i18n.language === 'fr' ? 'bg-[#3B6FF6] text-white' : 'text-[#6B7A99] hover:text-[#1E2A44]'}`}
        >
          FR
        </button>
        <button
          onClick={() => i18n.changeLanguage('en')}
          className={`text-xs font-medium px-2 py-0.5 rounded-md transition-all duration-150 ${i18n.language === 'en' ? 'bg-[#3B6FF6] text-white' : 'text-[#6B7A99] hover:text-[#1E2A44]'}`}
        >
          EN
        </button>
      </div>

      <div className="w-full lg:w-[40%] flex items-center justify-center p-6 lg:p-10 bg-white">
        <div className="w-full max-w-sm animate-[fadeIn_0.5s_ease-out]">
          <div className="mb-8">
            <div className="w-14 h-14 rounded-xl bg-[#3B6FF6] flex items-center justify-center mb-5 shadow-lg shadow-[#3B6FF6]/25">
              <GraduationCap size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-display font-semibold text-[#1E2A44] tracking-tight">{t('app.title').toUpperCase()}</h1>
            <p className="text-sm text-[#6B7A99] mt-1">{t('auth.connectAccount')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 animate-[fadeIn_0.3s_ease-out]">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="matricule" className="block text-sm font-medium text-[#1E2A44]">
                {t('auth.matricule')}
              </label>
              <div className="relative">
                <input
                  id="matricule"
                  type="text"
                  value={matricule}
                  onChange={(e) => setMatricule(e.target.value)}
                  required
                  placeholder="TEA001"
                  autoComplete="username"
                  className="w-full pl-4 pr-4 py-3 text-sm text-[#1E2A44] bg-[#F4F6FB] border border-[#E5E9F2] rounded-xl placeholder:text-[#6B7A99]/60 transition-all duration-220 ease-out focus:outline-none focus:border-[#3B6FF6] focus:ring-2 focus:ring-[#3B6FF6]/20 focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-[#1E2A44]">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full pl-4 pr-11 py-3 text-sm text-[#1E2A44] bg-[#F4F6FB] border border-[#E5E9F2] rounded-xl placeholder:text-[#6B7A99]/60 transition-all duration-220 ease-out focus:outline-none focus:border-[#3B6FF6] focus:ring-2 focus:ring-[#3B6FF6]/20 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7A99] hover:text-[#1E2A44] transition-colors duration-150"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E5E9F2] text-[#3B6FF6] focus:ring-[#3B6FF6]/30 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-sm text-[#6B7A99] group-hover:text-[#1E2A44] transition-colors duration-150">{t('auth.rememberMe')}</span>
              </label>
              <button type="button" className="text-sm text-[#3B6FF6] hover:text-[#2D5FD9] font-medium transition-colors duration-150"
                onClick={() => setForgotOpen(true)}>
                {t('auth.forgotPassword')}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#3B6FF6] hover:bg-[#2D5FD9] text-white font-medium rounded-xl text-sm transition-all duration-220 ease-out disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2 shadow-[0_1px_2px_rgba(59,111,246,0.24)] hover:shadow-[0_4px_12px_rgba(59,111,246,0.35)]"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t('auth.loggingIn')}
                </>
              ) : (
                <>
                  {t('auth.signIn')}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-xs text-[#6B7A99]">
            &copy; {new Date().getFullYear()} {t('app.title')}
          </p>
        </div>
      </div>

      <div className="hidden lg:flex lg:w-[60%] bg-gradient-to-br from-[#16223f] via-[#101B34] to-[#0b1226] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(circle_at_30%_20%,white_0%,transparent_60%),radial-gradient(circle_at_70%_80%,white_0%,transparent_50%)]" />
        <div className="relative z-10 text-center max-w-md animate-[fadeIn_0.8s_ease-out]">
          <div className="w-20 h-20 rounded-2xl bg-[#3B6FF6]/15 flex items-center justify-center mx-auto mb-8 border border-[#3B6FF6]/20">
            <GraduationCap size={36} className="text-[#3B6FF6]/80" />
          </div>
          <h2 className="text-3xl font-display font-semibold text-white mb-3 tracking-tight">{t('app.title')}</h2>
          <p className="text-white/60 text-sm leading-relaxed">
            {t('auth.platformDesc')}<br />
            {t('auth.streamsDesc')}
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white text-lg font-semibold">3</p>
              <p className="text-white/50 text-xs mt-1">{t('auth.streams')}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white text-lg font-semibold">PDF</p>
              <p className="text-white/50 text-xs mt-1">{t('auth.reportCards')}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/10">
              <p className="text-white text-lg font-semibold">SMS</p>
              <p className="text-white/50 text-xs mt-1">{t('auth.parents')}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <AnimatePresence>
        {forgotOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F1728]/70 backdrop-blur-xl"
            onClick={() => { setForgotOpen(false); setForgotResult(null); setForgotError(''); setForgotIdentifier(''); setCopied(false) }}
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#3B6FF6]/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-40 -left-40 w-[30rem] h-[30rem] bg-[#6366F1]/10 rounded-full blur-3xl" />
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm"
            >
              <div className="absolute -inset-[1px] bg-gradient-to-b from-[#3B6FF6]/30 via-transparent to-[#6366F1]/20 rounded-3xl blur-sm" />
              <div className="relative bg-[#0F1728] border border-white/[0.06] rounded-3xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                {!forgotResult ? (
                  <>
                    <div className="pt-10 pb-2 px-7 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 260, delay: 0.1 }}
                        className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#3B6FF6] to-[#6366F1] flex items-center justify-center shadow-lg shadow-[#3B6FF6]/30"
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                      </motion.div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Mot de passe oublié ?</h2>
                      <p className="text-sm text-white/40 mt-2 leading-relaxed max-w-[260px] mx-auto">
                        Entrez votre identifiant pour recevoir un mot de passe temporaire.
                      </p>
                    </div>

                    <div className="px-7 pt-6 pb-8">
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-5">
                        {forgotError && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl px-4 py-3"
                          >
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <span>{forgotError}</span>
                          </motion.div>
                        )}
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-white/50 uppercase tracking-wider">Email ou matricule</label>
                          <input
                            type="text"
                            value={forgotIdentifier}
                            onChange={(e) => setForgotIdentifier(e.target.value)}
                            placeholder="admin@ecole.com ou TEA001"
                            className="w-full px-4 py-3 text-sm text-white bg-white/[0.04] border border-white/[0.08] rounded-xl placeholder:text-white/20 focus:outline-none focus:border-[#3B6FF6]/50 focus:ring-2 focus:ring-[#3B6FF6]/15 transition-all"
                          />
                        </div>
                        <button
                          onClick={async () => {
                            if (!forgotIdentifier.trim()) { setForgotError('Veuillez entrer un identifiant'); return }
                            setForgotLoading(true); setForgotError('')
                            try {
                              const { data } = await api.post('/auth/forgot-password', { identifier: forgotIdentifier.trim() })
                              setForgotResult(data.data)
                            } catch (err) {
                              setForgotError(err.response?.data?.error?.message || err.message)
                            } finally { setForgotLoading(false) }
                          }}
                          disabled={forgotLoading}
                          className="w-full py-3 bg-gradient-to-r from-[#3B6FF6] to-[#6366F1] hover:from-[#2D5FD9] hover:to-[#5358E0] text-white font-semibold rounded-xl text-sm transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-[#3B6FF6]/25"
                        >
                          {forgotLoading ? (
                            <>
                              <Loader2 size={15} className="animate-spin" />
                              Envoi en cours...
                            </>
                          ) : 'Réinitialiser'}
                        </button>
                      </div>
                    </div>

                    <div className="px-7 pb-6 flex justify-center">
                      <button onClick={() => { setForgotOpen(false); setForgotResult(null); setForgotError(''); setForgotIdentifier(''); setCopied(false) }}
                        className="text-xs text-white/30 hover:text-white/60 transition-colors">
                        Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="pt-10 pb-2 px-7 text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
                        className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#22C55E] flex items-center justify-center shadow-lg shadow-[#16A34A]/30"
                      >
                        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                          <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                      </motion.div>
                      <h2 className="text-xl font-bold text-white tracking-tight">Mot de passe réinitialisé</h2>
                      <p className="text-sm text-white/40 mt-2 leading-relaxed">
                        {forgotResult.emailSent
                          ? `Un mot de passe temporaire a été envoyé à ${forgotResult.email}.`
                          : 'Utilisez ce mot de passe temporaire pour vous connecter.'}
                      </p>
                    </div>

                    <div className="px-7 pt-6 pb-8">
                      <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5 space-y-5">
                        {!forgotResult.emailSent && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium text-white/50 uppercase tracking-wider text-center">Mot de passe temporaire</p>
                            <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-4 flex items-center justify-between gap-3">
                              <code className="text-lg font-bold text-white tracking-[3px] font-mono select-all">
                                {forgotResult.temporaryPassword}
                              </code>
                              <button onClick={() => { navigator.clipboard.writeText(forgotResult.temporaryPassword); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                                className="shrink-0 p-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-all text-white/50 hover:text-white">
                                {copied
                                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
                              </button>
                            </div>
                          </div>
                        )}
                        <button onClick={() => { setForgotOpen(false); setForgotResult(null); setForgotIdentifier(''); setCopied(false) }}
                          className="w-full py-3 bg-gradient-to-r from-[#3B6FF6] to-[#6366F1] hover:from-[#2D5FD9] hover:to-[#5358E0] text-white font-semibold rounded-xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-[#3B6FF6]/25">
                          J'ai noté, me connecter
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}