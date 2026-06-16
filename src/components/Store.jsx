export default function Store() {
  return (
    <section id="store">
      <div className="container">
        <div className="store-header">
          <div className="eyebrow center reveal">Онлайн-магазин</div>
          <h2 className="h-title reveal">Заказ ЗИП и модулей</h2>
          <p className="lead reveal" style={{ marginTop: 22 }}>
            Подбирайте и заказывайте запасные части, расходные материалы
            и модули телеметрии прямо здесь.
          </p>
        </div>
        <div className="iframe-wrap instr-frame reveal">
          <div className="iframe-bar">
            <span className="url">oklimashov.fvds.ru</span>
          </div>
          <iframe src="https://oklimashov.fvds.ru" loading="lazy" allow="fullscreen" title="Магазин ЗИП" />
        </div>
      </div>
    </section>
  )
}
