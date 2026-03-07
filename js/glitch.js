// ═══════════════════════════════════════════════════════════════
// GENESIS GLITCH ENGINE v2 — adapted from KnexKeys
// Rainbow Spectrum + Per-Character Decrypt + Scanlines + Hover
// ═══════════════════════════════════════════════════════════════
(function() {
    const glitchElement = document.querySelector('.glitch');
    if (!glitchElement) return;

    const glitchText = glitchElement.getAttribute('data-text');
    const chars = glitchElement.querySelectorAll('.glitch-char');

    const glitchStyle = document.createElement('style');
    document.head.appendChild(glitchStyle);
    const rainbowStyle = document.createElement('style');
    document.head.appendChild(rainbowStyle);

    const whiteout = document.createElement('div');
    whiteout.className = 'glitch-whiteout';
    document.body.appendChild(whiteout);

    // Utilities
    const rand = (min, max) => Math.random() * (max - min) + min;
    const randInt = (min, max) => Math.floor(rand(min, max));
    const chance = (percent) => Math.random() < percent / 100;
    const pick = (arr) => arr[randInt(0, arr.length)];

    const randomBezier = () => {
        const curves = [
            () => `cubic-bezier(${rand(0.7,1)},${rand(-0.5,0.5)},${rand(0,0.3)},${rand(0.8,1.2)})`,
            () => `cubic-bezier(${rand(0.2,0.4)},${rand(1,1.8)},${rand(0.4,0.8)},${rand(0.8,1)})`,
            () => `cubic-bezier(${rand(0.6,0.9)},${rand(-0.3,0)},${rand(0.1,0.4)},${rand(1.1,1.5)})`,
            () => `steps(${randInt(2,8)}, ${pick(['start','end','jump-both'])})`,
        ];
        return pick(curves)();
    };

    // Rainbow Spectrum
    let hue = 0;
    const HUE_SPEED = 0.5;

    function hslToHex(h, s, l) {
        s /= 100; l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => { const k = (n + h / 30) % 12; return Math.round(255 * (l - a * Math.max(Math.min(k-3,9-k,1),-1))).toString(16).padStart(2,'0'); };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    let isHovering = false;
    let hoverIntensity = 1;

    function updateRainbow() {
        hue = (hue + HUE_SPEED) % 360;
        const mainColor = hslToHex(hue, 100, 55);
        const topColor = hslToHex((hue + 60) % 360, 100, 55);
        const botColor = hslToHex((hue + 180) % 360, 100, 75);

        glitchElement.style.color = mainColor;
        if (!isHovering) {
            glitchElement.style.textShadow = `0 0 10px ${mainColor}, 0 0 20px ${mainColor}, 0 0 40px ${mainColor}, 0 0 80px ${mainColor}88`;
        }
        chars.forEach((ch, i) => { ch.style.color = hslToHex((hue + i * 30) % 360, 100, 55); });
        rainbowStyle.textContent = `.glitch::before { color: ${topColor} !important; text-shadow: 0 0 10px ${topColor}, 0 0 20px ${topColor}, 0 0 40px ${topColor} !important; } .glitch::after { color: ${botColor} !important; text-shadow: 0 0 10px ${botColor}, 0 0 20px ${botColor}, 0 0 30px ${botColor} !important; }`;
        requestAnimationFrame(updateRainbow);
    }
    requestAnimationFrame(updateRainbow);

    // Hover — chromatic aberration
    glitchElement.addEventListener('mouseenter', () => {
        isHovering = true; hoverIntensity = 4;
        const c1 = hslToHex((hue+90)%360,100,60), c2 = hslToHex((hue+270)%360,100,60);
        glitchElement.style.textShadow = `8px 0 ${c1}, -8px 0 ${c2}, 0 0 20px ${hslToHex(hue,100,55)}, 0 0 60px ${hslToHex(hue,100,55)}`;
    });
    glitchElement.addEventListener('mouseleave', () => {
        isHovering = false;
        setTimeout(() => { hoverIntensity = 2; }, 100);
        setTimeout(() => { hoverIntensity = 1; }, 300);
    });

    // Duration generator
    const randomDuration = () => {
        const speeds = [() => randInt(8,25), () => randInt(25,50), () => randInt(50,100), () => randInt(100,180)];
        const weights = [50, 30, 15, 5];
        const total = weights.reduce((a,b)=>a+b);
        let r = rand(0, total);
        for (let i = 0; i < weights.length; i++) { r -= weights[i]; if (r <= 0) return speeds[i](); }
        return speeds[0]();
    };

    // Per-Character Decrypt Sequence
    const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!█▓▒░ΓΞΨΩφ∞◊◆';
    let decryptRunning = false;

    function decryptSequence() {
        if (decryptRunning) return;
        decryptRunning = true;
        const original = glitchText.split('');
        const resolved = new Array(original.length).fill(false);
        let currentIndex = 0;

        chars.forEach(ch => { ch.textContent = scrambleChars[randInt(0, scrambleChars.length)]; });

        function resolveNext() {
            if (currentIndex >= original.length) {
                glitchElement.setAttribute('data-text', glitchText);
                decryptRunning = false; return;
            }
            let cycles = randInt(3, 8);
            const cycleInterval = setInterval(() => {
                if (cycles <= 0) {
                    clearInterval(cycleInterval);
                    chars[currentIndex].textContent = original[currentIndex];
                    resolved[currentIndex] = true;
                    const dataText = original.map((c,i) => resolved[i] ? c : scrambleChars[randInt(0,scrambleChars.length)]).join('');
                    glitchElement.setAttribute('data-text', dataText);
                    currentIndex++;
                    setTimeout(resolveNext, randInt(30, 80));
                    return;
                }
                chars[currentIndex].textContent = scrambleChars[randInt(0, scrambleChars.length)];
                cycles--;
            }, randInt(20, 40));
            chars.forEach((ch, i) => { if (!resolved[i] && i !== currentIndex) ch.textContent = scrambleChars[randInt(0, scrambleChars.length)]; });
        }
        resolveNext();
    }

    function scheduleDecrypt() { setTimeout(() => { decryptSequence(); scheduleDecrypt(); }, randInt(5000, 8000)); }
    setTimeout(() => { decryptSequence(); scheduleDecrypt(); }, 2000);

    // Per-Character Jitter
    function charJitter() {
        if (decryptRunning) { setTimeout(charJitter, randInt(200, 500)); return; }
        const count = randInt(1, 4);
        for (let n = 0; n < count; n++) {
            const i = randInt(0, chars.length); const ch = chars[i];
            const x = rand(-4,4)*hoverIntensity, y = rand(-3,3)*hoverIntensity;
            ch.style.transform = `translate(${x}px, ${y}px)`;
            ch.style.opacity = chance(30) ? rand(0.3, 0.8) : '1';
            setTimeout(() => { ch.style.transform = 'none'; ch.style.opacity = '1'; }, randInt(30, 80));
        }
        setTimeout(charJitter, randInt(80, 250));
    }
    setTimeout(charJitter, 500);

    // Main Slice Glitch Engine
    let glitchIntensity = 1;

    function randomGlitch() {
        const duration = randomDuration();
        const nextGlitch = duration + randInt(0, 25);
        const intensity = glitchIntensity * hoverIntensity;
        const mainEase = randomBezier(), topEase = randomBezier(), botEase = randomBezier();
        const mainDur = duration + randInt(-10,20), topDur = duration + randInt(-15,25), botDur = duration + randInt(-15,25);

        if (chance(8)) { glitchIntensity = rand(2, 6); setTimeout(() => { glitchIntensity = 1; }, randInt(60, 250)); }

        const topX = rand(-30,30)*intensity, topY = rand(-10,10)*intensity, topClip = rand(25,58), topSkew = rand(-12,12)*intensity;
        const topScale = chance(20) ? rand(0.93,1.07) : 1, topRotate = chance(12) ? rand(-4,4) : 0;
        const botX = rand(-30,30)*intensity, botY = rand(-10,10)*intensity, botClip = rand(42,75), botSkew = rand(-12,12)*intensity;
        const botScale = chance(20) ? rand(0.93,1.07) : 1, botRotate = chance(12) ? rand(-4,4) : 0;
        const mainSkew = rand(-5,5)*intensity, mainX = rand(-8,8)*intensity, mainY = rand(-3,3)*intensity, mainRotate = chance(10) ? rand(-3,3) : 0;
        const topOpacity = chance(22) ? rand(0.15,0.85) : 1, botOpacity = chance(22) ? rand(0.15,0.85) : 1;
        const sliceOffset = chance(30) ? rand(-5,5) : 0, gapSize = chance(40) ? rand(-5,20) : 10;

        let verticalCSS = '';
        if (chance(6)) {
            const sp = rand(30,70), lx = rand(-20,20)*intensity, rx = rand(-20,20)*intensity;
            verticalCSS = `.glitch::before { clip-path: polygon(0 0, ${sp}% 0, ${sp}% 100%, 0 100%) !important; transform: translateX(${lx}px) skewY(${rand(-3,3)}deg) !important; } .glitch::after { clip-path: polygon(${sp}% 0, 100% 0, 100% 100%, ${sp}% 100%) !important; transform: translateX(${rx}px) skewY(${rand(-3,3)}deg) !important; }`;
        }

        glitchStyle.textContent = `.glitch { transform: skewX(${mainSkew}deg) translate(${mainX}px, ${mainY}px) rotate(${mainRotate}deg); transition: transform ${mainDur}ms ${mainEase}; } .glitch::before { transform: translateX(${topX}px) translateY(${topY}px) skewX(${topSkew}deg) scaleX(${topScale}) rotate(${topRotate}deg); clip-path: polygon(0 0, 100% 0, 100% ${topClip}%, 0 ${topClip+sliceOffset}%); opacity: ${topOpacity}; transition: transform ${topDur}ms ${topEase}, clip-path ${topDur}ms ${topEase}, opacity ${randInt(10,50)}ms ${pick(['linear','ease-out','steps(2)'])}; } .glitch::after { transform: translateX(${botX}px) translateY(${botY}px) skewX(${botSkew}deg) scaleX(${botScale}) rotate(${botRotate}deg); clip-path: polygon(0 ${botClip-gapSize}%, 100% ${botClip-gapSize+sliceOffset}%, 100% 100%, 0 100%); opacity: ${botOpacity}; transition: transform ${botDur}ms ${botEase}, clip-path ${botDur}ms ${botEase}, opacity ${randInt(10,50)}ms ${pick(['linear','ease-out','steps(2)'])}; } ${verticalCSS}`;

        if (chance(12)) {
            const splitX = rand(4,18)*(chance(50)?1:-1), splitY = rand(0,5)*(chance(50)?1:-1);
            const c1 = hslToHex((hue+90)%360,100,60), c2 = hslToHex((hue+270)%360,100,60);
            glitchElement.style.transition = `text-shadow ${randInt(30,100)}ms ${randomBezier()}`;
            glitchElement.style.textShadow = `${splitX}px ${splitY}px ${c1}, ${-splitX}px ${-splitY}px ${c2}, 0 0 10px ${hslToHex(hue,100,55)}, 0 0 20px ${hslToHex(hue,100,55)}`;
        }

        if (chance(6)) {
            const flickerDur = randInt(10,35);
            glitchElement.style.transition = `opacity ${flickerDur}ms steps(1)`;
            glitchElement.style.opacity = rand(0,0.3);
            setTimeout(() => { glitchElement.style.transition = `opacity ${randInt(8,20)}ms steps(1)`; glitchElement.style.opacity = '1'; }, flickerDur);
        }

        if (chance(4) && !decryptRunning) {
            const sc = 'APRIL22!@#$%^&*ΓΕΝΕΣΙΣ01█▓▒░φ<>∞◊◆';
            const scrambled = glitchText.split('').map(c => chance(45) ? sc[randInt(0,sc.length)] : c).join('');
            glitchElement.setAttribute('data-text', scrambled);
            setTimeout(() => { glitchElement.setAttribute('data-text', glitchText); }, randInt(20,70));
        }

        if (chance(10)) {
            setTimeout(() => {
                const bx = rand(-45,45), be = randomBezier();
                glitchStyle.textContent += `.glitch::before { transform: translateX(${bx}px) !important; transition: transform ${randInt(15,35)}ms ${be} !important; } .glitch::after { transform: translateX(${-bx}px) !important; transition: transform ${randInt(15,35)}ms ${be} !important; }`;
            }, duration * 0.4);
        }

        if (chance(1.5)) { whiteout.classList.add('flash'); setTimeout(() => { whiteout.classList.remove('flash'); }, randInt(30,60)); }

        setTimeout(randomGlitch, nextGlitch);
    }

    // Occasional Reset
    function occasionalReset() {
        if (chance(12)) {
            const rd = randInt(60,180), re = `cubic-bezier(${rand(0.2,0.4)},0,${rand(0.4,0.6)},1)`;
            glitchStyle.textContent = `.glitch { transform: none; transition: transform ${rd}ms ${re}; } .glitch::before { transform: none; clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%); opacity: 1; transition: all ${rd}ms ${re}; } .glitch::after { transform: none; clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%); opacity: 1; transition: all ${rd}ms ${re}; }`;
            chars.forEach(ch => { ch.style.transform = 'none'; ch.style.opacity = '1'; });
        }
        setTimeout(occasionalReset, randInt(300, 1000));
    }

    randomGlitch();
    setTimeout(occasionalReset, 800);
})();
