// ═══════════════════════════════════════════
// KNEXPAY CARD — Wobble + Hex + Micro Glitter
// ═══════════════════════════════════════════

(function() {
    const wrapper = document.getElementById('knexpayCard');
    if (!wrapper) return;

    const card = wrapper.querySelector('.knexpay-card');
    const canvas = document.getElementById('cardGlitter');
    const hexSpans = wrapper.querySelectorAll('.hex-number');
    const hexChars = '0123456789ABCDEF';

    // ── Mouse Wobble Tilt ──
    let cardRect = null;
    let tiltX = 0, tiltY = 0;
    let targetTiltX = 0, targetTiltY = 0;
    let isHovering = false;

    function updateRect() {
        cardRect = wrapper.getBoundingClientRect();
    }

    wrapper.addEventListener('mouseenter', () => {
        isHovering = true;
        updateRect();
    });

    wrapper.addEventListener('mouseleave', () => {
        isHovering = false;
        targetTiltX = 0;
        targetTiltY = 0;
    });

    wrapper.addEventListener('mousemove', (e) => {
        if (!cardRect) return;
        const x = (e.clientX - cardRect.left) / cardRect.width;
        const y = (e.clientY - cardRect.top) / cardRect.height;
        targetTiltX = (y - 0.5) * -12;
        targetTiltY = (x - 0.5) * 12;
    });

    // Subtle ambient wobble when not hovering
    let ambientTime = 0;

    function animateTilt() {
        requestAnimationFrame(animateTilt);
        ambientTime += 0.008;

        if (!isHovering) {
            targetTiltX = Math.sin(ambientTime) * 1.5;
            targetTiltY = Math.cos(ambientTime * 0.7) * 1.5;
        }

        tiltX += (targetTiltX - tiltX) * 0.08;
        tiltY += (targetTiltY - tiltY) * 0.08;

        card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }
    animateTilt();

    // ── Hex Number Cycling ──
    function randomHex() {
        return hexChars[Math.floor(Math.random() * 16)] + hexChars[Math.floor(Math.random() * 16)];
    }

    function cycleHex() {
        hexSpans.forEach(span => {
            span.textContent = randomHex();
        });
    }
    setInterval(cycleHex, 2000);

    // Quick scramble effect
    function scrambleHex() {
        let count = 0;
        const interval = setInterval(() => {
            hexSpans.forEach(span => {
                span.textContent = randomHex();
            });
            count++;
            if (count > 5) clearInterval(interval);
        }, 60);
    }
    setInterval(scrambleHex, 4000);

    // ── Micro Glitter Particles (Canvas 2D - lightweight) ──
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    const PARTICLE_COUNT = 150;

    function resizeCanvas() {
        const rect = card.getBoundingClientRect();
        canvas.width = rect.width * Math.min(window.devicePixelRatio, 2);
        canvas.height = rect.height * Math.min(window.devicePixelRatio, 2);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create glitter particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 0.5,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: (Math.random() - 0.5) * 0.3,
            phase: Math.random() * Math.PI * 2,
            twinkleSpeed: Math.random() * 3 + 1,
            color: Math.random() > 0.5 ? 'rgba(255,255,255,' :
                   Math.random() > 0.5 ? 'rgba(180,220,255,' : 'rgba(200,255,200,'
        });
    }

    let glitterTime = 0;
    let lightX = 0.5, lightY = 0.5;

    // Track mouse only when hovering the card
    wrapper.addEventListener('mousemove', (e) => {
        if (!cardRect) updateRect();
        if (cardRect && isHovering) {
            lightX = (e.clientX - cardRect.left) / cardRect.width;
            lightY = (e.clientY - cardRect.top) / cardRect.height;
        }
    });

    function animateGlitter() {
        requestAnimationFrame(animateGlitter);
        glitterTime += 0.02;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Ambient light sweep when not hovering — slow figure-8 pattern
        if (!isHovering) {
            lightX = 0.5 + Math.sin(glitterTime * 0.4) * 0.4;
            lightY = 0.5 + Math.sin(glitterTime * 0.6) * 0.35;
        }

        // Light reflection gradient
        const gradX = lightX * canvas.width;
        const gradY = lightY * canvas.height;
        const grad = ctx.createRadialGradient(gradX, gradY, 0, gradX, gradY, canvas.width * 0.6);
        grad.addColorStop(0, 'rgba(255,255,255,0.05)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            // Twinkle
            const twinkle = Math.sin(glitterTime * p.twinkleSpeed + p.phase);
            const alpha = Math.max(0, twinkle * 0.7 + 0.15);

            if (alpha > 0.05) {
                // Brighter near the light reflection point
                const dx = p.x - gradX;
                const dy = p.y - gradY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const proximity = Math.max(0, 1 - dist / (canvas.width * 0.5));
                const finalAlpha = alpha * (0.4 + proximity * 0.6);

                ctx.fillStyle = p.color + finalAlpha.toFixed(2) + ')';
                ctx.beginPath();

                // Draw tiny diamond shape for glitter
                const s = p.size * (1 + proximity * 0.5);
                ctx.moveTo(p.x, p.y - s);
                ctx.lineTo(p.x + s * 0.6, p.y);
                ctx.lineTo(p.x, p.y + s);
                ctx.lineTo(p.x - s * 0.6, p.y);
                ctx.closePath();
                ctx.fill();

                // Tiny star burst for brightest particles
                if (finalAlpha > 0.35 && proximity > 0.2) {
                    ctx.strokeStyle = p.color + (finalAlpha * 0.5).toFixed(2) + ')';
                    ctx.lineWidth = 0.5;
                    ctx.beginPath();
                    ctx.moveTo(p.x - s * 2, p.y);
                    ctx.lineTo(p.x + s * 2, p.y);
                    ctx.moveTo(p.x, p.y - s * 2);
                    ctx.lineTo(p.x, p.y + s * 2);
                    ctx.stroke();
                }
            }

            // Subtle drift
            p.x += p.speedX;
            p.y += p.speedY;

            // Wrap around
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;
        });
    }
    animateGlitter();

})();
