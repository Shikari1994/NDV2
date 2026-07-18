import { asset } from '../lib/asset.js'
import Globe from './Globe.jsx'

/* Разворот «ключевые цифры»: слева прибитая колонка — рубрика и
   карточка-изображение, справа лента цифр, по экрану на пункт.

   Наложение здесь — приём, а не дефект: следующий пункт наезжает
   на предыдущий, и кромка наезда видна. Кромок две, и они
   сознательно рассинхронизированы — слева едет картинка, справа
   панель с числом, и левая уходит вперёд правой. Из-за этого в
   переходе видно оба шва на разной высоте.

   Панели правой колонки складываются штабелем на чистом sticky,
   картинки слева двигает motion.js. Каждая цифра поэтому — свой
   слой: article для числа, .spread-shot для картинки.

   Финал раздела — глобус: четвёртый пункт того же счётчика. */
const CARDS = [
  {
    big: '15', unit: 'лет', kicker: 'На рынке телеметрии',
    text: 'Разрабатываем и производим системы MWD/LWD с 2010 года. Оборудование работает на объектах ведущих добывающих компаний России и СНГ.',
    img: '/direct.webp',
  },
  {
    big: '200+', kicker: 'Скважин с MWD/LWD',
    text: 'Пробурено с нашими телесистемами — от наклонно-направленных до горизонтальных стволов сложного профиля.',
    img: '/app-survey.webp',
  },
  {
    big: '24/7', kicker: 'Инженерная поддержка',
    text: 'Дежурная смена инженеров на связи круглосуточно, с удалённым доступом к данным буровой в реальном времени.',
    img: '/app-drilling.webp',
  },
]

const TOTAL = String(CARDS.length + 1).padStart(2, '0')

export default function About() {
  return (
    <section id="about" data-theme="black">
      <div className="spread" data-spread>
        <div className="spread-aside">
          <div className="spread-head">
            <div className="eyebrow"><span className="ey-no">01<span className="ey-den"> / 07</span></span>О компании</div>
            <h2 className="spread-title">Ключевые цифры</h2>
            <p className="lead">
              ГЕОТЕХНАВИГАЦИЯ — российский разработчик и производитель
              телеметрического оборудования и ПО для контроля траектории бурения.
            </p>
            <a className="pill" href="#contact">связаться</a>
          </div>

          <div className="spread-media" aria-hidden="true">
            {CARDS.map((c, i) => (
              <div className="spread-shot" data-spread-shot={i} key={c.kicker}>
                <img src={asset(c.img)} alt="" loading="lazy" draggable="false" />
              </div>
            ))}
          </div>
        </div>

        <div className="spread-main">
          <span className="spread-count mono" aria-hidden="true">
            <b data-spread-count>01</b>
            <i>/{TOTAL}</i>
          </span>

          {CARDS.map((c, i) => (
            <article className="spread-item" data-spread-item={i} key={c.kicker}>
              <span className="sc-big">
                {c.big}
                {c.unit && <span className="sc-unit">{c.unit}</span>}
              </span>
              <span className="sc-kicker">{c.kicker}</span>
              <p className="sc-text">{c.text}</p>
            </article>
          ))}
        </div>
      </div>

      <Globe index={TOTAL} total={TOTAL} />
    </section>
  )
}
