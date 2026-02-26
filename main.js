/* ============================================================
   main.js — "¿Qué hay de nuevo?"
   JavaScript compartido por todas las páginas
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Menú hamburguesa ───────────────────────────────────── */
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => {
      navMobile.classList.toggle('open');
    });
  }

  /* ── Marcar enlace activo según la página actual ─────── */
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === current) link.classList.add('active');
  });

  /* ── Filtros de categoría (páginas de listados) ──────── */
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.filter-bar');
      parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const cat = btn.dataset.filter;
      document.querySelectorAll('.listing-card').forEach(card => {
        if (cat === 'todos' || card.dataset.cat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  /* ── Cotización del dólar (API pública dolarapi.com) ─── */
  async function fetchDolar() {
    const slots = {
      'oficial': document.getElementById('dolar-oficial'),
      'blue':    document.getElementById('dolar-blue'),
      'mep':     document.getElementById('dolar-mep'),
      'ccl':     document.getElementById('dolar-ccl'),
    };
    if (!Object.values(slots).some(Boolean)) return; // no es index

    const types = {
      'oficial': 'oficial',
      'blue':    'blue',
      'mep':     'bolsa',
      'ccl':     'contadoconliqui',
    };

    for (const [key, el] of Object.entries(slots)) {
      if (!el) continue;
      try {
        const res  = await fetch(`https://dolarapi.com/v1/dolares/${types[key]}`);
        const data = await res.json();
        el.querySelector('.dolar-compra').textContent = `$${data.compra.toLocaleString('es-AR')}`;
        el.querySelector('.dolar-venta').textContent  = `$${data.venta.toLocaleString('es-AR')}`;
        el.querySelector('.dolar-fecha').textContent  = new Date(data.fechaActualizacion).toLocaleString('es-AR', {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
      } catch (_) {
        // fallback silencioso, los valores de placeholder quedan en HTML
      }
    }
  }
  fetchDolar();

  /* ── Animación de aparición al hacer scroll ─────────── */
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
});
