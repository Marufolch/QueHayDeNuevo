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

  /* ── Cargar grilla según la página actual ─────── */
  if (document.querySelector('.grid-3')) {
    const pagina = window.location.pathname.split('/').pop();
    if (pagina.includes('autos'))     cargarAutos();
    if (pagina.includes('servicios')) cargarServicios();
  }

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

/* ── Grilla de Vehiculos ─────────── */
// =====================
//  CARGAR AUTOS DESDE JSON
// =====================
async function cargarAutos() {
  const res = await fetch('autos.json');
  const autos = await res.json();
  const grid = document.querySelector('.grid-3');
  if (!grid) return;

  grid.innerHTML = autos.map(auto => {
    const imgs = auto.imagenes || [auto.imagen];
    const dotsHTML = imgs.length > 1
      ? `<div class="carousel-dots">${imgs.map((_, i) => `<span class="dot ${i === 0 ? 'active' : ''}" data-index="${i}"></span>`).join('')}</div>`
      : '';
    const arrowsHTML = imgs.length > 1
      ? `<button class="carousel-arrow left" aria-label="Anterior">&#8249;</button>
         <button class="carousel-arrow right" aria-label="Siguiente">&#8250;</button>`
      : '';

    return `
      <div class="auto-card listing-card" data-cat="${auto.categoria}">
        <div class="card-img carousel" data-imgs='${JSON.stringify(imgs)}' data-current="0">
          <img src="${imgs[0]}" alt="${auto.nombre}" loading="lazy" class="carousel-img"/>
          <span class="auto-badge badge ${auto.badgeColor}">${auto.badge}</span>
          ${arrowsHTML}
          ${dotsHTML}
        </div>
        <div class="auto-body">
          <p class="card-tag">${auto.categoria.toUpperCase()} · ${auto.marca}</p>
          <h3>${auto.nombre}</h3>
          <div class="auto-specs">
            <span class="spec-pill">⛽ ${auto.combustible}</span>
            <span class="spec-pill">🔄 ${auto.transmision}</span>
            <span class="spec-pill">📍 ${auto.ubicacion}</span>
            <span class="spec-pill">${auto.km}</span>
          </div>
          <p style="font-size:0.82rem;color:var(--text-muted)">${auto.descripcion}</p>
          <div class="auto-footer">
            <span class="card-price">${auto.precio}</span>
            <a href="#" class="btn btn-outline" style="font-size:0.78rem;padding:0.4rem 0.8rem">Contactar</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initCarousels();
  initLightbox();
  initFiltros();
}

// =====================
//  CARRUSEL
// =====================
function initCarousels() {
  document.querySelectorAll('.carousel').forEach(carousel => {
    const imgs = JSON.parse(carousel.dataset.imgs);
    if (imgs.length <= 1) return;

    carousel.querySelector('.carousel-arrow.left').addEventListener('click', e => {
      e.stopPropagation();
      cambiarSlide(carousel, -1);
    });
    carousel.querySelector('.carousel-arrow.right').addEventListener('click', e => {
      e.stopPropagation();
      cambiarSlide(carousel, 1);
    });

    carousel.querySelectorAll('.dot').forEach(dot => {
      dot.addEventListener('click', e => {
        e.stopPropagation();
        const idx = parseInt(dot.dataset.index);
        setSlide(carousel, idx);
      });
    });
  });
}

function cambiarSlide(carousel, direccion) {
  const imgs = JSON.parse(carousel.dataset.imgs);
  let current = parseInt(carousel.dataset.current);
  current = (current + direccion + imgs.length) % imgs.length;
  setSlide(carousel, current);
}

function setSlide(carousel, idx) {
  const imgs = JSON.parse(carousel.dataset.imgs);
  carousel.dataset.current = idx;
  carousel.querySelector('.carousel-img').src = imgs[idx];
  carousel.querySelectorAll('.dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === idx);
  });
}

// =====================
//  LIGHTBOX
// =====================
function initLightbox() {
  // Crear el lightbox en el DOM si no existe
  if (!document.getElementById('lightbox')) {
    const lb = document.createElement('div');
    lb.id = 'lightbox';
    lb.innerHTML = `
      <div class="lb-overlay"></div>
      <div class="lb-content">
        <button class="lb-close">✕</button>
        <button class="lb-arrow lb-left">&#8249;</button>
        <img class="lb-img" src="" alt=""/>
        <button class="lb-arrow lb-right">&#8250;</button>
        <div class="lb-counter"></div>
      </div>
    `;
    document.body.appendChild(lb);

    lb.querySelector('.lb-overlay').addEventListener('click', cerrarLightbox);
    lb.querySelector('.lb-close').addEventListener('click', cerrarLightbox);
    lb.querySelector('.lb-left').addEventListener('click', () => moverLightbox(-1));
    lb.querySelector('.lb-right').addEventListener('click', () => moverLightbox(1));

    document.addEventListener('keydown', e => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') moverLightbox(-1);
      if (e.key === 'ArrowRight') moverLightbox(1);
      if (e.key === 'Escape') cerrarLightbox();
    });
  }

  // Click en imagen abre el lightbox
  document.querySelectorAll('.carousel').forEach(carousel => {
    carousel.querySelector('.carousel-img').addEventListener('click', () => {
      const imgs = JSON.parse(carousel.dataset.imgs);
      const current = parseInt(carousel.dataset.current);
      abrirLightbox(imgs, current);
    });
  });
}

let lbImgs = [];
let lbIndex = 0;

function abrirLightbox(imgs, index) {
  lbImgs = imgs;
  lbIndex = index;
  const lb = document.getElementById('lightbox');
  lb.querySelector('.lb-img').src = lbImgs[lbIndex];
  lb.querySelector('.lb-counter').textContent = `${lbIndex + 1} / ${lbImgs.length}`;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function cerrarLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
}

function moverLightbox(dir) {
  lbIndex = (lbIndex + dir + lbImgs.length) % lbImgs.length;
  const lb = document.getElementById('lightbox');
  lb.querySelector('.lb-img').src = lbImgs[lbIndex];
  lb.querySelector('.lb-counter').textContent = `${lbIndex + 1} / ${lbImgs.length}`;
}

// =====================
//  FILTROS
// =====================
function initFiltros() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filtro = btn.dataset.filter;
      document.querySelectorAll('.listing-card').forEach(card => {
        card.style.display = (filtro === 'todos' || card.dataset.cat === filtro) ? '' : 'none';
      });
    });
  });
}

// =====================
//  FADE IN AL HACER SCROLL
// =====================
function initFadeIn() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

// =====================
//  MENÚ HAMBURGUESA
// =====================
function initMenu() {
  const hamburger = document.getElementById('hamburger');
  const navMobile = document.getElementById('nav-mobile');
  if (hamburger && navMobile) {
    hamburger.addEventListener('click', () => navMobile.classList.toggle('open'));
  }
}


// =====================
//  CARGAR SERVICIOS DESDE JSON
// =====================
async function cargarServicios() {
  const res = await fetch('servicios.json');
  const servicios = await res.json();
  const grid = document.querySelector('.grid-3');
  if (!grid) return;

  grid.innerHTML = servicios.map(s => {
    const estrellas = '★'.repeat(s.estrellas) + '☆'.repeat(5 - s.estrellas);
    return `
      <div class="srv-card listing-card" data-cat="${s.categoria}">
        <div class="card-img">
          <img src="${s.imagen}" alt="${s.nombre}" loading="lazy"/>
        </div>
        <div class="srv-body">
          <p class="card-tag">${s.emoji} ${s.categoria.charAt(0).toUpperCase() + s.categoria.slice(1)} · ${s.tipo}</p>
          <h3>${s.nombre}</h3>
          <div class="srv-name">
            <span>${s.profesionalEmoji} ${s.profesional}</span>
            <span class="srv-stars">${estrellas}</span>
            <span style="font-size:0.72rem">(${s.resenas} reseñas)</span>
          </div>
          <p style="font-size:0.8rem;color:var(--text-muted)">${s.descripcion}</p>
          <div class="srv-footer">
            <span class="srv-rate">${s.tarifa}</span>
            <a href="#" class="btn btn-primary" style="font-size:0.78rem;padding:0.4rem 0.9rem">Contactar</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  initFiltros();
}
