export default function Contact() {
  return (
    <section id="contact" data-theme="black">
      <div className="split">
        <div className="split-aside">
          <div className="eyebrow reveal"><span className="ey-no">07<span className="ey-den"> / 07</span></span>Связаться с нами</div>
          <h2 className="split-title reveal">Контакты</h2>
          <a className="pill pill--solid" href="mailto:info@telemetrylab.ru">написать нам</a>
        </div>
        {/* TODO: заменить на реальные контакты */}
        <div className="split-main">
          <div className="contact-cards">
            <a className="contact-card reveal" href="tel:+78000000000">
              <div className="ci-text"><label>Телефон</label><span>+7 (800) 000-00-00</span></div>
            </a>
            <a className="contact-card reveal" href="mailto:info@telemetrylab.ru">
              <div className="ci-text"><label>Email</label><span>info@telemetrylab.ru</span></div>
            </a>
            <div className="contact-card reveal">
              <div className="ci-text"><label>Адрес</label><span>г. Москва, ул. Нефтяников, 1</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
