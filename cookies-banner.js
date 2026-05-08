/* Lumero cookies consent banner.
   Pairs with Google Consent Mode v2 — analytics_storage stays denied
   until the user clicks Accept. Honors Do Not Track / Global Privacy Control. */
(function(){
  var KEY = 'lumero_consent';
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch(e){}

  // Privacy signals: if the browser asks not to be tracked, treat as decline
  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
  if (!stored && dnt) stored = 'declined';

  function applyConsent(state){
    if (typeof gtag !== 'function') return;
    if (state === 'accepted'){
      gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    } else {
      gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  }

  applyConsent(stored);

  if (stored === 'accepted' || stored === 'declined') return;

  // Build the banner
  var banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Cookie preferences');
  banner.innerHTML = ''
    + '<div class="cookie-banner__inner">'
    +   '<div class="cookie-banner__mark" aria-hidden="true">Ł</div>'
    +   '<div class="cookie-banner__copy">'
    +     '<strong>We use minimal cookies.</strong>'
    +     'Required ones keep the site working. Optional analytics help us see what gets read &mdash; you can turn them off. '
    +     '<a href="/cookies.html">Cookie policy</a>.'
    +   '</div>'
    +   '<div class="cookie-banner__buttons">'
    +     '<button type="button" class="cookie-btn cookie-btn--decline" data-cookie-action="decline">Decline</button>'
    +     '<button type="button" class="cookie-btn cookie-btn--accept" data-cookie-action="accept">Accept</button>'
    +   '</div>'
    + '</div>';

  document.body.appendChild(banner);
  // animate in
  requestAnimationFrame(function(){ banner.classList.add('is-in'); });

  banner.addEventListener('click', function(e){
    var t = e.target.closest('[data-cookie-action]');
    if (!t) return;
    var action = t.getAttribute('data-cookie-action');
    var state = action === 'accept' ? 'accepted' : 'declined';
    try { localStorage.setItem(KEY, state); } catch(_){}
    applyConsent(state);
    banner.classList.remove('is-in');
    setTimeout(function(){ banner.remove(); }, 300);
  });
})();
