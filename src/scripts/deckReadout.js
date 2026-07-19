/* ─────────────────────────────────────────────
   READOUT колоды — живые величины в левой полосе
   экрана про ПО. Ведёт .deck-readout из Hero.astro.

   Обновление раз в секунду, а не покадрово, и это
   не экономия: телеметрия на буровой приходит
   пачками, и цифра, «плывущая» 60 раз в секунду,
   читается индикатором загрузки, а не прибором.

   Дрейф детерминированный — сумма несоизмеримых
   гармоник от времени, как у каротажных кривых в
   heroCanvas.js. Случайные числа давали скачки на
   всю амплитуду между соседними тиками; здесь
   соседние значения всегда рядом, и столбец
   читается как показание, а не как шум.
   ───────────────────────────────────────────── */

const readout = document.querySelector('[data-readout]')

if (readout) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const cells = [...readout.querySelectorAll('[data-val]')].map((el, i) => ({
    el,
    base: Number(el.dataset.base),
    fix: Number(el.dataset.fix) || 0,
    drift: Number(el.dataset.drift) || 0,
    rate: Number(el.dataset.rate) || 0,
    // своя фаза у каждой строки: с общей все значения ходили бы в такт
    seed: 1.7 + i * 2.3,
  }))

  const t0 = performance.now()

  const wave = (t, seed) =>
    Math.sin(t * 0.31 + seed) * 0.6 +
    Math.sin(t * 0.13 + seed * 2.1) * 0.3 +
    Math.sin(t * 0.07 + seed * 3.7) * 0.1

  const tick = () => {
    const t = (performance.now() - t0) / 1000
    cells.forEach((c) => {
      // rate — монотонный ход (глубина только растёт), drift — колебание
      const v = c.base + c.rate * t + c.drift * wave(t, c.seed)
      c.el.textContent = v.toFixed(c.fix)
    })
  }

  /* Тикаем только когда блок на экране и вкладка активна: колода
     уезжает вверх на первом же экране скролла, а таймер без этого
     жил бы до конца страницы. */
  let timer = 0
  let onScreen = true

  const play = () => {
    if (timer || reduce || !onScreen || document.hidden) return
    tick()
    timer = setInterval(tick, 1000)
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

  // при reduced-motion остаются значения из разметки — они уже осмысленные
  if (!reduce) play()
}
