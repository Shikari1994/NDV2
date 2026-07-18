export default function Store() {
  return (
    <section id="store" data-theme="gray">
      <div className="split">
        <div className="split-aside">
          <div className="eyebrow reveal"><span className="ey-no">06<span className="ey-den"> / 07</span></span>Онлайн-магазин</div>
          <h2 className="split-title reveal">Заказ ЗИП и модулей</h2>
          <p className="lead reveal">
            Подбирайте и заказывайте запасные части, расходные материалы
            и модули телеметрии прямо здесь.
          </p>
        </div>
        <div className="split-main">
          <div className="iframe-wrap instr-frame reveal">
            <div className="iframe-bar">
              <span className="url">oklimashov.fvds.ru</span>
            </div>
            <iframe src="https://oklimashov.fvds.ru" loading="lazy" allow="fullscreen" title="Магазин ЗИП" />
          </div>
        </div>
      </div>
    </section>
  )
}
