// Typing Effect
const phrases = [
    "Cross-Platform React Native Apps",
    "Scalable Supabase & PostgreSQL Backends",
    "Live Sports Analytics & 3D Cards",
    "Interactive 3D Web Canvas Games"
];

let phraseIndex = 0;
let letterIndex = 0;
let currentPhrase = "";
let isDeleting = false;
const typingSpeed = 70;
const deletingSpeed = 40;
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
        nextSpeed = 500;
    }

    setTimeout(typeEffect, nextSpeed);
}

// Mobile Menu Toggle
document.addEventListener("DOMContentLoaded", () => {
    typeEffect();

    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const mobileMenu = document.getElementById("mobileMenu");

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });

        // Close menu on link click
        mobileMenu.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                mobileMenu.classList.add("hidden");
            });
        });
    }
});
