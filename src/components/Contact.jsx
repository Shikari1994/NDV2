export default function Contact() {
  return (
    <section id="contact">
      <div className="container">
        <div className="eyebrow center reveal">Связаться с нами</div>
        <h2 className="h-title reveal">Контакты</h2>
        <div className="contact-cards">
          <a className="contact-card reveal" href="tel:+78000000000">
            <div className="ci-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013 10.81a19.79 19.79 0 01-3.07-8.67A2 2 0 011.95 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.74a16 16 0 006 6l1.06-1.06a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>
            </div>
            <div className="ci-text"><label>Телефон</label><span>+7 (800) 000-00-00</span></div>
          </a>
          <a className="contact-card reveal" href="mailto:info@telemetrylab.ru">
            <div className="ci-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
            </div>
            <div className="ci-text"><label>Email</label><span>info@telemetrylab.ru</span></div>
          </a>
          <div className="contact-card reveal">
            <div className="ci-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
            </div>
            <div className="ci-text"><label>Адрес</label><span>г. Москва, ул. Нефтяников, 1</span></div>
          </div>
        </div>
      </div>
    </section>
  )
}
