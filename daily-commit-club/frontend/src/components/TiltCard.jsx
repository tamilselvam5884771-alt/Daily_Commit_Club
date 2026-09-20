import React, { useRef, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { audioService } from '../services/audioService';

/**
 * 3D Interactive Tilt Card Component
 * Inspired by Awwwards interactive site depth transforms & glare reflections.
 */
export const TiltCard = ({
  children,
  className = '',
  maxTilt = 15,
  scaleOnHover = 1.03,
  glare = true,
  onClick,
  ...props
}) => {
  const cardRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  // Spring physics for smooth movement
  const mouseX = useSpring(0, { stiffness: 300, damping: 20 });
  const mouseY = useSpring(0, { stiffness: 300, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const normX = x / rect.width - 0.5;
    const normY = y / rect.height - 0.5;

    mouseX.set(normX);
    mouseY.set(normY);

    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    audioService.playHover();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={(e) => {
        audioService.playClick();
        if (onClick) onClick(e);
      }}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      animate={{
        scale: isHovered ? scaleOnHover : 1,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative overflow-hidden cursor-pointer perspective-1000 ${className}`}
      {...props}
    >
      {/* Glare Spotlight Overlay */}
      {glare && (
        <div
          className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 0.35 : 0,
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0) 60%)`,
          }}
        />
      )}

      {/* Content wrapper with Z translation for depth */}
      <div style={{ transform: 'translateZ(20px)' }}>{children}</div>
    </motion.div>
  );
};
