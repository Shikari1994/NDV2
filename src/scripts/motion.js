/* ─────────────────────────────────────────────
   Глобальная анимация страницы (вне React):
   инерционный скролл Lenis, синхронизация со
   ScrollTrigger, появление .reveal, активация
   шагов и прогресс-линия в How, разворот
   «Ключевые цифры».

   ЕДИНЫЙ ЯЗЫК ДВИЖЕНИЯ (одна шкала на весь сайт):
     ease   — power3.out и только он; ничего
              упругого, никаких bounce/elastic
     0.3 c  — микро-отклик (подмена значения)
     0.6 c  — появление элемента
     1.0 c  — крупный жест
   Скролл-приёмов на странице ровно два: накат
   экранов колоды и прибитая сцена «О компании».
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

/* ─── Колода экранов: компенсация наезда ───
   Заливки накатывают друг на друга средствами CSS (sticky у .deck-screen) —
   скролл-механики здесь нет. Задача этого блока ровно одна: пока экран
   въезжает снизу, его содержимое должно СТОЯТЬ на месте вьюпорта, а не
   ехать вместе с заливкой. Тогда шторка работает как маска — открывает
   неподвижную композицию снизу вверх, и константа «ГЕОТЕХНАВИГАЦИЯ»,
   стоящая на одной высоте у всех экранов, оказывается разрезанной цветом.

   Смещение экрана на входе — от 100svh до 0, поэтому компенсация ровно
   встречная: y от -100vh к 0. Твин один на экран и висит на внешнем
   узле .deck, а не на самой секции: у sticky-элемента замеренная позиция
   зависит от того, где стоял скролл в момент refresh. Отсчёт по экрану
   на секцию — чистый и переживает ресайз (invalidateOnRefresh).

   Прошлая версия вешала ВТОРОЙ, встречный твин на родителя .deck-content:
   трансформы вложенных узлов складывались, содержимое проходило двойной
   путь за экран скролла — отсюда были рывки и «левитация». */
if (!reduce) {
  const deck = document.querySelector('.deck')
  const inners = deck ? gsap.utils.toArray('.deck-screen .deck-inner', deck) : []

  // первый экран приходить неоткуда — он уже на месте
  inners.slice(1).forEach((el, k) => {
    const i = k + 1
    gsap.fromTo(
      el,
      { y: () => -window.innerHeight },
      {
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: deck,
          start: () => 'top top-=' + (i - 1) * window.innerHeight,
          end: () => '+=' + window.innerHeight,
          scrub: 0,
          invalidateOnRefresh: true,
        },
      },
    )
  })
}

/* ─── Сцена на экране 02: выход справа налево ───
   Экран приходит шторкой, а его содержимое компенсацией стоит на месте —
   значит «выехать» предметам самим неоткуда, ход им нужен собственный.
   Окно у него ровно то же, что у наката этого экрана: пока заливка идёт
   снизу вверх, ноутбук приходит из-за правой кромки, а телефон выползает
   из-под его корпуса. Шторка работает проявителем — сцена собирается
   ровно в тот момент, когда её открывают.

   Ось горизонтальная, и она же зеркалит первый экран: там снаряд идёт
   слева направо, здесь сцена справа налево. Вертикаль отдана колоде —
   вертикальный ход слился бы с накатом шторки в одно движение.

   Ход у каждого свой (data-lift-x, в процентах собственной ширины):
   у телефона он втрое длиннее, поэтому на входе телефон спрятан за
   корпусом ноутбука и выходит из-под него по мере наката. Разница
   скоростей на одной оси и есть глубина сцены.

   Отсчёт — по экрану на секцию от самой колоды, а не от липкой секции:
   у sticky-элемента замеренная позиция зависит от того, где стоял скролл
   в момент refresh. Конфиг триггера собирается заново для каждого твина:
   ScrollTrigger дописывает в переданный объект ссылку на свою анимацию. */
if (!reduce) {
  const deck = document.querySelector('.deck')
  const screens = deck ? gsap.utils.toArray('.deck-screen', deck) : []

  screens.forEach((screen, i) => {
    const devices = gsap.utils.toArray('[data-device]', screen)
    if (!devices.length) return

    devices.forEach((el) => {
      gsap.fromTo(
        el,
        { xPercent: Number(el.dataset.liftX) || 0 },
        {
          xPercent: 0,
          ease: 'none',
          scrollTrigger: {
            trigger: deck,
            start: () => 'top top-=' + (i - 1) * window.innerHeight,
            end: () => '+=' + window.innerHeight,
            scrub: 0,
            invalidateOnRefresh: true,
          },
        },
      )
    })
  })
}

