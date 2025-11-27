import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import './TextShimmer.css'

export function TextShimmer({ 
  children, 
  as: Component = 'span',
  className = '',
  duration = 2,
  spread = 2
}) {
  const MotionComponent = motion(Component)

  const dynamicSpread = useMemo(() => {
    const textLength = typeof children === 'string' ? children.length : 20
    return textLength * spread
  }, [children, spread])

  return (
    <MotionComponent
      className={`text-shimmer ${className}`}
      initial={{ backgroundPosition: '100% center' }}
      animate={{ backgroundPosition: '0% center' }}
      transition={{
        repeat: Infinity,
        duration,
        ease: 'linear',
      }}
      style={{
        '--spread': `${dynamicSpread}px`,
      }}
    >
      {children}
    </MotionComponent>
  )
}

