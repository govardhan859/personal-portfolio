// --- Core Application Logic (Class-Based) ---

// Theme Management
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        // Initialize theme preference, defaulting to 'dark' if none is saved
        this.currentTheme = localStorage.getItem('theme') || 'dark';
        
        this.init();
        this.bindEvents();
    }
    
    init() {
        // Apply the stored or default theme immediately to the root HTML element
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        this.updateThemeIcon();
    }
    
    bindEvents() {
        this.themeToggle?.addEventListener('click', () => {
            this.toggleTheme();
        });
    }
    
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeIcon();
    }
    
    updateThemeIcon() {
        const icon = this.themeToggle?.querySelector('i');
        if (icon) {
            // Update icon to reflect the opposite mode (what clicking it will switch to)
            icon.className = this.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// Particle System (Updated to use a Canvas element for drawing)
class ParticleSystem {
    constructor() {
        // Use document.createElement to ensure the canvas exists if the HTML only provided a div placeholder
        let canvas = document.getElementById('particles-canvas');
        if (canvas.tagName !== 'CANVAS') {
             canvas = document.createElement('canvas');
             canvas.id = 'particles-canvas';
             document.getElementById('particles-canvas-container').appendChild(canvas);
        }
        this.canvas = canvas;

        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.animationId = null;
        this.currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
        
        this.isMobile = window.innerWidth <= 768;

        if (!this.isMobile) {
            this.init();
            this.bindEvents();
            this.animate();
        } else {
            // Hide canvas completely on small screens for performance
            this.canvas.style.display = 'none';
        }
    }
    
    init() {
        this.resizeCanvas();
        this.createParticles();
        this.updateTheme();
    }
    
    updateTheme() {
        this.currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        // Reduce particle count significantly for web performance
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 30000); 
        this.particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.4, // Slower movement
                vy: (Math.random() - 0.5) * 0.4,
                size: Math.random() * 1.5 + 0.5, // Smaller particles
                opacity: Math.random() * 0.4 + 0.3
            });
        }
    }
    
    bindEvents() {
        window.addEventListener('resize', this.handleResize.bind(this));
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Listen for theme changes to update particle colors
        new MutationObserver(() => {
            this.updateTheme();
        }).observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }

    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        if (this.isMobile) {
            this.canvas.style.display = 'none';
            if (this.animationId) cancelAnimationFrame(this.animationId);
            this.animationId = null;
        } else {
            this.canvas.style.display = 'block';
            this.resizeCanvas();
            this.createParticles();
            if (!this.animationId) this.animate();
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        const primaryColor = this.currentTheme === 'light' ? '0, 102, 204' : '0, 212, 255';
        
        this.particles.forEach((particle, index) => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Boundary check (wrap around screen)
            if (particle.x < -10) particle.x = this.canvas.width + 10;
            if (particle.x > this.canvas.width + 10) particle.x = -10;
            if (particle.y < -10) particle.y = this.canvas.height + 10;
            if (particle.y > this.canvas.height + 10) particle.y = -10;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${primaryColor}, ${particle.opacity})`;
            this.ctx.fill();
            
            // Draw connections (only check nearby particles)
            for (let j = index + 1; j < this.particles.length; j++) {
                const otherParticle = this.particles[j];
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                const maxDistance = 80; // Shorter lines for cleaner look
                if (distance < maxDistance) {
                    const lineOpacity = 0.08 * (1 - distance / maxDistance);
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(otherParticle.x, otherParticle.y);
                    this.ctx.strokeStyle = `rgba(${primaryColor}, ${lineOpacity})`;
                    this.ctx.lineWidth = 0.3;
                    this.ctx.stroke();
                }
            }
        });
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

// Navigation functionality
class Navigation {
    constructor() {
        this.navLinks = document.querySelectorAll('.nav-link');
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('nav-menu');
        this.sections = document.querySelectorAll('.section, .hero');
        this.header = document.querySelector('.header');
        
        this.bindEvents();
        // Initial call to set active link correctly
        this.updateActiveLink(); 
    }
    
    bindEvents() {
        // Hamburger menu toggle
        this.hamburger?.addEventListener('click', () => {
            this.navMenu.classList.toggle('active');
            this.hamburger.classList.toggle('active');
        });
        
        // Close menu and smooth scroll when clicking on a link
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);
                
                if (targetSection) {
                    const headerHeight = this.header?.offsetHeight || 0;
                    // Adjusted scroll position to account for sticky header
                    const targetPosition = targetSection.offsetTop - headerHeight + 5; 
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
                
                // Close mobile menu
                this.navMenu?.classList.remove('active');
                this.hamburger?.classList.remove('active');
            });
        });
        
        // Update active link on scroll
        window.addEventListener('scroll', () => {
            // Throttle scroll events for performance
            this.throttledUpdateActiveLink();
        });
    }

    // Using a throttle utility (defined below) to improve scroll performance
    throttledUpdateActiveLink = this.throttle(this.updateActiveLink, 100);
    
    updateActiveLink() {
        const scrollPosition = window.scrollY + this.header.offsetHeight; // Use header height as offset
        
        this.sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                this.navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // Utility: Simple throttle function
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}


// Loading Screen Animation
class LoadingScreen {
    constructor() {
        this.loadingScreen = document.getElementById('loading-screen');
        this.loadingProgress = document.getElementById('loading-progress');
        this.loadingPercentage = document.getElementById('loading-percentage');
        this.mainContent = document.getElementById('main-content');
        this.progress = 0;
        
        this.init();
    }
    
    init() {
        this.animateProgress();
    }
    
    animateProgress() {
        const interval = setInterval(() => {
            // Use a constant, controlled increment for reliable loading time
            this.progress += 5; 
            
            if (this.progress >= 100) {
                this.progress = 100;
                clearInterval(interval);
                
                // CRITICAL: Ensure hideLoading runs after a short delay
                setTimeout(() => this.hideLoading(), 300); 
            }
            
            if (this.loadingProgress && this.loadingPercentage) {
                this.loadingProgress.style.width = `${this.progress}%`;
                this.loadingPercentage.textContent = `${Math.floor(this.progress)}%`;
            } else {
                // Failsafe in case elements disappear
                clearInterval(interval); 
                this.hideLoading();
            }
        }, 50);
    }
    
    hideLoading() {
        this.loadingScreen.classList.add('hidden');
        this.mainContent.classList.add('visible');
        
        // Initialize other components now that the DOM is ready and visible
        setTimeout(() => {
            this.initializeComponents();
        }, 300);
    }
    
    initializeComponents() {
        // Initialize all main components
        new ParticleSystem(); // Handles itself based on screen size
        new Navigation();
        new TypeWriter();
        new ScrollAnimations();
        new CounterAnimation();
        new BackToTopButton();
        new ContactForm();
        // Removed SmoothScroll as Navigation class handles smooth scrolling of anchors
    }
}

// Back to Top Button
class BackToTopButton {
    constructor() {
        this.button = document.getElementById('back-to-top');
        if (!this.button) return;
        
        this.bindEvents();
    }
    
    bindEvents() {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                this.button.classList.add('visible');
            } else {
                this.button.classList.remove('visible');
            }
        });
        
        this.button.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Typewriter Effect
class TypeWriter {
    constructor() {
        this.element = document.getElementById('typewriter');
        if (!this.element) return;
        
        this.text = this.element.dataset.text;
        this.speed = 50;
        this.index = 0;
        
        this.element.textContent = '';
        // Start typing after a short pause post-load
        setTimeout(() => this.type(), 500); 
    }
    
    type() {
        if (this.index < this.text.length) {
            this.element.textContent += this.text.charAt(this.index);
            this.index++;
            setTimeout(() => this.type(), this.speed);
        }
    }
}

// Scroll Animations
class ScrollAnimations {
    constructor() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Stop observing once visible to prevent re-animation on scroll up/down
                    this.observer.unobserve(entry.target); 
                }
            });
        }, {
            // Start animating when just 10% of the element is visible
            threshold: 0.1, 
            rootMargin: '0px 0px -50px 0px' 
        });
        
        this.init();
    }
    
    init() {
        // Select all elements tagged for animation and start observing
        document.querySelectorAll('.slide-in-left, .slide-in-right, .fade-in').forEach(element => {
            this.observer.observe(element);
        });
        
        // This function assigns delayed classes for effect, ensuring they are only processed once
        this.applyDelayedAnimations();
    }
    
    applyDelayedAnimations() {
         // Apply delays for skills grid 
         document.querySelectorAll('#skills .skill-item-clean').forEach((element, index) => {
             element.classList.add('fade-in');
             element.style.transitionDelay = `${index * 0.05}s`;
         });
         // Apply delays for project cards
         document.querySelectorAll('#projects .project-card-new').forEach((element, index) => {
             element.classList.add('fade-in');
             element.style.transitionDelay = `${index * 0.1}s`;
         });
    }
}

// Counter Animation
class CounterAnimation {
    constructor() {
        this.counters = document.querySelectorAll('.stat-number');
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    entry.target.classList.add('counted');
                    this.animateCounter(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });
        
        this.init();
    }
    
    init() {
        this.counters.forEach(counter => {
            this.observer.observe(counter);
        });
    }
    
    animateCounter(counter) {
        const target = parseFloat(counter.dataset.count);
        const duration = 1500; // Shorter animation duration
        const start = performance.now();
        const startValue = 0;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease-out effect for a smoother count-up
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            const current = startValue + (target - startValue) * easedProgress;
            
            if (target % 1 === 0) { // Check if target is an integer
                counter.textContent = Math.floor(current);
            } else {
                counter.textContent = current.toFixed(1);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                counter.textContent = target % 1 === 0 ? target : target.toFixed(1);
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Contact Form handler (Simplified for demonstration)
class ContactForm {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.modal = document.getElementById('message-modal');

        // Initial setup for floating labels
        this.form?.querySelectorAll('input, textarea').forEach(input => {
             if (input.value.trim() !== '') input.classList.add('has-value');
        });

        this.bindEvents();
    }
    
    bindEvents() {
        this.form?.addEventListener('submit', this.handleSubmit.bind(this));

        // Setup input change detection for labels
        this.form?.querySelectorAll('input, textarea').forEach(input => {
            input.addEventListener('input', () => {
                if (input.value.trim() !== '') {
                    input.classList.add('has-value');
                } else {
                    input.classList.remove('has-value');
                }
            });
        });
    }
    
    handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = this.form.querySelector('button[type="submit"]');
        const originalHTML = submitBtn.innerHTML;
        
        // Show loading spinner during simulation
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Success State
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            this.form.reset();
            
            // Show custom success modal
            this.modal.style.display = 'flex';

            // Reset floating labels
            this.form.querySelectorAll('input, textarea').forEach(input => {
                input.classList.remove('has-value');
            });

        }, 1500); // Simulate network delay
    }
}


// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Theme Manager immediately to prevent FOUC (Flash of Unstyled Content)
    new ThemeManager();
    
    // 2. Start the Loading Screen sequence which initiates all other components after fade-out
    new LoadingScreen();
});

// Expose modal function globally for the HTML's onclick attribute
window.showMessageModal = () => {
    document.getElementById('message-modal').style.display = 'flex';
};
