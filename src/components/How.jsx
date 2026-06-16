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

export default function How() {
  return (
    <section id="how">
      <div className="container">
        <div className="how-header">
          <div className="eyebrow center reveal">Принцип работы</div>
          <h2 className="h-title reveal">От забоя до диспетчерской — в реальном времени</h2>
          <p className="lead reveal" style={{ marginTop: 22 }}>
            Данные о пространственном положении инструмента поступают на поверхность
            непрерывно, без остановки бурения.
          </p>
        </div>

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
      </div>
    </section>
  )
}
