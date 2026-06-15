import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage()

  return (
    <button
      onClick={toggleLang}
      style={{
        position: 'fixed',
        top: 18,
        right: 18,
        zIndex: 30,
        borderRadius: 999,
        padding: '7px 18px',
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(8,8,16,0.85)',
        color: 'rgba(255,255,255,0.8)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: '0.12em',
        cursor: 'pointer',
        minWidth: 52,
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={lang}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15 }}
          style={{ display: 'block' }}
        >
          {lang.toUpperCase()}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
