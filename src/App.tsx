import { useEffect, useState } from 'react'
import { Stack } from '@astryxdesign/core/Stack'
import { Heading } from '@astryxdesign/core/Heading'
import { Text } from '@astryxdesign/core/Text'
import { Button } from '@astryxdesign/core/Button'
import { Badge } from '@astryxdesign/core/Badge'
import { Banner } from '@astryxdesign/core/Banner'
import { Card } from '@astryxdesign/core/Card'
import { Divider } from '@astryxdesign/core/Divider'
import { TextInput } from '@astryxdesign/core/TextInput'
import { Collapsible, CollapsibleGroup } from '@astryxdesign/core/Collapsible'
import { Link } from '@astryxdesign/core/Link'
import { Section } from '@astryxdesign/core/Section'
import { Grid } from '@astryxdesign/core/Grid'

/*
 * Bhoothaddam — clean editorial site, built with the real Astryx library.
 * Every visible control below is an @astryxdesign/core component.
 * Layout spacing comes from Astryx Stack/Section/Grid; the only custom
 * styles are the plain CSS page-shell classes in index.css.
 *
 * NOTE: do NOT call stylex.create() in app code. Astryx ships pre-compiled
 * ("No build plugins needed"), but app-level stylex.create() is NOT compiled
 * by this Vite setup (no @stylexjs/babel-plugin) and throws at runtime —
 * "Unexpected 'stylex.create' call at runtime" — during module evaluation,
 * which left #root empty and the page blank. Plain CSS classes below are
 * the equivalent declarations.
 */

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

