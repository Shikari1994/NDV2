import { asset } from '../lib/asset.js'

/* Пунктов ровно пять — по числу колонок между направляющими сетки
   (--rail-1…--rail-6): каждый пункт садится в свою колонку, как в
   первоисточнике. «Контакты» в строке нет намеренно — на них ведёт
   кнопка «Связаться» справа. Полный список живёт в мобильном меню. */
const LINKS = [
  ['#about', 'О компании'],
  ['#software', 'Приложение'],
  ['#products', 'Оборудование'],
  ['#how', 'Технологии'],
  ['#store', 'Магазин ЗИП'],
]

const MOBILE_LINKS = [...LINKS, ['#contact', 'Контакты']]

/* Компонент только рисует разметку — на клиент он не едет (в index.astro
   нет client:*). Класс .scrolled, открытие бургера и .menu-open на body
   навешивает scripts/nav.js; состояние ниже — исходное, то самое, что
   раньше отдавал первый рендер React. */
export default function Nav() {
  return (
    <>
      <nav className="nav">
        <a className="nav-logo" href="#hero">
          <img src={asset('/logo.webp')} alt="ГЕОТЕХНАВИГАЦИЯ" />
          <span className="nav-logo-text">Геотехнавигация</span>
        </a>
        <ul className="nav-links">
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <a className="pill nav-cta" href="#contact">Связаться</a>
        <button
          className="nav-burger"
          aria-label="Открыть меню"
          aria-expanded="false"
          aria-controls="mobile-menu"
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div id="mobile-menu" className="nav-mobile" aria-hidden="true">
        <ul>
          {MOBILE_LINKS.map(([href, label]) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>
        <a className="pill pill--solid" href="#contact">Связаться</a>
      </div>
    </>
  )
}
