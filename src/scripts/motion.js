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

/* ─── Мобильный ресайз не считаем ресайзом ───
   Показ и скрытие адресной строки в мобильном браузере шлют resize, хотя
   раскладка не изменилась ни на пиксель. Без этого флага каждый такой
   жест вызывает пересчёт всех триггеров ПОСРЕДИ прокрутки, и липкие
   секции — колода, разворот «Ключевые цифры», глобус — дёргаются. */
ScrollTrigger.config({ ignoreMobileResize: true })

const EASE = 'power3.out'

/* ─── Высота липкого экрана ───
   Все липкие сцены на странице стоят в 100svh, а svh — это «малый»
   вьюпорт, то есть высота ПРИ ПОКАЗАННОЙ адресной строке. window.innerHeight
   на мобильном означает другое: текущую высоту, которая гуляет вместе
   с этой строкой. На десктопе числа совпадают, на телефоне расходятся
   на 60–100px — и ровно на столько же разъезжались отсчёты ниже.

   Поэтому меряем не окно, а сам элемент: он и есть 100svh по CSS,
   каким бы это значение ни было на текущем устройстве. Функции, а не
   константы: их зовёт ScrollTrigger на каждом refresh. */
const stickyH = (el) => el?.offsetHeight || window.innerHeight

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

