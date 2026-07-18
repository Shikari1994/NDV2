/* Тихий список тезисов: прибитая слева цифра подменяется тем пунктом,
   что сейчас в фокусе экрана. Превью-за-курсором убрано — оно повторяло
   те же скриншоты приложения и спорило с остальным движением страницы.

   Дедупликация: числа масштаба (15 лет / 200+ скважин / 24-7) живут
   в сцене «О компании», здесь — только неповторяющиеся тезисы о том,
   на чём построена технология. */
const FACTS = [
  {
    count: '2', unit: 'канала связи',
    title: ['Импульсный', 'и электромагнитный'],
  },
  {
    count: '100%', unit: 'свой цикл',
    title: ['Производство', 'и калибровка у нас'],
    text: 'Проектирование, изготовление, калибровка и сертификация — на собственной базе, без зависимости от внешних поставщиков.',
  },
  {
    count: 'Реестр ПО', unit: 'Минпромторг РФ', isText: true,
    title: ['Drill Monitor', 'в реестре отечественного ПО'],
    text: 'Программный комплекс отвечает требованиям импортозамещения.',
  },
]

export default function Facts() {
  return (
    <section id="facts" data-theme="gray">
      <div className="container facts-grid">
        <aside className="facts-aside">
          <div className="eyebrow">Факты</div>
          <div
            className={FACTS[0].isText ? 'facts-count is-text' : 'facts-count'}
            data-facts-count
          >
            {FACTS[0].count}
          </div>
          <div className="facts-unit mono" data-facts-unit>{FACTS[0].unit}</div>
        </aside>

        <ul className="facts-list" data-facts-list>
          {FACTS.map((f, i) => (
            <li
              className="facts-item"
              key={f.count}
              data-facts-item
              data-count={f.count}
              data-unit={f.unit}
              data-textual={f.isText ? '1' : undefined}
            >
              <span className="facts-no mono">
                {String(i + 1).padStart(2, '0')}
                <span className="facts-no-den"> / {String(FACTS.length).padStart(2, '0')}</span>
              </span>
              <h3 className="facts-title">
                {f.title.map((line, j) => (
                  <span key={line}>
                    {line}
                    {j < f.title.length - 1 && <br />}
                  </span>
                ))}
              </h3>
              {f.text && <p className="facts-text">{f.text}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
