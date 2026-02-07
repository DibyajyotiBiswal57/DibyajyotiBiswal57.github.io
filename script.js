// ============================================
// Linux-Style Verbose Boot Splash Screen
// ============================================
(function() {
    const splashScreen = document.getElementById('splash-screen');
    const skipButton = document.getElementById('skip-btn');
    const bootContainer = document.getElementById('boot-container');
    
    // Check if splash has been shown this session
    const splashShown = sessionStorage.getItem('splashShown');
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (splashShown || prefersReducedMotion) {
        // Skip splash screen if already shown or reduced motion is preferred
        if (splashScreen) {
            splashScreen.style.display = 'none';
        }
        return;
    }
    
    // Boot sequence messages - simulating actual loading
    const bootMessages = [
        { text: 'Starting portfolio system...', delay: 0, status: 'ok' },
        { text: 'Loading core stylesheet /style.css', delay: 150, status: 'ok' },
        { text: 'Loading Google Fonts (Inter, Space Mono)', delay: 200, status: 'ok' },
        { text: 'Initializing favicon from GitHub', delay: 150, status: 'ok' },
        { text: 'Loading main script /script.js', delay: 200, status: 'ok' },
        { text: 'Parsing DOM structure', delay: 180, status: 'ok' },
        { text: 'Initializing theme system', delay: 150, status: 'ok' },
        { text: 'Setting up navigation menu', delay: 120, status: 'ok' },
        { text: 'Loading hero section', delay: 140, status: 'ok' },
        { text: 'Initializing typing animation', delay: 160, status: 'ok' },
        { text: 'Setting up smooth scrolling', delay: 130, status: 'ok' },
        { text: 'Configuring intersection observers', delay: 150, status: 'ok' },
        { text: 'Loading about section', delay: 120, status: 'ok' },
        { text: 'Loading skills section', delay: 110, status: 'ok' },
        { text: 'Loading projects section', delay: 130, status: 'ok' },
        { text: 'Loading badges and achievements', delay: 120, status: 'ok' },
        { text: 'Setting up contact section', delay: 110, status: 'ok' },
        { text: 'Initializing parallax effects', delay: 140, status: 'ok' },
        { text: 'Configuring keyboard shortcuts', delay: 120, status: 'ok' },
        { text: 'Setting up mouse tracking effects', delay: 130, status: 'ok' },
        { text: 'Initializing ripple animations', delay: 110, status: 'ok' },
        { text: 'Loading external resources', delay: 150, status: 'ok' },
        { text: 'All systems operational', delay: 200, status: 'ok' }
    ];
    
    let currentLine = 0;
    let autoHideTimeout;
    
    // Function to add a boot line
    function addBootLine(message, status) {
        const line = document.createElement('div');
        line.className = 'boot-line';
        
        const text = document.createElement('span');
        text.className = 'boot-text';
        text.textContent = message;
        
        const statusSpan = document.createElement('span');
        statusSpan.className = 'boot-status';
        
        if (status === 'ok') {
            statusSpan.classList.add('status-ok');
            statusSpan.textContent = '[  OK  ]';
        } else if (status === 'failed') {
            statusSpan.classList.add('status-failed');
            statusSpan.textContent = '[ FAILED ]';
        }
        
        line.appendChild(text);
        line.appendChild(statusSpan);
        bootContainer.appendChild(line);
        
        // Scroll to bottom
        bootContainer.scrollTop = bootContainer.scrollHeight;
    }
    
    // Function to show next boot message
    function showNextMessage() {
        if (currentLine >= bootMessages.length) {
            // All messages shown, auto-hide after a delay
            autoHideTimeout = setTimeout(hideSplash, 1500);
            return;
        }
        
        const msg = bootMessages[currentLine];
        addBootLine(msg.text, msg.status);
        currentLine++;
        
        // Schedule next message
        setTimeout(showNextMessage, msg.delay);
    }
    
    // Function to hide splash screen
    function hideSplash() {
        splashScreen.classList.add('fade-out');
        setTimeout(() => {
            splashScreen.style.display = 'none';
            sessionStorage.setItem('splashShown', 'true');
        }, 1000);
    }
    
    // Start the boot sequence
    setTimeout(showNextMessage, 100);
    
    // Skip button functionality
    if (skipButton) {
        skipButton.addEventListener('click', () => {
            if (autoHideTimeout) {
                clearTimeout(autoHideTimeout);
            }
            hideSplash();
        });
    }
    
    // Allow Enter key to skip
    document.addEventListener('keydown', function skipOnKey(e) {
        if (e.key === 'Enter' && splashScreen && !splashScreen.classList.contains('fade-out')) {
            if (autoHideTimeout) {
                clearTimeout(autoHideTimeout);
            }
            hideSplash();
            document.removeEventListener('keydown', skipOnKey);
        }
    });
})();

