import React, { useEffect, useRef, useState } from 'react';
import { getTimeOfDay, TIME_OF_DAY_STYLES } from '../services/timeOfDayService';

/**
 * SeasonEnvironment Component
 * Renders season-specific particle overlays (spring sakura, summer gold, autumn leaves, winter snow, legendary aurora)
 */
export const SeasonEnvironment = ({ season = 'spring' }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Spring Sakura Floating Petals */}
      {season === 'spring' && (
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/20 via-transparent to-emerald-950/40 opacity-70">
          <div className="absolute top-10 left-1/4 w-2 h-2 rounded-full bg-pink-300/40 animate-ping" />
          <div className="absolute top-20 right-1/3 w-3 h-3 rounded-full bg-emerald-300/30 animate-pulse" />
        </div>
      )}

      {/* Summer Gold Glow */}
      {season === 'summer' && (
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/20 via-transparent to-amber-950/40 opacity-70">
          <div className="absolute top-1/3 left-1/5 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
        </div>
      )}

      {/* Autumn Leaves & Warm Tint */}
      {season === 'autumn' && (
        <div className="absolute inset-0 bg-gradient-to-b from-orange-950/20 via-transparent to-orange-950/50 opacity-70">
          <div className="absolute top-12 left-10 w-2 h-2 bg-amber-600/50 rotate-45 animate-float" />
          <div className="absolute top-32 right-20 w-3 h-3 bg-orange-700/50 rotate-12 animate-float" />
        </div>
      )}

      {/* Winter Snow Overlay */}
      {season === 'winter' && (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-blue-950/20 to-slate-950/60 opacity-80">
          <div className="absolute top-5 left-1/3 w-2 h-2 rounded-full bg-white/60 animate-pulse" />
          <div className="absolute top-15 right-1/4 w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
        </div>
      )}

      {/* Legendary Aurora Starlight Overlay */}
      {season === 'legendary' && (
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/30 via-indigo-950/40 to-amber-950/30 opacity-90">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-r from-purple-500/10 via-amber-400/20 to-indigo-500/10 blur-3xl animate-pulse" />
        </div>
      )}
    </div>
  );
};

/**
 * WorldBackground Component
 * Renders dynamic day/night atmosphere, sun/moon positioning, interactive HTML5 particle overlay, star layers, fog, and seasonal ambient environments.
 */
export const WorldBackground = ({ season = 'spring', children }) => {
  const timeOfDay = getTimeOfDay();
  const timeStyle = TIME_OF_DAY_STYLES[timeOfDay] || TIME_OF_DAY_STYLES.night;

  const canvasRef = useRef(null);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // Parallax mouse position tracker
    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 20;
      const normY = (e.clientY / window.innerHeight - 0.5) * 20;
      setParallax({ x: normX, y: normY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Interactive Floating Dust / Ember Particles Canvas
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const particles = [];
    const particleCount = 45;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.8,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4 - 0.2,
        alpha: Math.random() * 0.6 + 0.2,
        color: season === 'spring' ? '#10b981' : season === 'summer' ? '#f59e0b' : '#3b82f6',
      });
    }

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [season]);

  return (
    <div className={`relative min-h-screen w-full bg-gradient-to-b ${timeStyle.gradient} text-slate-100 overflow-hidden select-none`}>
      {/* Interactive Floating Particle Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" />

      {/* Time of Day Atmosphere Tint Overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-1000"
        style={{ backgroundColor: timeStyle.skyTint }}
      />

      {/* Sun / Moon Orb Component with Parallax */}
      <div
        className="transition-transform duration-300 ease-out pointer-events-none"
        style={{ transform: `translate3d(${parallax.x * -1.5}px, ${parallax.y * -1.5}px, 0)` }}
      >
        {timeStyle.showMoon ? (
          <div className="absolute top-10 right-20 w-16 h-16 rounded-full bg-gradient-to-tr from-amber-100 to-amber-200 shadow-[0_0_50px_rgba(254,243,199,0.6)] opacity-80" />
        ) : (
          <div
            className="absolute top-12 left-1/4 w-24 h-24 rounded-full bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.6)] transition-opacity duration-1000"
            style={{ opacity: timeStyle.sunOpacity }}
          />
        )}
      </div>

      {/* Twinkling Star Layer */}
      {(timeOfDay === 'night' || timeOfDay === 'evening') && (
        <div className="absolute inset-0 pointer-events-none opacity-50">
          <div className="absolute top-12 left-16 w-1 h-1 bg-amber-200 rounded-full animate-star" />
          <div className="absolute top-24 left-1/3 w-1.5 h-1.5 bg-amber-100 rounded-full animate-star" />
          <div className="absolute top-36 right-1/4 w-1 h-1 bg-blue-200 rounded-full animate-star" />
          <div className="absolute top-10 right-12 w-2 h-2 bg-yellow-100 rounded-full animate-star" />
          <div className="absolute top-48 left-2/3 w-1 h-1 bg-white rounded-full animate-star" />
        </div>
      )}

      {/* Drifting Clouds & Fog with Parallax */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20 animate-fog transition-transform duration-300"
        style={{ transform: `translate3d(${parallax.x * 0.8}px, ${parallax.y * 0.8}px, 0)` }}
      >
        <div className="absolute top-16 -left-32 w-96 h-32 bg-slate-400/20 rounded-full blur-3xl" />
        <div className="absolute top-40 right-10 w-[30rem] h-40 bg-slate-500/20 rounded-full blur-3xl" />
      </div>

      {/* Season Environment Particles */}
      <SeasonEnvironment season={season} />

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
