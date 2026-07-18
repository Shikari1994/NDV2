/* ─────────────────────────────────────────────
   ГЛОБУС · финал раздела «О компании»

   Один прогресс скролла (0…1 по длине обёртки .globe) ведёт всю сцену:
     0.00–0.45  строка сверху набирается по словам
     0.00–0.60  земной шар выезжает снизу и подрастает
     0.00–0.90  шар доворачивается и приходит Россией к зрителю

   Точек присутствия здесь нет намеренно: сцена показывает планету,
   а не карту объектов — светящиеся маркеры спорили с самой моделью.

   Цвет модели не трогаем: материалы идут как есть из .glb, сцена даёт
   только свет. Раньше здесь была перекраска через emissive — с текстурами
   2048×1024 она больше не нужна и только глушила собственный цвет карты.

   Штатный клип «Take 001» не проигрываем: он крутит не только спутник,
   но и сам шар, и от него финальный разворот переставал быть
   предсказуемым — Россия приходила на камеру не там, где нужно.
   Вращение целиком считает скролл.

   three.js и .glb (2 МБ) грузятся динамически и только когда секция
   подходит к экрану: на первый экран страницы этот вес не ложится.
   Без WebGL и при reduced-motion сцена сворачивается в статичный экран
   (.is-static) — строка там сразу читаемая.
   ───────────────────────────────────────────── */
import { asset } from '../lib/asset.js'

const wrap = document.querySelector('[data-globe]')
const canvas = wrap?.querySelector('[data-globe-canvas]')
const words = wrap ? [...wrap.querySelectorAll('[data-globe-word]')] : []

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

const hasWebGL = () => {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')))
  } catch {
    return false
  }
}

/* Разворот и завал полюса, в радианах.

   Отправная точка бралась не на глаз: в сцену временно ставились метки
   в координатах Москвы, Новосибирска и Якутска, и перебором искалось
   положение, где все три выходят на ближнюю к зрителю сторону шара.
   Дальше значения доводились по кадру.

   Одной долготы тут мало. В кадр попадает только верхняя шапка шара —
   его лицевая сторона лежит ниже нижней кромки экрана, — поэтому без
   завала полюса Россия при любой долготе оставалась бы на дальней
   кромке, сплюснутой полосой. */
const SPIN_FROM = -4.4
const SPIN_TO = -0.75
const TILT_FROM = 0.28
const TILT_TO = 0.55

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smooth = (t) => t * t * (3 - 2 * t)

/* прогресс прокрутки сквозь обёртку: 0 — сцена только прилипла,
   1 — обёртка кончилась и сцена уходит вверх */
function progress() {
  const r = wrap.getBoundingClientRect()
  const span = r.height - window.innerHeight
  return span > 0 ? clamp01(-r.top / span) : 0
}

/* Карта окружения. Материалы шара зеркальные (у сетки clearcoat
   с шероховатостью 0.07), а зеркалу нечего отражать, если сцена пуста —
   в three.js такой материал рисуется чёрным независимо от источников
   света. Поэтому даём окружение: вертикальный градиент от светлого неба
   к тёмной воде, свёрнутый PMREM в карту отражений. Это свет сцены,
   а не правка материалов — собственный цвет модели остаётся как есть. */
