import { asset } from '../lib/asset.js'

/* Плитки только настольной версии: мобильный клиент вынесен в отдельную
   секцию (Mobile.jsx) и показан там во всю ширину. Плиткой он оставался
   бы одним скриншотом среди пяти, а это отдельный продукт. */
const MODULES = [
  {
    key: 'drilling',
    n: '01',
    tab: 'Бурение',
    // единственный настоящий real-time монитор — только он носит бейдж LIVE
    live: true,
    img: '/app-drilling.webp',
    size: 'lg',
    title: 'Мониторинг бурения в реальном времени',
    text: 'Единый пульт бурильщика: проходка, нагрузка на долото, момент, обороты, давление и вибрация — десятки каналов телеметрии с обновлением в реальном времени. Компас азимута и автоматическая SCC-коррекция.',
    tags: ['Real-time', 'Телеметрия MWD', 'Коррекция азимута'],
  },
  {
    key: 'survey',
    n: '02',
    tab: 'Инклинометрия',
    img: '/app-survey.webp',
    video: '/app-survey.mp4',
    size: 'sm',
    title: 'Инклинометрия и 3D-траектория',
    tags: ['3D-ствол', 'План / факт'],
  },
  {
    key: 'bha',
    n: '04',
    tab: 'Оборудование',
    img: '/app-bha.webp',
    size: 'sm',
    title: 'Компоновка КНБК и ресурс',
    tags: ['КНБК / BHA', 'Ресурс до ТО'],
  },
  {
    key: 'logging',
    n: '03',
    tab: 'Каротаж',
    img: '/app-logging.webp',
    video: '/app-logging.mp4',
    size: 'wide',
    title: 'Каротажный планшет LWD',
    tags: ['Гамма-каротаж', 'Экспорт LAS / PDF'],
  },
]

export default function Software() {
  return (
    <section id="software" data-theme="black">
      <div className="container">
        <div className="sw-head">
          <div>
            <div className="eyebrow reveal"><span className="ey-no">02<span className="ey-den"> / 07</span></span>Программный комплекс · настольная версия</div>
            <h2 className="h-title reveal">
              Drill&nbsp;Monitor — мониторинг <br />бурения в реальном времени
            </h2>
          </div>
          <div className="sw-head-side reveal">
            <p className="lead">
              Единая платформа для геонавигации: телеметрия MWD/LWD, инклинометрия,
              каротаж и контроль оборудования в одном интерфейсе — на буровой,
              в офисе и на мобильном.
            </p>
            <div className="sw-actions">
              <a className="btn btn-primary" href="#contact">
                Запросить демо
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </a>
              <a className="btn btn-ghost" href="#contact">Войти в систему</a>
            </div>
          </div>
        </div>

        <div className="sw-bento">
          {MODULES.map((m) => (
            <article className={`bento-tile instr-frame is-${m.size} bt-${m.key} reveal`} key={m.key}>
              {m.video ? (
                <video
                  className="bento-shot"
                  poster={asset(m.img)}
                  data-lazy-video={asset(m.video)}
                  muted
                  loop
                  playsInline
                  preload="none"
                  aria-label={m.title}
                />
              ) : (
                <img className="bento-shot" src={asset(m.img)} alt={m.title} loading="lazy" />
              )}
              <div className="bento-bar">
                <span className="bento-kicker mono">{m.n} · {m.tab}</span>
                {m.live && <span className="bento-live"><span className="bento-live-dot" />LIVE</span>}
              </div>
              <div className="bento-body">
                <h3>{m.title}</h3>
                {m.text && <p>{m.text}</p>}
                <div className="tag-row">
                  {m.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
