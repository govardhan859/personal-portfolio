// Javascript for the sleek typing effect in the Hero section
document.addEventListener('DOMContentLoaded', () => {
    const textElement = document.getElementById('typing-text');
    const roles = [
        'Full Stack Developer.',
        'IoT Systems Enthusiast.',
        'Data Analyst.',
        'B.Tech Student.'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let speed = 70; // Typing speed (ms)

    const type = () => {
        const currentRole = roles[roleIndex];

        if (isDeleting) {
            textElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
            speed = 40; // Deleting faster
        } else {
            textElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
            speed = 70; // Typing speed
        }

        // Check if the current phrase is fully typed
        if (!isDeleting && charIndex === currentRole.length) {
            // Pause at the end of typing
            speed = 1800;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            speed = 400; // Pause before starting new phrase
        }

        setTimeout(type, speed);
    };

    // Start the typing animation after a small delay
    setTimeout(type, 1000);
});
