/* Cafe Madan — plain JavaScript, without frameworks or modern syntax requirements. */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reducedMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var raf = window.requestAnimationFrame || function (callback) { return window.setTimeout(callback, 16); };
  var scrollPending = false;

  function updateProgress() {
    var max = Math.max(1, doc.scrollHeight - window.innerHeight);
    var value = Math.max(0, Math.min(1, (window.pageYOffset || window.scrollY || 0) / max));
    if (doc.style && doc.style.setProperty) doc.style.setProperty('--page-progress', String(value));
    scrollPending = false;
  }
  function queueProgress() {
    if (!scrollPending) { scrollPending = true; raf(updateProgress); }
  }
  window.addEventListener('scroll', queueProgress, false);
  window.addEventListener('resize', queueProgress, false);
  queueProgress();

  /* Restore the original SVG line-drawing and flying-logo sequence on scroll.
     No video, image-sequence, canvas or external animation library is used. */
  var story = document.querySelector('.motion-story');
  var stage = document.querySelector('.ms-stage');
  var percent = document.getElementById('ms-percent');
  if (story && stage && !reducedMotion) {
    var heroPaths = stage.querySelectorAll('.ms-logo-trace path');
    var heroFrame = 0;
    var heroProgress = 0;
    var heroTime = 0;
    function clamp(value) { return Math.max(0, Math.min(1, value)); }
    function smooth(value) { var t = clamp(value); return t * t * (3 - 2 * t); }
    function setHero(name, value) { stage.style.setProperty(name, value); }
    function drawHero(timestamp) {
      var range = Math.max(1, story.offsetHeight - window.innerHeight);
      var target = clamp(-story.getBoundingClientRect().top / range);
      var delta = Math.min(50, heroTime ? timestamp - heroTime : 16);
      heroTime = timestamp;
      heroProgress += (target - heroProgress) * (1 - Math.exp(-delta / 110));
      if (Math.abs(target - heroProgress) < .0007) heroProgress = target;
      var progress = heroProgress;
      var flight = smooth((progress - .67) / .18);
      /* Values below preserve the actual entry -> trace -> resolve -> flight phases
         found in src/MotionStory.jsx of the first supplied project. */
      /* Two independent stream groups travel in from beyond both sides.
         They do not occupy the centre before the user scrolls. */
      var streamEntry = smooth((progress - .035) / .405);
      var streamProgress = smooth((progress - .025) / .46);
      var streamAlpha = smooth((progress - .025) / .105) * (1 - smooth((progress - .545) / .14));
      var traceAlpha = smooth((progress - .19) / .14) * (1 - smooth((progress - .64) / .11));
      var traceProgress = smooth((progress - .20) / .405);
      var imageAlpha = smooth((progress - .505) / .12);
      setHero('--ambient-drift', (-1.2 * progress).toFixed(2) + 'vh');
      setHero('--hint-opacity', (1 - smooth(progress / .18)).toFixed(3));
      setHero('--progress-width', (progress * 100).toFixed(1) + '%');
      setHero('--logo-stream-opacity', streamAlpha.toFixed(3));
      setHero('--stream-progress', streamProgress.toFixed(3));
      setHero('--stream-left-x', (-32 * (1 - streamEntry)).toFixed(2) + 'vw');
      setHero('--stream-right-x', (32 * (1 - streamEntry)).toFixed(2) + 'vw');
      setHero('--logo-trace-opacity', traceAlpha.toFixed(3));
      setHero('--logo-trace-progress', traceProgress.toFixed(3));
      setHero('--logo-image-opacity', imageAlpha.toFixed(3));
      // Each genuine contour arrives in sequence rather than 13 identical bright streaks.
      for (var li = 0; li < heroPaths.length; li++) {
        var line = smooth((progress - (.19 + li * .009)) / .40);
        heroPaths[li].style.strokeDashoffset = (1 - line).toFixed(3);
      }
      setHero('--logo-scale', (1 - .58 * flight).toFixed(3));
      setHero('--logo-top', (50 - 31 * flight).toFixed(2) + 'vh');
      setHero('--logo-yaw', (4 * (1 - flight)).toFixed(2) + 'deg');
      setHero('--logo-pitch', (-2 * (1 - flight)).toFixed(2) + 'deg');
      setHero('--whiteout-opacity', smooth((progress - .83) / .16).toFixed(3));
      if (percent) percent.textContent = (progress < .1 ? '0' : '') + String(Math.round(progress * 100)) + '%';
      if (progress > .22) stage.classList.add('hero-scrolled');
      else stage.classList.remove('hero-scrolled');
      heroFrame = 0;
      if (Math.abs(target - heroProgress) > .0007) heroFrame = raf(drawHero);
    }
    function queueHero() { if (!heroFrame) heroFrame = raf(drawHero); }
    window.addEventListener('scroll', queueHero, { passive: true });
    window.addEventListener('resize', queueHero, false);
    queueHero();
  }

  /* Jump precisely to the visible form panel, not the registration section's
     introduction. Offset includes the fixed CTA and top safe area on phones. */
  var stickyLink = document.querySelector('.sticky-register');
  var registrationPanel = document.getElementById('registration-panel');
  if (stickyLink && registrationPanel) {
    function scrollToRegistration(event) {
      if (event) event.preventDefault();
      var fixedHeight = stickyLink.getBoundingClientRect().height || 50;
      var fixedTop = Math.max(0, stickyLink.getBoundingClientRect().top);
      var offset = Math.max(100, fixedTop + fixedHeight + 52);
      var y = Math.max(0, registrationPanel.getBoundingClientRect().top + (window.pageYOffset || window.scrollY || 0) - offset);
      try { window.scrollTo({ top: y, behavior: reducedMotion ? 'auto' : 'smooth' }); }
      catch (ignore) { window.scrollTo(0, y); }
      if (window.history && window.history.replaceState) {
        try { window.history.replaceState(null, '', window.location.pathname + window.location.search + '#registration-panel'); } catch (ignore) { /* Cross-origin preview contexts can prohibit URL state updates. */ }
      }
    }
    stickyLink.addEventListener('click', scrollToRegistration, false);
    if (window.location.hash === '#registration-panel') {
      window.addEventListener('load', function () { scrollToRegistration(); });
    }
  }

  /* Same settled designs, but stagger arrivals when each section scrolls into view. */
  document.documentElement.classList.add('js-motion');
  var extraReveal = document.querySelectorAll('.speaker-card, .speaker-note, .agenda-row, .footer-about, .footer-contact, .footer-online');
  for (var x = 0; x < extraReveal.length; x++) {
    extraReveal[x].setAttribute('data-reveal', '');
    extraReveal[x].style.setProperty('--reveal-delay', ((x % 3) * 95) + 'ms');
  }
  var sectionBlocks = document.querySelectorAll('.section-motion');
  if (window.IntersectionObserver && !reducedMotion) {
    var sectionObserver = new window.IntersectionObserver(function (entries) {
      for (var si = 0; si < entries.length; si++) {
        if (entries[si].isIntersecting) {
          entries[si].target.classList.add('section-inview');
          sectionObserver.unobserve(entries[si].target);
        }
      }
    }, { threshold: .05, rootMargin: '0px 0px -5% 0px' });
    for (var sb = 0; sb < sectionBlocks.length; sb++) sectionObserver.observe(sectionBlocks[sb]);
  } else {
    for (var sc = 0; sc < sectionBlocks.length; sc++) sectionBlocks[sc].classList.add('section-inview');
  }

  var revealed = document.querySelectorAll('[data-reveal]');
  if (window.IntersectionObserver && !reducedMotion) {
    var observer = new window.IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add('seen');
          observer.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.07, rootMargin: '0px 0px 25px 0px' });
    for (var i = 0; i < revealed.length; i++) observer.observe(revealed[i]);
  } else {
    for (var j = 0; j < revealed.length; j++) revealed[j].classList.add('seen');
  }

  var form = document.getElementById('attendance-form');
  if (!form) return;
  var name = form.elements.namedItem('fullName');
  var phone = form.elements.namedItem('phone');
  var company = form.elements.namedItem('company');
  var status = document.getElementById('form-status');
  var button = form.querySelector('[type="submit"]');
  var buttonText = button.querySelector('span');
  var roleInput = document.getElementById('role');
  roleInput.addEventListener('change', function () {
    setRoleError('');
    clearStatus();
  }, false);
  function resetRolePicker() {
    roleInput.value = '';
  }

  function digitize(value) {
    return String(value || '').replace(/[\u06F0-\u06F9]/g, function (x) {
      return String(x.charCodeAt(0) - 0x06F0);
    }).replace(/[\u0660-\u0669]/g, function (x) {
      return String(x.charCodeAt(0) - 0x0660);
    });
  }
  function setError(id, message) {
    var input = document.getElementById(id);
    var output = document.getElementById(id + '-error');
    if (output) output.textContent = message;
    if (input) {
      if (message) input.setAttribute('aria-invalid', 'true');
      else input.removeAttribute('aria-invalid');
    }
  }
  function setRoleError(message) {
    document.getElementById('role-error').textContent = message;
    if (message) roleInput.setAttribute('aria-invalid', 'true');
    else roleInput.removeAttribute('aria-invalid');
  }
  function showStatus(message, kind) {
    status.hidden = false;
    status.className = 'form-status ' + kind;
    status.textContent = message;
  }
  function clearStatus() { status.hidden = true; status.textContent = ''; }
  function normalizePhone() {
    var normal = digitize(phone.value).replace(/[^0-9]/g, '').slice(0, 11);
    if (phone.value !== normal) phone.value = normal;
    if (normal.length === 11) setError('phone', '');
    clearStatus();
  }
  phone.addEventListener('input', normalizePhone, false);
  name.addEventListener('input', function () { setError('fullName', ''); clearStatus(); }, false);
  company.addEventListener('input', clearStatus, false);

  function validate() {
    var fullName = name.value.replace(/\s+/g, ' ').trim();
    var mobile = digitize(phone.value).trim();
    var role = roleInput.value || '';
    var org = company.value.trim();
    var nameError = fullName.length < 3 ? 'لطفاً نام و نام خانوادگی خود را کامل وارد کنید.' : '';
    var phoneError = !/^\d{11}$/.test(mobile) ? 'شماره تماس باید دقیقاً ۱۱ رقم باشد.' : '';
    var roleError = !role ? 'لطفاً حوزه فعالیت خود را انتخاب کنید.' : '';
    setError('fullName', nameError);
    setError('phone', phoneError);
    setRoleError(roleError);
    var firstInvalid = nameError ? name : phoneError ? phone : roleError ? roleInput : null;
    if (firstInvalid) { firstInvalid.focus(); return null; }
    return { fullName: fullName, phone: mobile, role: role, company: org, website: form.elements.namedItem('website').value };
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    clearStatus();
    var data = validate();
    if (!data) return;
    button.disabled = true;
    buttonText.textContent = 'در حال ارسال درخواست…';
    var request = new XMLHttpRequest();
    var finished = false;
    function finish() {
      if (finished) return;
      finished = true;
      button.disabled = false;
      buttonText.textContent = 'ثبت درخواست حضور';
    }
    request.open('POST', form.action, true);
    request.setRequestHeader('Content-Type', 'application/json');
    request.setRequestHeader('Accept', 'application/json');
    request.timeout = 12000;
    request.onreadystatechange = function () {
      if (request.readyState !== 4 || finished) return;
      var result = {};
      try { result = JSON.parse(request.responseText || '{}'); } catch (ignore) { result = {}; }
      if (request.status >= 200 && request.status < 300 && result.success === true) {
        form.reset();
        resetRolePicker();
        setError('fullName', ''); setError('phone', ''); setRoleError('');
        showStatus('درخواست شما با موفقیت ثبت شد. برای هماهنگی و اطلاع‌رسانی درباره جزئیات همایش با شما تماس گرفته می‌شود.', 'success');
      } else {
        var message = result.message || (request.status === 404
          ? 'برای ارسال واقعی فرم، سایت باید روی Vercel منتشر شود و تنظیمات دریافت درخواست انجام شده باشد.'
          : 'ثبت درخواست انجام نشد. لطفاً دوباره تلاش کنید یا با شماره‌های پایین صفحه تماس بگیرید.');
        showStatus(message, 'error');
      }
      finish();
    };
    request.onerror = function () { showStatus('ارتباط با سامانه برقرار نشد. لطفاً دوباره تلاش کنید.', 'error'); finish(); };
    request.ontimeout = function () { showStatus('زمان اتصال به سامانه به پایان رسید. لطفاً دوباره تلاش کنید.', 'error'); finish(); };
    try { request.send(JSON.stringify(data)); }
    catch (error) { showStatus('ارسال درخواست ممکن نشد. لطفاً با شماره‌های سایت تماس بگیرید.', 'error'); finish(); }
  }, false);
})();