function makeEnv(THREE, renderer) {
  const c = document.createElement('canvas')
  c.width = 64
  c.height = 32
  const ctx = c.getContext('2d')
  /* Цвета взяты из подложки сцены (.globe-stage, радиальный градиент
     #0f57a8 → #04122a): океан у модели зеркальный и отражает почти
     только окружение, поэтому синева шара задаётся здесь. Нейтральное
     небо давало серо-стальной шар, выпадавший из синего фона. */
  const g = ctx.createLinearGradient(0, 0, 0, c.height)
  g.addColorStop(0, '#a8d2ff')
  g.addColorStop(0.42, '#1668bd')
  g.addColorStop(1, '#04122a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, c.width, c.height)

  const tex = new THREE.CanvasTexture(c)
  tex.mapping = THREE.EquirectangularReflectionMapping
  tex.colorSpace = THREE.SRGBColorSpace

  const pmrem = new THREE.PMREMGenerator(renderer)
  const env = pmrem.fromEquirectangular(tex).texture
  pmrem.dispose()
  tex.dispose()
  return env
}

function paintWords(p) {
  // строка набирается за первые 45% прокрутки
  const lit = clamp01(p / 0.45) * words.length
  words.forEach((w, i) => w.classList.toggle('is-on', i < lit))
}

async function start() {
  const [THREE, { GLTFLoader }] = await Promise.all([
    import('three'),
    import('three/examples/jsm/loaders/GLTFLoader.js'),
  ])

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
  /* Плотность буфера на телефоне режем до 1.5: у сцены дорогой пиксель
     (PBR-материалы шара плюс карта отражений из PMREM), и на экране с
     dpr 3 полный ×2 означал вчетверо больше работы на закраску, чем
     на десктопе. Разницы на глаз при такой мелкой картинке нет —
     шар занимает нижнюю треть экрана, — а кадры перестают проседать. */
  const dprCap = window.matchMedia('(max-width: 900px)').matches ? 1.5 : 2
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, dprCap))
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.15
  renderer.outputColorSpace = THREE.SRGBColorSpace

  const scene = new THREE.Scene()
  scene.environment = makeEnv(THREE, renderer)
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100)
  camera.position.set(0, 0, 3.2)

  // свет тоже синий: белый ключевой давал стальные блики на воде
  scene.add(new THREE.AmbientLight(0x7fb4f0, 0.9))
  const key = new THREE.DirectionalLight(0xbcdcff, 2.0)
  key.position.set(-2.4, 2.2, 2.6)
  scene.add(key)
  const rim = new THREE.DirectionalLight(0x2f8ae0, 1.6)
  rim.position.set(2.6, -1.2, -1.8)
  scene.add(rim)

  // группа-обёртка: скролл двигает её, вращение живёт на globe
  const holder = new THREE.Group()
  scene.add(holder)
  const globe = new THREE.Group()
  holder.add(globe)

  const clock = new THREE.Clock()

  const gltf = await new GLTFLoader().loadAsync(asset('/earth_orbit1.glb'))
  const model = gltf.scene

  /* Спутник на орбите — часть модели, он остаётся. Летит он штатным
     клипом, но клип берём не целиком: тот же «Take 001» крутит ещё
     и обе сферы шара, а это вращение складывалось бы с нашим и уводило
     финальный кадр — Россия приходила бы на камеру не там, где нужно.
     Оставляем в клипе только дорожки орбиты. */
  let mixer = null
  const clip = gltf.animations[0]
  if (clip) {
    const orbit = clip.clone()
    orbit.tracks = orbit.tracks.filter((t) => t.name.startsWith('Sat_Org'))
    if (orbit.tracks.length) {
      mixer = new THREE.AnimationMixer(model)
      mixer.clipAction(orbit).play()
    }
  }

  /* Нормируем по САМОМУ шару, а не по сцене целиком: в габариты сцены
     входят спутники на орбите, и от них «радиус 1» оказывался втрое
     больше земного — шар выходил крошечным. */
  const earth = model.getObjectByName('Globe_Solid') || model
  const box = new THREE.Box3().setFromObject(earth)
  const center = box.getCenter(new THREE.Vector3())
  // радиус берём как половину габарита, а не описанной сферы: у Box3
  // getBoundingSphere возвращает сферу вокруг КУБА, то есть R·√3 —
  // от этого шар выходил в полтора раза мельче
  const radius = Math.max(...box.getSize(new THREE.Vector3()).toArray()) / 2
  model.position.sub(center)
  const norm = new THREE.Group()
  norm.add(model)
  norm.scale.setScalar(1 / radius)
  globe.add(norm)


  const resize = () => {
    const w = canvas.clientWidth || wrap.clientWidth
    const h = canvas.clientHeight || window.innerHeight
    renderer.setSize(w, h, false)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  resize()

  /* ресайз прижимаем к кадру: серия событий при перетаскивании окна
     пересобирала буфер рендерера на каждое из них */
  let resizeRaf = 0
  window.addEventListener('resize', () => {
    if (resizeRaf) return
    resizeRaf = requestAnimationFrame(() => { resizeRaf = 0; resize() })
  })

  /* ─── Кадры считаются только пока сцена на экране ───
     Прежде цикл rAF продолжал вызываться всегда: за пределами секции он
     выходил на первой же строке, но браузер всё равно будил его каждый
     кадр до конца жизни страницы. Теперь цикл именно останавливается
     и заводится заново по наблюдателю — и глохнет на скрытой вкладке.

     При возврате первым делом сбрасываем накопившуюся дельту часов:
     иначе mixer получил бы разом всё время простоя и спутник прыгнул
     бы по орбите вместо того, чтобы продолжить полёт. */
  let visible = false
  let raf = 0

  const play = () => {
    if (raf || !visible || document.hidden) return
    clock.getDelta()
    raf = requestAnimationFrame(frame)
  }
  const stop = () => {
    if (!raf) return
    cancelAnimationFrame(raf)
    raf = 0
  }

  new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      visible = e.isIntersecting
      visible ? play() : stop()
    }),
    { threshold: 0 },
  ).observe(wrap)

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()))

  function frame() {
    raf = requestAnimationFrame(frame)
    const dt = clock.getDelta()

    const p = progress()
    paintWords(p)

    /* Выезд снизу: за первые 60% прокрутки шар поднимается и подрастает.
       Всё — и масштаб, и высота — умножается на fit: на узком вертикальном
       экране шар радиуса 1 не влезает в кадр по ширине и превращается
       в безориентирную заливку, поэтому там он мельче. */
    const fit = Math.min(1, Math.max(0.42, camera.aspect / 1.6))
    const rise = smooth(clamp01(p / 0.6))
    /* Конечная высота подобрана по России: на меньшем подъёме её южная
       граница уходила под нижнюю кромку экрана — страна упиралась в край
       кадра вместо того, чтобы поместиться целиком. */
    holder.position.y = fit * (-2.9 + rise * 1.85)
    holder.scale.setScalar(fit * (0.9 + rise * 0.22))

    /* Разворот заканчивается на 90% прокрутки, последние 10% — выдержка
       на России: иначе кадр, ради которого всё затевалось, проскакивает. */
    const turn = smooth(clamp01(p / 0.9))
    globe.rotation.y = SPIN_FROM + (SPIN_TO - SPIN_FROM) * turn
    globe.rotation.x = TILT_FROM + (TILT_TO - TILT_FROM) * turn
    globe.rotation.z = 0.14

    if (mixer) mixer.update(dt)
    renderer.render(scene, camera)
  }

  /* Первый кадр рисуем сразу, не дожидаясь наблюдателя: модель могла
     догрузиться уже после того, как секция вошла в экран, и до первого
     колебания скролла шар остался бы непоказанным. */
  visible = true
  play()
}

if (wrap && canvas) {
  if (reduce || !hasWebGL()) {
    wrap.classList.add('is-static')
  } else {
    // подгружаем three и модель только на подходе к секции
    const io = new IntersectionObserver(
      (entries, obs) => {
        if (!entries.some((e) => e.isIntersecting)) return
        obs.disconnect()
        start().catch(() => wrap.classList.add('is-static'))
      },
      { rootMargin: '600px' },
    )
    io.observe(wrap)
  }
}
