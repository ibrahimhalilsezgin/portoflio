import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  scrollContainerRef?: React.RefObject<HTMLElement>;
  enableBlur?: boolean;
  baseOpacity?: number;
  baseRotation?: number;
  blurStrength?: number;
  wordAnimationEnd?: string;
  delay?: number;
  rotationEnd?: number;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  scrollContainerRef,
  enableBlur = true,
  baseOpacity = 0,
  baseRotation = 3,
  blurStrength = 4,
  wordAnimationEnd = 'bottom top',
  delay = 0,
  rotationEnd = 0,
}) => {
  // A simplified scroll reveal that uses Framer Motion's whileInView
  // which works consistently across both desktop and mobile without needing complex scroll-tracking hooks.
  
  const content = typeof children === 'string' ? children : '';
  const words = content.split(' ');

  if (!content) {
    return (
      <motion.div
        initial={{ opacity: baseOpacity, y: 20, filter: enableBlur ? `blur(${blurStrength}px)` : 'none' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay: delay }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-1">
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ 
            opacity: baseOpacity, 
            y: 20, 
            rotate: baseRotation,
            filter: enableBlur ? `blur(${blurStrength}px)` : 'none' 
          }}
          whileInView={{ 
            opacity: 1, 
            y: 0, 
            rotate: rotationEnd,
            filter: 'blur(0px)' 
          }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ 
            duration: 0.5, 
            delay: delay + (i * 0.05), // stagger effect
            ease: "easeOut" 
          }}
          className="inline-block"
        >
          {word}
        </motion.span>
      ))}
    </div>
  );
};

export default ScrollReveal;
