import React, { useEffect, useRef } from "react";

interface FluidBackgroundProps {
  score: number;
}

export const FluidBackground: React.FC<FluidBackgroundProps> = ({ score }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let mouse = { x: -1000, y: -1000 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      color: string;

      constructor(w: number, h: number, score: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * (score / 2);
        this.vy = (Math.random() - 0.5) * (score / 2);
        this.size = Math.random() * 2 + 1;
        
        const hue = score < 4 ? 0 : score < 7 ? 45 : 130;
        this.color = `hsla(${hue}, 70%, 50%, 0.3)`;
      }

      update(w: number, h: number, score: number) {
        this.x += this.vx * (score / 5);
        this.y += this.vy * (score / 5);

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
        
        // Mouse interaction
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          // If healthy (>= 7), attract slightly. If critical (< 4), repel aggressively.
          const isHealthy = score >= 7;
          const isCritical = score < 4;
          
          if (isCritical) {
            this.x -= dx * force * 0.1;
            this.y -= dy * force * 0.1;
          } else if (isHealthy) {
            this.x += dx * force * 0.02;
            this.y += dy * force * 0.02;
          }
        }
      }

      draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }
    }

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = Array.from({ length: 150 }, () => new Particle(canvas.width, canvas.height, score));
    };

    window.addEventListener("resize", resize);
    resize();

    const render = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.update(canvas.width, canvas.height, score);
        p.draw(ctx);
      });

      // Draw neural lines if healthy or stable
      if (score >= 4) {
        const connectionDist = score >= 7 ? 120 : 80;
        ctx.lineWidth = score >= 7 ? 0.5 : 0.2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${score >= 7 ? 0.15 : 0.05})`;

        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < connectionDist) {
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [score]);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
};
