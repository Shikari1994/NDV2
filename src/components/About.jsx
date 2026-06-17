const META = [
  ['Профиль', 'Телеметрия и геонавигация бурения'],
  ['География', 'Россия и страны СНГ'],
  ['Поддержка', 'Инженерное сопровождение 24/7'],
]

// крупные карточки-факты — едут вбок по мере скролла (pin + scrub)
const CARDS = [
  {
    big: '15', unit: 'лет', kicker: 'На рынке телеметрии',
    text: 'Разрабатываем и производим системы MWD/LWD с 2010 года. Оборудование работает на объектах ведущих добывающих компаний России и СНГ.',
  },
  {
    big: '200+', kicker: 'Скважин с MWD/LWD',
    text: 'Пробурено с нашими телесистемами — от наклонно-направленных до горизонтальных стволов сложного профиля.',
  },
  {
    big: '24/7', kicker: 'Инженерная поддержка',
    text: 'Дежурная смена инженеров на связи круглосуточно, с удалённым доступом к данным буровой в реальном времени.',
  },
  {
    big: 'Полный цикл', isText: true, kicker: 'Собственное производство',
    text: 'Проектирование, изготовление, калибровка и сертификация — на собственной базе, без зависимости от внешних поставщиков.',
  },
  {
    big: 'Реестр ПО', isText: true, kicker: 'Сертифицировано Минпромторгом',
    text: 'Программный комплекс Drill Monitor внесён в реестр отечественного ПО и отвечает требованиям импортозамещения.',
  },
]

export default function About() {
  return (
    <section id="about">
      <div className="about-stage pin-lane">
        <div className="about-track pin-track">
          <div className="about-intro">
            <div className="eyebrow reveal"><span className="ey-no">01<span className="ey-den"> / 06</span></span>О компании</div>
            <h2 className="h-title reveal">Инженерные решения <br />для нефтегазовой отрасли</h2>
            <p className="lead reveal">
              ГЕОТЕХНАВИГАЦИЯ — российский разработчик и производитель
              телеметрического оборудования и ПО для контроля траектории бурения.
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
            {CARDS.map((c, i) => (
              <article className="about-card" key={c.kicker}>
                <span className="ac-idx mono">{String(i + 1).padStart(2, '0')}</span>
                <span className={c.isText ? 'ac-big ac-big--text' : 'ac-big'}>
                  {c.big}
                  {c.unit && <span className="ac-unit">{c.unit}</span>}
                </span>
                <span className="ac-kicker">{c.kicker}</span>
                <p className="ac-text">{c.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
