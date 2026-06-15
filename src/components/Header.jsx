import { motion } from 'framer-motion'
import Wordmark from './Wordmark'

export default function Header({ lang, hidden, inline }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={`app-header${inline ? ' app-header--inline' : ''}${hidden ? ' ui-hidden' : ''}`}
    >
      <Wordmark lang={lang} />
    </motion.div>
  )
}
