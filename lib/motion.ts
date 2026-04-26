export const motionConfig = {
  transition: {
    duration: 0.2,
    ease: [0.4, 0, 0.2, 1], // easeOut
  },
  whileHover: { 
    y: -2, 
    transition: { duration: 0.15 } 
  },
  whileTap: { 
    scale: 0.98, 
    transition: { duration: 0.1 } 
  },
}

export const staggerContainer = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    staggerChildren: 0.1,
    delayChildren: 0.2,
  },
}

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.25, ease: "easeOut" },
}

export const slideDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.2, ease: "easeOut" },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.15, ease: "easeOut" },
}
