import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

/*
 * Bhoothaddam 2.0 — dark-first, 3D hero, minimal copy.
 * Plain CSS classes live in index.css (fx-*). Do NOT call stylex.create()
 * in app code: it is NOT compiled by this Vite setup and throws at runtime,
 * which left #root empty and the page blank (fixed 2026-11-17).
 */

/*
 * Funny UI sounds, synthesized in the browser with WebAudio — no audio
 * files, nothing downloaded, nothing sent anywhere. Sounds only ever
 * play in response to a tap or click, never on page load, and never loop.
 * The toggle in the header turns them off; the choice is remembered in
 * localStorage.
 */
let audioCtx: AudioContext | null = null
let soundsEnabled = true

function getAudioCtx(): AudioContext | null {
  try {
    if (!audioCtx) {
      const AC =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext
      if (!AC) return null
      audioCtx = new AC()
    }
    if (audioCtx.state === 'suspended') void audioCtx.resume()
    return audioCtx
  } catch {
    return null
  }
}

function tone(
  freqFrom: number,
  freqTo: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  delay = 0,
) {
  const ctx = getAudioCtx()
  if (!ctx) return
  const t0 = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freqFrom, t0)
  osc.frequency.exponentialRampToValueAtTime(Math.max(freqTo, 1), t0 + duration)
  gain.gain.setValueAtTime(0, t0)
  gain.gain.linearRampToValueAtTime(volume, t0 + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t0)
  osc.stop(t0 + duration + 0.05)
}

export function setSoundsEnabled(on: boolean) {
  soundsEnabled = on
}

function play(fn: () => void) {
  if (!soundsEnabled) return
  try {
    fn()
  } catch {
    /* A sound failing must never break the page. */
  }
}

/** Short pop — navigation, filters, footer links. */
export function sfxPop() {
  play(() => tone(520, 880, 0.09, 'sine', 0.12))
}

/** Springy boing — the theme switch. */
export function sfxBoing() {
  play(() => tone(180, 620, 0.22, 'triangle', 0.12))
}

/** Bright two-note ding — a genuine deal. */
export function sfxDing() {
  play(() => {
    tone(880, 880, 0.12, 'sine', 0.12)
    tone(1318, 1318, 0.18, 'sine', 0.1, 0.1)
  })
}

/** Sad slide-whistle down — a deal that is not one. */
export function sfxWomp() {
  play(() => tone(420, 140, 0.45, 'sine', 0.1))
}

/*
 * Three.js hero: a wireframe icosahedron with a glowing core, drifting
 * particles, slow spin, and a gentle lean toward the cursor. If WebGL is
 * unavailable the canvas stays empty and the CSS gradient behind it
 * carries the hero. Pauses its spin for reduced-motion users.
 */
function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    let renderer: THREE.WebGLRenderer | null = null
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
    camera.position.set(0, 0, 7)

    const group = new THREE.Group()
    const shellGeo = new THREE.IcosahedronGeometry(1.9, 1)
    const shell = new THREE.LineSegments(
      new THREE.WireframeGeometry(shellGeo),
      new THREE.LineBasicMaterial({
        color: 0x22d3ee,
        transparent: true,
        opacity: 0.55,
      }),
    )
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.15, 1),
      new THREE.MeshBasicMaterial({
        color: 0x8b5cf6,
        transparent: true,
        opacity: 0.16,
        wireframe: true,
      }),
    )
    const count = 500
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 3 + Math.random() * 3.5
      const t = Math.random() * Math.PI * 2
      const p = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(p) * Math.cos(t)
      pos[i * 3 + 1] = r * Math.sin(p) * Math.sin(t) * 0.7
      pos[i * 3 + 2] = r * Math.cos(p)
    }
    const pointsGeo = new THREE.BufferGeometry()
    pointsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    const points = new THREE.Points(
      pointsGeo,
      new THREE.PointsMaterial({
        color: 0x67e8f9,
        size: 0.035,
        transparent: true,
        opacity: 0.8,
      }),
    )
    group.add(shell)
    group.add(core)
    group.add(points)
    group.position.x = 1.4
    scene.add(group)
    mount.appendChild(renderer.domElement)

    let mx = 0
    let my = 0
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect()
      if (!r.width || !r.height) return
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2
      my = ((e.clientY - r.top) / r.height - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)
    const resize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      if (!w || !h || !renderer) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    window.addEventListener('resize', resize)

    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches
    const speed = reduced ? 0 : 1
    const clock = new THREE.Clock()
    let raf = 0
    let disposed = false
    const tick = () => {
      if (disposed || !renderer) return
      raf = requestAnimationFrame(tick)
      const t = clock.getElapsedTime() * speed
      group.rotation.y = t * 0.12 + mx * 0.35
      group.rotation.x = t * 0.05 + my * 0.25
      shell.rotation.z = t * 0.03
      points.rotation.y = -t * 0.02
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('resize', resize)
      shellGeo.dispose()
      pointsGeo.dispose()
      renderer?.dispose()
      if (renderer && mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [])

  return <div ref={mountRef} className="fx-hero-canvas" aria-hidden="true" />
}

