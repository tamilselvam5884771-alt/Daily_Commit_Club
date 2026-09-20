import React, { useEffect, useRef, useState } from 'react';

/**
 * Awwwards-inspired Custom Magnetic Follower Cursor with Particle Sparks
 */
export const CustomCursor = () => {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const canvasRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  useEffect(() => {
    // Hide default cursor on desktop devices with pointer
    if (window.matchMedia('(pointer: fine)').matches) {
      document.body.classList.add('custom-cursor-active');
    }

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let particles = [];

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      }

      // Add trailing particle sparks on movement
      if (Math.random() < 0.4) {
        particles.push({
          x: mouseX,
          y: mouseY,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 3 + 1,
          alpha: 1,
          color: Math.random() > 0.5 ? '#f59e0b' : '#10b981',
        });
      }

      // Detect hover target
      const target = e.target;
      const isInteractive = target.closest(
        'button, a, input, select, textarea, [role="button"], .tilt-card, .interactive'
      );
      setIsHovered(!!isInteractive);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Render Loop for Smooth Ring Inertia & Particle Trail
    let animId;
    const render = () => {
      // Smooth ring lerp
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      }

      // Clear particle canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render & update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.03;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);

  return (
    <>
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[9998]"
      />

      {/* Center Dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2.5 h-2.5 bg-amber-400 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-transform duration-75 ${
          isClicking ? 'scale-75' : isHovered ? 'scale-150 bg-emerald-400' : ''
        }`}
      />

      {/* Follower Outer Ring */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-9 h-9 border border-amber-400/60 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-[width,height,border-color,background-color] duration-200 ${
          isHovered
            ? 'w-14 h-14 border-emerald-400/80 bg-emerald-500/10 backdrop-blur-[1px]'
            : isClicking
            ? 'w-7 h-7 border-amber-500'
            : ''
        }`}
      />
    </>
  );
};
