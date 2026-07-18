/* ─────────────────────────────────────────────
   Глобальная анимация страницы (вне React):
   инерционный скролл Lenis, синхронизация со
   ScrollTrigger, появление .reveal, активация
   шагов и прогресс-линия в How, колода экранов,
   разворот «Ключевые цифры».

   ЕДИНЫЙ ЯЗЫК ДВИЖЕНИЯ (одна шкала на весь сайт):
     ease   — power3.out и только он; ничего
              упругого, никаких bounce/elastic
     0.3 c  — микро-отклик (подмена значения)
     0.6 c  — появление элемента
     1.0 c  — крупный жест
   Скролл-приёмов на странице ровно два: колода
   в hero и прибитая сцена «О компании».
   ───────────────────────────────────────────── */
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const EASE = 'power3.out'

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

/* ─── Появление .reveal + шаги + прогресс ─── */
if (reduce) {
  gsap.set('.reveal', { opacity: 1, y: 0 })
} else {
  // сдержанное появление: короткий сдвиг и почти синхронный выход группы
  ScrollTrigger.batch('.reveal', {
    start: 'top 85%',
    onEnter: (batch) =>
      gsap.to(batch, {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: EASE,
        stagger: 0.05,
        overwrite: true,
      }),
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

/* ─── Ленивое видео в плитке (тяжёлый файл грузим только у вьюпорта) ───
   src проставляется при подходе к экрану, не на загрузке страницы.
   При reduced-motion видео не грузим — остаётся постер-скриншот. */
{
  const vids = document.querySelectorAll('video[data-lazy-video]')

  /* Ролики фактурой весят около 9,5 МБ на двоих. На экономии трафика и на
     медленном соединении это заметная плата за подложку, которая идёт под
     заливкой с прозрачностью 0.22: вместо видео там остаётся постер —
     тот же кадр, только статичный, и раздел выглядит так же. */
  const conn = navigator.connection
  const frugal = !!conn && (conn.saveData === true || /(^|-)2g$/.test(conn.effectiveType || ''))

  if (vids.length && !reduce && !frugal && 'IntersectionObserver' in window) {
    const load = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const v = e.target
        if (!v.src) { v.src = v.dataset.lazyVideo; v.load() }
        obs.unobserve(v)
      })
    }, { rootMargin: '300px' })

    // играем только пока плитка видна — экономим CPU/батарею
    const play = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const v = e.target
        if (e.isIntersecting) v.play?.().catch(() => {})
        else v.pause?.()
      })
    }, { threshold: 0.25 })

    vids.forEach((v) => { load.observe(v); play.observe(v) })
  }
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

    /* Тикаем только пока ридаут виден и вкладка активна: значения
       «дышат» ради первого экрана, а интервал раньше жил до конца
       сессии — перерисовывал невидимый текст и будил фоновые вкладки.
       Показания при возврате продолжаются с текущих, скачка нет. */
    const readout = tms[0].closest('.hero-readout') || tms[0]
    let timer = 0
    let onScreen = true

    const play = () => {
      if (timer || !onScreen || document.hidden) return
      timer = setInterval(() => tms.forEach(tick), 1400)
    }
    const stop = () => {
      if (!timer) return
      clearInterval(timer)
      timer = 0
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(
        (entries) => {
          onScreen = entries[0].isIntersecting
          onScreen ? play() : stop()
        },
        { threshold: 0 },
      ).observe(readout)
    }
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()))
    play()
  }
}

/* ─── scrollspy ───
   Магнитные CTA и spotlight-граница убраны: игривая микро-механика
   спорит с промышленным тоном. Отклик на нажатие остался, но чисто
   на CSS (:active) — без слежения за курсором. */
if (!reduce) {
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
}

/* Параллакс-глубина hero убрана: её роль перешла к механике колоды.
   Оба эффекта двигали вложенные друг в друга узлы одного экрана —
   трансформы складывались, и содержимое уезжало вдвое быстрее самого
   экрана. Слоистость окон теперь держится на .hero-window--back. */

/* ─── Колода экранов ───
   Приём первоисточника: секции не пиннятся и не липнут — они обычные,
   по 100svh, но обрезают содержимое. Уходящий экран уезжает вниз на
   свою высоту, приходящий выезжает сверху из-за той же кромки. Оба
   движения scrub'ятся один-в-один со скроллом (scrub: 0), поэтому
   колода ощущается как прямое продолжение жеста, а не как анимация.
   invalidateOnRefresh — чтобы значения пересчитались при ресайзе. */
if (!reduce) {
  const contents = gsap.utils.toArray('.deck-content')
  const inners = gsap.utils.toArray('.deck-inner')

  contents.forEach((el) => {
    gsap.to(el, {
      y: () => window.innerHeight,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: '100% 100%',            // низ экрана дошёл до низа вьюпорта
        end: () => '+=' + window.innerHeight,
        scrub: 0,
        invalidateOnRefresh: true,
      },
    })
  })

  // первый экран приходить неоткуда — он уже на месте
  inners.slice(1).forEach((el) => {
    gsap.set(el, { y: () => -window.innerHeight })
    gsap.to(el, {
      y: 0,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: '0% 0%',
        end: () => '+=' + window.innerHeight,
        scrub: 0,
        invalidateOnRefresh: true,
      },
    })
  })
}

