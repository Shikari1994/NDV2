import { useEffect, useState } from 'react'
import { asset } from '../lib/asset.js'

const LINKS = [
  ['#about', 'О компании'],
  ['#software', 'Приложение'],
  ['#products', 'Оборудование'],
  ['#how', 'Технологии'],
  ['#store', 'Магазин ЗИП'],
  ['#contact', 'Контакты'],
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.classList.toggle('menu-open', open)
  }, [open])

  return (
    <>
      <nav className={`nav${scrolled ? ' scrolled' : ''}`}>
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
        <a className="btn btn-ghost nav-cta" href="#contact">Связаться</a>
        <button
          className={`nav-burger${open ? ' open' : ''}`}
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span><span></span><span></span>
        </button>
      </nav>

      <div
        id="mobile-menu"
        className={`nav-mobile${open ? ' open' : ''}`}
        aria-hidden={!open}
        onClick={() => setOpen(false)}
      >
        <ul>
          {LINKS.map(([href, label]) => (
            <li key={href}><a href={href}>{label}</a></li>
          ))}
        </ul>
        <a className="btn btn-primary" href="#contact">Связаться</a>
      </div>
    </>
  )
}