type Route =
  | 'home'
  | 'explainers'
  | 'finds'
  | 'deal-checker'
  | 'how-we-pick'
  | 'about'
  | 'disclosure'
  | 'privacy'
  | 'terms'
  | 'contact'

function routeFromHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '')
  const routes: Route[] = [
    'home',
    'explainers',
    'finds',
    'deal-checker',
    'how-we-pick',
    'about',
    'disclosure',
    'privacy',
    'terms',
    'contact',
  ]
  return (routes as string[]).includes(h) ? (h as Route) : 'home'
}

const NAV: { route: Route; label: string }[] = [
  { route: 'home', label: 'Home' },
  { route: 'explainers', label: 'Explainers' },
  { route: 'finds', label: 'Finds' },
  { route: 'deal-checker', label: 'Deal Checker' },
  { route: 'how-we-pick', label: 'How we pick' },
  { route: 'about', label: 'About' },
]

type Explainer = {
  id: string
  title: string
  category: string
  standfirst: string
  steps: string[]
  watch: string
}

const EXPLAINERS: Explainer[] = [
  {
    id: 'cofferdam',
    title: 'How a cofferdam holds back a river',
    category: 'Engineering',
    standfirst:
      'To build in a river, builders first build a temporary wall in the water — then pump the river out of the way.',
    steps: [
      'A temporary wall — the cofferdam — is driven into the riverbed around the work area.',
      'Pumps remove the water trapped inside the wall, leaving a dry patch in the middle of the river.',
      'Builders work in the dry patch, pouring concrete and setting foundations.',
      'When the work is done, the pumps stop, the wall comes down, and the river returns.',
    ],
    watch: 'Watch the 3D breakdown on Instagram @bhoothaddam_3d.',
  },
  {
    id: 'upi',
    title: 'How UPI moves your money in seconds',
    category: 'Money',
    standfirst:
      'One tap on your phone, and money leaves your bank and lands in another — through a chain of checks you never see.',
    steps: [
      'You enter the amount and the receiver, and your bank checks that the money is there.',
      'The request travels to the UPI switch, which finds the receiver’s bank.',
      'The receiver’s bank credits the account and confirms it back down the chain.',
      'Both banks record the transfer, and you get the confirmation in seconds.',
    ],
    watch: 'Watch the 3D journey on Instagram @bhoothaddam_3d.',
  },
  {
    id: 'instant-photo',
    title: 'How an instant photo develops',
    category: 'Everyday tech',
    standfirst:
      'A blank white square slides out of the camera — and the picture slowly appears on it. The chemistry is inside the film itself.',
    steps: [
      'Light from the scene hits the film and forms a hidden image in its light-sensitive layers.',
      'Rollers squeeze a packet of developer chemicals evenly across the film as it leaves the camera.',
      'The chemicals develop the hidden image, layer by layer, into visible dyes.',
      'Minutes later the colours settle, and the print is finished — no darkroom needed.',
    ],
    watch: 'Watch the 3D breakdown on Instagram @bhoothaddam_3d.',
  },
  {
    id: 'smartwatch-heartbeat',
    title: 'How a smartwatch counts your heartbeat',
    category: 'Everyday tech',
    standfirst:
      'There is no stethoscope in a smartwatch. It watches your blood with light, and counts the pulses.',
    steps: [
      'A green light on the back of the watch shines into your wrist.',
      'Blood absorbs green light, so the amount reflected back rises and falls with each heartbeat.',
      'A sensor measures those tiny changes in reflected light, many times a second.',
      'The watch counts the peaks, and that count is your heart rate.',
    ],
    watch: 'Watch the 3D breakdown on Instagram @bhoothaddam_3d.',
  },
  {
    id: 'infrared-beam',
    title: 'What an infrared beam can — and cannot — do',
    category: 'Light',
    standfirst:
      'Infrared is light, just beyond what your eyes can see. It travels at the speed of light, and it cannot be seen — only its effects can.',
    steps: [
      'A remote sends pulses of infrared light — a code, flashed too fast and too dim for the eye.',
      'The TV’s receiver reads the pulses and turns them into a command: volume up, channel down.',
      'Walls and closed doors block the beam, because infrared does not pass through solid objects the way radio does.',
      'You cannot see the beam itself. Any glow in a video of one is the camera, or a visualisation — not the beam.',
    ],
    watch: 'Watch the 3D breakdown on Instagram @bhoothaddam_3d.',
  },
]

