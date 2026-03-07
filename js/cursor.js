// CUSTOM CURSOR WITH TRAIL
const cursor = document.querySelector('.cursor-dot');
const trailCount = 20;
const trails = [];

for (let i = 0; i < trailCount; i++) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.opacity = (1 - i / trailCount) * 0.6;
    trail.style.transform = `scale(${1 - i / trailCount})`;
    document.body.appendChild(trail);
    trails.push({ el: trail, x: 0, y: 0 });
}

let cursorX = 0, cursorY = 0;
document.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
});

function animateCursor() {
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    let prevX = cursorX, prevY = cursorY;
    trails.forEach((trail, i) => {
        const delay = (i + 1) * 0.05;
        trail.x += (prevX - trail.x) * (0.3 - delay * 0.01);
        trail.y += (prevY - trail.y) * (0.3 - delay * 0.01);
        trail.el.style.left = trail.x + 'px';
        trail.el.style.top = trail.y + 'px';
        prevX = trail.x;
        prevY = trail.y;
    });
    requestAnimationFrame(animateCursor);
}
animateCursor();
