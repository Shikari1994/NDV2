/* Финальный разворот раздела «О компании»: пока идёт прокрутка, строка
   сверху набирается по словам, а снизу выезжает земной шар
   (earth_orbit1.glb) и доворачивается Россией к зрителю. Сцена прибита
   sticky внутри длинной обёртки — весь эффект считает один прогресс
   скролла (scripts/globeCanvas.js).

   Модель тяжёлая, поэтому three.js и .glb подгружаются динамически и
   только при подходе секции к экрану. Без WebGL и при reduced-motion
   остаётся статичная строка — она читается сама по себе. */
const HEADLINE = 'Реализованы проекты в 55 регионах России и в 38 странах мира'

export default function Globe({ index = '04', total = '04' }) {
  const words = HEADLINE.split(' ')

  return (
    <div className="globe" data-globe>
      <div className="globe-stage">
        <canvas className="globe-canvas" data-globe-canvas aria-hidden="true" />

        <h3 className="globe-headline">
          {words.map((w, i) => (
            <span className="globe-word" data-globe-word={i} key={`${w}-${i}`}>
              {w}{' '}
            </span>
          ))}
        </h3>

        <span className="globe-label mono" aria-hidden="true">География деятельности</span>
        <span className="globe-count mono" aria-hidden="true">
          <b>{index}</b><i>/{total}</i>
        </span>
      </div>
    </div>
  )
}
