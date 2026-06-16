/* ─────────────────────────────────────────────
   Глобальная анимация страницы (вне React).
   Переехало из useSmoothScroll.js + useReveal.js:
   инерционный скролл Lenis, синхронизация со
   ScrollTrigger, появление .reveal, счётчики,
   активация шагов и прогресс-линия в How.
   ───────────────────────────────────────────── */
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ─── Инерционный скролл + якорные ссылки ─── */
if (!reduce) {
  const lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  })

  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)

  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]')
    if (!a) return
    const id = a.getAttribute('href')
    if (id.length > 1) {
      e.preventDefault()
      lenis.scrollTo(id, { offset: -70 })
    }
  })
}

/* ─── Появление .reveal + счётчики + шаги + прогресс ─── */
if (reduce) {
  gsap.set('.reveal', { opacity: 1, y: 0 })
} else {
  ScrollTrigger.batch('.reveal', {
    start: 'top 85%',
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.08,
        overwrite: true,
      }),
  })

  // счётчики статистики (count-up при появлении)
  gsap.utils.toArray('.count').forEach((node) => {
    const end = parseInt(node.dataset.count, 10) || 0
    const obj = { v: 0 }
    ScrollTrigger.create({
      trigger: node,
      start: 'top 88%',
      once: true,
      onEnter: () =>
        gsap.to(obj, {
          v: end,
          duration: 1.4,
          ease: 'power2.out',
          onUpdate: () => {
            node.textContent = Math.round(obj.v)
          },
        }),
    })
  })

  // активация шагов
  gsap.utils.toArray('.step').forEach((step) => {
    ScrollTrigger.create({
      trigger: step,
      start: 'top 70%',
      onEnter: () => step.classList.add('is-visible'),
    })
  })

  // прогресс-линия "Как работает": высоту задаём вручную в onUpdate/onRefresh,
  // читая offsetHeight вживую — устойчиво к сдвигам раскладки и дозагрузке картинок
  const fill = document.querySelector('.how-line-fill')
  const line = document.querySelector('.how-line')
  const steps = document.querySelector('.steps')
  const nodes = steps ? steps.querySelectorAll('.step-node') : []
  if (fill && line && steps && nodes.length) {
    // трек и заливка идут от центра первого узла до центра последнего —
    // линия завершается ровно на шаге 04, без «хвоста» внизу
    let topY = 0
    let span = 0
    const layout = () => {
      const sr = steps.getBoundingClientRect()
      const first = nodes[0].getBoundingClientRect()
      const last = nodes[nodes.length - 1].getBoundingClientRect()
      topY = first.top - sr.top + first.height / 2
      span = last.top - sr.top + last.height / 2 - topY
      gsap.set(line, { top: topY, bottom: 'auto', height: span })
      gsap.set(fill, { top: topY })
    }
    // высота заливки = путь от первого узла до «линии сканирования»
    // на 58% высоты экрана; точка-голова идёт ровно за позицией скролла
    const draw = () => {
      const sr = steps.getBoundingClientRect()
      const h = window.innerHeight * 0.58 - (sr.top + topY)
      gsap.set(fill, { height: Math.max(0, Math.min(span, h)) })
    }
    ScrollTrigger.create({
      trigger: steps,
      start: 'top bottom',
      end: 'bottom top',
      onUpdate: draw,
      onRefresh: () => { layout(); draw() },
    })
    layout()
    draw()
  }

  ScrollTrigger.refresh()
  // пересчёт после загрузки изображений, чтобы триггеры не съезжали
  window.addEventListener('load', () => ScrollTrigger.refresh())
}

/* ─── Живой hero-readout: значения слегка «дышат» (RU-формат) ─── */
{
  const tms = document.querySelectorAll('.hero-readout [data-tm]')
  if (tms.length && !reduce) {
    const fmt = (n, d = 0) =>
      n.toLocaleString('ru-RU', { minimumFractionDigits: d, maximumFractionDigits: d })
    const base = { depth: 3842, azimuth: 252.74, rop: 18.6, gamma: 72 }
    const tick = (el) => {
      const k = el.dataset.tm
      if (k === 'depth') { base.depth += Math.random() * 0.5; el.textContent = fmt(base.depth, 1) }
      else if (k === 'azimuth') el.textContent = fmt(base.azimuth + (Math.random() - 0.5) * 0.4, 2)
      else if (k === 'rop') el.textContent = fmt(base.rop + (Math.random() - 0.5) * 1.2, 1)
      else if (k === 'gamma') el.textContent = fmt(base.gamma + (Math.random() - 0.5) * 4, 0)
    }
    tms.forEach(tick)
    setInterval(() => tms.forEach(tick), 1400)
  }
}

/* ─── Прогресс-бар скролла + scrollspy + магнитные CTA + spotlight ─── */
if (!reduce) {
  // прогресс-бар «проходки» сверху
  const bar = document.querySelector('.scroll-progress > i')
  if (bar) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => gsap.set(bar, { scaleX: self.progress }),
    })
  }

  // scrollspy: подсветка активного пункта навигации по видимой секции
  document.querySelectorAll('section[id]').forEach((sec) => {
    const link = document.querySelector(`.nav-links a[href="#${sec.id}"]`)
    if (!link) return
    ScrollTrigger.create({
      trigger: sec,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: (self) => link.classList.toggle('active', self.isActive),
    })
  })

  // магнитные hero-CTA (только для точного указателя)
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.hero-actions .btn').forEach((el) => {
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect()
        gsap.to(el, {
          x: (e.clientX - r.left - r.width / 2) * 0.3,
          y: (e.clientY - r.top - r.height / 2) * 0.4,
          duration: 0.4,
          ease: 'power3.out',
        })
      })
      el.addEventListener('pointerleave', () =>
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' }))
    })
  }

  // spotlight: светящаяся граница карточек следует за курсором
  const spotSel = '.about-card, .product-card, .car-card, .blog-card, .contact-card'
  document.querySelectorAll(spotSel).forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect()
      card.style.setProperty('--mx', `${e.clientX - r.left}px`)
      card.style.setProperty('--my', `${e.clientY - r.top}px`)
    })
  })
}
