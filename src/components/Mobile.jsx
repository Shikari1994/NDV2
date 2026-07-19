import { asset } from '../lib/asset.js'

/* ── МОБИЛЬНЫЙ КЛИЕНТ ──────────────────────────────────────────────
   Приём первоисточника: три аппарата в ряд на чёрном, средний выше
   боковых, и на подходе к секции они поднимаются снизу с РАЗНОЙ
   скоростью. Разница скоростей и есть весь эффект — уйди они одним
   блоком, ряд читался бы картинкой, а не сценой.

   Порядок в массиве — порядок в ряду. Средний по счёту аппарат несёт
   главный экран продукта: он стоит выше и виден целиком, боковые
   уходят за нижнюю кромку.

   Ход отдан motion.js (data-depth — место в глубине), здесь только
   покой: он же состояние без скрипта и при reduced-motion.
   ────────────────────────────────────────────────────────────────── */
const PHONES = [
  { src: '/mob1.webp', label: 'Парк оборудования и ресурс до ТО' },
  { src: '/mob2.webp', label: 'Мониторинг бурения в реальном времени' },
  { src: '/mob3.webp', label: 'Компоновка КНБК' },
]

const TAGS = ['iOS / Android', 'Live-данные', 'Офлайн-режим']

export default function Mobile() {
  return (
    <section id="mobile" data-theme="black">
      <div className="container mob-head">
        <div>
          <div className="eyebrow reveal"><span className="ey-no">03<span className="ey-den"> / 07</span></span>Программный комплекс · мобильная версия</div>
          <h2 className="h-title reveal">
            Промысел в кармане —<br />тот же Drill&nbsp;Monitor
          </h2>
        </div>
        <div className="mob-head-side reveal">
          <p className="lead">
            Ключевые показатели скважины, механика бурения и парк оборудования
            на смартфоне: супервайзер видит буровую с площадки, офис — из города.
            Данные те же, что на настольной версии, без задержки.
          </p>
          <div className="tag-row">
            {TAGS.map((t) => <span className="tag" key={t}>{t}</span>)}
          </div>
        </div>
      </div>

      <div className="mob-stage" data-mob-stage>
        {PHONES.map((p, i) => (
          <figure
            className={'mob-phone' + (i === 1 ? ' is-mid' : '')}
            data-mob-phone
            data-depth={i === 1 ? 0 : 1}
            key={p.src}
          >
            <img src={asset(p.src)} alt={p.label} loading="lazy" draggable="false" />
          </figure>
        ))}
      </div>
    </section>
  )
}