/* ─── Мобильный клиент: ряд аппаратов выходит снизу ───
   Приём первоисточника: не общий сдвиг ряда, а РАЗНАЯ скорость у среднего
   и боковых. Одна скорость на всех дала бы картинку, которая просто едет;
   разная — сцену, которая собирается по мере подхода.

   Окно — подход секции к экрану: старт, когда верх сцены входит снизу,
   финиш, когда её низ садится на нижнюю кромку. К моменту, когда ряд
   прочитан целиком, движение уже закончено — дальше он стоит.

   scrub с задержкой, а не жёсткий: ряд идёт чуть мягче колеса, и это
   единственное место на странице, где инерция уместна — предметы
   тяжёлые и должны догонять скролл, а не быть приклеенными к нему. */
if (!reduce) {
  const stage = document.querySelector('[data-mob-stage]')
  const phones = stage ? gsap.utils.toArray('[data-mob-phone]', stage) : []

  phones.forEach((el) => {
    // 0 — средний (ближний план, короткий ход), 1 — боковые
    const depth = Number(el.dataset.depth) || 0
    gsap.fromTo(
      el,
      { yPercent: 10 + depth * 12 },
      {
        yPercent: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      },
    )
  })
}

/* ─── Снаряд на входном экране: выход и параллакс ───
   Первому экрану приходить неоткуда — компенсации наезда у него нет,
   и «выезд по скроллу» ему взять негде. Поэтому жест разложен на два,
   и триггеры у них разные:

     · выход — на загрузке. Снаряд заходит целиком из-за левой кромки,
       и заметно позже заголовка: пауза и есть весь эффект. Придёт
       вместе с текстом — прочитается фоном, придёт после — читается
       как отдельный жест. Проявления по opacity здесь нет намеренно:
       предмет въезжает из-за кадра, а не возникает в нём;
     · параллакс — пока СЛЕДУЮЩИЙ экран накатывает шторкой. Содержимое
       под ней стоит на месте, а снаряд продолжает идти вправо, туда же,
       куда смотрят наконечники. Одно направление на оба жеста: вход и
       уход складываются в непрерывный ход, а не в возврат.

   Ось у обоих жестов горизонтальная, и это не произвол: колода
   листается по вертикали, и вертикальный снаряд на вертикальном же
   ходу сливался бы с ней в одно движение. Поперёк — читается.

   Узла поэтому два: обёртка везёт параллакс, картинка внутри — выход.
   На одном узле твины подрались бы за y. Прятать снаряд в CSS нельзя —
   без JS и при reduced-motion он обязан просто стоять на месте. */
if (!reduce) {
  const rig = document.querySelector('[data-rig]')
  const deck = document.querySelector('.deck')

  if (rig) {
    // Кадр стоит правым торцом на 92vw, поэтому -92% ставят снаряд
    // ровно за левую кромку — дальше уводить нечего. Выход едет на
    // обёртке: на самом кадре свой transform (центровка по оси).
    gsap.from(rig.parentElement, { x: '-92%', duration: 1.5, ease: EASE, delay: 0.5 })

    gsap.to(rig.closest('.deck-rig'), {
      x: () => 0.11 * window.innerWidth,
      ease: 'none',
      scrollTrigger: {
        trigger: deck,
        start: 'top top',
        end: () => '+=' + window.innerHeight,
        scrub: 0,
        invalidateOnRefresh: true,
      },
    })
  }
}

/* ─── Шапка перенимает тему секции, проходящей под ней ───
   rootMargin схлопывает область наблюдения до полоски у верхней
   кромки экрана: «видимой» считается ровно та секция, что сейчас
   под шапкой. Работает и при reduced-motion — это не анимация,
   а читаемость текста на меняющемся фоне.

   Экраны колоды липкие и накрывают друг друга, поэтому полоску
   разом пересекают несколько секций. Верхняя из них — последняя
   по DOM: она и рисуется поверх, её тему и берём. Реагировать на
   каждое событие по отдельности здесь нельзя — накрытая секция
   события не шлёт, и на обратном скролле шапка застревала бы
   в теме уехавшей шторки. */
{
  const nav = document.querySelector('nav.nav')
  const themed = [...document.querySelectorAll('[data-theme]')]
  if (nav && themed.length && 'IntersectionObserver' in window) {
    const visible = new Set()
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target)))
        for (let i = themed.length - 1; i >= 0; i--) {
          if (visible.has(themed[i])) {
            nav.setAttribute('data-theme', themed[i].dataset.theme)
            break
          }
        }
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
