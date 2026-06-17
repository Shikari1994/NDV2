import { asset } from '../lib/asset.js'

const PRODUCTS = [
  {
    n: '01', img: '/direct.webp', title: 'Телеметрическая система MWD',
    text: 'Трёхосевые акселерометры и магнитометры измеряют зенитный угол, азимут и угол отклонителя прямо на долоте. Импульсный и электромагнитный каналы передачи данных.',
    tags: ['MWD', 'Инклинометрия', '2 канала'],
  },
  {
    n: '02', img: '/earth.webp', title: 'Блок декодирования сигнала',
    text: 'Демодулирует импульсы давления и электромагнитный сигнал, рассчитывает инклинометрические параметры и передаёт данные на станцию геолога и в систему мониторинга.',
    tags: ['Декодер', 'Real-time'],
  },
  {
    n: '03', img: '/parts.webp', title: 'Гамма-модуль LWD',
    text: 'Измерение естественной гамма-активности горных пород в процессе бурения. Определение литологии, коэффициента глинистости и привязка к продуктивным горизонтам.',
    tags: ['LWD', 'Гамма-каротаж'],
  },
  {
    n: '04', img: '/kitrent.webp', title: 'Датчик давления и температуры',
    text: 'Пьезорезистивные датчики контролируют давление промывочной жидкости, забойную температуру и вибрационную нагрузку на КНБК.',
    tags: ['Сенсор', 'P / T'],
  },
  {
    n: '05', img: '/kit4psd.webp', title: 'Сервис и ЗИП',
    text: 'Запасные части, расходные материалы и комплектующие для всех моделей. Постоянное наличие на складе, срочная отгрузка и сервисное обслуживание 24/7.',
    tags: ['ЗИП', 'Сервис 24/7'],
  },
]

export default function Showcase() {
  return (
    <section id="products">
      <div className="about-stage pin-lane">
        <div className="about-track pin-track">
          <div className="about-intro">
            <div className="eyebrow reveal"><span className="ey-no">03<span className="ey-den"> / 06</span></span>Линейка оборудования</div>
            <h2 className="h-title reveal">Оборудование <br />и сервис</h2>
            <p className="lead reveal">
              Полная линейка телеметрии MWD/LWD собственной разработки —
              от забойных датчиков до наземных станций декодирования и сервиса.
            </p>
          </div>

          <div className="about-cards">
            {PRODUCTS.map((p) => (
              <article className="car-card" key={p.n}>
                <div className="car-card-media">
                  <img src={asset(p.img)} alt={p.title} loading="lazy" draggable="false" />
                  <span className="car-num">{p.n}</span>
                </div>
                <div className="car-body">
                  <h3>{p.title}</h3>
                  <p>{p.text}</p>
                  <div className="tag-row">
                    {p.tags.map((t) => <span className="tag" key={t}>{t}</span>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