/* ─── Шапка перенимает тему секции, проходящей под ней ───
   rootMargin схлопывает область наблюдения до полоски у верхней
   кромки экрана: «видимой» считается ровно та секция, что сейчас
   под шапкой. Работает и при reduced-motion — это не анимация,
   а читаемость текста на меняющемся фоне. */
{
  const nav = document.querySelector('nav.nav')
  const themed = document.querySelectorAll('[data-theme]')
  if (nav && themed.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) nav.setAttribute('data-theme', e.target.dataset.theme)
        })
      },
      { rootMargin: '0px 0px -100% 0px', threshold: 0 },
    )
    themed.forEach((s) => io.observe(s))
  }
}

/* ─── Бесконечные ленты (.marquee) ───
   Список клонируется, обе копии едут встык — шов не виден.
   Скорость привязана к ширине, чтобы длинные и короткие ленты
   двигались одинаково; за пределами экрана анимация на паузе. */
if (!reduce) {
  document.querySelectorAll('.marquee').forEach((lane) => {
    const list = lane.querySelector('.marquee-list')
    if (!list) return
    list.after(list.cloneNode(true))

    const speed = Number(lane.dataset.marqueeSpeed) || 45 // px/сек
    const dir = lane.dataset.marqueeDir === 'right' ? 1 : -1
    const tweens = [...lane.querySelectorAll('.marquee-list')].map((el) =>
      gsap.to(el, {
        x: dir * el.scrollWidth,
        repeat: -1,
        paused: true,
        duration: el.scrollWidth / speed,
        ease: 'none',
      }),
    )

    new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => tweens.forEach((t) => (e.isIntersecting ? t.play() : t.pause())))
      },
      { threshold: 0 },
    ).observe(lane)
  })
}

/* ─── Факты: цифра в прибитой колонке подменяется на скролле ───
   Превью-за-курсором убрано: оно повторяло скриншоты приложения и
   было самым «игровым» приёмом страницы. Остался тихий эффект —
   значение слева меняется тем пунктом, что сейчас в фокусе экрана. */
{
  const countEl = document.querySelector('[data-facts-count]')
  const unitEl = document.querySelector('[data-facts-unit]')
  const items = document.querySelectorAll('[data-facts-item]')

  if (countEl && unitEl && items.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          countEl.textContent = e.target.dataset.count
          unitEl.textContent = e.target.dataset.unit
          // текстовое значение («Реестр ПО») набирается мельче цифры
          countEl.classList.toggle('is-text', e.target.dataset.textual === '1')
        })
      },
      // узкая полоса на трети экрана — активен ровно один пункт
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    )
    items.forEach((el) => io.observe(el))
  }
}

/* ─── Разворот «Ключевые цифры»: наезд колонок со сдвигом ───
   Правую колонку скрипт не трогает вовсе: панели с числами непрозрачны
   и липнут к одной кромке, поэтому штабель собирается на чистом CSS.
   Здесь — только левая колонка и счётчик.

   Картинка повторяет тот же жест: приходящий слой выезжает снизу из-за
   кромки рамки, уходящий подаётся вверх — разная скорость читается как
   слоистость, а не как подмена кадра. Окно наезда — тот же экран, что
   у панели справа, но обрывается на 20% раньше: левый шов уходит вперёд
   правого, и в переходе видно оба — на разной высоте.

   Пин-сцены нет намеренно: прошлая версия уводила ленту абсолютным
   позиционированием и наезжала панелями на левую колонку.

   Ниже 900px колонок нет — есть один список, наезжать нечему; слои,
   кроме первого, остаются отведёнными за кромку средствами CSS. */
{
  const spread = document.querySelector('[data-spread]')
  const items = spread ? gsap.utils.toArray('[data-spread-item]', spread) : []
  const shots = spread ? gsap.utils.toArray('[data-spread-shot]', spread) : []
  const count = spread ? spread.querySelector('[data-spread-count]') : null

  // счётчик ведём отдельно: он должен работать и при reduced-motion
  if (items.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting || !count) return
          count.textContent = String(Number(e.target.dataset.spreadItem) + 1).padStart(2, '0')
        })
      },
      // узкая полоса по середине экрана — активен ровно один пункт
      { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
    )
    items.forEach((el) => io.observe(el))
  }

  if (!reduce && shots.length > 1 && window.matchMedia('(min-width: 901px)').matches) {
    /* Стартовое смещение слоёв задано в CSS (это же фолбэк без скрипта),
       но GSAP разбирает готовый transform в пиксельную базу y и кладёт
       yPercent поверх неё — слой тогда не поднимается выше кромки.
       Переписываем то же состояние своими единицами: база в нуле,
       смещение целиком в процентах. */
    gsap.set(shots.slice(1), { y: 0, yPercent: 100 })

    /* Отметки отмеряем от самого разворота, а не от панели справа: та
       липкая, и её замеренная позиция зависит от того, где стоял скролл
       в момент refresh. Здесь отсчёт чистый — по экрану на пункт.
       Конфиг собираем заново для каждого твина: ScrollTrigger дописывает
       в переданный объект ссылку на свою анимацию, и общий литерал увёл
       бы второй твин на первый. */
    const seg = (i) => ({
      trigger: spread,
      start: () => 'top top-=' + (i - 1) * window.innerHeight,
      end: () => '+=' + window.innerHeight * 0.8,   // на 20% экрана раньше правого шва
      scrub: 0,
      invalidateOnRefresh: true,
    })

    shots.slice(1).forEach((shot, k) => {
      const i = k + 1

      gsap.fromTo(shot,
        { yPercent: 100 },
        { yPercent: 0, ease: 'none', immediateRender: false, scrollTrigger: seg(i) })

      // уходящий слой подаётся вверх — параллакс между картинками
      gsap.fromTo(shots[i - 1],
        { yPercent: 0 },
        { yPercent: -8, ease: 'none', immediateRender: false, scrollTrigger: seg(i) })
    })
  }
}
