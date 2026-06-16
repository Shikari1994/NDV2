import { useEffect, useRef, useState } from 'react'

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
    n: '04', img: '/noroot.webp', title: 'Программный комплекс Drill Monitor',
    text: 'Диспетчерский комплекс для 3D-визуализации траектории скважины, контроля отклонений от проектного профиля и автоматического формирования отчётности.',
    tags: ['ПО', '3D', 'Реестр РФ'],
  },
  {
    n: '05', img: '/kitrent.webp', title: 'Датчик давления и температуры',
    text: 'Пьезорезистивные датчики контролируют давление промывочной жидкости, забойную температуру и вибрационную нагрузку на КНБК.',
    tags: ['Сенсор', 'P / T'],
  },
  {
    n: '06', img: '/kit4psd.webp', title: 'Сервис и ЗИП',
    text: 'Запасные части, расходные материалы и комплектующие для всех моделей. Постоянное наличие на складе, срочная отгрузка и сервисное обслуживание 24/7.',
    tags: ['ЗИП', 'Сервис 24/7'],
  },
]

export default function Showcase() {
  const trackRef = useRef(null)
  const [active, setActive] = useState(0)

  const stepRef = useRef(0)
  const measure = () => {
    const track = trackRef.current
    if (!track || track.children.length < 2) return track ? track.firstChild?.offsetWidth || 0 : 0
    return track.children[1].offsetLeft - track.children[0].offsetLeft
  }

  const scrollToIndex = (i) => {
    const track = trackRef.current
    if (!track) return
    const idx = Math.max(0, Math.min(PRODUCTS.length - 1, i))
    track.scrollTo({ left: idx * measure(), behavior: 'smooth' })
  }

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const step = measure() || 1
        setActive(Math.round(track.scrollLeft / step))
      })
    }
    track.addEventListener('scroll', onScroll, { passive: true })

    // перетаскивание мышью
    let down = false, startX = 0, startScroll = 0, moved = false
    const onDown = (e) => {
      if (e.pointerType === 'touch') return // тач — нативный скролл
      down = true; moved = false
      startX = e.clientX; startScroll = track.scrollLeft
      track.classList.add('dragging')
      track.setPointerCapture?.(e.pointerId)
    }
    const onMove = (e) => {
      if (!down) return
      const dx = e.clientX - startX
      if (Math.abs(dx) > 4) moved = true
      track.scrollLeft = startScroll - dx
    }
    const onUp = () => {
      if (!down) return
      down = false
      track.classList.remove('dragging')
      // мягкий снап к ближайшей карточке
      scrollToIndex(Math.round(track.scrollLeft / (measure() || 1)))
    }
    const onClickCapture = (e) => { if (moved) { e.preventDefault(); e.stopPropagation() } }

    track.addEventListener('pointerdown', onDown)
    track.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    track.addEventListener('click', onClickCapture, true)

    return () => {
      track.removeEventListener('scroll', onScroll)
      track.removeEventListener('pointerdown', onDown)
      track.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      track.removeEventListener('click', onClickCapture, true)
      cancelAnimationFrame(raf)
    }
  }, [])

  const atStart = active <= 0
  const atEnd = active >= PRODUCTS.length - 1

  return (
    <section id="products">
      <div className="container">
        <div className="car-head">
          <div>
            <div className="eyebrow reveal">Линейка продуктов</div>
            <h2 className="h-title reveal">Оборудование и модули</h2>
          </div>
          <div className="car-controls reveal">
            <button className="car-arrow" aria-label="Назад" disabled={atStart} onClick={() => scrollToIndex(active - 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
            </button>
            <button className="car-arrow" aria-label="Вперёд" disabled={atEnd} onClick={() => scrollToIndex(active + 1)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>

      <div className="car-viewport reveal">
        <div className="car-track" ref={trackRef}>
          {PRODUCTS.map((p) => (
            <article className="car-card" key={p.n}>
              <div className="car-card-media">
                <img src={p.img} alt={p.title} loading="lazy" draggable="false" />
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

      <div className="container">
        <div className="car-dots">
          {PRODUCTS.map((p, i) => (
            <button
              key={p.n}
              className={`car-dot${i === active ? ' on' : ''}`}
              aria-label={`Перейти к продукту ${p.n}`}
              onClick={() => scrollToIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
