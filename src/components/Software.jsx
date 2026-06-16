const MODULES = [
  {
    key: 'drilling',
    n: '01',
    tab: 'Бурение',
    img: '/app-drilling.webp',
    title: 'Мониторинг бурения в реальном времени',
    text: 'Единый пульт бурильщика: проходка, нагрузка на долото, момент, обороты, давление и вибрация — десятки каналов телеметрии с обновлением в реальном времени. Компас азимута и автоматическая SCC-коррекция.',
    tags: ['Real-time', 'Телеметрия MWD', 'Коррекция азимута'],
  },
  {
    key: 'survey',
    n: '02',
    tab: 'Инклинометрия',
    img: '/app-survey.webp',
    title: 'Инклинометрия и 3D-траектория',
    text: 'Журнал замеров «факт» и «план», ввод новых точек прямо на буровой и интерактивная 3D-визуализация ствола скважины с наложением проектного профиля и отклонений.',
    tags: ['3D-ствол', 'План / факт', 'Замеры'],
  },
  {
    key: 'logging',
    n: '03',
    tab: 'Каротаж',
    img: '/app-logging.webp',
    title: 'Каротажный планшет LWD',
    text: 'Гамма-каротаж, механическая скорость и индукционный каротаж на одном планшете с привязкой по глубине. Экспорт результатов в форматах PDF и LAS для передачи заказчику.',
    tags: ['Гамма-каротаж', 'Индукционный', 'Экспорт LAS / PDF'],
  },
  {
    key: 'bha',
    n: '04',
    tab: 'Оборудование',
    img: '/app-bha.webp',
    title: 'Компоновка КНБК и ресурс оборудования',
    text: 'Наглядная схема компоновки низа бурильной колонны, контроль наработки модулей телеметрии до ТО, параметры УБТ, ВЗД и долота, проверка стыков в допустимом диапазоне.',
    tags: ['КНБК / BHA', 'Ресурс до ТО', 'Контроль стыков'],
  },
  {
    key: 'mobile',
    n: '05',
    tab: 'Мобайл',
    img: '/app-mobile.webp',
    title: 'Мобильное приложение',
    text: 'Ключевые показатели скважины и метрики бурения прямо на смартфоне — для супервайзера и офиса. Доступ к данным буровой в любой точке.',
    tags: ['iOS / Android', 'Live-данные', 'Доступ из офиса'],
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

        <div className="sw-rows">
          {MODULES.map((m) => (
            <div className={`sw-row reveal${m.key === 'mobile' ? ' sw-row--mobile' : ''}`} key={m.key}>
              <div className="sw-row-text">
                <div className="sw-row-kicker mono">{m.n} · {m.tab}</div>
                <h3>{m.title}</h3>
                <p>{m.text}</p>
                <div className="tag-row">
                  {m.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                </div>
              </div>

              <div className="sw-row-media">
                <div className="sw-window instr-frame">
                  <div className="sw-window-bar">
                    <span className="sw-window-title">DRILL&nbsp;MONITOR · {m.tab}</span>
                    <span className="sw-live"><span className="sw-live-dot" />LIVE</span>
                  </div>
                  <div className={`sw-shot${m.key === 'mobile' ? ' is-mobile' : ''}`}>
                    <img src={m.img} alt={m.title} loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
