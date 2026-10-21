// Y2K Typing Effect
const phrases = [
    "REACT NATIVE & TYPESCRIPT APPS",
    "SCALABLE SUPABASE & POSTGRESQL BACKENDS",
    "21-SPORT ANALYTICS & 3D CARDS",
    "INTERACTIVE 3D CANVAS GAMES"
];

let phraseIndex = 0;
let letterIndex = 0;
let currentPhrase = "";
let isDeleting = false;
const typingSpeed = 60;
const deletingSpeed = 35;
const delayBetweenPhrases = 2000;

function typeEffect() {
    const typingElement = document.getElementById("typingText");
    if (!typingElement) return;

    if (phraseIndex >= phrases.length) {
        phraseIndex = 0;
    }

    currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, letterIndex - 1);
        letterIndex--;
    } else {
        typingElement.textContent = currentPhrase.substring(0, letterIndex + 1);
        letterIndex++;
    }

    let nextSpeed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && letterIndex === currentPhrase.length) {
        nextSpeed = delayBetweenPhrases;
        isDeleting = true;
    } else if (isDeleting && letterIndex === 0) {
        isDeleting = false;
        phraseIndex++;
        nextSpeed = 400;
    }

    setTimeout(typeEffect, nextSpeed);
}

// Cosmic Twinkling Starfield & Shooting Stars Canvas Engine
function initStarfieldCanvas() {
    const canvas = document.getElementById("bgCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let stars = [];
    let shootingStars = [];
    const starCount = Math.floor((width * height) / 3000); // Dense starfield

    const mouse = { x: null, y: null, radius: 150 };

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    // 4-Point Star Sparkle Drawer
    function draw4PointStar(x, y, radius, opacity, color = "#39FF14") {
        ctx.save();
        ctx.beginPath();
        ctx.translate(x, y);
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;

        // Draw 4-point star flare
        for (let i = 0; i < 4; i++) {
            ctx.rotate(Math.PI / 2);
            ctx.lineTo(0, radius);
            ctx.lineTo(radius * 0.25, radius * 0.25);
        }

        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    // Star Object
    class Star {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2.5 + 0.5;
            this.isSparkle = Math.random() > 0.75; // 25% are 4-point glowing sparkles
            this.alpha = Math.random() * 0.8 + 0.2;
            this.twinkleSpeed = Math.random() * 0.02 + 0.005;
            this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
            this.color = Math.random() > 0.6
                ? "rgba(57, 255, 20, "
                : Math.random() > 0.3
                ? "rgba(0, 240, 255, "
                : "rgba(255, 255, 255, ";
        }

        update() {
            // Twinkle Pulse
            this.alpha += this.twinkleSpeed * this.twinkleDirection;
            if (this.alpha >= 1 || this.alpha <= 0.1) {
                this.twinkleDirection *= -1;
            }

            // Mouse proximity flare
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    this.alpha = Math.min(1, this.alpha + 0.3);
                }
            }
        }

        draw() {
            if (this.isSparkle && this.size > 1.8) {
                draw4PointStar(this.x, this.y, this.size * 3, this.alpha, this.color === "rgba(57, 255, 20, " ? "#39FF14" : "#00F0FF");
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + this.alpha + ")";
                ctx.shadowBlur = this.size > 2 ? 8 : 0;
                ctx.shadowColor = "#39FF14";
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
    }

    // Shooting Star Object
    class ShootingStar {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = Math.random() * (height / 2);
            this.length = Math.random() * 80 + 40;
            this.speed = Math.random() * 8 + 4;
            this.angle = Math.PI / 4; // 45 degree angle
            this.alpha = 1;
            this.active = false;
        }

        spawn() {
            this.reset();
            this.active = true;
        }

        update() {
            if (!this.active) return;
            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;
            this.alpha -= 0.015;

            if (this.alpha <= 0 || this.x > width || this.y > height) {
                this.active = false;
            }
        }

        draw() {
            if (!this.active) return;
            ctx.save();
            ctx.beginPath();
            const tailX = this.x - Math.cos(this.angle) * this.length;
            const tailY = this.y - Math.sin(this.angle) * this.length;

            const gradient = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
            gradient.addColorStop(0, `rgba(57, 255, 20, ${this.alpha})`);
            gradient.addColorStop(0.5, `rgba(0, 240, 255, ${this.alpha * 0.5})`);
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 2;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(tailX, tailY);
            ctx.stroke();

            // Head glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
            ctx.fill();
            ctx.restore();
        }
    }

    // Init Stars
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }

    // Init Shooting Stars Pool
    for (let i = 0; i < 3; i++) {
        shootingStars.push(new ShootingStar());
    }

    // Random Shooting Star Spawner
    setInterval(() => {
        const inactive = shootingStars.find(s => !s.active);
        if (inactive && Math.random() > 0.3) {
            inactive.spawn();
        }
    }, 2500);

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Draw & Update Starfield
        stars.forEach(s => {
            s.update();
            s.draw();
        });

        // Draw & Update Shooting Stars
        shootingStars.forEach(s => {
            s.update();
            s.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
}

// Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", () => {
    typeEffect();
    initStarfieldCanvas();

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });

        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.add("hidden");
            });
        });
    }
});
