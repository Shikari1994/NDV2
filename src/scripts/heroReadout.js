/* ─────────────────────────────────────────────
   Курсорный readout AZ/INC на входном экране колоды.

   Положение курсора над каротажным канвасом читается как условные
   азимут/зенит — интерактивная деталь того же приборного языка, что
   у .deck-readout экрана 02, но без claim на реальные данные: это
   не бейдж LIVE, а живой отклик на курсор, честно подписанный только
   на устройствах с указателем (см. `deck-cursor-readout` в CSS).
   ───────────────────────────────────────────── */
const zone = document.querySelector('.hero-bg-canvas')
const readout = document.querySelector('[data-cursor-readout]')
const az = readout?.querySelector('[data-cursor-az]')
const inc = readout?.querySelector('[data-cursor-inc]')

if (zone && az && inc) {
  let raf = 0
  zone.parentElement.addEventListener('mousemove', (e) => {
    if (raf) return
    raf = requestAnimationFrame(() => {
      raf = 0
      const r = zone.getBoundingClientRect()
      const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1)
      const y = Math.min(Math.max((e.clientY - r.top) / r.height, 0), 1)
      az.textContent = (x * 360).toFixed(1) + '°'
      inc.textContent = (y * 90).toFixed(1) + '°'
    })
  })
}
