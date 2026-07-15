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
const formWrapper = document.getElementById('login-3d') || document.getElementById('enquiry-3d');
const glassCard = document.querySelector('.glass-login-card');

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth <= 768);

if(formWrapper && glassCard && !isTouchDevice) {
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

if(!isTouchDevice) {
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
}

/* ==========================================================================
   GLASS CARD HOVER GLOW & 3D TILT
   ========================================================================== */
const glassCards = document.querySelectorAll('.glass-card');

if(!isTouchDevice) {
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
}

/* ==========================================================================
   VIDEO BACKGROUND PARALLAX
   ========================================================================== */
const videoWrapper = document.querySelector('.video-wrapper');
if (videoWrapper && !isTouchDevice) {
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

    async function processAIInput() {
        const query = aiInput.value.trim();
        if (!query) {
            showToast('Input Required', 'Please describe your project first.', 'info');
            return;
        }

        const originalIcon = aiBtn.innerHTML;
        aiBtn.innerHTML = '<span class="btn-text"><i class="ri-loader-4-line ri-spin"></i></span>';
        aiInput.disabled = true;
        
        const API_KEY = ""; // Removed for security. Add to .env in backend if needed.
        let responseText = "";
        let responseTextSpeech = "";
        let responseLang = "en-IN";

        // Show Chat Area immediately with a thinking indicator
        const chatArea = document.querySelector('.ai-chat-response-area');
        const msgText = document.querySelector('.ai-message-text');
        chatArea.style.display = 'flex';
        msgText.innerHTML = '<span class="thinking-dots">Thinking<span>.</span><span>.</span><span>.</span></span>';

        try {
            const systemPrompt = `You are Motion AI, a friendly and expert tech counselor for Digital Byte Academy. 
Guide students about MERN, AI, Data Science, Cyber Security. 
Points: 100% placement, 4-6 months duration, affordable fees.
RULES:
1. Speak STRICTLY in natural "Hinglish" (Hindi language written in English alphabet). DO NOT use JSON. DO NOT use Devanagari script.
2. Keep it short (2-3 sentences max).
3. Use 1-2 emojis.
4. Be encouraging, use words like 'Bhai', 'Bilkul'.`;
            
            const finalPrompt = systemPrompt + "\n\nUser Question: " + query;
            const url = `https://text.pollinations.ai/${encodeURIComponent(finalPrompt)}`;
            
            const response = await fetch(url);
            
            if(!response.ok) {
                throw new Error('API Request Failed');
            }
            
            // Pollinations returns raw text directly
            responseText = await response.text();
            
        } catch (error) {
            console.error("AI API failed, using intelligent fallback:", error);
            
            // Bulletproof Local Fallback AI
            const q = query.toLowerCase();
            if(q.includes("mern") || q.includes("web") || q.includes("full stack")) {
                responseText = "Bhai, Web Dev (MERN Stack) ki bohot demand hai! 🔥 Humare 4-6 mahine ke course me aap frontend/backend master kar loge, 100% placement ke sath! 🚀";
            } else if(q.includes("ai") || q.includes("data") || q.includes("machine")) {
                responseText = "Arre waah! AI aur Data Science toh future hai. Humara course ekdum practical hai aur placement bhi 100% guaranteed hai! 🤖";
            } else if(q.includes("fee") || q.includes("paise") || q.includes("cost") || q.includes("price")) {
                responseText = "Fees bilkul affordable hai bhai, aur EMI options bhi available hain. Tension mat lo, padhai pe focus karo! 💸";
            } else if(q.includes("hi") || q.includes("hello") || q.includes("hey")) {
                responseText = "Hello bhai! Kaisa chal raha hai? Main Digital Byte Academy ka AI counselor hu. Aapko kounse course ki details chahiye? 😊";
            } else if(q.includes("time") || q.includes("duration") || q.includes("kitna")) {
                responseText = "Humare saare courses normally 4 se 6 mahine ke hote hain bhai. Sath me live projects bhi banwate hain! 💻";
            } else {
                responseText = "Bhai, main samajh nahi paya! Par agar aap courses dhoondh rahe ho toh MERN, AI aur Data Science humare best courses hain. Kuch details batau? ✨";
            }
        }

        aiBtn.innerHTML = '<span class="btn-text"><i class="ri-check-double-line"></i></span>';
        
        msgText.innerHTML = '<span class="typing-cursor"></span>';
        
        // Fast Typewriter Animation
        let i = 0;
        function typeWriter() {
            if (i < responseText.length) {
                // Print 3 characters at a time for super fast typing
                i += 3;
                msgText.innerHTML = responseText.substring(0, i) + '<span class="typing-cursor"></span>';
                setTimeout(typeWriter, 10);
            } else {
                // Convert simple bold markdown if AI returns any
                msgText.innerHTML = responseText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            }
        }
        
        speakResponse(responseText, "en-IN");
        typeWriter();
        
        aiInput.value = '';
        aiInput.disabled = false;
        setTimeout(() => {
            aiBtn.innerHTML = originalIcon;
        }, 3000);
    }
    
    function speakResponse(text, langCode = 'en-IN') {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            
            // Clean emojis and markdown
            let cleanText = text.replace(/<[^>]*>?/gm, '');
            cleanText = cleanText.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
            cleanText = cleanText.replace(/\*\*/g, '');
            
            const utterance = new SpeechSynthesisUtterance(cleanText);
            
            // Try to find an Indian English voice for best Hinglish reading
            const voices = window.speechSynthesis.getVoices();
            let voiceToUse = voices.find(v => v.lang === 'en-IN') || 
                             voices.find(v => v.lang.includes('en-IN')) ||
                             voices.find(v => v.name.includes('India')) ||
                             voices.find(v => v.name.includes('Ravi')) ||
                             voices.find(v => v.name.includes('Heera'));
            
            if(voiceToUse) {
                utterance.voice = voiceToUse;
            }
            
            utterance.lang = 'en-IN';
            utterance.rate = 1.0; 
            utterance.pitch = 1.0;
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

// Landing Page Enquiry Form
const landingEnquiryForm = document.getElementById('landingEnquiryForm');
if (landingEnquiryForm) {
    landingEnquiryForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const btnText = document.getElementById('enquiryBtnText');
        const btnIcon = document.getElementById('enquiryBtnIcon');
        const originalText = btnText.innerText;
        
        btnText.innerText = 'Sending...';
        btnIcon.className = 'ri-loader-4-line ri-spin';
        
        const fullName = document.getElementById('enquiryName').value;
        const phoneNumber = document.getElementById('enquiryPhone').value;
        const course = document.getElementById('enquiryCourse').value;
        
        try {
            const res = await fetch('http://localhost:5000/api/enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, phoneNumber, course })
            });
            
            if (res.ok) {
                // Innovative Animation: Fade out form and header, fade in success
                const header = document.getElementById('enquiry-header');
                const form = document.getElementById('landingEnquiryForm');
                const successDiv = document.getElementById('enquirySuccess');
                
                header.style.opacity = '0';
                form.style.opacity = '0';
                header.style.transform = 'scale(0.95)';
                form.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    header.style.display = 'none';
                    form.style.display = 'none';
                    successDiv.style.display = 'flex';
                    
                    // Trigger reflow
                    void successDiv.offsetWidth;
                    
                    successDiv.style.opacity = '1';
                    successDiv.style.transform = 'scale(1)';
                    
                    showToast('Enquiry Sent!', 'We have received your details successfully.', 'success');
                }, 400); // Wait for fade out
                
            } else {
                showToast('Error', 'Something went wrong. Please try again.', 'error');
                btnText.innerText = originalText;
                btnIcon.className = 'ri-phone-fill';
            }
        } catch (error) {
            console.error(error);
            showToast('Connection Error', 'Could not connect to server.', 'error');
            btnText.innerText = originalText;
            btnIcon.className = 'ri-phone-fill';
        }
    });
}

