/* Бесконечная лента — «шов» между секциями вместо линии-разделителя.
   Список клонируется в motion.js; здесь только одна копия. */
export default function Marquee({ items, theme = 'gray', dir = 'left', speed = 45 }) {
  return (
    <div className="marquee" data-theme={theme} data-marquee-dir={dir} data-marquee-speed={speed}>
      <ul className="marquee-list" aria-hidden="true">
        {items.map((t) => (
          <li key={t}>
            {t}
            <span className="marquee-sep" aria-hidden="true">/</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
