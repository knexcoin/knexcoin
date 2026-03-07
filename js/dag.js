// DAG BLOCK-LATTICE VISUALIZATION - Fibonacci acceleration
(function initDAGVisualization() {
    const canvas = document.getElementById('dag-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // ═══════════════════════════════════════════════════════════════
    // ANIMATION ENGINE - Clean State Machine Approach
    // ═══════════════════════════════════════════════════════════════

    const CONFIG = {
        STEPS_PER_CYCLE: 4,
        CYCLE1_REPETITIONS: 20,       // Cycle 1: 20 iterations of steps 1-4
        CYCLE1_START_DURATION: 400,   // Cycle 1 starts at 400ms per step
        CYCLE1_END_DURATION: 80,      // Cycle 1 ends at 80ms (matches cycle 2 start)
        CYCLE2_MINI_CYCLES: 250,      // Cycle 2: 250 mini-cycles of 4 steps
        CYCLE2_START_DURATION: 80,    // Cycle 2 starts at 80ms per step
        CYCLE2_END_DURATION: 2,       // Cycle 2 ends at 2ms per step
        PAUSE_DURATION: 2000,         // Click pause duration (ms)
        LIGHTNING_SLOW_PORTION: 0.33, // First 1/3 of time
        LIGHTNING_SLOW_DISTANCE: 0.1  // Covers 10% of distance
    };

    // Chain structure: A, B, C with S (send) and R (receive) nodes
    const CHAINS = [
        { label: 'A', nodes: ['S', 'S', 'R', 'S'] },
        { label: 'B', nodes: ['R', 'S', 'R', 'S'] },
        { label: 'C', nodes: ['S', 'R', 'S', 'R'] }
    ];

    // Fixed connections for cycle 1
    const CYCLE1_CONNECTIONS = [
        { from: [0, 0], to: [1, 0] },  // A[0] → B[0]
        { from: [1, 1], to: [2, 1] },  // B[1] → C[1]
        { from: [2, 2], to: [0, 2] },  // C[2] → A[2]
        { from: [0, 3], to: [2, 3] }   // A[3] → C[3]
    ];

    // State
    const state = {
        inCycle2: false,          // Are we in cycle 2?
        stepInCycle: 0,           // 0-3 within current cycle
        cycle1Count: 0,           // For cycle 1: which repetition (0-1, need 2 total)
        miniCycleCount: 0,        // For cycle 2: which mini-cycle (0-249)
        stepStartTime: 0,
        isPaused: false,
        pauseEndTime: 0,
        pausedAtStep: null,
        cycle2Connections: []     // Shuffled connections for cycle 2
    };

    // ═══════════════════════════════════════════════════════════════
    // VALID CONNECTIONS GENERATOR
    // ═══════════════════════════════════════════════════════════════

    function generateValidConnections() {
        const connections = [];
        CHAINS.forEach((fromChain, fromChainIdx) => {
            fromChain.nodes.forEach((fromType, fromNodeIdx) => {
                if (fromType === 'S') {
                    CHAINS.forEach((toChain, toChainIdx) => {
                        if (toChainIdx !== fromChainIdx) {
                            toChain.nodes.forEach((toType, toNodeIdx) => {
                                if (toType === 'R') {
                                    connections.push({
                                        from: [fromChainIdx, fromNodeIdx],
                                        to: [toChainIdx, toNodeIdx]
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
        return connections;
    }

    function shuffleArray(arr) {
        const shuffled = [...arr];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    function prepareCycle2() {
        const all = generateValidConnections();
        state.cycle2Connections = shuffleArray(all).slice(0, 4);
    }

    // ═══════════════════════════════════════════════════════════════
    // TIMING & EASING
    // ═══════════════════════════════════════════════════════════════

    function getStepDuration() {
        if (!state.inCycle2) {
            // Cycle 1: 20 iterations x 4 steps = 80 steps in ~8 seconds
            // Accelerates from 400ms to 80ms with cubic easing
            const totalSteps = CONFIG.CYCLE1_REPETITIONS * CONFIG.STEPS_PER_CYCLE;
            const currentStep = state.cycle1Count * CONFIG.STEPS_PER_CYCLE + state.stepInCycle;
            const t = currentStep / (totalSteps - 1);
            const eased = Math.pow(t, 3);  // Cubic: exponential acceleration
            return CONFIG.CYCLE1_START_DURATION - (CONFIG.CYCLE1_START_DURATION - CONFIG.CYCLE1_END_DURATION) * eased;
        } else {
            // Cycle 2: 250 mini-cycles x 4 steps = 1000 steps in ~8 seconds
            // Accelerates from 80ms to 2ms with cubic easing
            const totalSteps = CONFIG.CYCLE2_MINI_CYCLES * CONFIG.STEPS_PER_CYCLE;
            const currentStep = state.miniCycleCount * CONFIG.STEPS_PER_CYCLE + state.stepInCycle;
            const t = currentStep / (totalSteps - 1);
            const eased = Math.pow(t, 3);  // Cubic: exponential acceleration
            return CONFIG.CYCLE2_START_DURATION - (CONFIG.CYCLE2_START_DURATION - CONFIG.CYCLE2_END_DURATION) * eased;
        }
    }

    function lightningEase(t) {
        // First 1/3: slow (covers 10% distance)
        // Remaining 2/3: ultra fast (covers 90% distance)
        const { LIGHTNING_SLOW_PORTION: slow, LIGHTNING_SLOW_DISTANCE: dist } = CONFIG;
        if (t < slow) {
            return (t / slow) * dist;
        }
        const remaining = (t - slow) / (1 - slow);
        return dist + remaining * (1 - dist);
    }

    // ═══════════════════════════════════════════════════════════════
    // CONNECTION RESOLVER
    // ═══════════════════════════════════════════════════════════════

    function getCurrentConnection() {
        if (!state.inCycle2) {
            return CYCLE1_CONNECTIONS[state.stepInCycle];
        } else {
            return state.cycle2Connections[state.stepInCycle];
        }
    }

    function getDisplayStep() {
        return state.stepInCycle + 1;
    }

    function getConfig() {
        const w = canvas.width / window.devicePixelRatio;
        const h = canvas.height / window.devicePixelRatio;
        return {
            w, h,
            nodeRadius: 16,
            chainSpacing: 70,
            nodeSpacing: 72,
            startY: 55,
            centerX: w / 2
        };
    }

    function resizeCanvas() {
        const rect = canvas.parentElement.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }

    // ═══════════════════════════════════════════════════════════════
    // UI HELPERS
    // ═══════════════════════════════════════════════════════════════

    function setActiveStep(stepNum) {
        for (let i = 1; i <= 4; i++) {
            const el = document.getElementById('dagStep' + i);
            if (el) {
                el.classList.toggle('active', i === stepNum);
                el.classList.toggle('paused', state.isPaused && i === state.pausedAtStep);
            }
        }
    }

    function handleStepClick(stepNum) {
        state.isPaused = true;
        state.pausedAtStep = stepNum;
        state.pauseEndTime = Date.now() + CONFIG.PAUSE_DURATION;
        state.stepInCycle = stepNum - 1;  // Jump to step N
        state.inCycle2 = false;           // Return to cycle 1
        state.cycle1Count = 0;
        state.miniCycleCount = 0;
        state.stepStartTime = Date.now();
        prepareCycle2();  // Refresh cycle 2 connections
        setActiveStep(stepNum);
    }

    function setupStepClickHandlers() {
        for (let i = 1; i <= 4; i++) {
            const el = document.getElementById('dagStep' + i);
            if (el) {
                el.addEventListener('click', () => handleStepClick(i));
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // DRAWING FUNCTIONS
    // ═══════════════════════════════════════════════════════════════

    function drawNode(x, y, label, cfg, highlight = false, glowIntensity = 0) {
        const r = cfg.nodeRadius;

        // Glow effect - either from highlight or from random glow intensity
        if (glowIntensity > 0) {
            const glowRadius = r * (1.3 + glowIntensity * 0.5);
            const grad = ctx.createRadialGradient(x, y, r * 0.5, x, y, glowRadius);
            grad.addColorStop(0, `rgba(0,255,0,${0.15 + glowIntensity * 0.25})`);
            grad.addColorStop(1, 'rgba(0,255,0,0)');
            ctx.beginPath();
            ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        } else if (highlight) {
            const grad = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 1.8);
            grad.addColorStop(0, 'rgba(0,255,0,0.3)');
            grad.addColorStop(1, 'rgba(0,255,0,0)');
            ctx.beginPath();
            ctx.arc(x, y, r * 1.8, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
        }

        const isGlowing = glowIntensity > 0.3 || highlight;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.strokeStyle = isGlowing ? '#00ff00' : 'rgba(0,255,0,0.6)';
        ctx.lineWidth = isGlowing ? 2.5 : 1.5;
        ctx.stroke();
        ctx.fillStyle = isGlowing ? 'rgba(0,40,20,0.95)' : 'rgba(0,15,8,0.8)';
        ctx.fill();

        ctx.fillStyle = isGlowing ? '#00ff00' : 'rgba(0,255,0,0.7)';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
    }

    function drawChainLine(x, y1, y2, cfg) {
        ctx.beginPath();
        ctx.moveTo(x, y1 + cfg.nodeRadius);
        ctx.lineTo(x, y2 - cfg.nodeRadius);
        ctx.strokeStyle = 'rgba(0,255,0,0.4)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }

    function drawDashedLink(x1, y1, x2, y2, progress, active = false, showDot = true) {
        if (progress <= 0) return;

        ctx.beginPath();
        ctx.setLineDash([4, 4]);
        const px = x1 + (x2 - x1) * Math.min(progress, 1);
        const py = y1 + (y2 - y1) * Math.min(progress, 1);
        ctx.moveTo(x1, y1);
        ctx.lineTo(px, py);
        ctx.strokeStyle = active ? 'rgba(0,255,0,0.9)' : 'rgba(0,255,0,0.3)';
        ctx.lineWidth = active ? 2 : 1;
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated dot
        if (active && progress > 0 && progress < 1 && showDot) {
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fillStyle = '#00ff00';
            ctx.fill();
        }
    }

    function drawChainLabel(x, y, label) {
        const box = 20;
        ctx.strokeStyle = 'rgba(0,255,0,0.5)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x - box/2, y - box/2, box, box);
        ctx.fillStyle = 'rgba(0,255,0,0.8)';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, x, y);
    }

    function drawTimeArrow(cfg) {
        const ax = cfg.centerX - cfg.chainSpacing - 40;
        const top = cfg.startY + 10;
        const bot = cfg.startY + cfg.nodeSpacing * 3.2;

        ctx.beginPath();
        ctx.moveTo(ax, bot);
        ctx.lineTo(ax, top);
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(ax, top);
        ctx.lineTo(ax - 4, top + 7);
        ctx.moveTo(ax, top);
        ctx.lineTo(ax + 4, top + 7);
        ctx.stroke();

        ctx.save();
        ctx.translate(ax - 10, (top + bot) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#555';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time', 0, 0);
        ctx.restore();
    }

    // ═══════════════════════════════════════════════════════════════
    // MAIN RENDER LOOP
    // ═══════════════════════════════════════════════════════════════

    function draw() {
        const cfg = getConfig();
        const now = Date.now();

        // Handle pause expiration
        if (state.isPaused && now >= state.pauseEndTime) {
            state.isPaused = false;
            state.pausedAtStep = null;
            state.stepStartTime = now;
        }

        const duration = getStepDuration();
        const elapsed = now - state.stepStartTime;
        const rawProgress = state.isPaused ? 1 : Math.min(elapsed / duration, 1);
        const progress = lightningEase(rawProgress);

        // Step transition
        if (!state.isPaused && elapsed >= duration) {
            state.stepInCycle++;

            // Check if we completed a 4-step cycle
            if (state.stepInCycle >= CONFIG.STEPS_PER_CYCLE) {
                state.stepInCycle = 0;

                if (!state.inCycle2) {
                    // In cycle 1, advance repetition count
                    state.cycle1Count++;

                    // Check if all cycle 1 repetitions complete
                    if (state.cycle1Count >= CONFIG.CYCLE1_REPETITIONS) {
                        // Enter cycle 2
                        state.inCycle2 = true;
                        state.miniCycleCount = 0;
                        prepareCycle2();
                    }
                } else {
                    // In cycle 2, advance mini-cycle
                    state.miniCycleCount++;
                    prepareCycle2();  // New random connections each mini-cycle

                    // Check if all 250 mini-cycles complete
                    if (state.miniCycleCount >= CONFIG.CYCLE2_MINI_CYCLES) {
                        // Restart from cycle 1
                        state.inCycle2 = false;
                        state.cycle1Count = 0;
                        state.miniCycleCount = 0;
                        state.stepInCycle = 0;
                    }
                }
            }

            state.stepStartTime = now;
            requestAnimationFrame(draw);
            return;  // Skip this frame to avoid flicker
        }

        // Clear and setup
        ctx.clearRect(0, 0, cfg.w, cfg.h);
        setActiveStep(getDisplayStep());

        // Calculate positions
        const chains = CHAINS.map((c, i) => ({
            ...c,
            x: cfg.centerX + (i - 1) * cfg.chainSpacing
        }));
        const getY = idx => cfg.startY + idx * cfg.nodeSpacing;

        // Draw time arrow (hide when ultra fast)
        if (duration > 100) drawTimeArrow(cfg);

        // Draw vertical chain lines
        chains.forEach(chain => {
            for (let i = 0; i < chain.nodes.length - 1; i++) {
                drawChainLine(chain.x, getY(i), getY(i + 1), cfg);
            }
        });

        // Get current connection and draw
        const conn = getCurrentConnection();
        if (conn) {
            const [fromChain, fromNode] = conn.from;
            const [toChain, toNode] = conn.to;
            const x1 = chains[fromChain].x, y1 = getY(fromNode);
            const x2 = chains[toChain].x, y2 = getY(toNode);

            // Draw animated link with lightning easing applied
            const showDot = duration > 100;
            drawDashedLink(x1, y1, x2, y2, progress, true, showDot);

            // Draw nodes with highlight
            chains.forEach((chain, ci) => {
                chain.nodes.forEach((type, ni) => {
                    const isFrom = ci === fromChain && ni === fromNode;
                    const isTo = ci === toChain && ni === toNode;
                    const highlight = isFrom || isTo;
                    const glow = highlight ? progress * 0.8 : 0;
                    drawNode(chain.x, getY(ni), type, cfg, highlight, glow);
                });
            });
        }

        // Draw labels
        const labelY = getY(CHAINS[0].nodes.length) + 14;
        chains.forEach(chain => drawChainLabel(chain.x, labelY, chain.label));

        requestAnimationFrame(draw);
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    resizeCanvas();
    prepareCycle2();
    state.stepStartTime = Date.now();
    setActiveStep(1);
    setupStepClickHandlers();
    draw();
    window.addEventListener('resize', resizeCanvas);
})();
