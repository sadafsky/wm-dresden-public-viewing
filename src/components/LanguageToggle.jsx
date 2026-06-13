import { motion, AnimatePresence } from 'framer-motion'
import { useLanguage } from '../context/LanguageContext'

export default function LanguageToggle() {
  const { lang, toggleLang } = useLanguage()

  return (
    <button
      onClick={toggleLang}
      style={{
        position: 'fixed',
        top: 14,
        right: 14,
        zIndex: 30,
        background: 'rgba(244,162,97,0.15)',
        border: '1px solid rgba(244,162,97,0.35)',
        borderRadius: 20,
        padding: '5px 14px',
        color: '#f4a261',
        fontWeight: 'bold',
        fontSize: 11,
        letterSpacing: 1,
        cursor: 'pointer',
        minWidth: 44,
        textAlign: 'center',
      }}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={lang}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {lang.toUpperCase()}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}
