import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
  const canvasRef = useRef(null);
  const cursorRef = useRef(null);
  const ringRef   = useRef(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const ring   = ringRef.current;
    let mx=0, my=0, rx=0, ry=0;
    let animId;

    const onMouseMove = (e) => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = (mx - 5) + 'px';
      cursor.style.top  = (my - 5) + 'px';
    };
    document.addEventListener('mousemove', onMouseMove);

    function animRing() {
      rx += (mx - rx - 18) * 0.12;
      ry += (my - ry - 18) * 0.12;
      ring.style.left = rx + 'px';
      ring.style.top  = ry + 'px';
      animId = requestAnimationFrame(animRing);
    }
    animRing();

    const hoverEls = document.querySelectorAll('a,button,.feature-card,.task-mock,.stack-item');
    hoverEls.forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.style.transform='scale(2)'; ring.style.transform='scale(1.5)'; });
      el.addEventListener('mouseleave', () => { cursor.style.transform='scale(1)'; ring.style.transform='scale(1)'; });
    });

    // Canvas partículas
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    let W, H, dots = [];
    let canvasAnimId;

    function resize() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (let i = 0; i < 60; i++) {
      dots.push({
        x:  Math.random() * 1400,
        y:  Math.random() * 900,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r:  Math.random() * 1.5 + 0.5,
      });
    }

    function drawBg() {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx; d.y += d.vy;
        if (d.x < 0 || d.x > W) d.vx *= -1;
        if (d.y < 0 || d.y > H) d.vy *= -1;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = '#4fffb0';
        ctx.fill();
      });
      dots.forEach((a, i) => {
        dots.slice(i + 1).forEach(b => {
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < 140) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(79,255,176,${0.12 * (1 - dist / 140)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      canvasAnimId = requestAnimationFrame(drawBg);
    }
    drawBg();

    // Cleanup al desmontar
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
      cancelAnimationFrame(canvasAnimId);
    };
  }, []);

  return (
    <>
      <div className="cursor"     ref={cursorRef} />
      <div className="cursor-ring" ref={ringRef} />
      <canvas ref={canvasRef} id="bg" />

      <section className="hero">
        <div className="hero-label">Open source · Django + React</div>
        <h1>
          <div className="line"><span>Gestioná</span></div>
          <div className="line"><span>proyectos <span className="accent">sin</span></span></div>
          <div className="line"><span>fricción.</span></div>
        </h1>
        <p className="hero-sub">
          Un tablero Kanban completo con workspaces, drag &amp; drop en tiempo real
          y control de accesos por roles. Construido con Django REST Framework y React.
        </p>
        <div className="hero-actions">
          <a href="#" className="btn-primary">Ver demo en vivo</a>
          <a href="#" className="btn-secondary">Ver en GitHub</a>
        </div>
        <div className="hero-stats">
          <div>
            <div className="stat-num">3<span>+</span></div>
            <div className="stat-label">Apps Django</div>
          </div>
          <div>
            <div className="stat-num">15<span>+</span></div>
            <div className="stat-label">Endpoints REST</div>
          </div>
          <div>
            <div className="stat-num">JWT<span>.</span></div>
            <div className="stat-label">Auth segura</div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="section-tag">// Funcionalidades</div>
        <h2 className="section-title">Todo lo que necesitás para trabajar en equipo.</h2>
        <div className="features-grid">
          {[
            { n:'01', t:'Workspaces y roles',      d:'Creá espacios de trabajo, invitá miembros y asignales roles. El owner tiene control total sobre quién puede ver y editar.' },
            { n:'02', t:'Kanban con drag & drop',  d:'Mové tareas entre columnas con optimistic updates. La UI se actualiza al instante y sincroniza con el backend en segundo plano.' },
            { n:'03', t:'Auth JWT completa',        d:'Login, registro y refresh automático de tokens. Si el access token expira, se renueva solo sin interrumpir la sesión.' },
            { n:'04', t:'API REST documentada',     d:'15+ endpoints con ViewSets, permisos por objeto y filtros. Testeada con Postman y lista para consumir desde cualquier cliente.' },
            { n:'05', t:'Prioridades y fechas',     d:'Cada tarea tiene prioridad (alta, media, baja), fecha límite y asignados. Todo editable inline sin salir del tablero.' },
            { n:'06', t:'PostgreSQL + Docker',      d:'Base de datos relacional con modelos bien definidos. Docker Compose para levantar todo el entorno con un solo comando.' },
          ].map(f => (
            <div className="feature-card" key={f.n}>
              <div className="feature-num">{f.n}</div>
              <div className="feature-title">{f.t}</div>
              <div className="feature-desc">{f.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="kanban-preview">
        <div className="preview-header">
          <div>
            <div className="section-tag">// Preview</div>
            <h2 className="section-title" style={{ marginBottom:0, fontSize:'1.8rem' }}>El tablero en acción.</h2>
          </div>
          <div className="preview-nav">
            <div className="preview-dot active" />
            <div className="preview-dot" />
            <div className="preview-dot" />
          </div>
        </div>
        <div className="board-mock">
          <div className="col-mock">
            <div className="col-header"><span className="col-name">Por hacer</span><span className="col-count">3</span></div>
            <div className="task-mock"><div className="task-title">Diseñar modelo de datos</div><span className="task-badge badge-high">Alta</span></div>
            <div className="task-mock"><div className="task-title">Configurar Docker Compose</div><span className="task-badge badge-mid">Media</span></div>
            <div className="task-mock task-drag"><div className="task-title">Setup inicial React</div><span className="task-badge badge-low">Baja</span></div>
          </div>
          <div className="col-mock">
            <div className="col-header"><span className="col-name">En progreso</span><span className="col-count">2</span></div>
            <div className="task-mock"><div className="task-title">API de autenticación JWT</div><span className="task-badge badge-high">Alta</span></div>
            <div className="task-mock"><div className="task-title">ViewSets y serializers</div><span className="task-badge badge-mid">Media</span></div>
          </div>
          <div className="col-mock">
            <div className="col-header"><span className="col-name">Listo</span><span className="col-count">3</span></div>
            <div className="task-mock"><div className="task-title">Modelos Django</div><span className="task-badge badge-low">Baja</span></div>
            <div className="task-mock"><div className="task-title">Configurar PostgreSQL</div><span className="task-badge badge-low">Baja</span></div>
            <div className="task-mock"><div className="task-title">CORS y settings</div><span className="task-badge badge-mid">Media</span></div>
          </div>
        </div>
      </section>

      <section className="stack">
        <div>
          <div className="section-tag">// Stack técnico</div>
          <h2 className="section-title">Tecnologías reales, usadas en producción.</h2>
          <p style={{ color:'var(--muted)', fontSize:'0.82rem', lineHeight:1.8 }}>
            Cada tecnología fue elegida por ser estándar en la industria y estar presente en ofertas laborales reales.
          </p>
        </div>
        <div className="stack-list">
          {[
            { badge:'be', name:'Django REST Framework', desc:'ViewSets · Serializers' },
            { badge:'be', name:'Simple JWT',             desc:'Auth · Refresh tokens' },
            { badge:'be', name:'PostgreSQL',             desc:'Base de datos' },
            { badge:'fe', name:'React + Vite',           desc:'SPA · Fast HMR' },
            { badge:'fe', name:'Zustand',                desc:'Estado global' },
            { badge:'fe', name:'@hello-pangea/dnd',      desc:'Drag & drop' },
          ].map(s => (
            <div className="stack-item" key={s.name}>
              <span className={`stack-badge ${s.badge}`}>{s.badge === 'be' ? 'Backend' : 'Frontend'}</span>
              <span className="stack-name">{s.name}</span>
              <span className="stack-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="cta">
        <h2>¿Listo para<br /><span style={{ color:'var(--accent)' }}>arrancar?</span></h2>
        <p>Cloná el repo, levantá el entorno y tenés el proyecto corriendo en minutos.</p>
        <div className="cta-buttons">
          <a href="#" className="btn-primary">Ver demo en vivo</a>
          <a href="#" className="btn-secondary" style={{ color:'var(--muted)' }}>Ver código en GitHub →</a>
        </div>
      </section>

      <footer>
        <div className="footer-copy">© 2026 Proyecta. Construido con Django + React.</div>
        <div className="footer-links">
          <a href="#">GitHub</a>
          <a href="#">Demo</a>
          <a href="#">Contacto</a>
        </div>
      </footer>
    </>
  );
}