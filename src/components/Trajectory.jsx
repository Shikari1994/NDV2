/* Закрывающий разворот перед контактами — ответ на крупный пластический
   объект первоисточника. Отличие принципиальное: у них абстрактная витая
   труба, у нас — реальный профиль скважины, посчитанный формулой в
   trajectoryCanvas.js. Подписи приколоты к точкам ствола и едут вместе
   с ним при повороте.

   Цифры взяты те же, что уже заявлены в hero и таймлайне (глубина забоя,
   частота опроса, задержка канала), — это поясняющие метки к объекту,
   а не новый набор достижений. */
const MARKS = [
  { t: 0.06, k: '0 м', v: 'устье' },
  { t: 0.46, k: 'набор угла', v: 'зенит 0° → 90°' },
  { t: 0.97, k: '3 842 м', v: 'забой · MWD/LWD' },
]

export default function Trajectory() {
  return (
    <section id="trajectory" data-theme="black">
      <div className="traj" data-trajectory>
        {/* Сцена — отдельный слой, а не просто canvas на всю секцию:
            на широком экране она разлита по всей секции (заголовок и
            сноска лежат поверх объекта), а на узком становится обычным
            блоком в потоке — своей полосой между заголовком и сноской.
            Подписи живут внутри сцены, поэтому их координаты считаются
            от того же прямоугольника, что и проекция трубы. */}
        <div className="traj-stage">
          <canvas className="traj-canvas" aria-hidden="true" />

          <div className="traj-marks" aria-hidden="true">
            {MARKS.map((m) => (
              <span className="traj-mark" data-traj-mark={m.t} key={m.k}>
                <b className="mono">{m.k}</b>
                <i>{m.v}</i>
              </span>
            ))}
          </div>
        </div>

        <div className="traj-head">
          <div className="eyebrow"><span className="ey-no">05<span className="ey-den"> / 07</span></span>Геонавигация</div>
          <h2 className="traj-title">Ствол скважины<br />целиком на экране</h2>
          <a className="pill" href="#software">смотреть Drill Monitor</a>
        </div>

        <p className="traj-note">
          Профиль строится по инклинометрии в реальном времени: от вертикали
          через участок набора угла до горизонтального ствола в продуктивном
          пласте — с план-фактом отклонений на каждой точке замера.
        </p>
      </div>
    </section>
  )
}
