import { asset } from '../lib/asset.js'

/* ── КОЛОДА ЭКРАНОВ 01–02 ──────────────────────────────────────────
   Приём первоисточника (ZITAR® METALWARE → ZITAR® ABRASIVES): первая
   строка ОДНА И ТА ЖЕ на всех экранах колоды и стоит на одной и той же
   высоте вьюпорта. Наезжающая заливка режет её по горизонтали: сверху
   она ещё в тоне уходящего экрана, снизу — уже в тоне пришедшего.
   Меняется только слово под ней и цвет фона.

   Чтобы разрез сошёлся, обязаны совпадать три вещи:
     · высота строки на экране — держится одинаковой вёрсткой экранов;
     · кегль — общий для всей колоды, считается по самой длинной строке
       (--deck-len ниже), иначе на разных экранах буквы разного размера;
     · неподвижность — содержимое пришедшего экрана не едет вместе с
       заливкой, его компенсирует motion.js.

   Ряд показателей и окно прибора с первого экрана убраны: интерфейс
   Drill Monitor подробно разобран в Software и About, а здесь он мешал
   разрезу — первый экран был плотнее остальных, и приём не читался.
   Экран про ЗИП из колоды тоже убран: сервис и комплектующие живут
   в Showcase и Store, в колоде он был третьим повтором того же приёма.
   ────────────────────────────────────────────────────────────────── */
const BRAND = 'ГЕОТЕХНАВИГАЦИЯ'

const SCREENS = [
  {
    theme: 'black',
    no: '01',
    kicker: 'Телеметрия и геонавигация бурения',
    word: ['Производство', 'телесистем'],
    descr: [
      'системы MWD / LWD и наземные станции декодирования —',
      'полный цикл от забойного датчика до отчёта заказчику',
    ],
    // каротажный canvas вместо видео — своя фактура у входного экрана
    canvas: true,
    // компоновка в сборе: канвас замаскирован в левую половину, снаряд идёт справа
    rig: '/mwd-rig.webp',
    cta: { href: '#products', label: 'Оборудование' },
  },
  {
    theme: 'graphite',
    no: '02',
    kicker: 'Программный комплекс',
    word: ['Разработка', 'ПО'],
    descr: ['Drill Monitor: рабочее место инженера и мобильный клиент —', 'один промысел на всех экранах'],
    /* Рабочее место вместо видео-фактуры: у экрана про ПО иллюстрация —
       сам интерфейс, а не абстрактный кадр. Телефон здесь один и стоит
       на кромке ноутбука: ряд из трёх дробил экран, а читались всё
       равно не они. */
    stage: { note: '/note1.webp', phone: '/mob2.webp' },
    cta: { href: '#software', label: 'Смотреть Drill Monitor' },
  },
]

/* Кегль колоды считается по самой длинной строке — и константе, и словам.
   Один кегль на все экраны: если он прыгает, разрез константы не сходится.
   Поэтому же слово разбито на строки руками: автоперенос дал бы разным
   экранам разную высоту заголовка и увёл бы константу с общей высоты. */
const LONGEST = Math.max(BRAND.length, ...SCREENS.flatMap((s) => s.word.map((w) => w.length)))

export default function Hero() {
  return (
    <div className="deck" style={{ '--deck-len': LONGEST }}>
      {SCREENS.map((s, i) => {
        const Heading = i === 0 ? 'h1' : 'h2'
        return (
          <section
            className="deck-screen"
            id={i === 0 ? 'hero' : undefined}
            data-theme={s.theme}
            data-rails="on"
            key={s.no}
          >
            <div className="deck-inner">
              {s.canvas && <canvas className="hero-bg-canvas" aria-hidden="true" />}

              {s.video && (
                <div className="deck-media" aria-hidden="true">
                  <video
                    poster={asset(s.poster)}
                    data-lazy-video={asset(s.video)}
                    muted
                    loop
                    playsInline
                    preload="none"
                  />
                </div>
              )}

              {/* data-lift-x — ход выхода в процентах собственной ширины.
                  Величины здесь, а не в CSS: transform целиком отдан GSAP,
                  иначе он разберёт готовый transform в пиксельную базу и
                  смещение перестанет пересчитываться на ресайзе. Телефону
                  ход втрое длиннее — он и стартует из-под ноутбука.

                  Узла у телефона два: место в сцене держит CSS (.deck-phone),
                  ход везёт вложенный .deck-phone-move. На одном узле
                  позиционирование и твин дрались бы за transform. */}
              {s.stage && (
                <div className="deck-devices" aria-hidden="true">
                  <div className="deck-stage">
                    <div className="deck-note" data-device data-lift-x="46">
                      <img src={asset(s.stage.note)} alt="" loading="lazy" draggable="false" />
                    </div>
                    <div className="deck-phone">
                      <div className="deck-phone-move" data-device data-lift-x="235">
                        <img src={asset(s.stage.phone)} alt="" loading="lazy" draggable="false" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* три узла, и это не лишняя вложенность: поворот кадра,
                  выход на загрузке и параллакс — три трансформа, а на
                  одном узле они затирают друг друга */}
              {s.rig && (
                <div className="deck-rig" aria-hidden="true">
                  <div className="deck-rig-move">
                    <img src={asset(s.rig)} alt="" data-rig fetchPriority="high" draggable="false" />
                  </div>
                </div>
              )}

              <div className="deck-body container">
                <span className="deck-kicker mono">{s.kicker}</span>
                <Heading className="mega deck-heading">
                  <span className="deck-heading-line deck-brand">{BRAND}</span>
                  <span className="deck-word">
                    {s.word.map((w) => (
                      <span className="deck-heading-line" key={w}>{w}</span>
                    ))}
                  </span>
                </Heading>
                <div className="deck-foot">
                  <p className="deck-descr">
                    {s.descr.map((line, k) => (
                      <span key={line}>
                        {line}
                        {k < s.descr.length - 1 && <br />}
                      </span>
                    ))}
                  </p>

                  {s.cta && (
                    <a className="btn btn-ghost deck-cta" href={s.cta.href}>
                      {s.cta.label}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </a>
                  )}

                  <div className="deck-count mono" aria-hidden="true">
                    <span>{s.no}</span><span className="deck-count-den">/</span><span className="deck-count-den">{String(SCREENS.length).padStart(2, '0')}</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}