function ExplainerCard({ item }: { item: Explainer }) {
  return (
    <Card padding={4}>
      <Stack gap={2}>
        <Badge label={item.category} variant="info" />
        <Heading level={3}>{item.title}</Heading>
        <Text as="p">{item.standfirst}</Text>
        <ol className="shell-explainer-steps">
          {item.steps.map((s) => (
            <li key={s}>
              <Text as="span">{s}</Text>
            </li>
          ))}
        </ol>
        <Text type="supporting">{item.watch}</Text>
      </Stack>
    </Card>
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
  const vsStreet = ready
    ? Math.round(((streetN - offerN) / streetN) * 100)
    : 0
  const genuine = ready && offerN < streetN
  return (
    <Stack gap={4}>
      <Heading level={2}>Deal Checker</Heading>
      <Text as="p">
        A discount off MRP is only half the story. A deal is genuine when the
        offer price is also below the price the product usually sells at —
        its street price. Enter the three numbers and judge for yourself.
      </Text>
      <Stack gap={3}>
        <TextInput
          label="MRP (₹)"
          type="text"
          value={mrp}
          onChange={(v) => setMrp(v.replace(/[^0-9.]/g, ''))}
          placeholder="e.g. 2999"
        />
        <TextInput
          label="Offer price (₹)"
          type="text"
          value={offer}
          onChange={(v) => setOffer(v.replace(/[^0-9.]/g, ''))}
          placeholder="e.g. 1499"
        />
        <TextInput
          label="Usual street price (₹)"
          type="text"
          value={street}
          onChange={(v) => setStreet(v.replace(/[^0-9.]/g, ''))}
          placeholder="e.g. 1899"
        />
      </Stack>
      {ready ? (
        <Banner
          status={genuine ? 'success' : 'warning'}
          title={
            genuine
              ? `${offMrp}% off MRP — a genuine deal`
              : `${offMrp}% off MRP — check the street price`
          }
          description={
            genuine
              ? `The offer is ${vsStreet}% below the usual street price of ₹${streetN.toLocaleString('en-IN')}.`
              : `The offer is ${Math.abs(vsStreet)}% above the usual street price of ₹${streetN.toLocaleString('en-IN')}. The MRP discount alone does not make it a deal.`
          }
        />
      ) : (
        <Text type="supporting">
          Enter all three prices to see the verdict. The offer price should
          be no higher than the MRP.
        </Text>
      )}
      <Text type="supporting">
        This is a calculator, not a recommendation. Prices change, and the
        street price you enter should be one you have actually seen.
      </Text>
    </Stack>
  )
}

function PolicyPages({ route }: { route: Route }) {
  if (route === 'disclosure') {
    return (
      <Stack gap={3}>
        <Heading level={2}>Affiliate Disclosure</Heading>
        <Text as="p">
          Bhoothaddam participates in the Amazon Influencer Program. When
          you buy through a link on this site or on our social channels, we
          may earn a commission from Amazon at no extra cost to you.
        </Text>
        <Text as="p">
          Our storefront is at amazon.in/shop/bhoothaddam_3d. Links on this
          site point to that storefront, and every link that earns a
          commission is labelled as an affiliate link.
        </Text>
        <Text as="p">
          A commission does not change what we recommend or what you pay.
          Products appear here only because they are in, or directly
          behind, one of our explainers. Nobody pays to be listed, and we
          do not publish commission rates.
        </Text>
        <Text type="supporting">Last updated: 18 November 2026.</Text>
      </Stack>
    )
  }
  if (route === 'privacy') {
    return (
      <Stack gap={3}>
        <Heading level={2}>Privacy Policy</Heading>
        <Text as="p">
          Bhoothaddam ("we", "us") runs this website, bhoothaddam.in, and
          the Bhoothaddam channels on Instagram, Facebook and YouTube. This
          policy explains what information is collected when you use this
          site, and what we do with it. If you do not agree with it, please
          do not use the site.
        </Text>
        <Heading level={3}>What we collect</Heading>
        <Text as="p">
          This site has no accounts, no newsletter, and no contact form, so
          we do not ask you for your name, email address, or phone number.
          The Deal Checker runs entirely in your browser: the prices you
          type in are never sent to us or stored anywhere.
        </Text>
        <Text as="p">
          Our hosting provider may keep standard server logs, such as the
          page requested, the time of the visit, and a general location
          derived from your IP address. These logs are used to keep the
          site running and secure, and are not used to identify you.
        </Text>
        <Heading level={3}>Cookies and tracking</Heading>
        <Text as="p">
          We do not run advertising trackers on this site, and we do not
          sell or share your information with advertisers. We do not
          currently use analytics software that follows you across the
          web. If that changes, this policy will be updated first.
        </Text>
        <Heading level={3}>Links to other sites</Heading>
        <Text as="p">
          This site links to Instagram, Facebook, YouTube, and Amazon.
          Those platforms have their own privacy policies, and they apply
          once you leave this site. We are not responsible for how they
          handle your information. Buying through our Amazon storefront is
          governed by Amazon&apos;s privacy notice and terms.
        </Text>
        <Heading level={3}>Children</Heading>
        <Text as="p">
          This site is intended for a general audience. We do not knowingly
          collect personal information from children under 18.
        </Text>
        <Heading level={3}>Your rights</Heading>
        <Text as="p">
          Under India&apos;s Digital Personal Data Protection Act, 2023, you
          may ask us what personal information we hold about you, and ask
          for it to be corrected or erased. Since this site collects almost
          nothing directly, most such requests will concern server logs
          held by our hosting provider. You can reach us through the
          channels on the Contact page, and we will respond within a
          reasonable time.
        </Text>
        <Heading level={3}>Changes to this policy</Heading>
        <Text as="p">
          We may update this policy from time to time. The latest version
          is always the one published on this page, and the date below
          shows when it was last changed.
        </Text>
        <Text type="supporting">
          Last updated: 18 November 2026. Contact: see the Contact page.
        </Text>
      </Stack>
    )
  }
  if (route === 'terms') {
    return (
      <Stack gap={3}>
        <Heading level={2}>Terms of Service</Heading>
        <Text as="p">
          These terms govern your use of bhoothaddam.in. By using this
          site, you accept them. If you do not accept them, please do not
          use the site.
        </Text>
        <Heading level={3}>What this site is</Heading>
        <Text as="p">
          Bhoothaddam publishes short 3D visual explainers that answer
          everyday questions — how things work, step by step. This website
          carries the full written versions of those explainers, and lists
          the products behind them under Finds.
        </Text>
        <Heading level={3}>Accuracy</Heading>
        <Text as="p">
          Our explainers simplify complex subjects so they can be followed
          in under a minute. We check the facts we state, and we say so
          when something is unverified — but simplifications are still
          simplifications. Do not treat an explainer as professional,
          technical, medical, or financial advice. For anything that
          matters, check the original source or ask a qualified
          professional.
        </Text>
        <Heading level={3}>Prices and the Deal Checker</Heading>
        <Text as="p">
          A price is shown only if it was actually seen on the
          seller&apos;s page at the time of checking. Prices change, and
          offers expire. The Deal Checker is a guide, not a guarantee: the
          price on the seller&apos;s page at the moment you buy is the one
          that counts.
        </Text>
        <Heading level={3}>Affiliate links</Heading>
        <Text as="p">
          Some links on this site are affiliate links. If you buy through
          one, we may earn a commission at no extra cost to you. See the
          Affiliate Disclosure page for the full details.
        </Text>
        <Heading level={3}>Content and ownership</Heading>
        <Text as="p">
          The text, videos, images, and 3D visuals on this site belong to
          Bhoothaddam unless stated otherwise. You may share links to our
          pages and quote short passages with credit. You may not copy,
          re-upload, or sell our content as your own, or use it in a way
          that suggests we endorse you.
        </Text>
        <Heading level={3}>Acceptable use</Heading>
        <Text as="p">
          Do not misuse this site: do not try to break it, scrape it in a
          way that disrupts it for others, or use it for anything unlawful.
        </Text>
        <Heading level={3}>Liability</Heading>
        <Text as="p">
          This site is provided as it is, without warranties of any kind.
          To the extent permitted by law, we are not liable for any loss
          arising from your use of the site, from a product you buy through
          a link here, or from relying on an explainer. Your purchase is
          governed by the seller&apos;s own terms.
        </Text>
        <Heading level={3}>Governing law</Heading>
        <Text as="p">
          These terms are governed by the laws of India. Any dispute will
          be subject to the courts of Bengaluru, Karnataka.
        </Text>
        <Heading level={3}>Changes</Heading>
        <Text as="p">
          We may update these terms from time to time. The latest version
          is always the one published on this page.
        </Text>
        <Text type="supporting">Last updated: 18 November 2026.</Text>
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Heading level={2}>Contact</Heading>
      <Text as="p">
        The fastest way to reach Bhoothaddam is through the channels
        themselves — send a message on Instagram or Facebook, or leave a
        comment on YouTube. Messages are read by the creator.
      </Text>
      <Stack gap={2}>
        <Link href="https://www.instagram.com/bhoothaddam_3d" isExternalLink isStandalone>
          Instagram — @bhoothaddam_3d
        </Link>
        <Link href="https://www.facebook.com/" isExternalLink isStandalone>
          Facebook — Bhoothaddam D
        </Link>
        <Link href="https://www.youtube.com/@bhoothaddam-3d" isExternalLink isStandalone>
          YouTube — @bhoothaddam-3d
        </Link>
      </Stack>
      <Text type="supporting">
        We do not publish an email address for this site. For privacy
        requests, use any of the channels above and mention that it is a
        privacy request.
      </Text>
    </Stack>
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

  useEffect(() => {
    const onHash = () => {
      setRoute(routeFromHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = (r: Route) => {
    window.location.hash = `/${r}`
  }

  const filtered =
    filter === 'All'
      ? EXPLAINERS
      : EXPLAINERS.filter((e) => e.category === filter)

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="shell-page">
      <Stack gap={3}>
        <Stack gap={1}>
          <Text type="supporting">
            {today} · Bengaluru
          </Text>
          <Heading level={1} type="display-2">
            Bhoothaddam
          </Heading>
          <Text type="large">
            3D visual stories that explain how things work — and the finds
            behind them.
          </Text>
        </Stack>

        <div className="shell-masthead-rule" />

        <div className="shell-nav">
          {NAV.map((n) => (
            <Button
              key={n.route}
              label={n.label}
              variant={route === n.route ? 'primary' : 'ghost'}
              onClick={() => go(n.route)}
            />
          ))}
          <Button
            label={mode === 'dark' ? 'Light mode' : 'Dark mode'}
            variant="secondary"
            onClick={onToggleMode}
          />
        </div>

        <Divider />

        {route === 'home' && (
          <Stack gap={4}>
            <Banner
              status="info"
              title="Shop the finds on Amazon"
              description="Our Amazon storefront is live: amazon.in/shop/bhoothaddam_3d. The Finds shelves below link there, with a clear affiliate label on every link."
            />
            <Section>
              <Stack gap={3}>
                <Heading level={2}>The latest explainers</Heading>
                <Text as="p">
                  Every Bhoothaddam reel is a 3D journey through one everyday
                  question. The full written version lives here — the steps,
                  in order, with nothing skipped.
                </Text>
                <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
                  {EXPLAINERS.slice(0, 4).map((e) => (
                    <ExplainerCard key={e.id} item={e} />
                  ))}
                </Grid>
                <Button
                  label="See all explainers"
                  variant="secondary"
                  onClick={() => go('explainers')}
                />
              </Stack>
            </Section>
            <Section>
              <Stack gap={3}>
                <Heading level={2}>Finds — on our Amazon storefront</Heading>
                <Text as="p">
                  These shelves list the products behind the explainers, on our
                  Amazon storefront at amazon.in/shop/bhoothaddam_3d, with a
                  clear affiliate label on every link.
                </Text>
                <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
                  {SHELVES.map((s) => (
                    <Card key={s.name} padding={4}>
                      <Stack gap={2}>
                        <Heading level={3}>{s.name}</Heading>
                        <Text as="p">{s.note}</Text>
                        <Badge label="On our Amazon storefront" variant="success" />
                      </Stack>
                    </Card>
                  ))}
                </Grid>
                <Button
                  label="How we pick"
                  variant="secondary"
                  onClick={() => go('how-we-pick')}
                />
              </Stack>
            </Section>
            <Section>
              <Stack gap={3}>
                <Heading level={2}>Follow the channel</Heading>
                <Text as="p">
                  Instagram is where the reels land first, Facebook carries
                  the same stories, and YouTube holds the full videos.
                </Text>
                <Stack direction="horizontal" gap={2}>
                  <Link
                    href="https://www.instagram.com/bhoothaddam_3d"
                    isExternalLink
                    isStandalone
                  >
                    Instagram — @bhoothaddam_3d
                  </Link>
                  <Link
                    href="https://www.youtube.com/@bhoothaddam-3d"
                    isExternalLink
                    isStandalone
                  >
                    YouTube — @bhoothaddam-3d
                  </Link>
                  <Link
                    href="https://www.amazon.in/shop/bhoothaddam_3d"
                    isExternalLink
                    isStandalone
                  >
                    Amazon storefront — shop the finds
                  </Link>
                </Stack>
                <Text type="supporting">
                  Instagram: 3,265 followers · Facebook profile Bhoothaddam
                  D: 400+ followers.
                </Text>
              </Stack>
            </Section>
          </Stack>
        )}

        {route === 'explainers' && (
          <Stack gap={4}>
            <Heading level={2}>Explainers</Heading>
            <Text as="p">
              One question per story, answered step by step in 3D — then
              written out here in full.
            </Text>
            <Stack direction="horizontal" gap={2}>
              {CATEGORIES.map((c) => (
                <Button
                  key={c}
                  label={c}
                  variant={filter === c ? 'primary' : 'secondary'}
                  onClick={() => setFilter(c)}
                />
              ))}
            </Stack>
            <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
              {filtered.map((e) => (
                <ExplainerCard key={e.id} item={e} />
              ))}
            </Grid>
            {filtered.length === 0 && (
              <Text as="p">No explainers in this category yet.</Text>
            )}
          </Stack>
        )}

        {route === 'finds' && (
          <Stack gap={4}>
            <Heading level={2}>Finds</Heading>
            <Banner
              status="info"
              title="Live on our Amazon storefront"
              description="These shelves link to our Amazon storefront at amazon.in/shop/bhoothaddam_3d, with a clear affiliate label on every link."
            />
            <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
              {SHELVES.map((s) => (
                <Card key={s.name} padding={4}>
                  <Stack gap={2}>
                    <Heading level={3}>{s.name}</Heading>
                    <Text as="p">{s.note}</Text>
                    <Badge label="On our Amazon storefront" variant="success" />
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>
        )}

        {route === 'deal-checker' && <DealChecker />}

        {route === 'how-we-pick' && (
          <Stack gap={4}>
            <Heading level={2}>How we pick</Heading>
            <Text as="p">
              These are the rules for everything that will ever appear in
              Finds. They are published here so a reader — or a reviewer —
              can hold us to them.
            </Text>
            <CollapsibleGroup type="multiple" hasDividers>
              <Collapsible
                trigger="Only things from the explainers"
                defaultIsOpen
              >
                <Text as="p">
                  A product appears in Finds only if it is in, or directly
                  behind, one of the explainers on this site. Nothing is
                  listed because it pays well.
                </Text>
              </Collapsible>
              <Collapsible trigger="No paid placement">
                <Text as="p">
                  Nobody pays to be listed here. If that ever changes, it
                  will be stated on the listing itself.
                </Text>
              </Collapsible>
              <Collapsible trigger="Prices are checked, not invented">
                <Text as="p">
                  A price is shown only if it was actually seen on the
                  seller’s page. The Deal Checker exists for exactly this
                  reason: compare the offer against the usual street price,
                  not just the MRP.
                </Text>
              </Collapsible>
              <Collapsible trigger="Every affiliate link is labelled">
                <Text as="p">
                  Every link that earns a commission is labelled as an
                  affiliate link, on this site and on the social channels.
                  There are no hidden affiliate links.
                </Text>
              </Collapsible>
              <Collapsible trigger="We say when we do not know">
                <Text as="p">
                  If a claim cannot be verified, it is left out — or marked
                  as unverified. A good story is not worth a wrong fact.
                </Text>
              </Collapsible>
            </CollapsibleGroup>
          </Stack>
        )}

        {route === 'about' && (
          <Stack gap={3}>
            <Heading level={2}>About Bhoothaddam</Heading>
            <Text as="p">
              Bhoothaddam is a 3D visual-science channel. Each reel takes one
              everyday question — how a cofferdam holds back a river, how UPI
              moves money, how an instant photo develops — and answers it
              step by step, in 3D.
            </Text>
            <Text as="p">
              The channel is on Instagram (@bhoothaddam_3d, 3,265 followers),
              on Facebook as the public profile Bhoothaddam D (400+
              followers), and on YouTube (@bhoothaddam-3d). This website is
              where the full written breakdowns live, and where the finds
              behind the videos are listed on our Amazon storefront at
              amazon.in/shop/bhoothaddam_3d.
            </Text>
            <Text as="p">
              The site is built with Astryx, Meta’s open-source design
              system, in its neutral theme.
            </Text>
          </Stack>
        )}

        {(route === 'disclosure' ||
          route === 'privacy' ||
          route === 'terms' ||
          route === 'contact') && <PolicyPages route={route} />}

        <Divider />
        <Stack gap={2}>
          <Stack direction="horizontal" gap={2}>
            <Button label="About" variant="ghost" onClick={() => go('about')} />
            <Button
              label="Affiliate Disclosure"
              variant="ghost"
              onClick={() => go('disclosure')}
            />
            <Button label="Privacy" variant="ghost" onClick={() => go('privacy')} />
            <Button label="Terms" variant="ghost" onClick={() => go('terms')} />
            <Button label="Contact" variant="ghost" onClick={() => go('contact')} />
          </Stack>
          <Text type="supporting">
            Bhoothaddam · bhoothaddam.in · 3D stories that explain how things
            work. Shop the finds at amazon.in/shop/bhoothaddam_3d.
          </Text>
        </Stack>
      </Stack>
    </div>
  )
}
