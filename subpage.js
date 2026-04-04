/**
 * subpage.js — Lightweight navbar script for Terms & Privacy pages.
 * Avoids loading the full GSAP/ScrollTrigger/Canvas stack on sub-pages.
 */
(function () {
    'use strict';

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const allowCursor = !isTouchDevice && !isSmallScreen;

    // Apply system cursor on touch/mobile
    if (!allowCursor) {
        document.body.classList.add('system-cursor');
    }

    // Restore saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        const icon = document.querySelector('.theme-icon');
        if (icon) icon.textContent = 'light_mode';
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle?.querySelector('.theme-icon');
    themeToggle?.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-mode');
        if (themeIcon) themeIcon.textContent = isLight ? 'light_mode' : 'dark_mode';
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    });

    // Navbar hide-on-scroll (pure rAF, no GSAP needed)
    const navInner = document.querySelector('.nav-inner');
    if (navInner) {
        let lastY = window.scrollY;
        let hidden = false;
        let rafId = null;

        const onScroll = () => {
            if (rafId) return;
            rafId = requestAnimationFrame(() => {
                rafId = null;
                const y = window.scrollY;
                const down = y > lastY && y > 60;
                lastY = y;

                if (down && !hidden) {
                    hidden = true;
                    navInner.style.transform = 'translateY(-120px)';
                    navInner.style.transition = 'transform 0.4s cubic-bezier(0.4,0,1,1)';
                } else if (!down && hidden) {
                    hidden = false;
                    navInner.style.transform = 'translateY(0)';
                    navInner.style.transition = 'transform 0.4s cubic-bezier(0,0,0.2,1)';
                }
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Lightweight magnetic effect (no GSAP)
    if (allowCursor) {
        // Custom cursor
        const cursor = document.getElementById('cursor');
        const follower = document.getElementById('cursor-follower');

        if (cursor && follower) {
            let cx = -100, cy = -100;
            let fx = -100, fy = -100;
            let dirtyPointer = false;

            const lerp = (a, b, t) => a + (b - a) * t;

            const renderCursor = () => {
                fx = lerp(fx, cx, 0.12);
                fy = lerp(fy, cy, 0.12);

                cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
                follower.style.transform = `translate(${fx}px, ${fy}px) translate(-50%, -50%)`;

                requestAnimationFrame(renderCursor);
            };

            window.addEventListener('mousemove', (e) => {
                cx = e.clientX;
                cy = e.clientY;
            }, { passive: true });

            renderCursor();
        }

        // Magnetic links
        document.querySelectorAll('.data-magnetic').forEach((el) => {
            let tx = 0, ty = 0;
            let animId = null;

            const lerpEl = () => {
                tx *= 0.75;
                ty *= 0.75;
                el.style.transform = `translate(${tx}px, ${ty}px)`;
                if (Math.abs(tx) > 0.1 || Math.abs(ty) > 0.1) {
                    animId = requestAnimationFrame(lerpEl);
                } else {
                    el.style.transform = '';
                    animId = null;
                }
            };

            el.addEventListener('mousemove', (e) => {
                const r = el.getBoundingClientRect();
                tx = (e.clientX - r.left - r.width / 2) * 0.28;
                ty = (e.clientY - r.top - r.height / 2) * 0.28;
                el.style.transform = `translate(${tx}px, ${ty}px)`;
                if (follower) follower.classList.add('cursor-hover');
            });

            el.addEventListener('mouseleave', () => {
                if (follower) follower.classList.remove('cursor-hover');
                if (!animId) animId = requestAnimationFrame(lerpEl);
            });
        });
    }
})();
