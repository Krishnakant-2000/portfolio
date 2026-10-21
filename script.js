// Typing Effect
const phrases = [
    "Cross-Platform React Native Apps",
    "Scalable Supabase & PostgreSQL Backends",
    "21-Sport Analytics & 3D Cards",
    "Interactive 3D Web Canvas Games"
];

let phraseIndex = 0;
let letterIndex = 0;
let currentPhrase = "";
let isDeleting = false;
const typingSpeed = 65;
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

// Parallax Twinkling Starfield Background Canvas
function initStarfieldCanvas() {
    const canvas = document.getElementById("bgCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let stars = [];
    const starCount = Math.floor((width * height) / 4000); // Elegant, non-cluttered density
    let scrollY = window.scrollY;

    const mouse = { x: null, y: null, radius: 120 };

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    window.addEventListener("scroll", () => {
        scrollY = window.scrollY;
    });

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Star {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.8 + 0.4;
            this.depth = Math.random() * 0.5 + 0.1; // Parallax depth factor
            this.alpha = Math.random() * 0.7 + 0.15;
            this.twinkleSpeed = Math.random() * 0.015 + 0.003;
            this.twinkleDirection = Math.random() > 0.5 ? 1 : -1;
            this.color = Math.random() > 0.7
                ? "rgba(56, 189, 248, " // Soft sky blue
                : Math.random() > 0.4
                ? "rgba(139, 92, 246, " // Soft purple
                : "rgba(255, 255, 255, "; // Soft white
        }

        update() {
            // Twinkle Pulse
            this.alpha += this.twinkleSpeed * this.twinkleDirection;
            if (this.alpha >= 0.85 || this.alpha <= 0.1) {
                this.twinkleDirection *= -1;
            }

            // Mouse proximity soft glow
            if (mouse.x && mouse.y) {
                const dx = mouse.x - this.x;
                const dy = mouse.y - (this.y - scrollY * this.depth % height);
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    this.alpha = Math.min(0.95, this.alpha + 0.2);
                }
            }
        }

        draw() {
            // Calculate parallax Y position based on page scroll
            let renderY = (this.y - scrollY * this.depth) % height;
            if (renderY < 0) renderY += height;

            ctx.beginPath();
            ctx.arc(this.x, renderY, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color + this.alpha + ")";
            if (this.size > 1.5) {
                ctx.shadowBlur = 6;
                ctx.shadowColor = "rgba(56, 189, 248, 0.5)";
            }
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Initialize Stars
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        stars.forEach(s => {
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
