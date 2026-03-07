// NAVIGATION
const nav = document.getElementById('nav');
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
});

menuToggle.addEventListener('click', () => {
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
});

document.querySelectorAll('.mobile-menu-links a').forEach(link => {
    link.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        mobileMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// Nav Dropdowns
(function(){
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    dropdowns.forEach(function(dd) {
        const trigger = dd.querySelector(':scope > a');
        if (!trigger) return;
        trigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const wasOpen = dd.classList.contains('open');
            dropdowns.forEach(function(d) { d.classList.remove('open'); });
            if (!wasOpen) dd.classList.add('open');
        });
    });
    document.addEventListener('click', function() {
        dropdowns.forEach(function(d) { d.classList.remove('open'); });
    });
    document.querySelectorAll('.nav-dropdown-menu a').forEach(function(a) {
        a.addEventListener('click', function() {
            dropdowns.forEach(function(d) { d.classList.remove('open'); });
        });
    });
})();

function scrollToSection(selector) {
    const el = document.querySelector(selector);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    menuToggle.classList.remove('active');
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
}

// SCROLL REVEAL
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
