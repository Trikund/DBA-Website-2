/* ==========================================================================
   DIGITAL BYTE SOLUTION - MAIN SCRIPT
   ========================================================================== */

// Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    direction: 'vertical',
    gestureDirection: 'vertical',
    smooth: true,
    mouseMultiplier: 1,
    smoothTouch: false,
    touchMultiplier: 2,
    infinite: false,
});

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// Link GSAP to Lenis
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0, 0);

/* ==========================================================================
   LOADING SCREEN
   ========================================================================== */
window.addEventListener('load', () => {
    const loaderWrapper = document.querySelector('.loader-wrapper');
    const loaderLogo = document.querySelector('.loader-logo');
    const progressText = document.querySelector('.cyber-progress');
    const barFill = document.querySelector('.progress-bar-fill');
    const counterSpan = document.querySelector('.counter');
    const doorLeft = document.querySelector('.door-left');
    const doorRight = document.querySelector('.door-right');

    const tl = gsap.timeline();

    // Reset logo state
    gsap.set(loaderLogo, { opacity: 0, scale: 0.8, filter: "invert(1) hue-rotate(180deg) brightness(1.5) drop-shadow(0 0 40px rgba(56,189,248,0.4)) blur(10px)" });
    
    // 1. Flicker logo in (Holographic start)
    tl.to(loaderLogo, {
        opacity: 1,
        scale: 1,
        filter: "invert(1) hue-rotate(180deg) brightness(1.5) drop-shadow(0 0 40px rgba(56,189,248,0.4)) blur(0px)",
        duration: 1.5,
        ease: "expo.out"
    })
    
    // 2. Show progress bar
    .to(progressText, { opacity: 1, duration: 0.5 }, "-=1")
    
    // 3. Animate progress bar and counter
    .to(barFill, { width: "100%", duration: 2, ease: "power2.inOut" }, "-=0.5")
    .to({val: 0}, {
        val: 100,
        duration: 2,
        ease: "power2.inOut",
        onUpdate: function() {
            counterSpan.textContent = Math.round(this.targets()[0].val);
        }
    }, "-=2")
    
    // 4. Glitch flash at 100%
    .to(loaderLogo, { scale: 1.1, filter: "invert(1) hue-rotate(180deg) brightness(3) drop-shadow(0 0 60px rgba(255,255,255,0.8)) blur(0px)", duration: 0.1, yoyo: true, repeat: 3 })
    
    // 5. Epic zoom out and hide content
    .to([loaderLogo, progressText], {
        opacity: 0,
        scale: 2,
        filter: "invert(1) hue-rotate(180deg) brightness(1.5) blur(30px)",
        duration: 0.6,
        ease: "power4.in"
    })
    
    // 6. Split doors open (Cinematic reveal)
    .to(doorLeft, { xPercent: -100, duration: 1, ease: "power4.inOut" }, "-=0.2")
    .to(doorRight, { xPercent: 100, duration: 1, ease: "power4.inOut" }, "-=1")
    
    // 7. Remove wrapper
    .set(loaderWrapper, { display: "none" })
    // 4. Stagger in the ultra hero content
    .fromTo('.kinetic-badge', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }, "-=0.2")
    .fromTo('.kinetic-title .line', 
        { y: 100, opacity: 0, rotationX: -90, transformOrigin: "50% 100%" }, 
        { y: 0, opacity: 1, rotationX: 0, duration: 1.2, stagger: 0.15, ease: "expo.out" }, 
        "-=0.6"
    )
    .fromTo('.kinetic-subtitle', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.8")
    .fromTo('.kinetic-actions', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.9")
    
    // 5. Build the 3D Login Form like a puzzle
    .fromTo('.glass-login-card', 
        { scale: 0.8, opacity: 0, rotationY: 45, rotationX: 20 }, 
        { scale: 1, opacity: 1, rotationY: 0, rotationX: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" }, 
        "-=1.2"
    )
    .fromTo('.login-header, .input-group-3d, .form-options, .submit-btn-3d',
        { z: -50, opacity: 0, y: 20 },
        { z: 0, opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "back.out(1.5)" },
        "-=1.0"
    )
    .fromTo('.float-decor', 
        { scale: 0, opacity: 0 }, 
        { scale: 1, opacity: 1, duration: 0.8, stagger: 0.2, ease: "back.out(2)" }, 
        "-=0.5"
    );
});

/* ==========================================================================
   3D TILT EFFECT (HERO LOGIN FORM)
   ========================================================================== */
const formWrapper = document.getElementById('login-3d');
const glassCard = document.querySelector('.glass-login-card');

if(formWrapper && glassCard) {
    document.addEventListener("mousemove", (e) => {
        const xAxis = (window.innerWidth / 2 - e.pageX) / 25;
        const yAxis = (window.innerHeight / 2 - e.pageY) / 25;
        
        gsap.to(glassCard, {
            rotationY: xAxis,
            rotationX: yAxis,
            duration: 0.5,
            ease: "power2.out",
            transformPerspective: 1000
        });
    });

    // Reset on leave (optional, since it's fullscreen tracking we might not need this, but good practice)
    document.addEventListener("mouseleave", () => {
        gsap.to(glassCard, {
            rotationY: 0,
            rotationX: 0,
            duration: 1,
            ease: "elastic.out(1, 0.3)"
        });
    });
}

/* ==========================================================================
   STATISTICS COUNTER
   ========================================================================== */
const counters = document.querySelectorAll('.counter');
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.5
};

const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const endValue = parseInt(target.getAttribute('data-target'));
            
            gsap.fromTo(target, 
                { innerHTML: 0 }, 
                { 
                    innerHTML: endValue, 
                    duration: 2, 
                    ease: "power3.out",
                    snap: { innerHTML: 1 },
                    onUpdate: function() {
                        target.innerHTML = Math.ceil(this.targets()[0].innerHTML);
                    }
                }
            );
            observer.unobserve(target);
        }
    });
}, observerOptions);

