const progress = document.querySelector('.scroll-progress span');
window.addEventListener('scroll', () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${Math.min((window.scrollY / maxScroll) * 100, 100)}%`;
}, { passive: true });

const setupPremiumMotion = () => {
  if (!window.gsap) return;
  if (window.ScrollTrigger) window.gsap.registerPlugin(window.ScrollTrigger);

  const heroTimeline = window.gsap.timeline({ defaults: { ease: 'power3.out' } });
  heroTimeline.from('.site-header', { y: -24, opacity: 0, duration: 1 })
    .from('.hero-copy .eyebrow', { y: 20, opacity: 0, duration: .7 }, '-=.45')
    .from('.hero-copy h1', { y: 42, opacity: 0, duration: 1 }, '-=.48')
    .from('.hero-copy .hero-lead', { y: 24, opacity: 0, duration: .7 }, '-=.55')
    .from('.hero-actions, .hero-note', { y: 18, opacity: 0, stagger: .12, duration: .7 }, '-=.42')
    .from('.hero-scene-label', { x: 24, opacity: 0, duration: .7 }, '-=.55');

  if (!window.ScrollTrigger) return;
  window.gsap.utils.toArray('.editorial-gallery img').forEach((image) => {
    window.gsap.to(image, { yPercent: -7, ease: 'none', scrollTrigger: { trigger: image, scrub: true } });
  });
  window.gsap.utils.toArray('.service-card').forEach((card, index) => {
    window.gsap.from(card, { y: 45, opacity: 0, rotate: index % 2 ? 1 : -1, duration: .8, delay: index * .08, scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
  });
  window.gsap.utils.toArray('.process-step, .editorial-bottom > div').forEach((item, index) => {
    window.gsap.from(item, { y: 24, opacity: 0, duration: .65, delay: index * .08, scrollTrigger: { trigger: item, start: 'top 88%', once: true } });
  });
  window.gsap.from('.appointment-form', { x: 50, opacity: 0, duration: 1, scrollTrigger: { trigger: '.appointment-section', start: 'top 72%', once: true } });
};

setupPremiumMotion();

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const heroVideos = [...document.querySelectorAll('.hero-video')];
const heroSceneCaption = document.querySelector('#hero-scene-caption');
if (heroVideos.length > 1) {
  let activeVideo = 0;
  window.setInterval(() => {
    const nextVideo = (activeVideo + 1) % heroVideos.length;
    heroVideos[nextVideo].currentTime = 0;
    heroVideos[nextVideo].play().catch(() => {});
    heroVideos[activeVideo].classList.remove('active');
    heroVideos[nextVideo].classList.add('active');
    if (heroSceneCaption) heroSceneCaption.textContent = heroVideos[nextVideo].dataset.caption || '';
    activeVideo = nextVideo;
  }, 8500);
}

const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.desktop-nav');
menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  nav.classList.toggle('mobile-open', !isOpen);
});
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menuToggle?.setAttribute('aria-expanded', 'false');
  nav.classList.remove('mobile-open');
}));

const form = document.querySelector('#appointment-form');
const formStatus = document.querySelector('.form-status');
const dateField = form?.querySelector('input[name="preferred_date"]');
if (dateField) dateField.min = new Date().toISOString().split('T')[0];
form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = 'Wird gesendet ...';
  formStatus.textContent = '';
  const data = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch('https://www.orzux.com/api/webhooks/website-forms/543ce920adb30163280b97bb4bb34f1800b913d4f8781f2f', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Request failed');
    form.reset();
    formStatus.textContent = 'Vielen Dank. Ihre Online-Termin Anfrage ist eingegangen. Wir bestätigen Ihren Wunschtermin persönlich.';
  } catch {
    formStatus.textContent = 'Ihre Anfrage konnte gerade nicht gesendet werden. Bitte rufen Sie uns an.';
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalText;
  }
});
