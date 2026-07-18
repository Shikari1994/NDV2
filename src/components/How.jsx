const STEPS = [
  {
    n: '01', depth: '3 842 м · ЗАБОЙ', title: 'Измерение на забое',
    text: 'Трёхосевые акселерометры и магнитометры фиксируют зенитный угол и азимут скважины с частотой до 1 Гц. Пьезорезистивные датчики параллельно измеряют давление и температуру.',
  },
  {
    n: '02', depth: 'КАНАЛ СВЯЗИ', title: 'Кодирование и передача',
    text: 'Данные кодируются и передаются по гидравлическому каналу связи (пульсации давления) или электромагнитным сигналом через породу.',
  },
  {
    n: '03', depth: '0 м · УСТЬЕ', title: 'Декодирование на поверхности',
    text: 'Наземный блок принимает сигнал, фильтрует шумы и декодирует пакеты данных в реальном времени без задержки.',
  },
  {
    n: '04', depth: 'ДИСПЕТЧЕРСКАЯ', title: 'Визуализация и управление',
    text: 'Drill Monitor отображает 3D-траекторию скважины, строит план-факт отклонений и передаёт данные в корпоративную систему заказчика по защищённому каналу.',
  },
]

/* Прежняя прибитая плашка-итог заменена на полноширинный финал: когда
   линия проходки доходит до устья, снизу разворачивается правило во всю
   колонку и под ним встаёт крупная строка. Момент завершения читается
   как событие, а не как подпись мелким шрифтом. */
export default function How() {
  return (
    <section id="how" data-theme="black">
      <div className="split">
        <div className="split-aside">
          <div className="eyebrow reveal"><span className="ey-no">04<span className="ey-den"> / 07</span></span>Принцип работы</div>
          <h2 className="split-title reveal">От забоя до диспетчерской — в реальном времени</h2>
          <p className="lead reveal">
            Данные о пространственном положении инструмента поступают на поверхность
            непрерывно, без остановки бурения.
          </p>
        </div>

        <div className="split-main">
          <div className="steps">
            <div className="how-line" />
            <div className="how-line-fill" />
            {STEPS.map((s) => (
              <div className="step reveal" key={s.n}>
                <div className="step-node">{s.n}</div>
                <div className="step-content">
                  <span className="step-depth">{s.depth}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="how-done" aria-hidden="true">
            <span className="how-done-rule" />
            <span className="how-done-label mono">Сигнал принят · пакет декодирован</span>
            <span className="how-done-title">Данные в диспетчерской</span>
            <span className="how-done-meta mono">
              <b>0,9 с</b> от забоя до экрана · <b>1 Гц</b> частота опроса · <b>24/7</b> дежурная смена
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
