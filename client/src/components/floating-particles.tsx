import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export function FloatingParticles() {
  const { theme } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const particles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i): Particle => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      duration: Math.random() * 20 + 15,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.3 + 0.1,
    }));
  }, []);

  const getParticleColor = () => {
    switch (theme) {
      case 'bull-run':
        return 'rgba(255, 180, 0, VAR)';
      case 'crypto-winter':
        return 'rgba(100, 200, 255, VAR)';
      case 'light':
        return 'rgba(139, 92, 246, VAR)';
      default:
        return 'rgba(139, 92, 246, VAR)';
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: getParticleColor().replace('VAR', String(particle.opacity)),
            filter: 'blur(1px)',
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.sin(particle.id) * 20, 0],
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
      
      <motion.div
        className="absolute top-0 left-0 w-full h-96 opacity-30"
        style={{
          background: theme === 'bull-run' 
            ? 'radial-gradient(ellipse at 20% 0%, rgba(255, 150, 0, 0.15) 0%, transparent 50%)'
            : theme === 'crypto-winter'
            ? 'radial-gradient(ellipse at 20% 0%, rgba(100, 200, 255, 0.15) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 20% 0%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)',
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute bottom-0 right-0 w-full h-96 opacity-30"
        style={{
          background: theme === 'bull-run' 
            ? 'radial-gradient(ellipse at 80% 100%, rgba(255, 200, 0, 0.1) 0%, transparent 50%)'
            : theme === 'crypto-winter'
            ? 'radial-gradient(ellipse at 80% 100%, rgba(0, 150, 200, 0.1) 0%, transparent 50%)'
            : 'radial-gradient(ellipse at 80% 100%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)',
        }}
        animate={{
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 10,
          delay: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
}
