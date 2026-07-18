/* ─────────────────────────────────────────────
   Поведение шапки — ванильный порт Nav.jsx.

   Раньше ради этих двух вещей (класс .scrolled и
   бургер) на клиент уезжал весь React — 136 КБ
   на критическом пути ради ~15 строк логики.
   Разметку Nav по-прежнему рисует тот же .jsx,
   но на сервере: HTML выходит байт-в-байт тем же,
   что давал первый рендер React, поэтому вид и
   поведение не изменились.

   Скрипт отдельный, а не внутри motion.js: тот
   тянет Lenis и GSAP, и бургер ждал бы разбора
   137 КБ, прежде чем начать нажиматься.
   ───────────────────────────────────────────── */

const nav = document.querySelector('nav.nav')
const burger = document.querySelector('.nav-burger')
const menu = document.querySelector('.nav-mobile')

/* ─── Класс .scrolled после 40px ───
   Порог и момент срабатывания те же, что были в React-версии: класс
   ставится синхронно в обработчике. Откладывать его до кадра анимации
   пробовали — шапка меняла фон на кадр позже прокрутки, и на быстром
   жесте это было заметно; сама операция (чтение scrollY и toggle)
   несопоставимо дешевле перерисовки компонента, ради которой здесь
   раньше держался React. Слушатель пассивный — прокрутку не тормозит. */
if (nav) {
  const apply = () => nav.classList.toggle('scrolled', window.scrollY > 40)
  window.addEventListener('scroll', apply, { passive: true })
  apply()
}

/* ─── Мобильное меню ───
   Состояние держим одной переменной и синхронизируем ровно те же
   атрибуты, что проставлял React: класс .open на бургере и на панели,
   .menu-open на body (его слушает CSS, блокируя прокрутку под меню),
   aria-expanded, aria-label и aria-hidden. */
if (burger && menu) {
  let open = false

  const sync = () => {
    burger.classList.toggle('open', open)
    burger.setAttribute('aria-expanded', String(open))
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню')
    menu.classList.toggle('open', open)
    menu.setAttribute('aria-hidden', String(!open))
    document.body.classList.toggle('menu-open', open)
  }

  burger.addEventListener('click', () => {
    open = !open
    sync()
  })

  // клик в любом месте панели закрывает её — включая ссылки,
  // как и было в React-версии (onClick висел на всём контейнере)
  menu.addEventListener('click', () => {
    if (!open) return
    open = false
    sync()
  })

  // Esc закрывает меню: клавиатурный выход в React-версии отсутствовал,
  // но открытая панель на весь экран без него — ловушка для фокуса
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && open) {
      open = false
      sync()
      burger.focus()
    }
  })
}
