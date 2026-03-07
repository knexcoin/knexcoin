// THREE.JS BACKGROUND - Multi-layer cyberspace
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 50);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl'), antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(0x000000);

// Multi-layer Grid
const gridGroup = new THREE.Group();
for (let layer = 0; layer < 3; layer++) {
    const gridGeo = new THREE.BufferGeometry();
    const pos = [];
    const size = 200;
    const div = 40 - layer * 10;
    const step = size / div;
    for (let i = -div / 2; i <= div / 2; i++) {
        const p = i * step;
        pos.push(-size/2, -20 - layer * 0.5, p, size/2, -20 - layer * 0.5, p);
        pos.push(p, -20 - layer * 0.5, -size/2, p, -20 - layer * 0.5, size/2);
    }
    gridGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const grid = new THREE.LineSegments(gridGeo, new THREE.LineBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.12 * (1 - layer * 0.3)
    }));
    gridGroup.add(grid);
}
scene.add(gridGroup);

// Particles
const partCount = 3000;
const partGeo = new THREE.BufferGeometry();
const partPos = new Float32Array(partCount * 3);
const partSpd = new Float32Array(partCount);
for (let i = 0; i < partCount; i++) {
    partPos[i * 3] = (Math.random() - 0.5) * 200;
    partPos[i * 3 + 1] = -20 + Math.random() * 5;
    partPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
    partSpd[i] = Math.random() * 0.6 + 0.2;
}
partGeo.setAttribute('position', new THREE.BufferAttribute(partPos, 3));
const particles = new THREE.Points(partGeo, new THREE.PointsMaterial({
    color: 0x00ff00,
    size: 0.4,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending
}));
scene.add(particles);

// Energy Streams
const streams = [];
for (let i = 0; i < 25; i++) {
    const streamGeo = new THREE.BufferGeometry();
    const pts = [];
    const startX = (Math.random() - 0.5) * 150;
    for (let j = 0; j <= 100; j++) {
        const t = j / 100;
        pts.push(
            startX + Math.sin(t * Math.PI * 4) * 3,
            -20 + Math.sin(t * Math.PI * 2) * 0.5,
            -100 + t * 200
        );
    }
    streamGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    const stream = new THREE.Line(streamGeo, new THREE.LineBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.15
    }));
    stream.userData = {
        baseOpacity: Math.random() * 0.2 + 0.1,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 2 + 1
    };
    streams.push(stream);
    scene.add(stream);
}

// Vertical Pillars
for (let i = 0; i < 20; i++) {
    const pillarGeo = new THREE.BufferGeometry();
    const x = (Math.random() - 0.5) * 180;
    const z = (Math.random() - 0.5) * 120 - 30;
    pillarGeo.setAttribute('position', new THREE.Float32BufferAttribute([x, -20, z, x, 60, z], 3));
    const pillar = new THREE.Line(pillarGeo, new THREE.LineBasicMaterial({
        color: 0x00ff00,
        transparent: true,
        opacity: 0.08
    }));
    scene.add(pillar);
}

// Mouse tracking
let mx = 0, my = 0, tx = 0, ty = 0;
document.addEventListener('mousemove', e => {
    mx = (e.clientX / window.innerWidth - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
});

// Animation loop
let time = 0;
function animateBackground() {
    requestAnimationFrame(animateBackground);
    time += 0.01;
    tx += (mx * 12 - tx) * 0.02;
    ty += (-my * 6 - ty) * 0.02;
    camera.position.x = tx;
    camera.position.y = 15 + ty;
    camera.lookAt(0, 0, -20);
    gridGroup.rotation.y = Math.sin(time * 0.1) * 0.02;
    const pos = particles.geometry.attributes.position.array;
    for (let i = 0; i < partCount; i++) {
        pos[i * 3 + 2] += partSpd[i];
        if (pos[i * 3 + 2] > 100) {
            pos[i * 3 + 2] = -100;
            pos[i * 3] = (Math.random() - 0.5) * 200;
        }
    }
    particles.geometry.attributes.position.needsUpdate = true;
    streams.forEach(s => {
        s.material.opacity = s.userData.baseOpacity + Math.sin(time * s.userData.speed + s.userData.phase) * 0.1;
    });
    renderer.render(scene, camera);
}
animateBackground();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
