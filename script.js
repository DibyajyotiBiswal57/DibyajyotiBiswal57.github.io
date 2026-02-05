// ============================================
// Advanced Splash Screen with Complex Particle System
// ============================================
(function() {
    const splashScreen = document.getElementById('splash-screen');
    const skipButton = document.getElementById('skip-btn');
    const enterButton = document.getElementById('enter-btn');
    const canvas = document.getElementById('particle-canvas');
    
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
    
    // Detect mobile/low-end devices
    const isMobile = window.innerWidth <= 768;
    const isLowEnd = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;
    
    // Performance constants
    const PARTICLE_COUNT_DESKTOP = 120;
    const PARTICLE_COUNT_MOBILE = 60;
    const SHOOTING_STAR_COUNT_DESKTOP = 3;
    const SHOOTING_STAR_COUNT_MOBILE = 2;
    const SHOOTING_STAR_SPAWN_RATE_DESKTOP = 0.02; // 2% per frame
    const SHOOTING_STAR_SPAWN_RATE_MOBILE = 0.01;  // 1% per frame
    
    // Adjust particle count based on device
    let particleCount = isMobile ? PARTICLE_COUNT_MOBILE : PARTICLE_COUNT_DESKTOP;
    if (isLowEnd && !isMobile) {
        particleCount = 80;
    }
    
    // Advanced Particle System
    if (canvas) {
        const ctx = canvas.getContext('2d', { alpha: true });
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const shootingStars = [];
        let mouseX = canvas.width / 2;
        let mouseY = canvas.height / 2;
        let animationId;
        
        // Particle class with enhanced properties
        class Particle {
            constructor() {
                this.reset();
                // Start with random positions for initial spread
                this.y = Math.random() * canvas.height;
                this.opacity = Math.random() * 0.5 + 0.3;
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.5;
                this.speedY = (Math.random() - 0.5) * 0.5;
                this.opacity = Math.random() * 0.5 + 0.3;
                this.twinkle = Math.random() * 0.015 + 0.005;
                this.twinkleDirection = 1;
                // Depth for parallax effect
                this.depth = Math.random() * 0.5 + 0.5;
            }
            
            update(mouseInfluence = false) {
                this.x += this.speedX * this.depth;
                this.y += this.speedY * this.depth;
                
                // Parallax effect based on mouse position
                if (mouseInfluence && !isMobile) {
                    const dx = mouseX - canvas.width / 2;
                    const dy = mouseY - canvas.height / 2;
                    this.x += dx * 0.00005 * (1 - this.depth);
                    this.y += dy * 0.00005 * (1 - this.depth);
                }
                
                // Wrap around screen
                if (this.x > canvas.width) this.x = 0;
                if (this.x < 0) this.x = canvas.width;
                if (this.y > canvas.height) this.y = 0;
                if (this.y < 0) this.y = canvas.height;
                
                // Twinkling effect
                this.opacity += this.twinkle * this.twinkleDirection;
                if (this.opacity >= 0.8 || this.opacity <= 0.3) {
                    this.twinkleDirection *= -1;
                }
            }
            
            draw() {
                const brightness = this.depth * 255;
                ctx.fillStyle = `rgba(${brightness}, ${brightness * 0.8}, 255, ${this.opacity})`;
                
                // Only apply shadow on desktop for performance
                if (!isMobile && !isLowEnd) {
                    ctx.shadowBlur = 10 * this.depth;
                    ctx.shadowColor = `rgba(96, 165, 250, ${this.opacity * 0.6})`;
                } else {
                    ctx.shadowBlur = 0;
                }
                
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * this.depth, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Shooting Star class
        class ShootingStar {
            constructor() {
                this.reset();
            }
            
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height * 0.5; // Top half
                this.length = Math.random() * 80 + 60;
                this.speed = Math.random() * 8 + 8;
                this.angle = Math.random() * Math.PI / 6 + Math.PI / 4; // 45-75 degrees
                this.opacity = 1;
                this.active = true;
                this.trail = [];
            }
            
            update() {
                if (!this.active) return;
                
                this.trail.unshift({ x: this.x, y: this.y });
                if (this.trail.length > 15) this.trail.pop();
                
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;
                this.opacity -= 0.008;
                
                if (this.opacity <= 0 || this.x > canvas.width || this.y > canvas.height) {
                    this.active = false;
                }
            }
            
            draw() {
                if (!this.active || this.opacity <= 0) return;
                
                // Draw trail
                for (let i = 0; i < this.trail.length; i++) {
                    const point = this.trail[i];
                    const trailOpacity = this.opacity * (1 - i / this.trail.length);
                    
                    ctx.strokeStyle = `rgba(255, 255, 255, ${trailOpacity})`;
                    ctx.lineWidth = 2 * (1 - i / this.trail.length);
                    
                    if (i > 0) {
                        const prevPoint = this.trail[i - 1];
                        ctx.beginPath();
                        ctx.moveTo(prevPoint.x, prevPoint.y);
                        ctx.lineTo(point.x, point.y);
                        ctx.stroke();
                    }
                }
                
                // Draw star head with glow
                ctx.shadowBlur = 20;
                ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Create particles
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
        
        // Create initial shooting stars (fewer on mobile)
        const shootingStarCount = isMobile ? SHOOTING_STAR_COUNT_MOBILE : SHOOTING_STAR_COUNT_DESKTOP;
        for (let i = 0; i < shootingStarCount; i++) {
            shootingStars.push(new ShootingStar());
        }
        
        // Mouse tracking for parallax (only on desktop)
        if (!isMobile) {
            canvas.addEventListener('mousemove', (e) => {
                mouseX = e.clientX;
                mouseY = e.clientY;
            });
        }
        
        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Update and draw particles
            particles.forEach(particle => {
                particle.update(!isMobile);
                particle.draw();
            });
            
            // Draw connections between nearby particles
            const maxDistance = isMobile ? 80 : 120;
            const maxConnections = isMobile ? 2 : 3;
            
            for (let i = 0; i < particles.length; i++) {
                let connectionCount = 0;
                for (let j = i + 1; j < particles.length; j++) {
                    if (connectionCount >= maxConnections) break;
                    
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < maxDistance) {
                        const opacity = 0.15 * (1 - distance / maxDistance) * 
                                       Math.min(particles[i].opacity, particles[j].opacity);
                        ctx.strokeStyle = `rgba(96, 165, 250, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.shadowBlur = 0;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        connectionCount++;
                    }
                }
            }
            
            // Update and draw shooting stars
            shootingStars.forEach((star, index) => {
                star.update();
                star.draw();
                
                // Reset shooting star with controlled probability
                if (!star.active) {
                    const probability = isMobile ? SHOOTING_STAR_SPAWN_RATE_MOBILE : SHOOTING_STAR_SPAWN_RATE_DESKTOP;
                    if (Math.random() < probability) {
                        star.reset();
                    }
                }
            });
            
            animationId = requestAnimationFrame(animate);
        }
        
        animate();
        
        // Resize canvas on window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }, 250);
        });
        
        // Cleanup on splash hide
        function stopAnimation() {
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            // Clear will-change
            if (splashScreen) {
                splashScreen.style.willChange = 'auto';
            }
        }
        
        // Function to hide splash screen with particle explosion effect
        function hideSplash() {
            stopAnimation();
            
            // Particle explosion effect
            particles.forEach(particle => {
                const dx = particle.x - canvas.width / 2;
                const dy = particle.y - canvas.height / 2;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = 20 / Math.max(distance, 50);
                particle.speedX = (dx / distance) * force;
                particle.speedY = (dy / distance) * force;
            });
            
            // Quick explosion animation
            let explosionFrames = 30;
            function explode() {
                if (explosionFrames-- > 0) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    particles.forEach(particle => {
                        particle.update(false);
                        particle.opacity -= 0.03;
                        particle.draw();
                    });
                    requestAnimationFrame(explode);
                } else {
                    splashScreen.classList.add('fade-out');
                    setTimeout(() => {
                        splashScreen.style.display = 'none';
                        sessionStorage.setItem('splashShown', 'true');
                    }, 1000);
                }
            }
            explode();
        }
        
        // Auto-hide after duration
        const splashDuration = parseInt(getComputedStyle(document.documentElement)
            .getPropertyValue('--splash-duration')) || 10000;
        const autoHideTimeout = setTimeout(hideSplash, splashDuration);
        
        // Skip and Enter button functionality
        if (skipButton) {
            skipButton.addEventListener('click', () => {
                clearTimeout(autoHideTimeout);
                hideSplash();
            });
        }
        
        if (enterButton) {
            enterButton.addEventListener('click', () => {
                clearTimeout(autoHideTimeout);
                hideSplash();
            });
        }
        
        // Allow Enter key to skip
        document.addEventListener('keydown', function skipOnKey(e) {
            if (e.key === 'Enter' && splashScreen && !splashScreen.classList.contains('fade-out')) {
                clearTimeout(autoHideTimeout);
                hideSplash();
                document.removeEventListener('keydown', skipOnKey);
            }
        });
    }
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