// Global function to reset the UI back to the form state
window.resetEnquiryUI = function() {
    const header = document.getElementById('enquiry-header');
    const form = document.getElementById('landingEnquiryForm');
    const successDiv = document.getElementById('enquirySuccess');
    
    successDiv.style.opacity = '0';
    successDiv.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        successDiv.style.display = 'none';
        
        header.style.display = 'block';
        form.style.display = 'block';
        
        // Trigger reflow
        void header.offsetWidth;
        
        header.style.opacity = '1';
        form.style.opacity = '1';
        header.style.transform = 'scale(1)';
        form.style.transform = 'scale(1)';
        
        form.reset();
        
        const btnText = document.getElementById('enquiryBtnText');
        const btnIcon = document.getElementById('enquiryBtnIcon');
        btnText.innerText = 'Request Callback';
        btnIcon.className = 'ri-phone-fill';
    }, 500);
};

// 5. Salary Predictor Calculator Logic
const calcCourse = document.getElementById('calc-course');
const calcExp = document.getElementById('calc-exp');
const expValText = document.getElementById('exp-val');
const salMin = document.getElementById('sal-min');
const salMax = document.getElementById('sal-max');

if(calcCourse && calcExp) {
    // Base salary ranges (min, max) for 0 years experience
    const baseSalaries = {
        'mern': [3.5, 5.0],
        'aiml': [6.0, 8.5],
        'cloud': [5.0, 8.0],
        'data': [5.0, 7.5],
        'python': [3.0, 4.5],
        'java': [4.0, 6.0],
        'mean': [3.5, 5.0],
        'cyber': [4.5, 7.0],
        'prompt': [5.5, 9.0]
    };

    // Multiplier added per year of experience
    const expMultipliers = {
        'mern': 1.5,
        'aiml': 2.5,
        'cloud': 2.2,
        'data': 2.0,
        'python': 1.2,
        'java': 1.8,
        'mean': 1.5,
        'cyber': 1.5,
        'prompt': 2.8
    };

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = (progress * (end - start) + start).toFixed(1);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }

    function calculateSalary() {
        const course = calcCourse.value;
        const exp = parseInt(calcExp.value);
        
        // Update experience label
        if(exp === 0) expValText.innerText = '0 Years (Fresher)';
        else if(exp === 10) expValText.innerText = '10+ Years (Expert)';
        else expValText.innerText = exp + ' Years';

        const base = baseSalaries[course];
        const mult = expMultipliers[course];
        
        const currentMin = parseFloat(salMin.innerText) || 0;
        const currentMax = parseFloat(salMax.innerText) || 0;
        
        const targetMin = base[0] + (exp * mult);
        const targetMax = base[1] + (exp * mult * 1.2);
        
        // Animate numbers
        animateValue(salMin, currentMin, targetMin, 800);
        animateValue(salMax, currentMax, targetMax, 800);
    }

    calcCourse.addEventListener('change', calculateSalary);
    calcExp.addEventListener('input', calculateSalary);
    
    // Initial call
    calculateSalary();
}
/// Showreel Modal Logic with Interactive Coding
document.addEventListener('DOMContentLoaded', () => {
    const watchBtn = document.getElementById('watchShowreelBtn');
    const showreelModal = document.getElementById('showreelModal');
    const closeShowreel = document.getElementById('closeShowreel');
    const showreelOverlay = document.getElementById('showreelOverlay');
    const showreelCode = document.getElementById('showreelCode');
    const showreelTitle = document.getElementById('showreelTitle');
    const thumbs = document.querySelectorAll('.video-thumb');
    
    let typeInterval;

    const snippets = {
        placement: {
            title: 'student_placement.py',
            code: `<span class="code-comment"># AI Model to predict student placement success</span>\n<span class="code-keyword">import</span> tensorflow <span class="code-keyword">as</span> tf\n<span class="code-keyword">from</span> digital_byte <span class="code-keyword">import</span> Students, Companies\n\n<span class="code-keyword">def</span> <span class="code-function">train_placement_model</span>():\n    data = Students.get_skills(batch=<span class="code-string">"2026"</span>)\n    model = tf.keras.Sequential([\n        tf.keras.layers.Dense(128, activation=<span class="code-string">"relu"</span>),\n        tf.keras.layers.Dense(64, activation=<span class="code-string">"relu"</span>),\n        tf.keras.layers.Dense(1, activation=<span class="code-string">"sigmoid"</span>)\n    ])\n    \n    <span class="code-comment"># Training with 99.9% accuracy target</span>\n    model.compile(optimizer=<span class="code-string">"adam"</span>, loss=<span class="code-string">"binary_crossentropy"</span>)\n    model.fit(data, epochs=100)\n    \n    <span class="code-keyword">return</span> <span class="code-string">"100% Placement Guaranteed!"</span>`
        },
        campus: {
            title: 'campus_tour.html',
            code: `<span class="code-comment">&lt;!-- 3D WebGL Campus Tour --&gt;</span>\n<span class="code-keyword">&lt;div</span> <span class="code-variable">class</span>=<span class="code-string">"campus-container"</span><span class="code-keyword">&gt;</span>\n    <span class="code-keyword">&lt;canvas</span> <span class="code-variable">id</span>=<span class="code-string">"webgl-canvas"</span><span class="code-keyword">&gt;&lt;/canvas&gt;</span>\n    \n    <span class="code-keyword">&lt;script</span> <span class="code-variable">type</span>=<span class="code-string">"module"</span><span class="code-keyword">&gt;</span>\n        <span class="code-keyword">import</span> * <span class="code-keyword">as</span> THREE <span class="code-keyword">from</span> <span class="code-string">'three'</span>;\n        <span class="code-keyword">const</span> scene = <span class="code-keyword">new</span> THREE.Scene();\n        \n        <span class="code-comment">// Render High-Tech Labs</span>\n        <span class="code-keyword">const</span> lab = <span class="code-keyword">new</span> DigitalByte.Lab();\n        scene.add(lab);\n        \n        camera.position.z = 5;\n        renderer.render(scene, camera);\n    <span class="code-keyword">&lt;/script&gt;</span>\n<span class="code-keyword">&lt;/div&gt;</span>`
        },
        alumni: {
            title: 'AlumniDashboard.jsx',
            code: `<span class="code-keyword">import</span> React, { useState, useEffect } <span class="code-keyword">from</span> <span class="code-string">'react'</span>;\n<span class="code-keyword">import</span> { AlumniNetwork } <span class="code-keyword">from</span> <span class="code-string">'./api'</span>;\n\n<span class="code-keyword">const</span> <span class="code-function">AlumniDashboard</span> = () => {\n    <span class="code-keyword">const</span> [successStories, setStories] = useState([]);\n    \n    useEffect(() => {\n        <span class="code-comment">// Fetching top package alumni</span>\n        AlumniNetwork.getTopEarners().then(data => {\n            setStories(data);\n            <span class="code-builtin">console</span>.log(<span class="code-string">"Highest Package: 50 LPA!"</span>);\n        });\n    }, []);\n    \n    <span class="code-keyword">return</span> (\n        <span class="code-keyword">&lt;div</span> <span class="code-variable">className</span>=<span class="code-string">"grid-layout"</span><span class="code-keyword">&gt;</span>\n            {successStories.map(story => <span class="code-keyword">&lt;Card</span> <span class="code-variable">data</span>={story} /<span class="code-keyword">&gt;</span>)}\n        <span class="code-keyword">&lt;/div&gt;</span>\n    );\n};\n\n<span class="code-keyword">export default</span> AlumniDashboard;`
        }
    };

    function typeCode(type) {
        clearInterval(typeInterval);
        showreelCode.innerHTML = '';
        showreelTitle.innerText = snippets[type].title;
        
        let codeHtml = snippets[type].code;
        let i = 0;
        let isTag = false;
        let currentHTML = '';
        
        typeInterval = setInterval(() => {
            if(i >= codeHtml.length) {
                clearInterval(typeInterval);
                return;
            }
            
            let char = codeHtml.charAt(i);
            currentHTML += char;
            
            if(char === '<') isTag = true;
            if(char === '>') isTag = false;
            
            if(!isTag) {
                showreelCode.innerHTML = currentHTML;
            }
            i++;
        }, 15);
    }

    if (watchBtn && showreelModal) {
        watchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showreelModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // reset thumbs
            thumbs.forEach(t => t.classList.remove('active'));
            if(thumbs[0]) thumbs[0].classList.add('active');
            if(showreelCode) typeCode('placement');
        });

        const close = () => {
            showreelModal.classList.remove('active');
            document.body.style.overflow = '';
            clearInterval(typeInterval);
        };

        closeShowreel.addEventListener('click', close);
        showreelOverlay.addEventListener('click', close);
        
        thumbs.forEach(thumb => {
            thumb.addEventListener('click', () => {
                thumbs.forEach(t => t.classList.remove('active'));
                thumb.classList.add('active');
                if(showreelCode) typeCode(thumb.dataset.type);
            });
        });
    }
});

