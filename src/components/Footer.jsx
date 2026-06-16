import { asset } from '../lib/asset.js'

const NAV = [
  ['#about', 'О компании'],
  ['#software', 'Платформа'],
  ['#products', 'Оборудование'],
  ['#how', 'Технологии'],
  ['#store', 'Магазин ЗИП'],
]

export default function Footer() {
  return (
    <footer>
      <div className="container footer-top">
        <div className="footer-brand">
          <div className="footer-logo">
            <img src={asset('/logo.webp')} alt="ГЕОТЕХНАВИГАЦИЯ" />
            <span className="footer-logo-text">Геотехнавигация</span>
          </div>
          <p className="footer-desc">
            Разработка и производство телеметрического оборудования MWD/LWD
            и программного комплекса для геонавигации бурения.
          </p>
        </div>

        <div className="footer-col">
          <h4>Навигация</h4>
          <ul>
            {NAV.map(([href, label]) => (
              <li key={href}><a href={href}>{label}</a></li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Контакты</h4>
          <ul>
            <li><a href="tel:+78000000000">+7 (800) 000-00-00</a></li>
            <li><a href="mailto:info@telemetrylab.ru">info@telemetrylab.ru</a></li>
            <li className="footer-muted">г. Москва, ул. Нефтяников, 1</li>
          </ul>
        </div>
      </div>

      <div className="container footer-bottom">
        <span className="footer-copy">© 2026 ООО «ГЕОТЕХНАВИГАЦИЯ». Все права защищены.</span>
        <span className="footer-copy footer-muted">ПО в реестре отечественного ПО Минпромторга РФ</span>
      </div>
    </footer>
  )
}
