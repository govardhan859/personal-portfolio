// --- Core Application Logic ---

const loadingScreen = document.getElementById('loading-screen');
const mainContent = document.getElementById('main-content');
const loadingProgress = document.getElementById('loading-progress');
const loadingPercentage = document.getElementById('loading-percentage');
const typewriterElement = document.getElementById('typewriter');
const themeToggle = document.getElementById('theme-toggle');
const backToTopButton = document.getElementById('back-to-top');
const navMenu = document.getElementById('nav-menu');
const hamburger = document.getElementById('hamburger');

// 1. Loading Screen Simulation & Fade-out
function startLoading() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += 5;
        if (progress > 100) {
            progress = 100;
            clearInterval(interval);
            
            // Fade out loading screen and show main content
            loadingScreen.classList.add('hidden');
            mainContent.classList.add('visible');
            
            // Start Typewriter effect immediately after load
            setTimeout(startTypewriter, 300);

        }
        loadingProgress.style.width = progress + '%';
        loadingPercentage.textContent = progress + '%';
    }, 50); 
}

// 2. Typewriter Effect
function startTypewriter() {
    const text = typewriterElement.getAttribute('data-text');
    typewriterElement.textContent = ''; // Clear initial content
    let i = 0;
    const speed = 75; // Typing speed in milliseconds

    function type() {
        if (i < text.length) {
            typewriterElement.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// 3. Theme Toggle (Light/Dark Mode)
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme); // Save preference
    themeToggle.querySelector('i').className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
});

// Initialize Theme
const savedTheme = localStorage.getItem('theme') || 'dark'; // Default to dark as per style
document.documentElement.setAttribute('data-theme', savedTheme);
themeToggle.querySelector('i').className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';


// 4. Hamburger Menu Toggle
hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        // Close menu on link click (for mobile experience)
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

// 5. Scroll Logic for Back-to-Top Button
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        backToTopButton.classList.add('visible');
    } else {
        backToTopButton.classList.remove('visible');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 6. Contact Form Modal (replacing alert())
function showMessageModal() {
    // Clear form content after showing modal
    document.querySelector('.contact-form').reset();
    // Show custom modal
    document.getElementById('message-modal').style.display = 'flex';
}
// Expose showMessageModal globally so HTML can call it
window.showMessageModal = showMessageModal;

// Intersection Observer for scroll animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.2 // Trigger when 20% of element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            // Stop observing once visible
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Apply observer to elements tagged for animation
document.querySelectorAll('.slide-in-left, .slide-in-right, .fade-in').forEach(el => {
    observer.observe(el);
});

// Input/Label behavior for form (replicating template style)
document.querySelectorAll('.form-group input, .form-group textarea').forEach(input => {
    // Add class on initial load if value exists
    if (input.value) {
        input.classList.add('has-value');
    }
    
    // Add/remove class on input/change
    input.addEventListener('input', () => {
        if (input.value) {
            input.classList.add('has-value');
        } else {
            input.classList.remove('has-value');
        }
    });
});

// Start loading sequence on page load
window.onload = startLoading;