// Roadmap Logic
const roadmaps = {
    'mern': {
        title: 'MERN Full Stack Roadmap',
        steps: [
            '<strong>Frontend Basics</strong> HTML5, CSS3, JavaScript (ES6+)',
            '<strong>React & State</strong> React.js, Hooks, Redux Toolkit',
            '<strong>Backend</strong> Node.js, Express.js, REST APIs',
            '<strong>Database & Deploy</strong> MongoDB, Mongoose, AWS / Vercel'
        ]
    },
    'python': {
        title: 'Python / Django Roadmap',
        steps: [
            '<strong>Python Core</strong> Data Types, OOPs, File Handling',
            '<strong>Database</strong> SQL, PostgreSQL, ORM',
            '<strong>Django Framework</strong> Views, Models, Templates, Django REST',
            '<strong>Deployment</strong> Docker, Nginx, AWS EC2'
        ]
    },
    'java': {
        title: 'Java Full Stack Roadmap',
        steps: [
            '<strong>Java Core</strong> OOPs, Collections, Multithreading',
            '<strong>Backend Framework</strong> Spring Boot, Spring Security, JPA',
            '<strong>Database & Cache</strong> MySQL, Hibernate, Redis',
            '<strong>Frontend</strong> Angular or React integration, Microservices'
        ]
    },
    'ai': {
        title: 'AI / ML Engineer Roadmap',
        steps: [
            '<strong>Foundations</strong> Python, Applied Math, Statistics',
            '<strong>Data Handling</strong> Pandas, NumPy, Matplotlib',
            '<strong>Machine Learning</strong> Scikit-Learn, Regression, Classification',
            '<strong>Deep Learning</strong> TensorFlow / PyTorch, Neural Networks'
        ]
    },
    'data': {
        title: 'Data Scientist Roadmap',
        steps: [
            '<strong>Data Core</strong> SQL, Python, Excel Advanced',
            '<strong>Data Cleaning & EDA</strong> Pandas, Data Wrangling',
            '<strong>Visualization</strong> Tableau / PowerBI, Seaborn',
            '<strong>Advanced Analysis</strong> Predictive Modeling, A/B Testing'
        ]
    },
    'cyber': {
        title: 'Cyber Security Roadmap',
        steps: [
            '<strong>Networking & OS</strong> TCP/IP, Linux, Windows Internals',
            '<strong>Ethical Hacking</strong> Kali Linux, Nmap, Metasploit',
            '<strong>Web Security</strong> OWASP Top 10, Burp Suite, Pentesting',
            '<strong>Defense & SecOps</strong> Firewalls, SIEM, Incident Response'
        ]
    }
};