const SHELVES = [
  {
    name: 'The 3D creator desk',
    note: 'The tools and gear used to make the Bhoothaddam videos.',
  },
  {
    name: 'Everyday tech, explained',
    note: 'The gadgets featured in the explainers — watches, remotes, cameras.',
  },
  {
    name: 'Home, explained',
    note: 'Ordinary household things, taken apart in 3D.',
  },
  {
    name: 'Books and learning',
    note: 'The books that shaped the explainers on this site.',
  },
]

const CATEGORIES = ['All', 'Engineering', 'Money', 'Everyday tech', 'Light']

const IG_URL = 'https://www.instagram.com/bhoothaddam_3d'
const YT_URL = 'https://www.youtube.com/@bhoothaddam-3d'
const SHOP_URL = 'https://www.amazon.in/shop/bhoothaddam_3d'

function ExplainerCard({ item, num }: { item: Explainer; num: number }) {
  return (
    <article className="fx-card">
      <div className="fx-card-top">
        <span className="fx-num">{String(num).padStart(2, '0')}</span>
        <span className="fx-chip">{item.category}</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.standfirst}</p>
      <details className="fx-details">
        <summary>Steps · {item.steps.length}</summary>
        <ol>
          {item.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
      </details>
      <a className="fx-card-link" href={IG_URL} target="_blank" rel="noreferrer">
        {item.watch} →
      </a>
    </article>
  )
}

