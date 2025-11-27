import React from 'react'
import { motion } from 'framer-motion'
import './ShiningText.css'

export function ShiningText({ text, children, className = '', as: Component = 'span' }) {
  const content = text || children
  const MotionComponent = motion(Component)
  
  return (
    <MotionComponent
      className={`shining-text ${className}`}
      initial={{ backgroundPosition: '200% 0' }}
      animate={{ backgroundPosition: '-200% 0' }}
      transition={{
        repeat: Infinity,
        duration: 2,
        ease: 'linear',
      }}
    >
      {content}
    </MotionComponent>
  )
}