// ============================================
// Theme Toggle Functionality
// ============================================
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference or default to system preference
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Initialize theme
if (savedTheme) {
    body.classList.toggle('dark-mode', savedTheme === 'dark');
    body.classList.toggle('light-mode', savedTheme === 'light');
} else if (prefersDark) {
    body.classList.add('dark-mode');
} else {
    body.classList.add('light-mode');
}

// Toggle theme on button click
themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    
    // Also manage light-mode class to override prefers-color-scheme
    if (isDark) {
        body.classList.remove('light-mode');
    } else {
        body.classList.add('light-mode');
    }
    
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update quote image theme
    updateQuoteTheme(isDark);
});

// Update quote image based on theme
function updateQuoteTheme(isDark) {
    const quoteImg = document.querySelector('.quote-img');
    if (quoteImg) {
        const theme = isDark ? 'dark' : 'light';
        const currentSrc = quoteImg.src;
        const newSrc = currentSrc.replace(/theme=\w+/, `theme=${theme}`);
        if (currentSrc !== newSrc) {
            quoteImg.src = newSrc;
        }
    }
}

// ============================================
// Typing Animation
// ============================================
const typingText = document.getElementById('typing-text');
const phrases = [
    'A person who struggles with life.',
    'Learning Python, AI & ML',
    'Exploring Cybersecurity',
    'Building innovative projects',
    'Passionate about technology',
    'Mastering DSA & Algorithms',
    'Contributing to open-source'
];

let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;
let typingSpeed = 100;

function typeEffect() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
        typingText.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 50;
    } else {
        typingText.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 100;
    }
    
    if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause at end
        typingSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 500;
    }
    
    setTimeout(typeEffect, typingSpeed);
}

// Start typing effect
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(typeEffect, 1000);
});

// ============================================
// Smooth Scrolling
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navHeight = document.querySelector('.nav').offsetHeight;
            const targetPosition = target.offsetTop - navHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ============================================
// Intersection Observer for Fade-in Animations with Stagger
// ============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Optionally unobserve after animating
            // observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all fade-in, slide-up, and scale-in elements
document.querySelectorAll('.fade-in, .slide-up, .scale-in').forEach(element => {
    observer.observe(element);
});

// Add stagger effect to about cards
document.querySelectorAll('.about-grid .about-card').forEach((card, index) => {
    card.style.setProperty('--index', index);
});

// Add stagger effect to skill items
document.querySelectorAll('.skills-grid .skill-item').forEach((item, index) => {
    item.style.setProperty('--index', index);
});

// Enhanced Intersection Observer for special elements
const specialObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Unobserve after animation for performance
            specialObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

// Observe special elements
document.querySelectorAll('.section-title, .contribution-3d, .contribution-graph, .badges-container, .social-links').forEach(element => {
    specialObserver.observe(element);
});

// Add entrance animation class after splash screen
setTimeout(() => {
    document.querySelectorAll('.nav, .hero-title, .hero-name, .typing-container, .hero-quote, .hero-buttons').forEach(element => {
        element.style.visibility = 'visible';
    });
}, 100);

// ============================================
// Dynamic Year in Footer
// ============================================
const yearElement = document.getElementById('year');
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