function DealChecker() {
  const [mrp, setMrp] = useState('')
  const [offer, setOffer] = useState('')
  const [street, setStreet] = useState('')
  const mrpN = Number(mrp)
  const offerN = Number(offer)
  const streetN = Number(street)
  const ready = mrpN > 0 && offerN > 0 && streetN > 0 && offerN <= mrpN
  const offMrp = ready ? Math.round(((mrpN - offerN) / mrpN) * 100) : 0
  const vsStreet = ready ? Math.round(((streetN - offerN) / streetN) * 100) : 0
  const genuine = ready && offerN < streetN
  const prevVerdict = useRef<string | null>(null)
  useEffect(() => {
    const verdict = !ready ? null : genuine ? 'genuine' : 'not-deal'
    if (verdict && verdict !== prevVerdict.current) {
      if (verdict === 'genuine') sfxDing()
      else sfxWomp()
    }
    prevVerdict.current = verdict
  }, [ready, genuine])
  return (
    <div className="fx-deal">
      <h2>Deal Checker</h2>
      <p>
        A discount off MRP is only half the story. A deal is genuine when the
        offer is also below the usual street price.
      </p>
      <div className="fx-inputs">
        <div className="fx-field">
          <label htmlFor="dc-mrp">MRP (₹)</label>
          <input
            id="dc-mrp"
            type="text"
            inputMode="decimal"
            value={mrp}
            onChange={(e) => setMrp(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="2999"
          />
        </div>
        <div className="fx-field">
          <label htmlFor="dc-offer">Offer price (₹)</label>
          <input
            id="dc-offer"
            type="text"
            inputMode="decimal"
            value={offer}
            onChange={(e) => setOffer(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="1499"
          />
        </div>
        <div className="fx-field">
          <label htmlFor="dc-street">Usual street price (₹)</label>
          <input
            id="dc-street"
            type="text"
            inputMode="decimal"
            value={street}
            onChange={(e) => setStreet(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="1899"
          />
        </div>
      </div>
      {ready ? (
        <div
          className={`fx-verdict ${genuine ? 'fx-verdict-good' : 'fx-verdict-bad'}`}
        >
          <div className="fx-verdict-big">
            {genuine
              ? `${offMrp}% off MRP — a genuine deal`
              : `${offMrp}% off MRP — check the street price`}
          </div>
          <p>
            {genuine
              ? `The offer is ${vsStreet}% below the usual street price of ₹${streetN.toLocaleString('en-IN')}.`
              : `The offer is ${Math.abs(vsStreet)}% above the usual street price of ₹${streetN.toLocaleString('en-IN')}. The MRP discount alone does not make it a deal.`}
          </p>
        </div>
      ) : (
        <p className="fx-hint">
          Enter all three prices to see the verdict. The offer price should be
          no higher than the MRP.
        </p>
      )}
      <p className="fx-hint">
        A calculator, not a recommendation. Prices change — enter a street
        price you have actually seen. Nothing you type leaves your browser.
      </p>
    </div>
  )
}

const RULES = [
  {
    title: 'Only things from the explainers',
    body: 'A product appears in Finds only if it is in, or directly behind, one of the explainers on this site. Nothing is listed because it pays well.',
  },
  {
    title: 'No paid placement',
    body: 'Nobody pays to be listed here. If that ever changes, it will be stated on the listing itself.',
  },
  {
    title: 'Prices are checked, not invented',
    body: 'A price is shown only if it was actually seen on the seller’s page. The Deal Checker exists for exactly this reason: compare the offer against the usual street price, not just the MRP.',
  },
  {
    title: 'Every affiliate link is labelled',
    body: 'Every link that earns a commission is labelled as an affiliate link, on this site and on the social channels. There are no hidden affiliate links.',
  },
  {
    title: 'We say when we do not know',
    body: 'If a claim cannot be verified, it is left out — or marked as unverified. A good story is not worth a wrong fact.',
  },
]

function PolicyPages({ route }: { route: Route }) {
  if (route === 'disclosure') {
    return (
      <div className="fx-prose">
        <h2>Affiliate Disclosure</h2>
        <p>
          Bhoothaddam participates in the Amazon Influencer Program. When you
          buy through a link on this site or on our social channels, we may
          earn a commission from Amazon at no extra cost to you.
        </p>
        <p>
          Our storefront is at amazon.in/shop/bhoothaddam_3d. Links on this
          site point to that storefront, and every link that earns a
          commission is labelled as an affiliate link.
        </p>
        <p>
          A commission does not change what we recommend or what you pay.
          Products appear here only because they are in, or directly behind,
          one of our explainers. Nobody pays to be listed, and we do not
          publish commission rates.
        </p>
        <p className="fx-small">Last updated: 18 November 2026.</p>
      </div>
    )
  }
  if (route === 'privacy') {
    return (
      <div className="fx-prose">
        <h2>Privacy Policy</h2>
        <p>
          Bhoothaddam (&ldquo;we&rdquo;, &ldquo;us&rdquo;) runs this website,
          bhoothaddam.in, and the Bhoothaddam channels on Instagram, Facebook
          and YouTube. This policy explains what information is collected
          when you use this site, and what we do with it. If you do not agree
          with it, please do not use the site.
        </p>
        <h3>What we collect</h3>
        <p>
          This site has no accounts, no newsletter, and no contact form, so
          we do not ask you for your name, email address, or phone number.
          The Deal Checker runs entirely in your browser: the prices you
          type in are never sent to us or stored anywhere.
        </p>
        <p>
          Our hosting provider may keep standard server logs, such as the
          page requested, the time of the visit, and a general location
          derived from your IP address. These logs are used to keep the site
          running and secure, and are not used to identify you.
        </p>
        <h3>Cookies and tracking</h3>
        <p>
          We do not run advertising trackers on this site, and we do not
          sell or share your information with advertisers. We do not
          currently use analytics software that follows you across the web.
          If that changes, this policy will be updated first. The optional
          interface sounds are generated in your browser and send nothing
          anywhere.
        </p>
        <h3>Links to other sites</h3>
        <p>
          This site links to Instagram, Facebook, YouTube, and Amazon.
          Those platforms have their own privacy policies, and they apply
          once you leave this site. We are not responsible for how they
          handle your information. Buying through our Amazon storefront is
          governed by Amazon&apos;s privacy notice and terms.
        </p>
        <h3>Children</h3>
        <p>
          This site is intended for a general audience. We do not knowingly
          collect personal information from children under 18.
        </p>
        <h3>Your rights</h3>
        <p>
          Under India&apos;s Digital Personal Data Protection Act, 2023, you
          may ask us what personal information we hold about you, and ask
          for it to be corrected or erased. Since this site collects almost
          nothing directly, most such requests will concern server logs held
          by our hosting provider. You can reach us through the channels on
          the Contact page, and we will respond within a reasonable time.
        </p>
        <h3>Changes to this policy</h3>
        <p>
          We may update this policy from time to time. The latest version is
          always the one published on this page, and the date below shows
          when it was last changed.
        </p>
        <p className="fx-small">
          Last updated: 18 November 2026. Contact: see the Contact page.
        </p>
      </div>
    )
  }
  if (route === 'terms') {
    return (
      <div className="fx-prose">
        <h2>Terms of Service</h2>
        <p>
          These terms govern your use of bhoothaddam.in. By using this site,
          you accept them. If you do not accept them, please do not use the
          site.
        </p>
        <h3>What this site is</h3>
        <p>
          Bhoothaddam publishes short 3D visual explainers that answer
          everyday questions — how things work, step by step. This website
          carries the full written versions of those explainers, and lists
          the products behind them under Finds.
        </p>
        <h3>Accuracy</h3>
        <p>
          Our explainers simplify complex subjects so they can be followed
          in under a minute. We check the facts we state, and we say so when
          something is unverified — but simplifications are still
          simplifications. Do not treat an explainer as professional,
          technical, medical, or financial advice. For anything that
          matters, check the original source or ask a qualified professional.
        </p>
        <h3>Prices and the Deal Checker</h3>
        <p>
          A price is shown only if it was actually seen on the seller&apos;s
          page at the time of checking. Prices change, and offers expire.
          The Deal Checker is a guide, not a guarantee: the price on the
          seller&apos;s page at the moment you buy is the one that counts.
        </p>
        <h3>Affiliate links</h3>
        <p>
          Some links on this site are affiliate links. If you buy through
          one, we may earn a commission at no extra cost to you. See the
          Affiliate Disclosure page for the full details.
        </p>
        <h3>Content and ownership</h3>
        <p>
          The text, videos, images, and 3D visuals on this site belong to
          Bhoothaddam unless stated otherwise. You may share links to our
          pages and quote short passages with credit. You may not copy,
          re-upload, or sell our content as your own, or use it in a way
          that suggests we endorse you.
        </p>
        <h3>Acceptable use</h3>
        <p>
          Do not misuse this site: do not try to break it, scrape it in a
          way that disrupts it for others, or use it for anything unlawful.
        </p>
        <h3>Liability</h3>
        <p>
          This site is provided as it is, without warranties of any kind. To
          the extent permitted by law, we are not liable for any loss arising
          from your use of the site, from a product you buy through a link
          here, or from relying on an explainer. Your purchase is governed
          by the seller&apos;s own terms.
        </p>
        <h3>Governing law</h3>
        <p>
          These terms are governed by the laws of India. Any dispute will be
          subject to the courts of Bengaluru, Karnataka.
        </p>
        <h3>Changes</h3>
        <p>
          We may update these terms from time to time. The latest version is
          always the one published on this page.
        </p>
        <p className="fx-small">Last updated: 18 November 2026.</p>
      </div>
    )
  }
  return (
    <div className="fx-prose">
      <h2>Contact</h2>
      <p>
        The fastest way to reach Bhoothaddam is through the channels
        themselves — send a message on Instagram or Facebook, or leave a
        comment on YouTube. Messages are read by the creator.
      </p>
      <p>
        <a href={IG_URL} target="_blank" rel="noreferrer">
          Instagram — @bhoothaddam_3d
        </a>
        <br />
        <a href="https://www.facebook.com/" target="_blank" rel="noreferrer">
          Facebook — Bhoothaddam D
        </a>
        <br />
        <a href={YT_URL} target="_blank" rel="noreferrer">
          YouTube — @bhoothaddam-3d
        </a>
      </p>
      <p className="fx-small">
        We do not publish an email address for this site. For privacy
        requests, use any of the channels above and mention that it is a
        privacy request.
      </p>
    </div>
  )
}

export default function App({
  mode,
  onToggleMode,
}: {
  mode: 'system' | 'light' | 'dark'
  onToggleMode: () => void
}) {
  const [route, setRoute] = useState<Route>(routeFromHash)
  const [filter, setFilter] = useState('All')
  const [soundOn, setSoundOn] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.localStorage.getItem('bhoothaddam-sound') !== 'off',
  )

  // Dark-first: 'system' resolves to dark, 'light' is the only light mode.
  const theme = mode === 'light' ? 'light' : 'dark'

  useEffect(() => {
    setSoundsEnabled(soundOn)
    window.localStorage.setItem('bhoothaddam-sound', soundOn ? 'on' : 'off')
  }, [soundOn])

  useEffect(() => {
    document.body.style.backgroundColor =
      theme === 'dark' ? '#05070d' : '#f3f5fa'
    document.body.style.color = theme === 'dark' ? '#f4f6fb' : '#0b0f1a'
  }, [theme])

  const toggleSound = () => {
    setSoundOn((on) => !on)
    sfxPop()
  }

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (r: Route) => {
    sfxPop()
    window.location.hash = `/${r}`
  }

  const filtered =
    filter === 'All'
      ? EXPLAINERS
      : EXPLAINERS.filter((e) => e.category === filter)

  return (
    <div className="fx-page" data-theme={theme}>
      <header className="fx-nav">
        <div className="fx-nav-inner">
          <button className="fx-brand" onClick={() => go('home')}>
            Bhoothaddam<i>.</i>
          </button>
          <nav className="fx-nav-links">
            {NAV.map((n) => (
              <button
                key={n.route}
                className={`fx-pill ${route === n.route ? 'fx-pill-on' : ''}`}
                onClick={() => go(n.route)}
              >
                {n.label}
              </button>
            ))}
          </nav>
          <div className="fx-nav-actions">
            <button className="fx-mini-btn" onClick={toggleSound}>
              {soundOn ? 'Sound on' : 'Sound off'}
            </button>
            <button
              className="fx-mini-btn"
              onClick={() => {
                sfxBoing()
                onToggleMode()
              }}
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
          </div>
        </div>
      </header>

      {route === 'home' && (
        <section className="fx-hero">
          <Hero3D />
          <div className="fx-hero-copy">
            <p className="fx-eyebrow">Bhoothaddam · 3D visual science</p>
            <h1 className="fx-h1">
              How things work, <span className="fx-grad">in 3D.</span>
            </h1>
            <p className="fx-sub">
              One everyday question. One 3D journey. Zero fluff.
            </p>
            <div className="fx-cta-row">
              <a
                className="fx-btn fx-btn-primary"
                href={IG_URL}
                target="_blank"
                rel="noreferrer"
              >
                Watch on Instagram
              </a>
              <button
                className="fx-btn fx-btn-ghost"
                onClick={() => go('finds')}
              >
                Shop the finds
              </button>
            </div>
            <p className="fx-stats">
              <b>4,422</b> on Instagram · <b>2.6k</b> on Facebook ·{' '}
              <b>{EXPLAINERS.length}</b> explainers
            </p>
          </div>
        </section>
      )}

      <main className="fx-wrap">
        {route === 'home' && (
          <>
            <section className="fx-section">
              <div className="fx-section-head">
                <h2 className="fx-h2">Latest drops</h2>
                <p className="fx-section-note">
                  Full breakdowns live here — steps included.
                </p>
              </div>
              <div className="fx-grid">
                {EXPLAINERS.slice(0, 4).map((e, i) => (
                  <ExplainerCard key={e.id} item={e} num={i + 1} />
                ))}
              </div>
            </section>

            <section className="fx-section">
              <div className="fx-section-head">
                <h2 className="fx-h2">Finds</h2>
                <p className="fx-section-note">
                  On our Amazon storefront — affiliate links, labelled.
                </p>
              </div>
              <div className="fx-grid">
                {SHELVES.map((s) => (
                  <article key={s.name} className="fx-card">
                    <h3>{s.name}</h3>
                    <p>{s.note}</p>
                    <span className="fx-shelf-tag">
                      On our Amazon storefront
                    </span>
                  </article>
                ))}
              </div>
            </section>

            <div className="fx-band">
              <div>
                <h2>Is that discount real?</h2>
                <p>Three numbers. Ten seconds. No signup.</p>
              </div>
              <button
                className="fx-btn"
                onClick={() => go('deal-checker')}
              >
                Check a deal →
              </button>
            </div>

            <section className="fx-section">
              <div className="fx-section-head">
                <h2 className="fx-h2">Follow the channel</h2>
              </div>
              <div className="fx-grid">
                <a
                  className="fx-tile"
                  href={IG_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <b>Instagram</b>
                  <span>@bhoothaddam_3d · 4,422 followers · reels first</span>
                </a>
                <a
                  className="fx-tile"
                  href={YT_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <b>YouTube</b>
                  <span>@bhoothaddam-3d · the full videos</span>
                </a>
                <a
                  className="fx-tile"
                  href={SHOP_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <b>Amazon storefront</b>
                  <span>Shop the finds · amazon.in/shop/bhoothaddam_3d</span>
                </a>
              </div>
            </section>
          </>
        )}

        {route === 'explainers' && (
          <section className="fx-section">
            <div className="fx-section-head">
              <h2 className="fx-h2">Explainers</h2>
              <p className="fx-section-note">
                One question per story, answered step by step in 3D.
              </p>
            </div>
            <div className="fx-cta-row" style={{ marginTop: 0, marginBottom: 20 }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  className={`fx-pill ${filter === c ? 'fx-pill-on' : ''}`}
                  onClick={() => {
                    sfxPop()
                    setFilter(c)
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="fx-grid">
              {filtered.map((e, i) => (
                <ExplainerCard key={e.id} item={e} num={i + 1} />
              ))}
            </div>
            {filtered.length === 0 && (
              <p className="fx-section-note">
                No explainers in this category yet.
              </p>
            )}
          </section>
        )}

        {route === 'finds' && (
          <section className="fx-section">
            <div className="fx-section-head">
              <h2 className="fx-h2">Finds</h2>
              <p className="fx-section-note">
                Live on our Amazon storefront — affiliate links, labelled.
              </p>
            </div>
            <div className="fx-grid">
              {SHELVES.map((s) => (
                <article key={s.name} className="fx-card">
                  <h3>{s.name}</h3>
                  <p>{s.note}</p>
                  <span className="fx-shelf-tag">
                    On our Amazon storefront
                  </span>
                </article>
              ))}
            </div>
            <div className="fx-cta-row">
              <a
                className="fx-btn fx-btn-primary"
                href={SHOP_URL}
                target="_blank"
                rel="noreferrer"
              >
                Open the storefront →
              </a>
            </div>
          </section>
        )}

        {route === 'deal-checker' && (
          <section className="fx-section">
            <DealChecker />
          </section>
        )}

        {route === 'how-we-pick' && (
          <section className="fx-section">
            <div className="fx-section-head">
              <h2 className="fx-h2">How we pick</h2>
              <p className="fx-section-note">
                The rules for everything in Finds — published so you can hold
                us to them.
              </p>
            </div>
            <div className="fx-rules">
              {RULES.map((r, i) => (
                <div key={r.title} className="fx-rule">
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <div>
                    <h3>{r.title}</h3>
                    <p>{r.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {route === 'about' && (
          <div className="fx-prose">
            <h2>About Bhoothaddam</h2>
            <p>
              Bhoothaddam is a 3D visual-science channel. Each reel takes one
              everyday question — how a cofferdam holds back a river, how UPI
              moves money, how an instant photo develops — and answers it
              step by step, in 3D.
            </p>
            <p>
              Instagram @bhoothaddam_3d (4,422 followers), Facebook as the
              public profile Bhoothaddam D (2.6k followers), YouTube
              @bhoothaddam-3d. This website holds the full written
              breakdowns, and the finds behind the videos on our Amazon
              storefront at amazon.in/shop/bhoothaddam_3d.
            </p>
          </div>
        )}

        {(route === 'disclosure' ||
          route === 'privacy' ||
          route === 'terms' ||
          route === 'contact') && <PolicyPages route={route} />}

        <footer className="fx-footer">
          <div className="fx-footer-links">
            <button className="fx-pill" onClick={() => go('about')}>
              About
            </button>
            <button className="fx-pill" onClick={() => go('disclosure')}>
              Affiliate Disclosure
            </button>
            <button className="fx-pill" onClick={() => go('privacy')}>
              Privacy
            </button>
            <button className="fx-pill" onClick={() => go('terms')}>
              Terms
            </button>
            <button className="fx-pill" onClick={() => go('contact')}>
              Contact
            </button>
          </div>
          <p>
            Bhoothaddam · bhoothaddam.in · 3D stories that explain how things
            work. Shop the finds at amazon.in/shop/bhoothaddam_3d.
          </p>
        </footer>
      </main>
    </div>
  )
}
