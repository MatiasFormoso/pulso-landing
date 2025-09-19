// script.js
// ===========================
// Pulso Landing JS (Conversión)
// ===========================

// ---- Config precios ----
const CONFIG_PRICING = {
  currency: 'USD',
  period: '/mes',
  base: 29,   // precio ancla
  plus: 49    // "más elegido"
};

// UTM capture & append
(function(){ 
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  utmKeys.forEach(k=>{ if(params.get(k)){ try{ localStorage.setItem(k, params.get(k)); }catch(e){} } });
})();
function appendUtm(url){
  try {
    const u = new URL(url);
    ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'].forEach(k=>{
      const v = localStorage.getItem(k);
      if(v) u.searchParams.set(k, v);
    });
    return u.toString();
  } catch(e) { return url; }
}
document.querySelectorAll('a[data-append-utm="1"]').forEach(a=>{
  a.href = appendUtm(a.href);
});

// ====== Mobile menu (overlay full screen) ======
(function mobileMenu(){
  const toggle = document.getElementById('navToggle');
  const closeBtn = document.getElementById('navClose');
  const menu = document.getElementById('mobileMenu');

  if(!toggle || !menu) return;

  const open = () => {
    menu.classList.add('open');
    document.body.classList.add('menu-open');
    menu.setAttribute('aria-hidden','false');
    toggle.setAttribute('aria-expanded','true');
  };
  const close = () => {
    menu.classList.remove('open');
    document.body.classList.remove('menu-open');
    menu.setAttribute('aria-hidden','true');
    toggle.setAttribute('aria-expanded','false');
  };

  toggle.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') close(); });
})();

// FAQ: acordeón exclusivo
document.querySelectorAll('.faq details').forEach(d => {
  d.addEventListener('toggle', () => {
    if(d.open) document.querySelectorAll('.faq details').forEach(o => { if(o!==d) o.removeAttribute('open'); });
  });
});

// Helpers
function num(v){ return isNaN(v) ? 0 : Number(v); }
function fmt(numVal, cur){
  try { return `${cur} ${Number(numVal).toLocaleString('es-AR')}`; }
  catch(e){ return `${cur} ${Number(numVal).toFixed(0)}`; }
}

// ROI calculator (ahorro + ventas recuperadas y neto por plan)
(function initROI(){
  const min = document.getElementById('roi-min');
  const days = document.getElementById('roi-days');
  const hourly = document.getElementById('roi-hourly');
  const currency = document.getElementById('roi-currency');

  const outHours = document.getElementById('roi-hours');
  const outSaved = document.getElementById('roi-saved');
  const outPill = document.getElementById('roi-pill');
  const outRecovered = document.getElementById('roi-recovered');

  const outNetBase = document.getElementById('roi-net-base');
  const outNetPlus = document.getElementById('roi-net-plus');

  // Opcionales (ventas recuperadas)
  const currencyTicket = document.getElementById('roi-currency-ticket');
  const ticket = document.getElementById('roi-ticket');
  const recov = document.getElementById('roi-recov');

  if(!min||!days||!hourly||!currency||!outHours||!outSaved||!outPill||!outNetBase||!outNetPlus||!outRecovered||!ticket||!recov||!currencyTicket) return;

  const recalc = () => {
    const cur = (currency.value || 'USD').trim();

    // Horas y ahorro mensual (tiempo)
    const h = (num(min.value)/60) * num(days.value);
    const saved = h * num(hourly.value);

    outHours.textContent = `${h.toFixed(1)} h`;
    outSaved.textContent = fmt(saved, cur);
    outPill.textContent = `Tu gasto oculto estimado: ${fmt(saved, cur)}`;

    // Ventas recuperadas (opcional)
    const curTicket = (currencyTicket.value || cur).trim();
    const recovered = num(ticket.value) * num(recov.value);
    outRecovered.textContent = fmt(recovered, curTicket);

    // Impacto total mensual (ahorro + recuperadas) → Neto por plan
    const total = saved + recovered;
    const basePrice = CONFIG_PRICING.base ?? 0;
    const plusPrice = CONFIG_PRICING.plus ?? 0;

    const baseNet = total - basePrice;
    const plusNet = total - plusPrice;

    outNetBase.textContent = baseNet >= 0 ? `+ ${fmt(baseNet, cur)}` : `- ${fmt(Math.abs(baseNet), cur)}`;
    outNetPlus.textContent = plusNet >= 0 ? `+ ${fmt(plusNet, cur)}` : `- ${fmt(Math.abs(plusNet), cur)}`;
  };

  [min,days,hourly,currency,ticket,recov,currencyTicket].forEach(i=> i.addEventListener('input', recalc));
  recalc();
})();

// Sticky CTA
(function stickyCTA(){
  const sticky = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  const primaryCTA = document.querySelector('.cta-primary');
  if(!sticky || !hero) return;

  const ioHero = new IntersectionObserver(([entry])=>{
    sticky.classList.toggle('hidden', entry.isIntersecting);
  }, {threshold: 0.1});
  ioHero.observe(hero);

  if(primaryCTA){
    const ioCTA = new IntersectionObserver(([entry])=>{
      if(entry.isIntersecting) sticky.classList.add('hidden');
    }, {threshold: 0.75});
    ioCTA.observe(primaryCTA);
  }
})();

// Render precios (con montos configurados arriba)
(function renderPrices(){
  const pfx = CONFIG_PRICING.currency || 'USD';
  const sfx = CONFIG_PRICING.period || '/mes';
  const baseEl = document.querySelector('.js-price-base');
  const plusEl = document.querySelector('.js-price-plus');
  if(baseEl){ baseEl.textContent = `${pfx} ${CONFIG_PRICING.base} ${sfx}`; }
  if(plusEl){ plusEl.textContent = `${pfx} ${CONFIG_PRICING.plus} ${sfx}`; }
})();

// Form → WhatsApp con prefill
const form = document.getElementById('lead-form');
if (form){
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const nombre = (data.get('nombre')||'').trim();
    const email  = (data.get('email')||'').trim();
    const tel    = (data.get('telefono')||'').trim();
    const plataforma = (data.get('plataforma')||'').trim();
    const comentarios = (data.get('comentarios')||'').trim();

    if(!tel || !plataforma){
      alert('Completá teléfono/WhatsApp y plataforma.');
      return;
    }

    const msg = `Hola Matías, quiero implementar los informes automáticos por WhatsApp.
Nombre: ${nombre||'-'}
Email: ${email||'-'}
Tel: ${tel}
Plataforma: ${plataforma}
Comentarios: ${comentarios||'-'}`;

    const wa = new URL('https://wa.me/5493541235829');
    wa.searchParams.set('text', msg);
    const withUtm = appendUtm(wa.toString());
    window.open(withUtm, '_blank', 'noopener');
  });
}

// Copiar link WA (con UTM)
document.querySelectorAll('[data-copy-wa]').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const url = btn.getAttribute('data-copy-wa');
    navigator.clipboard.writeText(appendUtm(url)).then(()=>{
      const prev = btn.textContent;
      btn.textContent = 'Copiado ✅';
      setTimeout(()=> btn.textContent = prev, 1600);
    });
  });
});