counters.forEach(counter => {
    counterObserver.observe(counter);
});


/* ==========================================================================
   MAGNETIC BUTTONS
   ========================================================================== */
const magneticBtns = document.querySelectorAll('.magnetic-btn');

magneticBtns.forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const h = rect.width / 2;
        
        const x = e.clientX - rect.left - h;
        const y = e.clientY - rect.top - h;

        gsap.to(btn, {
            x: x * 0.3,
            y: y * 0.3,
            duration: 0.4,
            ease: "power2.out"
        });
        
        const btnText = btn.querySelector('.btn-text');
        if(btnText) {
            gsap.to(btnText, {
                x: x * 0.1,
                y: y * 0.1,
                duration: 0.4,
                ease: "power2.out"
            });
        }
    });

    btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
        const btnText = btn.querySelector('.btn-text');
        if(btnText) {
            gsap.to(btnText, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
        }
    });
});

/* ==========================================================================
   GLASS CARD HOVER GLOW & 3D TILT
   ========================================================================== */
const glassCards = document.querySelectorAll('.glass-card');

glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update glow position
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // 3D Tilt Effect
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
        const rotateY = ((x - centerX) / centerX) * 10;
        
        gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            ease: "power2.out",
            duration: 0.5
        });
    });

    card.addEventListener('mouseleave', () => {
        gsap.to(card, {
            rotationX: 0,
            rotationY: 0,
            ease: "elastic.out(1, 0.3)",
            duration: 1.2
        });
    });
});

/* ==========================================================================
   VIDEO BACKGROUND PARALLAX
   ========================================================================== */
const videoWrapper = document.querySelector('.video-wrapper');
if (videoWrapper) {
    window.addEventListener('mousemove', (e) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 20; // max 20px movement
        const y = (e.clientY / window.innerHeight - 0.5) * 20;
        
        gsap.to(videoWrapper, {
            x: -x,
            y: -y,
            duration: 1,
            ease: "power2.out"
        });
    });
}

/* ==========================================================================
   MOBILE MENU
   ========================================================================== */
const menuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
        const isExpanded = navLinks.style.display === 'flex';
        
        if (isExpanded) {
            gsap.to(navLinks, { opacity: 0, y: -20, duration: 0.3, onComplete: () => {
                navLinks.style.display = 'none';
                navLinks.style.flexDirection = 'row';
                navLinks.style.position = 'static';
            }});
        } else {
            navLinks.style.display = 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.width = '100%';
            navLinks.style.background = 'rgba(15, 23, 42, 0.95)';
            navLinks.style.backdropFilter = 'blur(20px)';
            navLinks.style.padding = '24px';
            navLinks.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
            
            gsap.fromTo(navLinks, { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' });
        }
    });
}

/* ==========================================================================
   SCROLL ANIMATIONS (GSAP ScrollTrigger)
   ========================================================================== */