const viewRoadmapBtn = document.getElementById('view-roadmap-btn');
const roadmapContainer = document.getElementById('roadmap-container');
const roadmapTitle = document.getElementById('roadmap-title');
const roadmapSteps = document.getElementById('roadmap-steps');

if(viewRoadmapBtn && roadmapContainer) {
    viewRoadmapBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const course = calcCourse.value;
        const data = roadmaps[course];
        
        roadmapTitle.innerText = data.title;
        roadmapSteps.innerHTML = data.steps.map(step => `<li>${step}</li>`).join('');
        
        if (roadmapContainer.style.display === 'none') {
            roadmapContainer.style.display = 'block';
            viewRoadmapBtn.innerHTML = '<span class="btn-text"><i class="ri-arrow-up-s-line"></i> Hide Roadmap</span>';
        } else {
            roadmapContainer.style.display = 'none';
            viewRoadmapBtn.innerHTML = '<span class="btn-text"><i class="ri-map-pin-line"></i> View Course Roadmap</span>';
        }
    });

    calcCourse.addEventListener('change', () => {
        // Update roadmap if it is currently open
        if (roadmapContainer.style.display === 'block') {
            const course = calcCourse.value;
            const data = roadmaps[course];
            roadmapTitle.innerText = data.title;
            roadmapSteps.innerHTML = data.steps.map(step => `<li>${step}</li>`).join('');
        }
    });
}

