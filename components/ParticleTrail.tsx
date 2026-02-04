import React, { useEffect, useRef } from 'react';

const ParticleTrail: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        const mouse = { x: 0, y: 0 };

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;

            // Add multiple particles on move
            for (let i = 0; i < 3; i++) {
                particles.push(new Particle(mouse.x, mouse.y));
            }
        };

        window.addEventListener('mousemove', handleMouseMove);

        class Particle {
            x: number;
            y: number;
            size: number;
            speedX: number;
            speedY: number;
            color: string;
            life: number;
            maxLife: number;

            constructor(x: number, y: number) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 5 + 1;
                this.speedX = (Math.random() - 0.5) * 2;
                this.speedY = (Math.random() - 0.5) * 2;
                // Use TrophySeeker blue/purple colors
                const colors = ['#60A5FA', '#818CF8', '#C084FC', '#FDE047']; // Blue, Indigo, Purple, Gold
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.life = 1;
                this.maxLife = Math.random() * 0.02 + 0.015;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.1) this.size -= 0.05;
                this.life -= this.maxLife;
            }

            draw() {
                if (!ctx) return;

                // Occasionally draw a trophy instead of a dot
                if (this.size > 4 && Math.random() > 0.95) {
                    ctx.font = `${this.size * 2}px serif`;
                    ctx.fillText('🏆', this.x, this.y);
                } else {
                    ctx.fillStyle = this.color;
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Add a glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
            }
        }

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                if (particles[i].life <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-[9999]"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default ParticleTrail;
