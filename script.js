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

// Parallax Twinkling Starfield Background Canvas (Aura Mint & Solar Amber)
function initStarfieldCanvas() {
    const canvas = document.getElementById("bgCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let stars = [];
    const starCount = Math.floor((width * height) / 3800); // Elegant density
    let scrollY = window.scrollY;

    const mouse = { x: null, y: null, radius: 130 };

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
            this.color = Math.random() > 0.6
                ? "rgba(0, 245, 160, " // Aura Emerald Mint
                : Math.random() > 0.35
                ? "rgba(250, 204, 21, " // Solar Amber Gold
                : "rgba(255, 255, 255, "; // Pure White
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
                    this.alpha = Math.min(0.95, this.alpha + 0.25);
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
                ctx.shadowColor = "rgba(0, 245, 160, 0.4)";
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

// FAQ Accordion Toggle
function toggleFaq(btn) {
    const parent = btn.parentElement;
    const answer = parent.querySelector("div");
    const icon = btn.querySelector(".faq-icon");

    if (answer) {
        const isHidden = answer.classList.contains("hidden");

        // Close all other FAQs
        document.querySelectorAll("#faq .faq-icon").forEach(i => i.textContent = "+");
        document.querySelectorAll("#faq div.px-6").forEach(a => a.classList.add("hidden"));

        if (isHidden) {
            answer.classList.remove("hidden");
            if (icon) icon.textContent = "−";
        }
    }
}

// Lightbox Modal Preview
function openLightbox(imgSrc, title) {
    const modal = document.getElementById("lightboxModal");
    const modalImg = document.getElementById("lightboxImg");
    const modalTitle = document.getElementById("lightboxTitle");

    if (modal && modalImg && modalTitle) {
        modalImg.src = imgSrc;
        modalTitle.textContent = title || "Image Preview";
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }
}

function closeLightbox() {
    const modal = document.getElementById("lightboxModal");
    if (modal) {
        modal.classList.add("hidden");
        document.body.style.overflow = "auto";
    }
}

// Playable Game Modal
function openGameModal() {
    const modal = document.getElementById("gameModal");
    const iframe = document.getElementById("gameIframe");
    if (modal && iframe) {
        iframe.src = "desi-mela/index.html";
        modal.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }
}

function closeGameModal() {
    const modal = document.getElementById("gameModal");
    const iframe = document.getElementById("gameIframe");
    if (modal) {
        modal.classList.add("hidden");
        if (iframe) iframe.src = ""; // Unload iframe to stop audio & execution
        document.body.style.overflow = "auto";
    }
}

// Close modals on Escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeLightbox();
        closeGameModal();
    }
});

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