/* ─── Тач-скролл под контролем JS ───
   На колоде два движения идут навстречу: заливку экрана везёт CSS (sticky),
   её содержимое — встречный твин на scrub, то есть JS. Совпадать они обязаны
   покадрово, иначе содержимое ходит относительно собственного фона.

   На десктопе они совпадают сами: скролл там ведёт Lenis, тоже из JS, и оба
   движения считаются в одном кадре. На телефоне тач-скролл нативный — его
   ведёт композитор браузера отдельным потоком, поэтому sticky-заливка идёт
   за пальцем без задержки, а scroll-события в main-поток приходят позже и
   во время инерции рывками. Твин отставал от заливки на кадр-другой — это
   ровно та тряска, которая читалась на прокрутке колоды. Настройками GSAP
   она не лечится: причина не в кадре анимации, а в том, что два движения
   считают разные потоки.

   Лечили это через ScrollTrigger.normalizeScroll({ type: 'touch' }): он
   перехватывает тач и ведёт его тем же rAF-циклом, что и анимации, —
   рассинхрону взяться неоткуда.

   СЕЙЧАС ПЕРЕХВАТ СНЯТ — это проверка на живом устройстве, а не вывод.
   На айфонах скролл идёт гладко, но с частотой примерно вдвое ниже
   нужной, и перехват — первый подозреваемый: он уводит скролл из
   композитора браузера в main-поток, а значит и частоту кадров привязывает
   к нему. Воспроизвести это в эмуляторе не удалось (Chromium с профилем
   Pixel 7 держит одинаковые ~59 fps и с перехватом, и без), поэтому
   решает проверка на самих телефонах.

   Что смотреть при проверке: вернулась ли тряска содержимого колоды на
   прокрутке — ради неё перехват и ставили. Если тряски нет, причина,
   скорее всего, уже устранена отдельно: рывки давал ВТОРОЙ, встречный
   твин на .deck-content (см. блок колоды ниже), и его убрали.

   Если тряска вернётся, а плавность вырастет — возвращать перехват не
   надо: правильное лечение тогда увести компенсацию наезда на CSS
   scroll-driven animation (animation-timeline: scroll()), где обе
   половины движения считает композитор и расходиться им негде.

   При reduced-motion перехват не включался и раньше: скролл-твинов там
   нет, синхронизировать нечего. */

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

  // прогресс-линия "Как работает": высота заливки = прогресс скролла сквозь
  // блок шагов (start..end), привязанный к ScrollTrigger — устойчиво к pin
  // соседних секций, ресайзу и дозагрузке картинок.
  // Узел «загорается» не по своему отдельному триггеру, а строго в момент,
  // когда точка на конце заливки поравнялась с его центром — одна точка
  // отсчёта на оба эффекта, поэтому подсветка не может разъехаться с линией.
  const fill = document.querySelector('.how-line-fill')
  const line = document.querySelector('.how-line')
  const steps = document.querySelector('.steps')
  const done = document.querySelector('.how-done')
  const stepEls = steps ? Array.from(steps.querySelectorAll('.step')) : []
  const nodes = steps ? steps.querySelectorAll('.step-node') : []
  if (fill && line && steps && nodes.length) {
    // трек и заливка идут от центра первого узла до центра последнего
    let topY = 0
    let span = 0
    let offsets = []
    const layout = () => {
      const sr = steps.getBoundingClientRect()
      const first = nodes[0].getBoundingClientRect()
      const last = nodes[nodes.length - 1].getBoundingClientRect()
      topY = first.top - sr.top + first.height / 2
      span = last.top - sr.top + last.height / 2 - topY
      offsets = Array.from(nodes).map((n) => {
        const r = n.getBoundingClientRect()
        return r.top - sr.top + r.height / 2 - topY
      })
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
        const fillHeight = span * self.progress
        gsap.set(fill, { height: fillHeight })
        stepEls.forEach((step, i) => {
          step.classList.toggle('is-visible', fillHeight >= offsets[i])
        })
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
   путь за экран скролла — отсюда были рывки и «левитация».

   ─── CSS view-timeline вместо этого твина ───
   Три сцен-твина ниже (.deck-inner, [data-device], параллакс .deck-rig)
   продублированы в index.css нативным animation-timeline: view() — он
   считается тем же потоком композитора, что и сам sticky-скролл, и не
   отстаёт на тач-инерции (см. комментарий в index.css у .deck-inner).
   Там, где браузер это умеет, JS-версию нужно ПОГАСИТЬ — иначе два
   твина одновременно правят один transform. Где не умеет — GSAP остаётся
   единственным источником движения, как и было.

   На тач тряска осталась и с CSS-версией — судя по всему, баг самой
   связки sticky + animation-timeline в мобильном движке, а не в твине.
   Поэтому на тач (см. тот же media-гейт в index.css) не включаем и
   GSAP-фолбэк тоже: на мобильном сейчас никакого скролл-твина нет
   вообще, ни CSS, ни JS — дёргать нечему. */
const supportsViewTimeline = !!window.CSS?.supports?.('animation-timeline', 'view()')
const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches

const deck = reduce ? null : document.querySelector('.deck')

/* Выход снаряда на загрузке — не скролл-твин, а разовая анимация по
   времени, десинхрону взяться неоткуда, поэтому она вне ветки поддержки
   и идёт всегда. Параллакс на скролле (внутри ветки ниже) — другое дело. */
const rig = deck?.querySelector('[data-rig]')
if (rig) {
  // Кадр стоит правым торцом на 92vw, поэтому -92% ставят снаряд
  // ровно за левую кромку — дальше уводить нечего. Выход едет на
  // обёртке: на самом кадре свой transform (центровка по оси).
  gsap.from(rig.parentElement, { x: '-92%', duration: 1.5, ease: EASE, delay: 0.5 })
}

if (deck && !supportsViewTimeline && isFinePointer) {
  /* Окно наката i-го экрана: экран скролла на секцию, отсчёт от самой
     колоды. Конфиг собирается заново на каждый вызов — ScrollTrigger
     дописывает в переданный объект ссылку на свою анимацию, и общий
     литерал увёл бы второй твин на первый. */
  /* Шаг колоды — высота её липкого экрана (100svh), а не окна: именно на
     столько уезжает заливка за один накат. См. stickyH выше. */
  const deckStep = () => stickyH(deck.querySelector('.deck-screen'))

  const deckSeg = (i) => ({
    trigger: deck,
    start: () => 'top top-=' + (i - 1) * deckStep(),
    end: () => '+=' + deckStep(),
    scrub: 0,
    invalidateOnRefresh: true,
  })

  // первый экран приходить неоткуда — он уже на месте
  gsap.utils.toArray('.deck-screen .deck-inner', deck).slice(1).forEach((el, k) => {
    gsap.fromTo(
      el,
      { y: () => -deckStep() },
      { y: 0, ease: 'none', scrollTrigger: deckSeg(k + 1) },
    )
  })

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

     Окно у сцены то же, что у наката её экрана, — общий deckSeg выше. */
  gsap.utils.toArray('.deck-screen', deck).forEach((screen, i) => {
    gsap.utils.toArray('[data-device]', screen).forEach((el) => {
      gsap.fromTo(
        el,
        { xPercent: Number(el.dataset.liftX) || 0 },
        { xPercent: 0, ease: 'none', scrollTrigger: deckSeg(i) },
      )
    })
  })

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
         уход складываются в непрерывный ход, а не в возврат. Окно у
         параллакса — накат первого экрана, тот же deckSeg(1).

     Ось у обоих жестов горизонтальная, и это не произвол: колода
     листается по вертикали, и вертикальный снаряд на вертикальном же
     ходу сливался бы с ней в одно движение. Поперёк — читается.

     Узла поэтому два: обёртка везёт параллакс, картинка внутри — выход.
     На одном узле твины подрались бы за y. Прятать снаряд в CSS нельзя —
     без JS и при reduced-motion он обязан просто стоять на месте. */
  if (rig) {
    gsap.to(rig.closest('.deck-rig'), {
      x: () => 0.11 * window.innerWidth,
      ease: 'none',
      scrollTrigger: deckSeg(1),
    })
  }
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
  /* На узком экране ряд стоит веером внахлёст (боковые заходят за средний
     отрицательными полями). Разводить их там ещё и по горизонтали нельзя —
     перекрытие, на котором держится вся композиция, разъедется. Поэтому
     широкий экран получает полный сбор веера, узкий — только вертикаль. */
  const fan = window.matchMedia('(min-width: 601px)').matches

  phones.forEach((el, i) => {
    // 0 — средний (ближний план, короткий ход), 1 — боковые
    const depth = Number(el.dataset.depth) || 0
    // −1 левый, 0 средний, +1 правый: знак разводит боковые в свои стороны
    const side = depth === 0 ? 0 : i === 0 ? -1 : 1

    /* Ряд не просто едет вверх — он СОБИРАЕТСЯ. Боковые стартуют ниже,
       ближе к центру, чуть завалены на средний и мельче: пока идёт скролл,
       веер раскрывается, аппараты выравниваются и выходят на свой размер.
       Средний почти на месте с самого начала — он ось сцены, вокруг него
       и происходит сборка.

       Пивот у основания корпуса: аппараты стоят на полу сцены и клонятся
       как предметы, а не крутятся вокруг своей середины. */
    gsap.fromTo(
      el,
      {
        yPercent: 8 + depth * 26,
        xPercent: fan ? side * -9 : 0,
        rotate: fan ? side * -5 : 0,
        scale: 1 - depth * 0.07,
      },
      {
        yPercent: 0,
        xPercent: 0,
        rotate: 0,
        scale: 1,
        transformOrigin: '50% 100%',
        /* Средний приходит раньше боковых и притормаживает у места, боковые
           дособираются линейно — отсюда ощущение, что ряд живой, а не едет
           одним куском. */
        ease: depth === 0 ? 'power2.out' : 'none',
        scrollTrigger: {
          trigger: stage,
          start: 'top bottom',
          end: 'bottom bottom',
          /* разный scrub — разная инерция: боковые тяжелее и заметнее
             догоняют колесо, средний держится ближе к скроллу */
          scrub: depth === 0 ? 0.45 : 1,
          invalidateOnRefresh: true,
        },
      },
    )

    /* Второй такт: когда секция уходит вверх, ряд не замирает намертво —
       средний чуть отстаёт от скролла, боковые чуть обгоняют. Расхождение
       мелкое (единицы процентов), но пока сцена на экране, она продолжает
       дышать, а не превращается в статичный кадр.

       Цель — картинка внутри figure, а не сама figure: два scrub-твина на
       одном yPercent спорили бы на стыке окон (у обоих своя задержка), а
       так сборка живёт на обёртке, дрейф — на вложенном узле, и они друг
       друга не трогают. */
    gsap.to(el.querySelector('img'), {
      yPercent: depth === 0 ? 4 : -5,
      ease: 'none',
      scrollTrigger: {
        trigger: stage,
        start: 'bottom bottom',
        end: 'bottom top',
        scrub: depth === 0 ? 0.45 : 1,
        invalidateOnRefresh: true,
      },
    })
  })
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

/* Разворот «Ключевые цифры» больше не отдельная сцена: он слился с
   глобусом в единую прибитую сцену «О компании». Её ведёт собственный
   модуль scripts/aboutScene.js (карточки, ночь, набор строки) вместе
   с scripts/globeCanvas.js (земной шар) — оба на одном прогрессе. */
