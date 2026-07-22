import React, { useState, useEffect } from 'react';

export const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const startTime = performance.now();
    const update = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(value * ease));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }, [value]);

  return <>{displayValue}</>;
};

export const ConfettiParticle: React.FC<{ x: number; y: number; color: string; delay: number }> = ({ x, y, color, delay }) => (
  <div
    className="absolute w-2 h-2 rounded-sm"
    style={{
      left: `${x}%`,
      top: `${y}%`,
      backgroundColor: color,
      animation: `confetti-fall 2.5s cubic-bezier(.37,0,.63,1) forwards`,
      animationDelay: `${delay}s`,
      transform: 'translate(-50%, -50%)',
    }}
  />
);