// ============================================
// Navigation Background on Scroll (Throttled)
// ============================================
let lastScroll = 0;
const nav = document.querySelector('.nav');
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const currentScroll = window.pageYOffset;
            
            // Add shadow on scroll
            if (currentScroll > 50) {
                nav.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            } else {
                nav.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }
            
            lastScroll = currentScroll;
            ticking = false;
        });
        ticking = true;
    }
});

// ============================================
// Parallax effect for hero background (Throttled)
// ============================================
let parallaxTicking = false;

window.addEventListener('scroll', () => {
    if (!parallaxTicking) {
        window.requestAnimationFrame(() => {
            const heroBackground = document.querySelector('.hero-background');
            if (heroBackground) {
                const scrolled = window.pageYOffset;
                const rate = scrolled * 0.5;
                heroBackground.style.transform = `translate3d(0, ${rate}px, 0)`;
            }
            parallaxTicking = false;
        });
        parallaxTicking = true;
    }
});

// ============================================
// Prevent Flash of Unstyled Content
// ============================================
window.addEventListener('load', () => {
    document.body.style.visibility = 'visible';
});

// ============================================
// Handle External Links
// ============================================
document.querySelectorAll('a[target="_blank"]').forEach(link => {
    // Ensure external links have proper security attributes
    if (!link.hasAttribute('rel')) {
        link.setAttribute('rel', 'noopener noreferrer');
    }
});

// ============================================
// Performance: Lazy Loading Enhancement
// ============================================
if (!('loading' in HTMLImageElement.prototype)) {
    // Fallback for browsers that don't support lazy loading
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    script.integrity = 'sha512-VfjIYRLqK6B8l7nHCF8fjLf3RQEPDhfzVH2mxNZgwYQ8l4J4m4wBqA0wW1zHmKoNmKqJVQrJ6CJMXP0eBn1g0g==';
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);
}

// ============================================
// Console Easter Egg
// ============================================
console.log('%c👋 Hello, curious developer!', 'color: #58a6ff; font-size: 20px; font-weight: bold;');
console.log('%cInterested in the code? Check out the repository!', 'color: #30a5f7; font-size: 14px;');
console.log('%chttps://github.com/DibyajyotiBiswal57', 'color: #c9d1d9; font-size: 12px;');

// ============================================
// Keyboard Accessibility
// ============================================
document.addEventListener('keydown', (e) => {
    // Press 'T' to toggle theme
    if (e.key === 't' || e.key === 'T') {
        if (!e.target.matches('input, textarea')) {
            themeToggle.click();
        }
    }
});

// ============================================
// Preload critical resources
// ============================================
// Preload GitHub avatar for favicon
const avatarImg = new Image();
avatarImg.src = 'https://github.com/DibyajyotiBiswal57.png';

// ============================================
// Mouse Tracking for Featured Projects
// ============================================
document.querySelectorAll('.featured-project').forEach(project => {
    project.addEventListener('mousemove', (e) => {
        const rect = project.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        project.style.setProperty('--mouse-x', `${x}%`);
        project.style.setProperty('--mouse-y', `${y}%`);
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    .ripple-effect {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    }
`;
document.head.appendChild(style);

// ============================================
// Enhanced Button Ripple Effect
// ============================================
document.querySelectorAll('.btn, .featured-project-link').forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.className = 'ripple-effect';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// ============================================
// Parallax Effect for Cards on Mouse Move
// ============================================
const CARD_TILT_AMOUNT = 5; // degrees
const CARD_LIFT = -10; // pixels
const CARD_SCALE = 1.02;

document.querySelectorAll('.about-card, .stat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const deltaX = (x - centerX) / centerX;
        const deltaY = (y - centerY) / centerY;
        
        card.style.transform = `translateY(${CARD_LIFT}px) scale(${CARD_SCALE}) rotateX(${deltaY * CARD_TILT_AMOUNT}deg) rotateY(${deltaX * CARD_TILT_AMOUNT}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});
