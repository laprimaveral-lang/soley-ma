import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface FadeUpProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  yOffset?: number;
}

export default function FadeUp({ children, delay = 0, duration = 0.8, className = '', yOffset = 40 }: FadeUpProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ 
        duration, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1] // Luxury ease curve
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
