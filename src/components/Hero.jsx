const STATS = [
  { count: 15, suffix: '+', label: 'лет на рынке' },
  { count: 200, suffix: '+', label: 'скважин с MWD/LWD' },
  { text: '24/7', label: 'инженерная поддержка' },
]

export default function Hero() {
  return (
    <section id="hero">
      <canvas className="hero-bg-canvas" aria-hidden="true" />
      <div className="hero-inner container">
        <div className="hero-text">
          <div className="eyebrow reveal">Телеметрия и геонавигация бурения</div>

          <h1 className="hero-title reveal">
            Оборудование и ПО<br />
            <span className="hero-title-accent">для геонавигации бурения</span>
          </h1>

          <p className="hero-desc reveal">
            Разрабатываем и производим телеметрические системы MWD/LWD, наземные
            станции декодирования и диспетчерский программный комплекс. Полный
            цикл — от забойного датчика до отчёта заказчику.
          </p>

          <div className="hero-actions reveal">
            <a className="btn btn-primary" href="#software">
              Смотреть платформу
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </a>
            <a className="btn btn-ghost" href="#contact">Получить консультацию</a>
          </div>

          <div className="hero-stats reveal">
            {STATS.map((s) => (
              <div className="hero-stat" key={s.label}>
                <div className="hero-stat-num">
                  {s.count != null ? (
                    <>
                      <span className="count" data-count={s.count}>0</span>
                      <span className="hero-stat-suffix">{s.suffix}</span>
                    </>
                  ) : (
                    s.text
                  )}
                </div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-visual reveal">
          <div className="hero-window instr-frame">
            <div className="hero-window-bar">
              <span className="hero-window-title mono">DRILL MONITOR · БУРЕНИЕ</span>
              <span className="hero-live"><span className="hero-live-dot" />LIVE</span>
            </div>
            <img src="/app-drilling.webp" alt="Интерфейс программного комплекса Drill Monitor — мониторинг бурения" />
            <div className="hero-readout mono">
              <span className="tm"><i className="tm-k">ГЛУБИНА</i><b className="tm-v is-live" data-tm="depth">3 842</b><i className="tm-u">м</i></span>
              <span className="tm"><i className="tm-k">АЗИМУТ</i><b className="tm-v" data-tm="azimuth">252,74</b><i className="tm-u">°</i></span>
              <span className="tm"><i className="tm-k">ROP</i><b className="tm-v" data-tm="rop">18,6</b><i className="tm-u">м/ч</i></span>
              <span className="tm"><i className="tm-k">ГК</i><b className="tm-v is-gamma" data-tm="gamma">72</b><i className="tm-u">gAPI</i></span>
            </div>
          </div>
          <div className="hero-window hero-window--back" aria-hidden="true">
            <img src="/app-logging.webp" alt="" />
          </div>
        </div>
      </div>
    </section>
  )
}
