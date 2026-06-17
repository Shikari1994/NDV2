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

  // прогресс-линия "Как работает": высота заливки = прогресс скролла сквозь
  // блок шагов (start..end), привязанный к ScrollTrigger — устойчиво к pin
  // соседних секций, ресайзу и дозагрузке картинок
  const fill = document.querySelector('.how-line-fill')
  const line = document.querySelector('.how-line')
  const steps = document.querySelector('.steps')
  const done = document.querySelector('.how-done')
  const nodes = steps ? steps.querySelectorAll('.step-node') : []
  if (fill && line && steps && nodes.length) {
    // трек и заливка идут от центра первого узла до центра последнего
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
    layout()
    ScrollTrigger.create({
      trigger: steps,
      // «линия сканирования» на 60% экрана: 0 — когда верх шагов на ней,
      // 1 — когда низ шагов её прошёл
      start: 'top 60%',
      end: 'bottom 60%',
      onRefresh: layout,
      onUpdate: (self) => {
        gsap.set(fill, { height: span * self.progress })
        // достигли низа блока → состояние «цель достигнута»
        const complete = self.progress > 0.985
        steps.classList.toggle('is-complete', complete)
        if (done) done.classList.toggle('show', complete)
      },
    })
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

/* ─── scrollspy + магнитные CTA + spotlight ─── */
if (!reduce) {
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
      // press-feedback: лёгкий «вдавливание» при нажатии (Emil: кнопка отвечает на клик)
      el.addEventListener('pointerdown', () =>
        gsap.to(el, { scale: 0.96, duration: 0.15, ease: 'power2.out' }))
      el.addEventListener('pointerup', () =>
        gsap.to(el, { scale: 1, duration: 0.3, ease: 'power3.out' }))
      // возврат без elastic — чистый ease-out (Impeccable/Emil: без bounce/elastic)
      el.addEventListener('pointerleave', () =>
        gsap.to(el, { x: 0, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }))
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

/* ─── Секционный HUD: приборное табло текущего раздела ───
   Работает и при reduced-motion (это навигационный индикатор,
   а не декоративная анимация) — гасим только «перещёлк» номера. */
{
  const hud = document.querySelector('.section-hud')
  if (hud) {
    const noEl = hud.querySelector('[data-shud-no]')
    const labelEl = hud.querySelector('[data-shud-label]')
    const barEl = hud.querySelector('[data-shud-bar]')
    // id секции → [номер, имя]; hero — «00 / Обзор»
    const META = {
      hero:     ['00', 'Обзор'],
      about:    ['01', 'О компании'],
      software: ['02', 'Программный комплекс'],
      products: ['03', 'Линейка оборудования'],
      how:      ['04', 'Принцип работы'],
      store:    ['05', 'Онлайн-магазин'],
      contact:  ['06', 'Контакты'],
    }
    let current = null
    const setMeta = (id) => {
      const m = META[id]
      if (!m || current === id) return
      current = id
      labelEl.textContent = m[1]
      if (reduce) { noEl.textContent = m[0]; return }
      // номер «перещёлкивается», как разряд на табло прибора
      gsap.timeline()
        .to(noEl, { yPercent: -70, opacity: 0, duration: 0.16, ease: 'power2.in' })
        .add(() => { noEl.textContent = m[0] })
        .fromTo(noEl, { yPercent: 70, opacity: 0 },
          { yPercent: 0, opacity: 1, duration: 0.3, ease: 'power3.out' })
    }
    // активная секция и прогресс внутри неё (линия 50% экрана)
    document.querySelectorAll('section[id]').forEach((sec) => {
      ScrollTrigger.create({
        trigger: sec,
        start: 'top 50%',
        end: 'bottom 50%',
        onToggle: (self) => { if (self.isActive) setMeta(sec.id) },
        onUpdate: (self) => { if (self.isActive) gsap.set(barEl, { scaleX: self.progress }) },
      })
    })
    // HUD появляется после ухода с первого экрана
    ScrollTrigger.create({
      trigger: '#hero',
      start: 'bottom 60%',
      onEnter: () => hud.classList.add('show'),
      onLeaveBack: () => hud.classList.remove('show'),
    })
  }
}

/* ─── Параллакс-глубина hero: окна интерфейса уходят вверх
   быстрее текста, создавая слоистую глубину при скролле ─── */
if (!reduce) {
  const front = document.querySelector('.hero-visual .hero-window:not(.hero-window--back)')
  const back = document.querySelector('.hero-window--back')
  const text = document.querySelector('.hero-text')
  const st = { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: 0.5 }
  if (front) gsap.to(front, { y: -52, ease: 'none', scrollTrigger: st })
  if (back) gsap.to(back, { y: -96, ease: 'none', scrollTrigger: st })
  if (text) gsap.to(text, { y: -16, opacity: 0.55, ease: 'none', scrollTrigger: st })
}

/* ─── Закреплённые ленты (.pin-lane): «О компании» и «Оборудование» ───
   Секция прилипает, вся лента (интро + карточки) едет вбок по мере
   вертикального скролла — интро уезжает влево, карточки встают на место.
   Только десктоп + без reduced-motion; иначе стек/свайп. */
if (!reduce && window.matchMedia('(min-width: 901px)').matches) {
  document.querySelectorAll('.pin-lane').forEach((stage) => {
    const track = stage.querySelector('.pin-track')
    if (!track) return
    // дистанция прокрутки = насколько лента шире экрана
    const distance = () => Math.max(0, track.scrollWidth - stage.clientWidth)
    gsap.to(track, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: () => '+=' + distance(),
        pin: true,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        // пины создаются последними и не по порядку страницы → без приоритета
        // их спейсеры встают ПОСЛЕ того, как HUD/scrollspy измерят свои позиции,
        // и счётчик секций перещёлкивается раньше времени. Высокий приоритет
        // заставляет пины пересчитаться первыми — спейсеры на месте до замеров.
        refreshPriority: 1,
      },
    })
  })
}
