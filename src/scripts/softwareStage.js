/* ── Вкладки модулей ПО (настольная версия) ──
   Один большой кадр вместо мозаики: клик по вкладке переключает
   активный слайд. Видео внутри неактивных слайдов получает display:none
   и выпадает из пересечения вьюпорта — существующие лениво-грузящие
   IntersectionObserver'ы в motion.js сами подхватывают/ставят на паузу
   ролик при смене вкладки, доп. логика тут не нужна. */
const tabs = [...document.querySelectorAll('[data-sw-tab]')]
const slides = [...document.querySelectorAll('[data-sw-slide]')]

if (tabs.length && slides.length) {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const i = tab.dataset.index
      if (tab.classList.contains('is-active')) return

      tabs.forEach((t) => {
        const on = t === tab
        t.classList.toggle('is-active', on)
        t.setAttribute('aria-pressed', on ? 'true' : 'false')
      })
      slides.forEach((s) => s.classList.toggle('is-active', s.dataset.index === i))
    })
  })
}
