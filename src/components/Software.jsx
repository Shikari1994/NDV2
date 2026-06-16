import { asset } from '../lib/asset.js'

const MODULES = [
  {
    key: 'drilling',
    n: '01',
    tab: 'Бурение',
    img: '/app-drilling.webp',
    size: 'lg',
    title: 'Мониторинг бурения в реальном времени',
    text: 'Единый пульт бурильщика: проходка, нагрузка на долото, момент, обороты, давление и вибрация — десятки каналов телеметрии с обновлением в реальном времени. Компас азимута и автоматическая SCC-коррекция.',
    tags: ['Real-time', 'Телеметрия MWD', 'Коррекция азимута'],
  },
  {
    key: 'mobile',
    n: '05',
    tab: 'Мобайл',
    img: '/app-mobile.webp',
    size: 'tall',
    title: 'Мобильное приложение',
    text: 'Ключевые показатели скважины и метрики бурения прямо на смартфоне — для супервайзера и офиса.',
    tags: ['iOS / Android', 'Live-данные'],
  },
  {
    key: 'survey',
    n: '02',
    tab: 'Инклинометрия',
    img: '/app-survey.webp',
    size: 'sm',
    title: 'Инклинометрия и 3D-траектория',
    tags: ['3D-ствол', 'План / факт'],
  },
  {
    key: 'logging',
    n: '03',
    tab: 'Каротаж',
    img: '/app-logging.webp',
    size: 'sm',
    title: 'Каротажный планшет LWD',
    tags: ['Гамма-каротаж', 'Экспорт LAS / PDF'],
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
]

export default function Software() {
  return (
    <section id="software">
      <div className="container">
        <div className="sw-head">
          <div>
            <div className="eyebrow reveal">Программный комплекс</div>
            <h2 className="h-title reveal">
              Drill&nbsp;Monitor — мониторинг<br />бурения в реальном времени
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
            <article className={`bento-tile instr-frame is-${m.size} reveal`} key={m.key}>
              <img className="bento-shot" src={asset(m.img)} alt={m.title} loading="lazy" />
              <div className="bento-bar">
                <span className="bento-kicker mono">{m.n} · {m.tab}</span>
                <span className="bento-live"><span className="bento-live-dot" />LIVE</span>
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