// Navbar background on scroll
const navbar = document.querySelector('.navbar');
ScrollTrigger.create({
    start: 'top -50',
    end: 99999,
    toggleClass: {className: 'scrolled', targets: navbar}
});

// Dim video background on scroll to keep focus on content
if (document.querySelector('.video-wrapper')) {
    gsap.to('.video-wrapper', {
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "1000px top",
            scrub: true
        },
        opacity: 0.15,
        filter: "blur(12px) brightness(0.5)",
        ease: "none"
    });
}

// Scroll Progress Bar
gsap.to('.scroll-progress', {
    width: '100%',
    ease: 'none',
    scrollTrigger: {
        trigger: document.body,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.1
    }
});

// Fade up elements
const fadeUpElements = document.querySelectorAll('.fade-up');
fadeUpElements.forEach((el) => {
    // Skip hero elements as they are animated in the loader
    if(!el.closest('.hero')) {
        gsap.fromTo(el, 
            { y: 50, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 0.8, 
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }
});

// Parallax for Hero Glows
gsap.to('.glow-1', {
    yPercent: 50,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

gsap.to('.glow-2', {
    yPercent: -30,
    ease: "none",
    scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true
    }
});

// Services Stagger
gsap.from('.service-row', {
    scrollTrigger: {
        trigger: '.services-list',
        start: 'top 80%',
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: "power3.out"
});

/* ==========================================================================
   SIMPLE PARTICLES BACKGROUND
   ========================================================================== */
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = Math.random() * 4 + 1 + 'px';
        particle.style.height = particle.style.width;
        particle.style.background = 'rgba(255, 255, 255, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.left = Math.random() * 100 + '%';
        
        // Random animation
        gsap.to(particle, {
            y: `-${Math.random() * 100 + 50}`,
            x: `${(Math.random() - 0.5) * 50}`,
            opacity: 0,
            duration: Math.random() * 5 + 5,
            repeat: -1,
            ease: "none",
            delay: Math.random() * 5
        });

        particlesContainer.appendChild(particle);
    }
}

/* ==========================================================================
   TOAST NOTIFICATION SYSTEM & FORM HANDLING
   ========================================================================== */
const toastContainer = document.createElement('div');
toastContainer.className = 'toast-container';
document.body.appendChild(toastContainer);

function showToast(title, message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'ri-information-line';
    if (type === 'success') iconClass = 'ri-checkbox-circle-line';
    if (type === 'error') iconClass = 'ri-error-warning-line';
    
    toast.innerHTML = `
        <i class="${iconClass} toast-icon"></i>
        <div class="toast-content">
            <span class="toast-title">${title}</span>
            <span class="toast-message">${message}</span>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Animate out and remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}

// 1. Handle Login Form
const loginForm = document.querySelector('.glass-login-card form');
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = loginForm.querySelector('input[type="email"]');
        const passInput = loginForm.querySelector('input[type="password"]');
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        if (!emailInput.value || !passInput.value) {
            showToast('Authentication Failed', 'Please fill in all required fields.', 'error');
            return;
        }

        // Simulate network request (More realistic delay)
        submitBtn.innerHTML = '<span><i class="ri-loader-4-line ri-spin"></i> Authenticating...</span>';
        setTimeout(() => {
            // Fake Login for everyone (Showcase mode)
            showToast('Welcome!', 'Authentication successful. Redirecting to dashboard...', 'success');
            submitBtn.innerHTML = '<span><i class="ri-check-line"></i> Success</span>';
            submitBtn.style.background = '#10B981';
            
            // Clear the form immediately
            loginForm.reset();
            
            // Simulate a page redirect to the Coming Soon page after 1.5 seconds
            setTimeout(() => {
                window.location.href = 'dashboard-coming-soon.html';
            }, 1500);
            
        }, 300); // Reduced delay for faster response
    });
}

// 2. Handle AI Project Input
const aiInputWrapper = document.querySelector('.ai-input-wrapper');
if (aiInputWrapper) {
    const aiInput = aiInputWrapper.querySelector('.ai-input');
    const aiBtn = aiInputWrapper.querySelector('.ai-send-btn');
    
    aiBtn.addEventListener('click', processAIInput);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') processAIInput();
    });

    function processAIInput() {
        const query = aiInput.value.trim().toLowerCase();
        if (!query) {
            showToast('Input Required', 'Please describe your project first.', 'info');
            return;
        }

        // Determine Response
        let responseText = "I'm analyzing your request. Our team of experts will reach out soon to discuss your vision!";
        if (query.includes('name') || query.includes('who are you')) {
            responseText = "Hello! I am Motion AI, the intelligent assistant for Digital Byte Solutions.";
        } else if (query.includes('how') && query.includes('life') || query.includes('how are you')) {
            responseText = "Life is fantastic in the digital realm! I'm here and ready to help you build something amazing.";
        } else if (query.includes('ecommerce') || query.includes('e-commerce') || query.includes('shop')) {
            responseText = "An E-commerce platform? We specialize in building scalable, secure, and lightning-fast online stores.";
        } else if (query.includes('app') || query.includes('mobile')) {
            responseText = "Mobile apps are our forte. We build cross-platform solutions that deliver native-like performance.";
        }

        const originalIcon = aiBtn.innerHTML;
        aiBtn.innerHTML = '<span class="btn-text"><i class="ri-loader-4-line ri-spin"></i></span>';
        aiInput.disabled = true;

        setTimeout(() => {
            aiBtn.innerHTML = '<span class="btn-text"><i class="ri-check-double-line"></i></span>';
            
            // Show Chat Area
            const chatArea = document.querySelector('.ai-chat-response-area');
            const msgText = document.querySelector('.ai-message-text');
            chatArea.style.display = 'flex';
            msgText.innerHTML = '<span class="typing-cursor"></span>';
            
            // Typewriter Animation
            let i = 0;
            function typeWriter() {
                if (i < responseText.length) {
                    msgText.innerHTML = responseText.substring(0, i + 1) + '<span class="typing-cursor"></span>';
                    i++;
                    setTimeout(typeWriter, 35);
                } else {
                    msgText.innerHTML = responseText;
                }
            }
            
            speakResponse(responseText);
            typeWriter();
            
            aiInput.value = '';
            
            setTimeout(() => {
                aiBtn.innerHTML = originalIcon;
                aiInput.disabled = false;
                aiInput.placeholder = 'Ask me anything else...';
            }, 1000);
        }, 300);
    }
    
    function speakResponse(text) {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'en-US';
            utterance.rate = 1.0;
            utterance.pitch = 1.1;
            window.speechSynthesis.speak(utterance);
        }
    }
}

// 3. Handle Main Contact Form via AJAX
const contactForm = document.getElementById('main-contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        // Change button state
        submitBtn.innerHTML = '<span><i class="ri-loader-4-line ri-spin"></i> Sending...</span>';
        submitBtn.style.opacity = '0.8';
        submitBtn.style.pointerEvents = 'none';

        const formData = new FormData(contactForm);
        
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
        .then(async (response) => {
            let json = await response.json();
            if (response.status == 200) {
                // Success
                showToast('Message Sent!', 'Thank you for reaching out. We will get back to you shortly.', 'success');
                contactForm.reset(); // Clear the form!
            } else {
                console.log(response);
                showToast('Error', json.message || 'Something went wrong!', 'error');
            }
        })
        .catch(error => {
            console.log(error);
            showToast('Error', 'Failed to send message. Please try again later.', 'error');
        })
        .finally(() => {
            // Restore button
            submitBtn.innerHTML = originalText;
            submitBtn.style.opacity = '1';
            submitBtn.style.pointerEvents = 'auto';
        });
    });
}

// 4. Handle Login Form Interactivity (Password Toggle, Forgot, Remember)
// Run directly without DOMContentLoaded since script is at the bottom
const togglePassword = document.querySelector('.password-toggle');
const passwordInput = document.getElementById('login-password');
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function (e) {
        e.preventDefault();
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.classList.toggle('ri-eye-off-line');
        this.classList.toggle('ri-eye-line');
    });
}

// Forgot Password Link
const forgotLink = document.querySelector('.forgot-link');
if (forgotLink) {
    forgotLink.addEventListener('click', (e) => {
        e.preventDefault();
        const emailField = document.querySelector('.glass-login-card input[type="email"]');
        if (emailField && emailField.value) {
            showToast('Reset Link Sent', `If ${emailField.value} exists, you will receive a reset link.`, 'info');
        } else {
            showToast('Action Required', 'Please enter your email address first to reset password.', 'info');
        }
    });
}

// Remember Me Checkbox
const rememberCheckbox = document.querySelector('.checkbox-container input[type="checkbox"]');
if (rememberCheckbox) {
    rememberCheckbox.addEventListener('change', function() {
        if (this.checked) {
            showToast('Device Remembered', 'You will stay logged in on this device for 30 days.', 'success');
        }
    });
}