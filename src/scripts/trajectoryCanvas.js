/* ─────────────────────────────────────────────
   ТРАЕКТОРИЯ СТВОЛА · процедурный 3D-объект

   Ответ на крупный пластический объект первоисточника
   (витая труба во весь экран с приколотыми подписями).
   Только у нас это не абстракция: рисуется настоящий
   профиль скважины — вертикальный участок, набор угла
   и горизонтальный ствол по продуктивному пласту.

   Никаких библиотек и внешних ассетов: кривая считается
   формулой, проекция — руками, объём трубы имитируется
   поперечным градиентом на каждом сегменте. Порядок
   отрисовки — по глубине, поэтому самопересечения
   ствола выглядят корректно.

   Подписи — обычные DOM-узлы: их позиция каждый кадр
   берётся из проекции опорных точек кривой, поэтому
   они «приколоты» к трубе и остаются доступными
   для чтения с экрана.
   ───────────────────────────────────────────── */

const root = document.querySelector('[data-trajectory]')

if (root) {
  const canvas = root.querySelector('.traj-canvas')
  const ctx = canvas && canvas.getContext('2d')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (ctx) {
    /* ── профиль скважины в «промысловых» координатах ──
       t: 0 — устье, 1 — забой. Возвращает точку в мировых
       единицах: x — отход, y — глубина (вниз), z — смещение
       по азимуту. Вертикаль → участок набора угла → горизонт
       с пологим доворотом, как в реальном сложном профиле. */
    const SEG = 260
    const path = []
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG
      // доля вертикали / набора / горизонтали
      const build = Math.min(1, Math.max(0, (t - 0.22) / 0.34))
      // s-образное сглаживание набора угла
      const e = build * build * (3 - 2 * build)
      const horiz = Math.min(1, Math.max(0, (t - 0.56) / 0.44))

      const depth = 0.22 * Math.min(t, 0.22) / 0.22 + 0.52 * e
      const reach = 0.62 * e + 1.35 * horiz
      // пологий доворот по азимуту на горизонтальном участке
      const az = Math.sin(horiz * Math.PI * 1.6) * 0.26 * horiz
        + Math.sin(t * 7.0) * 0.02

      path.push({
        x: reach - 0.55,
        y: depth * 1.5 - 0.5,
        z: az,
      })
    }

    // опорные точки для подписей: доля вдоль ствола
    const MARKS = Array.from(root.querySelectorAll('[data-traj-mark]')).map((el) => ({
      el,
      t: parseFloat(el.dataset.trajMark),
    }))

    /* Профиль построен от устья, поэтому по горизонтали он лежит не
       вокруг нуля, а смещён вправо: x идёт от -0.55 до 1.42. На широком
       экране это и нужно — труба уходит вправо, под сноску. На узком
       из-за смещения забой вылезал за кромку, поэтому там объект
       центруется по собственному габариту. */
    const MID_X = (Math.min(...path.map((p) => p.x)) + Math.max(...path.map((p) => p.x))) / 2

    let w = 0, h = 0, dpr = 1, raf = 0, visible = false
    let yaw = 0, targetYaw = 0
    let narrow = false

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      const r = canvas.getBoundingClientRect()
      w = r.width; h = r.height
      // тот же порог, что у раскладки секции в index.css
      narrow = window.matchMedia('(max-width: 900px)').matches
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      // ширины подписей меряем на ресайзе, а не в кадре: чтение offsetWidth
      // внутри цикла заставляло браузер пересчитывать раскладку на каждый кадр
      for (const m of MARKS) m.half = m.el.offsetWidth / 2
    }

    /* перспективная проекция: поворот вокруг вертикальной оси,
       лёгкий наклон камеры вниз, затем деление на глубину */
    const TILT = 0.42
    const DIST = 3.4
    const project = (p, sinY, cosY, scale, cx, cy, shift) => {
      const rx = (p.x - shift) * cosY - p.z * sinY
      const rz = (p.x - shift) * sinY + p.z * cosY
      const ry = p.y * Math.cos(TILT) - rz * Math.sin(TILT)
      const rzz = p.y * Math.sin(TILT) + rz * Math.cos(TILT)
      const d = DIST + rzz
      const k = DIST / d
      return { sx: cx + rx * scale * k, sy: cy + ry * scale * k, k, depth: rzz }
    }

    const draw = () => {
      raf = 0
      ctx.clearRect(0, 0, w, h)
      if (!w || !h) return

      yaw += (targetYaw - yaw) * 0.06
      const sinY = Math.sin(yaw), cosY = Math.cos(yaw)
      /* На широком экране объект разлит по всей секции — прежняя формула
         и прежний центр, композиция не меняется.

         На узком он живёт в собственной невысокой полосе, и там масштаб
         не задаётся числом, а подбирается под габарит: профиль проецируется
         пробно в единичном масштабе, по нему меряется рамка и уже из неё
         считаются и масштаб, и центр. Экономия на догадках: при любой
         ширине полосы и любом угле поворота ствол занимает её целиком и
         стоит по центру, а не жмётся к нижней кромке — раньше он был
         смещён вниз, потому что профиль отсчитывается от устья и его
         середина не совпадает с началом координат. */
      let scale, cx, cy
      const shift = narrow ? MID_X : 0
      if (narrow) {
        // проекция линейна по масштабу, поэтому рамку достаточно снять один раз
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        for (const p of path) {
          const q = project(p, sinY, cosY, 1, 0, 0, shift)
          if (q.sx < minX) minX = q.sx
          if (q.sx > maxX) maxX = q.sx
          if (q.sy < minY) minY = q.sy
          if (q.sy > maxY) maxY = q.sy
        }
        // 0.82 — поля под толщину трубы и подписи на её концах
        scale = Math.min(w / (maxX - minX), h / (maxY - minY)) * 0.82
        cx = w / 2 - ((minX + maxX) / 2) * scale
        cy = h / 2 - ((minY + maxY) / 2) * scale
      } else {
        scale = Math.min(w, h * 1.55) * 0.42
        cx = w / 2
        cy = h / 2
      }
      // радиус трубы в мировых единицах → в пикселях через ту же перспективу
      const R = 0.085 * scale

      const pts = path.map((p) => project(p, sinY, cosY, scale, cx, cy, shift))

      /* сегменты сортируются по глубине: дальние рисуются первыми,
         поэтому в местах, где ствол проходит сам над собой, ближний
         участок корректно перекрывает дальний */
      const order = []
      for (let i = 0; i < pts.length - 1; i++) {
        order.push({ i, d: (pts[i].depth + pts[i + 1].depth) / 2 })
      }
      order.sort((a, b) => b.d - a.d)

      for (const { i } of order) {
        const a = pts[i], b = pts[i + 1]
        const dx = b.sx - a.sx, dy = b.sy - a.sy
        const len = Math.hypot(dx, dy)
        if (len < 0.001) continue
        // нормаль к сегменту — по ней откладывается толщина трубы
        const nx = -dy / len, ny = dx / len
        const ra = R * a.k, rb = R * b.k

        // затенение по удалению: дальний участок глуше
        const fog = Math.min(1, Math.max(0, 1 - (a.depth + 1.1) * 0.28))

        const g = ctx.createLinearGradient(
          a.sx + nx * ra, a.sy + ny * ra,
          a.sx - nx * ra, a.sy - ny * ra,
        )
        const lit = (v) => Math.round(v * (0.42 + 0.58 * fog))
        g.addColorStop(0.00, `rgb(${lit(58)},${lit(70)},${lit(88)})`)
        g.addColorStop(0.30, `rgb(${lit(226)},${lit(233)},${lit(242)})`)
        g.addColorStop(0.52, `rgb(${lit(168)},${lit(181)},${lit(198)})`)
        g.addColorStop(1.00, `rgb(${lit(38)},${lit(48)},${lit(62)})`)

        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(a.sx + nx * ra, a.sy + ny * ra)
        ctx.lineTo(b.sx + nx * rb, b.sy + ny * rb)
        ctx.lineTo(b.sx - nx * rb, b.sy - ny * rb)
        ctx.lineTo(a.sx - nx * ra, a.sy - ny * ra)
        ctx.closePath()
        ctx.fill()
        // сегменты перекрываются на волос, иначе на изгибах видны швы
        ctx.strokeStyle = g
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // подписи едут вместе с трубой
      for (const m of MARKS) {
        const p = pts[Math.round(m.t * (pts.length - 1))]
        /* Крайние метки прижимаем к полосе: у концов ствола половина
           подписи уходила за кромку (на телефоне «3 842 м · забой»
           обрезался). Сдвиг всегда меньше половины подписи, поэтому
           она остаётся при своей точке, а не отрывается от трубы. */
        const half = m.half || 0
        const sx = Math.min(Math.max(p.sx, half), w - half)
        // сначала в точку кривой, затем центрирование самой подписи —
        // порядок важен, иначе -50% считается от уже смещённой позиции
        m.el.style.transform = `translate(${sx}px, ${p.sy}px) translate(-50%, -50%)`
        m.el.style.opacity = p.depth > 0.9 ? '0.28' : '1'
      }

      /* Кадры продолжаем только пока поворот ещё догоняет цель. Раньше
         условие было просто «секция видна», и цикл крутился без остановки:
         260 сегментов, каждый со своим градиентом, перерисовывались 60 раз
         в секунду всё время, пока разворот на экране, — даже когда картинка
         уже замерла. На телефоне это самый дорогой кусок страницы. */
      if (visible && !reduce && Math.abs(targetYaw - yaw) > 0.0004) schedule()
    }

    const schedule = () => { if (!raf) raf = requestAnimationFrame(draw) }

    /* поворот привязан к прокрутке секции: объект «обходится»
       по мере чтения, а не крутится сам по себе */
    const onScroll = () => {
      const r = root.getBoundingClientRect()
      const total = r.height + window.innerHeight
      const progress = Math.min(1, Math.max(0, (window.innerHeight - r.top) / total))
      targetYaw = -0.55 + progress * 1.5
      schedule()
    }

    const io = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting
      if (visible) schedule()
    }, { rootMargin: '10% 0px' })
    io.observe(root)

    window.addEventListener('resize', () => { resize(); schedule() })
    window.addEventListener('scroll', onScroll, { passive: true })

    resize()
    onScroll()
    // без анимации кадр всё равно нужен — статичная проекция
    if (reduce) { yaw = targetYaw; draw() }

    // подписи набраны Golos/JetBrains Mono: до прихода файлов их ширина
    // другая, и прижим к кромке считался бы по запасной гарнитуре
    document.fonts?.ready.then(() => { resize(); schedule() })
  }
}
