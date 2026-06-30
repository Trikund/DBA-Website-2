/* ==========================================
   DIGITAL BYTE SOLUTIONS
   script.js
========================================== */

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    if (loader) {
        setTimeout(() => {
            loader.style.opacity = "0";
            loader.style.visibility = "hidden";
        }, 1500);
    }

});

/* ===========================
STICKY NAVBAR
=========================== */

const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {

    if (!navbar) return;

    if (window.scrollY > 80) {

        navbar.style.background = "rgba(7,18,35,.95)";
        navbar.style.boxShadow = "0 15px 35px rgba(0,0,0,.25)";

    } else {

        navbar.style.background = "rgba(7,18,35,.65)";
        navbar.style.boxShadow = "none";

    }

});

/* ===========================
SMOOTH SCROLL
=========================== */

document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", function (e) {

        const target = document.querySelector(this.getAttribute("href"));

        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({

            behavior: "smooth"

        });

    });

});

/* ===========================
SCROLL TO TOP
=========================== */

const topBtn = document.getElementById("topBtn");

window.addEventListener("scroll", () => {

    if (!topBtn) return;

    if (window.scrollY > 500) {

        topBtn.style.display = "flex";

    } else {

        topBtn.style.display = "none";

    }

});

if (topBtn) {

    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

/* ===========================
REVEAL ANIMATION
=========================== */

const revealItems = document.querySelectorAll(

    ".about-card,.course-card,.timeline-card,.why-card,.placement-card,.testimonial-card,.faq-item,.contact-info,.contact-form"

);

const observer = new IntersectionObserver(

    (entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.style.opacity = "1";

                entry.target.style.transform = "translateY(0)";

            }

        });

    },

    {

        threshold: .15

    }

);

revealItems.forEach(item => {

    item.style.opacity = "0";

    item.style.transform = "translateY(50px)";

    item.style.transition = ".8s ease";

    observer.observe(item);

});

/* ===========================
COUNTER ANIMATION
=========================== */

const counters = document.querySelectorAll(".hero-stats h2");

let started = false;

window.addEventListener("scroll", () => {

    const stats = document.querySelector(".hero-stats");

    if (!stats || started) return;

    const trigger = stats.offsetTop - 500;

    if (window.scrollY >= trigger) {

        started = true;

        counters.forEach(counter => {

            const original = counter.innerText;

            const target = parseInt(original);

            if (isNaN(target)) return;

            let count = 0;

            const step = Math.ceil(target / 60);

            function update() {

                count += step;

                if (count < target) {

                    if (original.includes("%")) {

                        counter.innerText = count + "%";

                    } else {

                        counter.innerText = count + "+";

                    }

                    requestAnimationFrame(update);

                } else {

                    counter.innerText = original;

                }

            }

            update();

        });

    }

});

/* ===========================
ACTIVE NAV LINK
=========================== */

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".navbar ul li a");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const top = section.offsetTop - 150;

        if (window.pageYOffset >= top) {

            current = section.getAttribute("id");

        }

    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {

            link.classList.add("active");

        }

    });

});

/* ===========================
HERO LOGO PARALLAX
=========================== */

const heroLogo = document.querySelector(".hero-right img");

if (heroLogo) {

    window.addEventListener("mousemove", (e) => {

        const x = (window.innerWidth / 2 - e.clientX) / 40;
        const y = (window.innerHeight / 2 - e.clientY) / 40;

        heroLogo.style.transform =
            `rotateY(${x}deg) rotateX(${y}deg)`;

    });

}

/* ===========================
BUTTON HOVER EFFECT
=========================== */

document.querySelectorAll(

    ".primary-btn,.secondary-btn,.apply-btn,.download-btn,.preview-btn"

).forEach(btn => {

    btn.addEventListener("mouseenter", () => {

        btn.style.transform = "translateY(-4px) scale(1.02)";

    });

    btn.addEventListener("mouseleave", () => {

        btn.style.transform = "translateY(0) scale(1)";

    });

});

/* ===========================
CURRENT YEAR
=========================== */

const footerBottom = document.querySelector(".footer-bottom");

if (footerBottom) {

    footerBottom.innerHTML =
        `© ${new Date().getFullYear()} Digital Byte Solutions. All Rights Reserved.`;

}

console.log("🚀 Digital Byte Solutions Website Loaded Successfully");