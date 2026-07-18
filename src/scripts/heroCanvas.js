/* ─────────────────────────────────────────────
   Каротажный планшет — фон первого экрана.
   Дорожки ГК / БК / ННК-ГГК, медленно ползущие
   вверх: имитация поступления данных по мере
   углубления скважины. Чистый 2D-canvas.
   Ванильный порт HeroBackdrop.jsx — цепляется к
   .hero-bg-canvas в статическом HTML (без React).
   ───────────────────────────────────────────── */

const canvas = document.querySelector('.hero-bg-canvas')

if (canvas) {
  const ctx = canvas.getContext('2d')
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // гладкая «шумовая» кривая от глубины — сумма гармоник, детерминированная
  const curveVal = (depth, seed) =>
    Math.sin(depth * 0.013 + seed) * 0.5 +
    Math.sin(depth * 0.031 + seed * 2.3) * 0.28 +
    Math.sin(depth * 0.072 + seed * 4.1) * 0.16 +
    Math.sin(depth * 0.151 + seed * 1.7) * 0.06

  const TRACKS = [
    { label: 'ГК',        unit: 'gAPI', curves: [{ seed: 1.0, color: '217,138,58', fill: true }] },
    { label: 'БК',        unit: 'Ом·м', curves: [{ seed: 3.4, color: '91,209,232' }, { seed: 5.1, color: '59,158,255' }] },
    { label: 'ННК · ГГК', unit: 'г/см³', curves: [{ seed: 7.2, color: '61,220,132' }, { seed: 9.6, color: '180,200,230' }] },
  ]

  const BASE_DEPTH = 3842
  const PX_PER_METER = 2.4
  const GRID_PX = 60

  let w = 0, h = 0, dpr = 1, offset = 0, raf = 0

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    const r = canvas.getBoundingClientRect()
    w = r.width; h = r.height
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  const depthAt = (y) => BASE_DEPTH + (offset + y) / PX_PER_METER

  const draw = () => {
    ctx.clearRect(0, 0, w, h)
    // на узком экране почти убираем боковой отступ — кривые до краёв
    const pad = w < 700 ? Math.max(10, w * 0.022) : Math.max(28, w * 0.04)
    const scaleX = w - pad * 2
    const trackW = scaleX / TRACKS.length

    // сетка глубины
    const phase = offset % GRID_PX
    ctx.font = '10px "JetBrains Mono", monospace'
    ctx.textBaseline = 'middle'
    for (let y = -phase; y < h; y += GRID_PX) {
      ctx.strokeStyle = 'rgba(232,238,247,0.07)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(pad, y + 0.5); ctx.lineTo(w - pad, y + 0.5); ctx.stroke()
      const depth = Math.round(depthAt(y) / 5) * 5
      ctx.fillStyle = 'rgba(232,238,247,0.32)'
      ctx.textAlign = 'left'
      ctx.fillText(`${depth} м`, pad + 4, y - 8)
    }

    // дорожки
    TRACKS.forEach((track, ti) => {
      const tx = pad + ti * trackW
      const amp = trackW * 0.30
      const cx = tx + trackW / 2

      ctx.strokeStyle = 'rgba(232,238,247,0.10)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(tx + 0.5, 0); ctx.lineTo(tx + 0.5, h); ctx.stroke()

      ctx.fillStyle = 'rgba(232,238,247,0.46)'
      ctx.textAlign = 'left'
      ctx.fillText(track.label, tx + 10, 18)
      ctx.fillStyle = 'rgba(232,238,247,0.28)'
      ctx.fillText(track.unit, tx + 10, 32)

      track.curves.forEach((cv) => {
        const step = 4
        if (cv.fill) {
          ctx.beginPath(); ctx.moveTo(tx, 0)
          for (let y = 0; y <= h; y += step) ctx.lineTo(cx + curveVal(depthAt(y), cv.seed) * amp, y)
          ctx.lineTo(tx, h); ctx.closePath()
          ctx.fillStyle = `rgba(${cv.color},0.08)`; ctx.fill()
        }
        ctx.beginPath()
        for (let y = 0; y <= h; y += step) {
          const x = cx + curveVal(depthAt(y), cv.seed) * amp
          if (y === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.strokeStyle = `rgba(${cv.color},0.85)`; ctx.lineWidth = 1.6; ctx.stroke()
      })
    })
  }

  const loop = () => {
    offset += 0.5
    draw()
    raf = requestAnimationFrame(loop)
  }

  /* ─── Цикл крутится только когда планшет действительно на экране ───
     Раньше rAF не останавливался никогда: первый экран давно уехал вверх,
     а сетка, подписи и пять кривых продолжали перерисовываться 60 раз
     в секунду до конца страницы — на всей её длине и на всех вкладках,
     открытых в фоне. Ни на вид, ни на поведение это не влияло, зато
     ощутимо грело процессор и сажало батарею на телефоне.

     Гасим по двум признакам: canvas ушёл из вьюпорта или вкладка
     скрыта. Фаза offset при этом сохраняется, так что при возврате
     дорожки продолжаются с того же места, а не прыгают. */
  let onScreen = true

  const running = () => raf !== 0
  const play = () => {
    if (running() || reduce || !onScreen || document.hidden) return
    raf = requestAnimationFrame(loop)
  }
  const stop = () => {
    if (!running()) return
    cancelAnimationFrame(raf)
    raf = 0
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(
      (entries) => {
        onScreen = entries[0].isIntersecting
        onScreen ? play() : stop()
      },
      { threshold: 0 },
    ).observe(canvas)
  }

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()))

  /* ресайз прижимаем к кадру: серия событий при перетаскивании окна
     давала пересборку буфера canvas на каждое из них */
  let resizeRaf = 0
  window.addEventListener('resize', () => {
    if (resizeRaf) return
    resizeRaf = requestAnimationFrame(() => {
      resizeRaf = 0
      resize()
      if (!running()) draw()   // на паузе перерисовываем кадр вручную
    })
  })

  resize()
  if (reduce) draw()
  else play()
}
