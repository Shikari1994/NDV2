import { asset } from '../lib/asset.js'

/* Ряд показателей убран из hero: те же 15 лет / 200+ скважин / 24-7
   разворачиваются панелями в сцене «О компании» сразу следом. Первый
   экран остаётся типографическим — заголовок, тезис и окно прибора.

   Экраны 2–3 колоды: чисто типографические, по образцу первоисточника —
   заголовок в пол-экрана, контент прижат к низу, видео фоном справа.

   Устройство заголовка повторяет приём первоисточника (ZITAR® METALWARE →
   ZITAR® ABRASIVES): первая строка ОДНА И ТА ЖЕ на всех экранах и стоит на
   одной и той же высоте, меняется только вторая. За счёт этого на переходе
   между экранами имя продукта не уезжает — оно остаётся на месте и просто
   меняет тон, а сменяется лишь слово под ним. Ради этого вторая строка —
   всегда одно слово: длинная фраза в мега-кегле разваливает композицию,
   а сам эффект подмены перестаёт читаться. */
const BRAND = 'Drill Monitor'

const SCREENS = [
  {
    theme: 'blue',
    no: '02',
    kicker: 'Телеметрия MWD / LWD',
    word: 'Скорость',
    descr: ['данные с забоя на поверхность за секунды —', 'без остановки бурения и спуска приборов'],
    video: '/app-logging.mp4',
    poster: '/app-logging.webp',
  },
  {
    theme: 'gray',
    no: '03',
    kicker: 'Геонавигация',
    word: 'Точность',
    descr: ['3D-траектория ствола —', 'план против факта в реальном времени'],
    video: '/app-survey.mp4',
    poster: '/app-survey.webp',
  },
]

export default function Hero() {
  return (
    <>
      {/* ── Экран 01: продуктовый — каротажный canvas и живые окна интерфейса ── */}
      <section id="hero" className="deck-screen" data-theme="black">
        <div className="deck-content">
          <div className="deck-inner">
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
                  <a className="btn btn-ghost" href="#software">
                    Смотреть платформу
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </a>
                </div>
              </div>

              <div className="hero-visual reveal">
                <div className="hero-window instr-frame">
                  <div className="hero-window-bar">
                    <span className="hero-window-title mono">DRILL MONITOR · БУРЕНИЕ</span>
                    <span className="hero-live"><span className="hero-live-dot" />LIVE</span>
                  </div>
                  {/* LCP первого экрана — грузим вперёд остальной статики
                      (парная строка preload лежит в Layout.astro) */}
                  <img src={asset('/app-drilling.webp')} alt="Интерфейс программного комплекса Drill Monitor — мониторинг бурения" fetchpriority="high" decoding="async" />
                  <div className="hero-readout mono">
                    <span className="tm"><i className="tm-k">ГЛУБИНА</i><b className="tm-v is-live" data-tm="depth">3 842</b><i className="tm-u">м</i></span>
                    <span className="tm"><i className="tm-k">АЗИМУТ</i><b className="tm-v" data-tm="azimuth">252,74</b><i className="tm-u">°</i></span>
                    <span className="tm"><i className="tm-k">ROP</i><b className="tm-v" data-tm="rop">18,6</b><i className="tm-u">м/ч</i></span>
                    <span className="tm"><i className="tm-k">ГК</i><b className="tm-v is-gamma" data-tm="gamma">72</b><i className="tm-u">gAPI</i></span>
                  </div>
                </div>
                <div className="hero-window hero-window--back" aria-hidden="true">
                  <img src={asset('/app-logging.webp')} alt="" />
                </div>
              </div>
            </div>

            <div className="deck-count container mono" aria-hidden="true">
              <span>01</span><span className="deck-count-den">/</span><span className="deck-count-den">03</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Экраны 02–03: типографические ── */}
      {SCREENS.map((s) => (
        <section className="deck-screen" data-theme={s.theme} data-rails="on" key={s.no}>
          <div className="deck-content">
            <div className="deck-inner">
              <div className="deck-media" aria-hidden="true">
                <video
                  poster={asset(s.poster)}
                  data-lazy-video={asset(s.video)}
                  muted
                  loop
                  playsInline
                  preload="none"
                />
              </div>

              <div className="deck-body container">
                <span className="deck-kicker mono">{s.kicker}</span>
                <h2 className="mega deck-heading">
                  <span className="deck-heading-line deck-brand">
                    {BRAND}<sup className="deck-reg">®</sup>
                  </span>
                  <span className="deck-heading-line">{s.word}</span>
                </h2>
                <div className="deck-foot">
                  <p className="deck-descr">
                    {s.descr.map((line, i) => (
                      <span key={line}>
                        {line}
                        {i < s.descr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>
                  <div className="deck-count mono" aria-hidden="true">
                    <span>{s.no}</span><span className="deck-count-den">/</span><span className="deck-count-den">03</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
