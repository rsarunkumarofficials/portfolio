// Portfolio Interactive Logic

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Set Current Year in Footer
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Elements
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');

    /* -------------------------------------------------------------
       1. Mobile Menu Toggle
       ------------------------------------------------------------- */
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.setAttribute('role', 'button');
        mobileMenuBtn.setAttribute('tabindex', '0');
        mobileMenuBtn.setAttribute('aria-label', 'Toggle navigation menu');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');

        const setMenu = (open) => {
            mobileMenuBtn.classList.toggle('active', open);
            navMenu.classList.toggle('active', open);
            mobileMenuBtn.setAttribute('aria-expanded', String(open));
        };

        mobileMenuBtn.addEventListener('click', () => {
            setMenu(!navMenu.classList.contains('active'));
        });

        mobileMenuBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setMenu(!navMenu.classList.contains('active'));
            }
        });

        // Close mobile menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => setMenu(false));
        });

        // Close when tapping outside
        document.addEventListener('click', (e) => {
            if (!navMenu.classList.contains('active')) return;
            if (navMenu.contains(e.target) || mobileMenuBtn.contains(e.target)) return;
            setMenu(false);
        });
    }

    /* -------------------------------------------------------------
       2. Scroll: navbar state, active link, anchor navigation
       ------------------------------------------------------------- */
    let scrollTicking = false;

    const updateOnScroll = () => {
        const y = window.scrollY;

        if (navbar) navbar.classList.toggle('scrolled', y > 40);

        let current = '';
        sections.forEach(section => {
            if (y >= section.offsetTop - window.innerHeight * 0.35) {
                current = section.id;
            }
        });

        navLinks.forEach(link => {
            const isActive = current !== '' && link.getAttribute('href') === `#${current}`;
            link.classList.toggle('active', isActive);
        });

        scrollTicking = false;
    };

    const onScroll = () => {
        if (scrollTicking) return;
        scrollTicking = true;
        requestAnimationFrame(updateOnScroll);
    };

    const syncNavHeight = () => {
        if (navbar) root.style.setProperty('--nav-h', `${navbar.offsetHeight}px`);
    };

    // Land anchor jumps exactly below the fixed navbar
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const hash = anchor.getAttribute('href');
            if (!hash || hash === '#') return;

            const target = document.querySelector(hash);
            if (!target) return;

            e.preventDefault();

            const navHeight = navbar ? navbar.getBoundingClientRect().height : 0;
            const header = hash === '#home' ? null : target.querySelector('.section-header');
            const landing = header || target;
            const targetTop = hash === '#home'
                ? 0
                : landing.getBoundingClientRect().top + window.scrollY - navHeight - 28;

            window.scrollTo({
                top: Math.max(0, Math.round(targetTop)),
                behavior: reduceMotion ? 'auto' : 'smooth'
            });

            if (history.pushState) history.pushState(null, '', hash);
        });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        syncNavHeight();
        onScroll();
    }, { passive: true });
    syncNavHeight();
    updateOnScroll();

    /* -------------------------------------------------------------
       3. Subtle hover effects
       ------------------------------------------------------------- */
    let pointerEvent = null;
    let pointerFrame = 0;

    const updatePointer = () => {
        pointerFrame = 0;
        const e = pointerEvent;
        if (!e) return;

        const target = e.target instanceof Element
            ? e.target.closest('.glass, .btn, .skill-tag')
            : null;

        if (target) {
            const rect = target.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            target.style.setProperty('--mx', `${x}%`);
            target.style.setProperty('--my', `${y}%`);
        }
    };

    if (!reduceMotion) {
        document.addEventListener('pointermove', (e) => {
            pointerEvent = e;
            if (!pointerFrame) pointerFrame = requestAnimationFrame(updatePointer);
        }, { passive: true });
    }

    /* -------------------------------------------------------------
       4. Intersection Observer for Scroll Animations
       ------------------------------------------------------------- */
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    if (!('IntersectionObserver' in window) || reduceMotion) {
        revealElements.forEach(el => el.classList.add('active'));
    } else {
        const revealOnScroll = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -8% 0px'
        });

        revealElements.forEach(el => revealOnScroll.observe(el));
    }

    window.__portfolioReady = true;

    /* -------------------------------------------------------------
       5. Hero role typewriter (uses the existing role text)
       ------------------------------------------------------------- */
    const roleTexts = Array.from(document.querySelectorAll('.role .typing-text'));

    if (roleTexts.length) {
        const phrases = roleTexts
            .map(el => el.textContent.trim())
            .filter(Boolean);

        const output = roleTexts[0];
        const ghosts = roleTexts.slice(1);

        ghosts.forEach(el => {
            el.classList.add('typing-ghost');
            el.setAttribute('aria-hidden', 'true');
        });

        if (reduceMotion || phrases.length < 2) {
            if (phrases.length) output.textContent = phrases[0];
        } else {
            output.textContent = '';
            let phraseIndex = 0;
            let charIndex = 0;
            let deleting = false;

            const tick = () => {
                const phrase = phrases[phraseIndex];

                if (!deleting) {
                    charIndex += 1;
                    output.textContent = phrase.slice(0, charIndex);

                    if (charIndex === phrase.length) {
                        deleting = true;
                        setTimeout(tick, 2200);
                        return;
                    }
                    setTimeout(tick, 55 + Math.random() * 45);
                } else {
                    charIndex -= 1;
                    output.textContent = phrase.slice(0, charIndex);

                    if (charIndex === 0) {
                        deleting = false;
                        phraseIndex = (phraseIndex + 1) % phrases.length;
                        setTimeout(tick, 380);
                        return;
                    }
                    setTimeout(tick, 28 + Math.random() * 20);
                }
            };

            setTimeout(tick, 650);
        }
    }

    /* -------------------------------------------------------------
       6. Contact Form Submission
       ------------------------------------------------------------- */
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]');
            if (!btn) return;

            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
            btn.disabled = true;

            try {
                const response = await fetch('https://formspree.io/f/xrpepoge', {
                    method: 'POST',
                    body: new FormData(contactForm),
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    btn.innerHTML = 'Message Sent! <i class="fa-solid fa-check"></i>';
                    contactForm.reset();
                } else {
                    btn.innerHTML = 'Error! Try Again <i class="fa-solid fa-xmark"></i>';
                }
            } catch {
                btn.innerHTML = 'Error! Try Again <i class="fa-solid fa-xmark"></i>';
            }

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }, 3000);
        });
    }
});
