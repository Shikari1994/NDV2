import { asset } from '../lib/asset.js'

/* TODO: подписи описывают железо, а изображения — скриншоты приложения.
   Свериться с реальными фото продукции. */
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

/* Линейка-«аккордеон»: карточки стоят в ряд равными долями, а под
   курсором нужная раскрывается на бо́льшую долю ряда — соседние
   сжимаются и уходят в затемнение. Фокус ведёт указатель, поэтому
   листалка со стрелками и перетаскиванием больше не нужна.

   Тот же эффект работает с клавиатуры (:focus-within), а на тач и при
   reduced-motion ряд превращается в обычную сетку плиток — раскрывать
   там нечего, наведения нет. */
export default function Showcase() {
  return (
    <section id="products" data-theme="gray">
      <div className="container">
        <div className="car-head">
          <div>
            <div className="eyebrow reveal"><span className="ey-no">03<span className="ey-den"> / 07</span></span>Линейка оборудования</div>
            <h2 className="h-title reveal">Оборудование <br />и сервис</h2>
            <p className="lead reveal">
              Полная линейка телеметрии MWD/LWD собственной разработки —
              от забойных датчиков до наземных станций декодирования и сервиса.
            </p>
          </div>
        </div>
      </div>

      <div className="exp-row reveal">
        {PRODUCTS.map((p) => (
          <article className="exp-card" key={p.n} tabIndex={0}>
            <img className="exp-img" src={asset(p.img)} alt={p.title} loading="lazy" draggable="false" />

            <div className="exp-body">
              <h3 className="exp-title">{p.title}</h3>
              <div className="exp-more">
                <p className="exp-text">{p.text}</p>
                <span className="exp-tags mono">{p.tags.join(' · ')}</span>
              </div>
            </div>

            <span className="exp-num mono" aria-hidden="true">{p.n}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
