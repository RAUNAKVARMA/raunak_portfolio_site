import { AnimatePresence, motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1]

function PageTransition({ routeKey, children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