// Preload voices for speech synthesis
if ('speechSynthesis' in window) {
    window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = function() {
        window.speechSynthesis.getVoices();
    };
}


// Brochure Lead Generation Logic
document.addEventListener('DOMContentLoaded', () => {
    const brochureBtns = document.querySelectorAll('a[title="Download Brochure"]');
    const brochureModal = document.getElementById('brochureModal');
    const closeBrochureModal = document.getElementById('closeBrochureModal');
    const brochureForm = document.getElementById('brochure-form');
    let pendingBrochureHref = '';
    let pendingBrochureName = '';

    if (brochureBtns.length > 0 && brochureModal) {
        brochureBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent direct download
                pendingBrochureHref = btn.getAttribute('href');
                pendingBrochureName = btn.getAttribute('download');
                
                brochureModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeModal = () => {
            brochureModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        if(closeBrochureModal) {
            closeBrochureModal.addEventListener('click', closeModal);
        }
        
        brochureModal.addEventListener('click', (e) => {
            if (e.target === brochureModal) closeModal();
        });

        
    // FAQ Accordion Logic
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const btn = item.querySelector('.faq-question');
        btn.addEventListener('click', () => {
            // Close others
            faqItems.forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
            item.classList.toggle('active');
        });
    });

    // Exit Intent Logic
    let exitIntentTriggered = sessionStorage.getItem('exitIntentShown');
    const exitPopup = document.getElementById('exitPopup');
    const closeExitPopup = document.getElementById('closeExitPopup');
    const exitForm = document.getElementById('exit-form');

    if (!exitIntentTriggered && exitPopup) {
        document.addEventListener('mouseleave', (e) => {
            if (e.clientY < 10 && !sessionStorage.getItem('exitIntentShown')) {
                exitPopup.classList.add('active');
                sessionStorage.setItem('exitIntentShown', 'true');
            }
        });
    }
    
    if (closeExitPopup) {
        closeExitPopup.addEventListener('click', () => exitPopup.classList.remove('active'));
        exitPopup.addEventListener('click', (e) => {
            if (e.target === exitPopup) exitPopup.classList.remove('active');
        });
    }

    if(exitForm) {
        exitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = exitForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<span><i class="ri-loader-4-line ri-spin"></i> Processing...</span>';
            submitBtn.disabled = true;

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: new FormData(exitForm)
            }).then(response => {
                if(response.status == 200) {
                    showToast('Session Booked!', 'Our counselor will contact you soon.', 'success');
                    exitPopup.classList.remove('active');
                }
            }).finally(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            });
        });
    }

        
    // See More Courses Logic
    const seeMoreBtn = document.getElementById('seeMoreCoursesBtn');
    const hiddenCourses = document.querySelectorAll('.hidden-course');
    
    if (seeMoreBtn && hiddenCourses.length > 0) {
        let isExpanded = false;
        
        seeMoreBtn.addEventListener('click', () => {
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                hiddenCourses.forEach((card, index) => {
                    card.style.display = 'flex';
                    // Re-trigger animation
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(30px)';
                    setTimeout(() => {
                        card.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, index * 100);
                });
                seeMoreBtn.innerHTML = '<i class="ri-arrow-up-s-line"></i> <span>Show Less</span>';
            } else {
                hiddenCourses.forEach(card => {
                    card.style.display = 'none';
                });
                seeMoreBtn.innerHTML = '<i class="ri-arrow-down-s-line"></i> <span>View All Courses</span>';
                
                // Scroll back to courses section
                document.getElementById('courses').scrollIntoView({behavior: 'smooth'});
            }
        });
    }

        
    // Dark/Light Mode Toggle
    const themeToggle = document.getElementById('theme-toggle');
    // Top Banner Close Logic
    const topBanner = document.getElementById('topBanner');
    const closeBanner = document.getElementById('closeBanner');
    if(topBanner && closeBanner) {
        closeBanner.addEventListener('click', () => {
            topBanner.style.display = 'none';
        });
    }

    // Dynamic Course Offer Logic (Changes every 10 days)
    const dynamicCourseSpan = document.getElementById('dynamicCourse');
    if (dynamicCourseSpan) {
        const offerCourses = [
            "MERN Stack & AI",
            "Data Science & Python",
            "Cloud Computing & AWS",
            "Cyber Security & Ethical Hacking",
            "React.js & Node.js",
            "Java Full Stack",
            "Digital Marketing"
        ];
        
        // Calculate an index that changes every 10 days
        const currentDate = new Date();
        const periodIndex = Math.floor(currentDate.getDate() / 10); // 0, 1, or 2 (within a month)
        const monthIndex = currentDate.getMonth();
        
        // Use a combination of month and period to cycle through the array
        const courseIndex = (monthIndex + periodIndex) % offerCourses.length;
        
        dynamicCourseSpan.textContent = offerCourses[courseIndex];
    }

    if(themeToggle) {
        const icon = themeToggle.querySelector('i');
        
        // Check saved theme
        if (localStorage.getItem('theme') === 'light') {
            document.body.classList.add('light-mode');
            icon.className = 'ri-sun-line';
        }
        
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            if (document.body.classList.contains('light-mode')) {
                icon.className = 'ri-sun-line';
                localStorage.setItem('theme', 'light');
            } else {
                icon.className = 'ri-moon-line';
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Animated Counters
    const counters = document.querySelectorAll('.counter');
    const speed = 200; // The lower the slower

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;
                const inc = target / speed;

                if (count < target) {
                    // Check if it's a float
                    if(target % 1 !== 0) {
                        counter.innerText = (count + inc).toFixed(1);
                    } else {
                        counter.innerText = Math.ceil(count + inc);
                    }
                    setTimeout(updateCount, 10);
                } else {
                    counter.innerText = target + (target % 1 === 0 && target > 10 ? '+' : '');
                }
            };
            updateCount();
        });
    };

    // Use Intersection Observer for counters
    if(counters.length > 0) {
        const counterObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        const statsSection = document.querySelector('.stats-section');
        if(statsSection) counterObserver.observe(statsSection);
    }

    if(brochureForm) {
            brochureForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const submitBtn = brochureForm.querySelector('button[type="submit"]');
                const originalText = submitBtn.innerHTML;
                
                submitBtn.innerHTML = '<span><i class="ri-loader-4-line ri-spin"></i> Processing...</span>';
                submitBtn.disabled = true;

                const formData = new FormData(brochureForm);
                formData.append('Requested_Brochure', pendingBrochureName);

                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                })
                .then(async (response) => {
                    if (response.status == 200) {
                        // Success: Start Download
                        if(typeof showToast === 'function') {
                            showToast('Success!', 'Your brochure is downloading...', 'success');
                        } else {
                            alert('Success! Your brochure is downloading...');
                        }
                        
                        // Create a temporary link to trigger the download
                        const tempLink = document.createElement('a');
                        tempLink.href = pendingBrochureHref;
                        tempLink.download = pendingBrochureName;
                        document.body.appendChild(tempLink);
                        tempLink.click();
                        document.body.removeChild(tempLink);
                        
                        brochureForm.reset();
                        closeModal();
                    } else {
                        if(typeof showToast === 'function') {
                            showToast('Error', 'Failed to submit details. Please try again.', 'error');
                        } else {
                            alert('Failed to submit details. Please try again.');
                        }
                    }
                })
                .catch(error => {
                    if(typeof showToast === 'function') {
                        showToast('Error', 'Network Error. Please try again.', 'error');
                    }
                })
                .finally(() => {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                });
            });
        }
    }
});
