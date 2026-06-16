const FEATURES = [
  {
    title: 'Собственное производство',
    text: 'Полный цикл на своей базе: проектирование, изготовление, калибровка и сертификация оборудования.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="8" strokeDasharray="3 3" /><line x1="12" y1="2" x2="12" y2="4" /><line x1="12" y1="20" x2="12" y2="22" /><line x1="2" y1="12" x2="4" y2="12" /><line x1="20" y1="12" x2="22" y2="12" /></svg>
    ),
  },
  {
    title: 'Сертифицированное ПО',
    text: 'Программный комплекс внесён в реестр отечественного ПО и соответствует требованиям Минпромторга РФ.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
  },
  {
    title: 'Мониторинг в реальном времени',
    text: 'Передача данных по каналу MWD с отображением на диспетчерском пульте, в офисе и в облаке.',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
]

const META = [
  ['Профиль', 'Телеметрия и геонавигация бурения'],
  ['География', 'Россия и страны СНГ'],
  ['Поддержка', 'Инженерное сопровождение 24/7'],
]

export default function About() {
  return (
    <section id="about">
      <div className="container about-layout">
        <div className="about-intro">
          <div className="eyebrow reveal">О компании</div>
          <h2 className="h-title reveal">Инженерные решения <br />для нефтегазовой отрасли</h2>
          <p className="lead reveal">
            ГЕОТЕХНАВИГАЦИЯ — российский разработчик и производитель
            телеметрического оборудования и ПО для контроля траектории бурения.
          </p>
          <p className="about-text reveal">
            Замкнутый цикл на собственной базе — от проектирования до сервиса на буровой —
            и решения, которыми оснащены объекты ведущих добывающих компаний России и СНГ.
          </p>
          <dl className="about-meta reveal">
            {META.map(([k, v]) => (
              <div className="about-meta-item" key={k}>
                <dt className="about-meta-k mono">{k}</dt>
                <dd className="about-meta-v">{v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="about-cards">
          {FEATURES.map((f) => (
            <div className="about-card reveal" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <div className="about-card-body">
                <h4>{f.title}</h4>
                <p>{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
