gsap.registerPlugin(ScrollTrigger);

document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const allowSmoothScroll = !prefersReducedMotion && !isTouchDevice && !isSmallScreen && typeof Lenis !== 'undefined';
    const allowInteractiveCursor = !prefersReducedMotion && !isTouchDevice && !isSmallScreen;
    const allowAmbientAnimation = !prefersReducedMotion && !isSmallScreen;

    const glowOrb = document.getElementById('glow-orb');
    const phoneScene = document.querySelector('.css-iphone');
    const appScreenImg = document.getElementById('app-screen-img');
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    const preloader = document.getElementById('preloader');
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    const cursorAwareElements = Array.from(document.querySelectorAll('.cursor-aware'));
    const magneticElements = Array.from(document.querySelectorAll('.data-magnetic'));

    if (!allowInteractiveCursor) {
        body.classList.add('system-cursor');
    }

    if (prefersReducedMotion) {
        body.classList.add('reduced-motion');
    }

    // ==========================================
    // THEME TOGGLE (LIGHT/DARK)
    // ==========================================
    const applyTheme = (theme) => {
        const isLight = theme === 'light';
        body.classList.toggle('light-mode', isLight);

        if (themeIcon) {
            themeIcon.textContent = isLight ? 'light_mode' : 'dark_mode';
        }

        localStorage.setItem('theme', theme);
        window.dispatchEvent(new Event('themeChanged'));
    };

    const currentTheme = localStorage.getItem('theme');
    if (currentTheme === 'light') {
        applyTheme('light');
    }

    themeToggle?.addEventListener('click', () => {
        applyTheme(body.classList.contains('light-mode') ? 'dark' : 'light');
    });

    // ==========================================
    // SHARED SCROLL SUBSCRIPTIONS
    // ==========================================
    const scrollListeners = [];
    const subscribeToScroll = (listener) => scrollListeners.push(listener);

    // Throttled scroll emit — fires at most once per animation frame
    let scrollRafId = null;
    let lastScrollPayload = {};
    const emitScroll = (payload) => {
        lastScrollPayload = payload;
        if (!scrollRafId) {
            scrollRafId = requestAnimationFrame(() => {
                scrollRafId = null;
                scrollListeners.forEach((listener) => listener(lastScrollPayload));
            });
        }
    };

    // ==========================================
    // LENIS SMOOTH SCROLL
    // ==========================================
    let lenis = null;

    if (allowSmoothScroll) {
        lenis = new Lenis({
            duration: 1.1,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1.0,
            smoothTouch: false,
            touchMultiplier: 1.8,
            infinite: false,
        });

        lenis.on('scroll', (event) => {
            ScrollTrigger.update();
            emitScroll(event);
        });

        gsap.ticker.add((time) => lenis.raf(time * 1000));
        gsap.ticker.lagSmoothing(0);
    } else {
        let lastScrollY = window.scrollY;
        let lastScrollTime = performance.now();

        const onNativeScroll = () => {
            const now = performance.now();
            const scrollY = window.scrollY;
            const deltaTime = Math.max(now - lastScrollTime, 16);
            const velocity = ((scrollY - lastScrollY) / deltaTime) * 16;

            lastScrollY = scrollY;
            lastScrollTime = now;

            ScrollTrigger.update();
            emitScroll({ scroll: scrollY, velocity });
        };

        window.addEventListener('scroll', onNativeScroll, { passive: true });
        onNativeScroll();
    }

    // --- Glow orb: use ONLY opacity/transform, NEVER filter (filter = full repaint) ---
    if (glowOrb) {
        subscribeToScroll((event) => {
            const velocity = Math.min(Math.abs(event.velocity || 0), 20);
            const scale = 1 + velocity * 0.018;
            const opacity = Math.min(1, 0.7 + velocity * 0.025);
            gsap.to(glowOrb, {
                scale,
                opacity,
                duration: 0.3,
                overwrite: 'auto',
                ease: 'power1.out'
            });
        });
    }

    // ==========================================
    // MUSIC PARTICLE CANVAS  — Optimised
    // ==========================================
    const canvas = document.getElementById('bg-canvas');

    if (canvas && allowAmbientAnimation) {
        const ctx = canvas.getContext('2d', { alpha: true });

        if (ctx) {
            // Fewer notes, drawn as simple circles instead of text for speed
            const NOTE_COUNT = 12;
            const noteGlyphs = ['♩', '♪', '♫', '♬'];
            let width = window.innerWidth;
            let height = window.innerHeight;
            let notes = [];
            let scrollOffset = 0;
            let animationFrameId = null;
            let isVisible = true;

            // Pre-create offscreen note bitmaps so we avoid font rendering each frame
            const noteCache = new Map();
            const getNoteBitmap = (glyph, size, color) => {
                const key = `${glyph}_${size}_${color}`;
                if (noteCache.has(key)) return noteCache.get(key);
                const oc = document.createElement('canvas');
                oc.width = size * 2;
                oc.height = size * 2;
                const octx = oc.getContext('2d');
                octx.fillStyle = color;
                octx.font = `${size}px serif`;
                octx.textAlign = 'center';
                octx.textBaseline = 'middle';
                octx.fillText(glyph, size, size);
                noteCache.set(key, oc);
                return oc;
            };

            const buildNotes = () => Array.from({ length: NOTE_COUNT }, () => {
                const size = Math.floor(10 + Math.random() * 16);
                const color = Math.random() > 0.5 ? '#FF9900' : '#ffffff';
                const glyph = noteGlyphs[Math.floor(Math.random() * noteGlyphs.length)];
                return {
                    x: Math.random() * width,
                    y: Math.random() * height,
                    glyph,
                    size,
                    opacity: 0.04 + Math.random() * 0.06,
                    speed: 0.1 + Math.random() * 0.2,
                    rotation: (Math.random() - 0.5) * 0.4,
                    rotationSpeed: (Math.random() - 0.5) * 0.003,
                    bitmap: getNoteBitmap(glyph, size, color),
                    bitmapSize: size,
                };
            });

            const resizeCanvas = () => {
                width = window.innerWidth;
                height = window.innerHeight;
                const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
                canvas.width = Math.floor(width * dpr);
                canvas.height = Math.floor(height * dpr);
                ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
                notes = buildNotes();
            };

            const drawScene = () => {
                ctx.clearRect(0, 0, width, height);

                // Draw 3 subtle staff lines across screen
                ctx.strokeStyle = 'rgba(255,153,0,0.04)';
                ctx.lineWidth = 0.8;
                for (let i = 1; i <= 3; i++) {
                    const y = (height * i / 4 - scrollOffset * 0.05) % height;
                    ctx.beginPath();
                    ctx.moveTo(0, y);
                    ctx.lineTo(width, y);
                    ctx.stroke();
                }

                // Draw notes using cached bitmaps
                for (const note of notes) {
                    note.y -= note.speed;
                    note.rotation += note.rotationSpeed;
                    if (note.y < -60) {
                        note.y = height + 60;
                        note.x = Math.random() * width;
                    }

                    ctx.save();
                    ctx.globalAlpha = note.opacity;
                    ctx.translate(note.x, note.y);
                    ctx.rotate(note.rotation);
                    const bs = note.bitmapSize;
                    ctx.drawImage(note.bitmap, -bs, -bs, bs * 2, bs * 2);
                    ctx.restore();
                }
            };

            const loop = () => {
                if (!isVisible) { animationFrameId = null; return; }
                drawScene();
                animationFrameId = requestAnimationFrame(loop);
            };

            subscribeToScroll((event) => {
                scrollOffset = event.scroll || window.scrollY;
            });

            // Pause when tab hidden
            document.addEventListener('visibilitychange', () => {
                isVisible = !document.hidden;
                if (isVisible && !animationFrameId) {
                    animationFrameId = requestAnimationFrame(loop);
                }
            });

            // Debounce resize
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(resizeCanvas, 200);
            }, { passive: true });

            resizeCanvas();
            animationFrameId = requestAnimationFrame(loop);
        }
    }

    // ==========================================
    // CUSTOM CURSOR — Batched RAF
    // ==========================================
    if (allowInteractiveCursor && cursor && follower) {
        // Use gsap quickSetters for zero-GC cursor movement
        const setCursorX = gsap.quickSetter(cursor, 'x', 'px');
        const setCursorY = gsap.quickSetter(cursor, 'y', 'px');
        const moveFollowerX = gsap.quickTo(follower, 'x', { duration: 0.15, ease: 'power2.out' });
        const moveFollowerY = gsap.quickTo(follower, 'y', { duration: 0.15, ease: 'power2.out' });

        // Phone parallax (only on desktop)
        const movePhoneX = phoneScene ? gsap.quickTo(phoneScene, 'x', { duration: 1.4, ease: 'power3.out' }) : null;
        const movePhoneY = phoneScene ? gsap.quickTo(phoneScene, 'y', { duration: 1.4, ease: 'power3.out' }) : null;
        const rotatePhoneY = phoneScene ? gsap.quickTo(phoneScene, 'rotationY', { duration: 1.4, ease: 'power3.out' }) : null;
        const rotatePhoneX = phoneScene ? gsap.quickTo(phoneScene, 'rotationX', { duration: 1.4, ease: 'power3.out' }) : null;

        let pointerX = window.innerWidth / 2;
        let pointerY = window.innerHeight / 2;
        let pointerDirty = false;

        const renderPointer = () => {
            setCursorX(pointerX);
            setCursorY(pointerY);
            moveFollowerX(pointerX);
            moveFollowerY(pointerY);

            if (movePhoneX && movePhoneY && rotatePhoneX && rotatePhoneY) {
                const xPct = (pointerX / window.innerWidth - 0.5) * 2;
                const yPct = (pointerY / window.innerHeight - 0.5) * 2;
                movePhoneX(xPct * 12);
                movePhoneY(yPct * 12);
                rotatePhoneY(5 + xPct * 4);
                rotatePhoneX(20 + yPct * 4);
            }
            pointerDirty = false;
        };

        window.addEventListener('mousemove', (e) => {
            pointerX = e.clientX;
            pointerY = e.clientY;
            if (!pointerDirty) {
                pointerDirty = true;
                requestAnimationFrame(renderPointer);
            }
        }, { passive: true });

        // Spotlight effect for cursor-aware elements
        cursorAwareElements.forEach((el) => {
            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                el.style.setProperty('--cursor-x', `${e.clientX - rect.left}px`);
                el.style.setProperty('--cursor-y', `${e.clientY - rect.top}px`);
            }, { passive: true });

            el.addEventListener('mouseleave', () => {
                el.style.removeProperty('--cursor-x');
                el.style.removeProperty('--cursor-y');
            });
        });

        // Magnetic effect — throttled per element, uses quickTo
        magneticElements.forEach((el) => {
            const quickX = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
            const quickY = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
            let magDirty = false;
            let magX = 0, magY = 0;

            el.addEventListener('mousemove', (e) => {
                const rect = el.getBoundingClientRect();
                magX = (e.clientX - rect.left - rect.width / 2) * 0.3;
                magY = (e.clientY - rect.top - rect.height / 2) * 0.3;
                if (!magDirty) {
                    magDirty = true;
                    requestAnimationFrame(() => {
                        follower.classList.add('cursor-hover');
                        quickX(magX);
                        quickY(magY);
                        magDirty = false;
                    });
                }
            });

            el.addEventListener('mouseleave', () => {
                follower.classList.remove('cursor-hover');
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)', overwrite: 'auto' });
            });
        });
    }

    // ==========================================
    // PRELOADER
    // ==========================================
    let preloaderHidden = false;

    const hidePreloader = () => {
        if (!preloader || preloaderHidden) return;
        preloaderHidden = true;

        gsap.to(preloader, {
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => { preloader.style.display = 'none'; }
        });
    };

    if (preloader) {
        window.addEventListener('load', hidePreloader, { once: true });
        window.setTimeout(hidePreloader, 1200);
    }

    // ==========================================
    // NAVBAR SCROLL BEHAVIOUR  — CSS class only
    // ==========================================
    const navInner = document.querySelector('.nav-inner');
    if (navInner) {
        let navHidden = false;
        let lastNavScrollY = window.scrollY;

        subscribeToScroll((event) => {
            const currentY = event.scroll || window.scrollY;
            const scrollingDown = currentY > lastNavScrollY;
            const scrolledPast = currentY > 80;
            lastNavScrollY = currentY;

            if (scrolledPast && scrollingDown && !navHidden) {
                navHidden = true;
                gsap.to(navInner, { y: -120, duration: 0.4, ease: 'power3.in', overwrite: 'auto' });
            } else if ((!scrollingDown || !scrolledPast) && navHidden) {
                navHidden = false;
                gsap.to(navInner, { y: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
            }
        });
    }

    // ==========================================
    // PIANO KEYS
    // ==========================================
    document.querySelectorAll('.pk, .mini-key').forEach((key) => {
        key.addEventListener('mousedown', () => {
            gsap.to(key, { scaleY: 0.94, y: 3, duration: 0.08, ease: 'power2.out' });
        }, { passive: true });

        key.addEventListener('mouseup', () => {
            gsap.to(key, { scaleY: 1, y: 0, duration: 0.35, ease: 'elastic.out(1, 0.4)' });
        }, { passive: true });

        key.addEventListener('mouseleave', () => {
            gsap.to(key, { scaleY: 1, y: 0, duration: 0.35, ease: 'elastic.out(1, 0.4)' });
        });
    });

    // ==========================================
    // TRANSITION TITLE ANIMATION
    // ==========================================
    gsap.from('.transition-title', {
        scrollTrigger: {
            trigger: '.transition-title-container',
            start: 'top 85%',
            end: 'top 50%',
            scrub: 1,
        },
        opacity: 0,
        y: 40,
        ease: 'power2.out'
    });

    gsap.from('.transition-line', {
        scrollTrigger: {
            trigger: '.transition-title-container',
            start: 'top 85%',
            end: 'top 50%',
            scrub: 1,
        },
        height: 0,
        opacity: 0,
        ease: 'power2.out'
    });

    // ==========================================
    // SCREEN IMAGE PRELOADS  — Idle callback
    // ==========================================
    const screenSources = [
        'assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 12.04.41.png',
        'assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 12.04.46.png',
        'assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 12.05.03.png',
        'assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 16.56.09.png',
        'assets/Simulator Screenshot - iPhone 17 - 2026-04-01 at 13.30.55.png'
    ];

    const preloadScreens = () => {
        screenSources.forEach((src) => {
            const img = new Image();
            img.decoding = 'async';
            img.src = src;
        });
    };

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(preloadScreens, { timeout: 1500 });
    } else {
        window.setTimeout(preloadScreens, 400);
    }

    // ==========================================
    // CORE MASTER TIMELINE — Phone Scroll
    // ==========================================
    if (phoneScene && appScreenImg) {
        let currentSrc = appScreenImg.getAttribute('src');
        const setScreenImage = (src) => {
            if (currentSrc !== src) {
                currentSrc = src;
                appScreenImg.src = src;
            }
        };

        const text1 = document.getElementById('text-1');
        const text2 = document.getElementById('text-2');
        const text3 = document.getElementById('text-3');
        const text4 = document.getElementById('text-4');

        gsap.set(phoneScene, {
            left: '50%',
            top: '200%',
            scale: 1.1,
            rotationY: 0,
            rotationX: 10,
            rotationZ: 0
        });

        const masterTl = gsap.timeline({
            scrollTrigger: {
                trigger: '.showcase-area',
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: 1.2
            }
        });

        masterTl.to('#glow-orb', { top: '80vh', scale: 1.5, duration: 6, ease: 'none' }, 0);

        masterTl.to(phoneScene, {
            left: '25%',
            top: '50%',
            scale: 1.0,
            rotationY: 30,
            rotationX: 5,
            rotationZ: 0,
            duration: 1.5,
            ease: 'power2.inOut',
            onStart: () => setScreenImage('assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 12.04.46.png'),
            onReverseComplete: () => setScreenImage('assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 12.04.41.png')
        }, 0);

        masterTl.to(text1, { opacity: 1, y: -20, duration: 0.5 }, 0.5);
        masterTl.to(text1, { opacity: 0, y: -40, duration: 0.5 }, 1.5);

        masterTl.to(phoneScene, { left: '75%', duration: 1.5, ease: 'power2.inOut' }, 1.5);
        masterTl.to(phoneScene, {
            rotationY: 0,
            rotationX: 0,
            rotationZ: -90,
            scale: 0.9,
            duration: 1.5,
            ease: 'power1.inOut',
            onStart: () => setScreenImage('assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 12.05.03.png'),
            onReverseComplete: () => setScreenImage('assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 12.04.46.png')
        }, 1.5);

        masterTl.to(text2, { opacity: 1, y: -20, duration: 0.5 }, 2);
        masterTl.to(text2, { opacity: 0, y: -40, duration: 0.5 }, 3);

        masterTl.to(phoneScene, { left: '30%', duration: 1.5, ease: 'power2.inOut' }, 3);
        masterTl.to(phoneScene, {
            rotationY: 25,
            rotationX: 10,
            rotationZ: -10,
            scale: 1.0,
            duration: 1.5,
            ease: 'power1.inOut',
            onStart: () => setScreenImage('assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 16.56.09.png'),
            onReverseComplete: () => setScreenImage('assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 12.05.03.png')
        }, 3);

        masterTl.to(text3, { opacity: 1, y: -20, duration: 0.5 }, 3.5);
        masterTl.to(text3, { opacity: 0, y: -40, duration: 0.5 }, 4.5);

        masterTl.to(phoneScene, { left: '70%', duration: 1.5, ease: 'power2.inOut' }, 4.5);
        masterTl.to(phoneScene, {
            rotationY: -20,
            rotationX: 15,
            rotationZ: 0,
            duration: 1.5,
            ease: 'power1.inOut',
            onStart: () => setScreenImage('assets/Simulator Screenshot - iPhone 17 - 2026-04-01 at 13.30.55.png'),
            onReverseComplete: () => setScreenImage('assets/Simulator Screenshot - iPhone 17 Pro - 2026-04-01 at 16.56.09.png')
        }, 4.5);

        masterTl.to(text4, { opacity: 1, y: -20, duration: 0.5 }, 5);
        masterTl.to(text4, { opacity: 0, y: -40, duration: 0.5 }, 6);

        gsap.to(phoneScene, {
            scrollTrigger: {
                trigger: '.footer-cta',
                start: 'top bottom',
                end: 'top center',
                scrub: true
            },
            y: '-100vh',
            scale: 0.5,
            opacity: 0,
            ease: 'power2.in'
        });
    }
});
