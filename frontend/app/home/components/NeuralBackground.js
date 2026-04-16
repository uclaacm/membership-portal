// components/NeuralBackground.js
import React, { useEffect, useRef } from 'react';

const NeuralBackground = ({ className = '' }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas.parentNode;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // detect small screens
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    // use fewer lines & slower speed on mobile
    const lineCount = isMobile ? 40 : 80;
    const baseSpeed = isMobile ? 0.2 : 0.4;
    const fadeOutDuration = 150;

    const lines = [];
    for (let i = 0; i < lineCount; i++) {
      lines.push({
        x: Math.random() * width,
        y: -Math.random() * height,
        length: Math.random() * height * 1.5,
        speed: Math.random() * baseSpeed + (baseSpeed / 2),
        fading: false,
        fadeProgress: 0,
        glowBallActive: false,
      });
    }

    let rafId;
    const animate = () => {
      ctx.fillStyle = '#1a1f2b';
      ctx.fillRect(0, 0, width, height);

      lines.forEach((line) => {
        if (!line.fading && Math.random() < (line.y / height) * 0.01) {
          line.fading = true;
          line.glowBallActive = true;
        }

        if (line.fading) {
          line.fadeProgress += 1;
          if (line.fadeProgress >= fadeOutDuration) {
            line.y = -line.length;
            line.x = Math.random() * width;
            line.fading = false;
            line.fadeProgress = 0;
            line.speed = Math.random() * baseSpeed + (baseSpeed / 2);
            line.glowBallActive = false;
          }
        } else {
          line.y += line.speed;
        }

        const alpha = line.fading
          ? Math.max(0, 1 - line.fadeProgress / fadeOutDuration)
          : 0.8;

        ctx.strokeStyle = `rgba(72, 86, 119, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(line.x, line.y - line.length);
        ctx.lineTo(line.x, line.y);
        ctx.stroke();

        if (line.glowBallActive) {
          ctx.beginPath();
          ctx.arc(line.x, line.y, 6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(72, 86, 119, ${alpha})`;
          ctx.shadowColor = `rgba(72, 86, 119, ${alpha})`;
          ctx.shadowBlur = 20;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      rafId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', top: 0, left: 0 }}
    />
  );
};

export default NeuralBackground;
