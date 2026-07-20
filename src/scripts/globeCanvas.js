/* ─────────────────────────────────────────────
   ГЛОБУС · финал раздела «О компании»

   Один прогресс скролла (0…1 по длине обёртки .globe) ведёт всю сцену:
     0.00–0.45  строка сверху набирается по словам
     0.00–0.60  земной шар выезжает снизу и подрастает
     0.00–0.90  шар доворачивается и приходит Россией к зрителю

   Точек присутствия здесь нет намеренно: сцена показывает планету,
   а не карту объектов — светящиеся маркеры спорили с самой моделью.
   По той же причине спутник, который несёт сама модель .glb, скрыт:
   он отвлекал от планеты и не нёс своего смысла — просто летал по
   орбите. Скрываем узел по имени (Sat_*), а не вырезаем из .glb: так
   проще вернуть, если он снова понадобится.

   Цвет модели не трогаем: материалы идут как есть из .glb, сцена даёт
   только свет. Раньше здесь была перекраска через emissive — с текстурами
   2048×1024 она больше не нужна и только глушила собственный цвет карты.

   Анимацию (миксер, штатный клип «Take 001») больше не поднимаем: она
   вращала только спутник, а он теперь скрыт — крутить нечего. Вращение
   самого шара по-прежнему целиком считает скролл, отдельно от клипа.

   three.js и .glb (2 МБ) грузятся динамически и только когда секция
   подходит к экрану: на первый экран страницы этот вес не ложится.

   Шар — часть сцены «О компании» (см. About.astro, index.css .atlas), и
   выходит он НЕ после карточек, а вместе с ними: с самого начала прокрутки
   из-за нижней кромки выглядывает шапка шара, и по мере скролла он
   поднимается, подрастает и доворачивается Россией — одновременно с тем,
   как листаются факты и наливается синева. Это и есть «одна сцена, из
   которой выходит глобус». Разворот заканчивается на 90% прокрутки,
   последние 10% — выдержка на России.

   Решение «поднимать ли three.js» принимает aboutScene.js: он вешает на
   обёртку класс .is-static в тех же случаях (нет WebGL, reduced-motion,
   экономный трафик). Здесь мы просто уважаем этот класс — своей проверки
   больше не держим, чтобы вердикт был один на оба модуля.
   ───────────────────────────────────────────── */
import { asset } from '../lib/asset.js'
import { makeProgress, span, clamp01, smooth } from './scrollProgress.js'

const wrap = document.querySelector('[data-atlas]')
const canvas = wrap?.querySelector('[data-globe-canvas]')
const stage = wrap?.querySelector('[data-atlas-stage]')

/* Шар отрабатывает почти всю прокрутку; последние 10% — выдержка на России,
   поэтому ремап идёт к 0.9, а не к 1. Выход из-за кромки виден с самого
   старта (при gp=0 шар уже приподнят на сливер, см. rise ниже). */
const GLOBE_END = 0.9

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

/* Прогресс всей сцены (0…1) считает общий модуль. gp — тот же прогресс,
   поджатый к диапазону выхода шара [0 … GLOBE_END]; по нему идут выход,
   рост и разворот. */
const progress = wrap ? makeProgress(wrap, stage) : () => 0
const globeProgress = () => span(progress(), 0, GLOBE_END)

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

  const gltf = await new GLTFLoader().loadAsync(asset('/earth_orbit1.glb'))
  const model = gltf.scene

  // спутник скрыт (см. заметку в шапке файла) — планета без орбитальной мишуры
  model.traverse((obj) => { if (obj.name.startsWith('Sat')) obj.visible = false })

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
     и заводится заново по наблюдателю — и глохнет на скрытой вкладке. */
  let visible = false
  let raf = 0

  const play = () => {
    if (raf || !visible || document.hidden) return
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

    // gp — прогресс акта с шаром (0 на GLOBE_START, 1 в конце сцены)
    const gp = globeProgress()

    /* Выезд снизу: за первые 60% акта шар поднимается и подрастает.
       Всё — и масштаб, и высота — умножается на fit: на узком вертикальном
       экране шар радиуса 1 не влезает в кадр по ширине и превращается
       в безориентирную заливку, поэтому там он мельче. */
    const fit = Math.min(1, Math.max(0.42, camera.aspect / 1.6))
    const rise = smooth(clamp01(gp / 0.6))
    /* Конечная высота подобрана по России: на меньшем подъёме её южная
       граница уходила под нижнюю кромку экрана — страна упиралась в край
       кадра вместо того, чтобы поместиться целиком. */
    holder.position.y = fit * (-2.9 + rise * 1.85)
    holder.scale.setScalar(fit * (0.9 + rise * 0.22))

    /* Разворот заканчивается на 90% акта, последние 10% — выдержка
       на России: иначе кадр, ради которого всё затевалось, проскакивает. */
    const turn = smooth(clamp01(gp / 0.9))
    globe.rotation.y = SPIN_FROM + (SPIN_TO - SPIN_FROM) * turn
    globe.rotation.x = TILT_FROM + (TILT_TO - TILT_FROM) * turn
    globe.rotation.z = 0.14

    renderer.render(scene, camera)
  }

  /* Первый кадр рисуем сразу, не дожидаясь наблюдателя: модель могла
     догрузиться уже после того, как секция вошла в экран, и до первого
     колебания скролла шар остался бы непоказанным. */
  visible = true
  play()
}

/* Поднимать ли three.js — решено в aboutScene.js: он вешает .is-static в
   тех же случаях (нет WebGL, reduced-motion, экономный трафик), и делает
   это синхронно на загрузке модуля. Здесь просто сверяемся с классом,
   вердикт один на оба модуля.

   Если модель не загрузится на живой сети — оставляем сцену как есть:
   ночь и строку ведёт aboutScene, шара просто не будет. Ронять всю
   сцену в статику посреди прокрутки хуже, чем показать её без планеты. */
if (wrap && canvas && !wrap.classList.contains('is-static')) {
  // подгружаем three и модель только на подходе к секции
  const io = new IntersectionObserver(
    (entries, obs) => {
      if (!entries.some((e) => e.isIntersecting)) return
      obs.disconnect()
      start().catch((e) => console.warn('[globe] сцена шара не поднялась:', e))
    },
    { rootMargin: '600px' },
  )
  io.observe(wrap)
}
