/* ─────────────────────────────────────────────
   ШТОРКА СПЕЦИФИКАЦИЙ · линейка оборудования

   Все панели (.specs-panel) уже в разметке Showcase.astro, лежат друг
   на друге; open() просто переключает, какая из них .is-on, и выдвигает
   общую шторку. Источник правды у контента один — Astro-компонент,
   здесь только видимость и фокус.
   ───────────────────────────────────────────── */
const overlay = document.querySelector('[data-specs-overlay]')
const drawer = document.querySelector('[data-specs-drawer]')

if (overlay && drawer) {
  const panels = [...drawer.querySelectorAll('[data-specs-panel]')]
  const openBtns = [...document.querySelectorAll('[data-specs-open]')]
  const closeEls = [...document.querySelectorAll('[data-specs-close]')]
  let lastFocus = null

  const open = (id) => {
    const panel = panels.find((p) => p.dataset.specsPanel === id)
    if (!panel) return
    panels.forEach((p) => p.classList.toggle('is-on', p === panel))
    lastFocus = document.activeElement
    overlay.classList.add('is-open')
    drawer.classList.add('is-open')
    drawer.setAttribute('aria-hidden', 'false')
    document.body.classList.add('menu-open')
    drawer.querySelector('.specs-close')?.focus()
  }

  const close = () => {
    overlay.classList.remove('is-open')
    drawer.classList.remove('is-open')
    drawer.setAttribute('aria-hidden', 'true')
    document.body.classList.remove('menu-open')
    lastFocus?.focus()
  }

  openBtns.forEach((btn) => {
    btn.addEventListener('click', () => open(btn.dataset.specsOpen))
  })
  closeEls.forEach((el) => el.addEventListener('click', close))
  overlay.addEventListener('click', close)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) close()
  })
}
