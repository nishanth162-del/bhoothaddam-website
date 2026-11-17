import { useEffect, useState } from 'react'
import * as stylex from '@stylexjs/stylex'
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
 * styles are a StyleX page shell (max width, masthead rule).
 */

const shell = stylex.create({
  page: {
    maxWidth: 780,
    marginInline: 'auto',
    paddingInline: 20,
    paddingBlock: 16,
    boxSizing: 'border-box',
  },
  mastheadRule: {
    borderTopWidth: 3,
    borderTopStyle: 'solid',
    borderTopColor: 'currentColor',
    marginTop: 12,
    marginBottom: 12,
  },
  nav: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
  },
  explainerSteps: {
    paddingInlineStart: 20,
    margin: 0,
    lineHeight: 1.7,
  },
})

type Route =
  | 'home'
  | 'explainers'
  | 'finds'
  | 'deal-checker'
  | 'how-we-pick'
  | 'about'
  | 'disclosure'
  | 'privacy'
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
        <ol {...stylex.props(shell.explainerSteps)}>
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
          Bhoothaddam may earn a commission when you buy through a link on
          this site or on our social channels. That does not change what we
          recommend, or what you pay.
        </Text>
        <Text as="p">
          Right now, no affiliate links are live on this site. The Amazon
          Influencer application will be made after this site is live, and
          links will only appear once an application is approved. When they
          do, every link will be clearly labelled as an affiliate link.
        </Text>
        <Text as="p">
          We do not take payment to recommend a product, and we do not
          publish commission rates.
        </Text>
      </Stack>
    )
  }
  if (route === 'privacy') {
    return (
      <Stack gap={3}>
        <Heading level={2}>Privacy Policy</Heading>
        <Text as="p">
          This site does not ask you for personal information. It has no
          accounts, no newsletter, and no contact form.
        </Text>
        <Text as="p">
          The hosting provider may record standard server logs, such as the
          page requested and the time, as most websites do. We do not run
          advertising trackers on this site.
        </Text>
        <Text as="p">
          Links to Instagram, Facebook and YouTube take you to those
          platforms, and their privacy policies apply there.
        </Text>
      </Stack>
    )
  }
  return (
    <Stack gap={3}>
      <Heading level={2}>Contact</Heading>
      <Text as="p">
        The fastest way to reach Bhoothaddam is through the channels
        themselves — send a message on Instagram or Facebook, or a comment on
        YouTube.
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
        There is no email address published for this site, so nothing here is
        invented. Messages on the channels are read by the creator.
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
    <div {...stylex.props(shell.page)}>
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

        <div {...stylex.props(shell.mastheadRule)} />

        <div {...stylex.props(shell.nav)}>
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
              title="No affiliate links live yet"
              description="The Finds shelves below open after the Amazon Influencer application is approved. Until then, this site is only the written breakdowns behind the reels."
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
                <Heading level={2}>Finds — opens after approval</Heading>
                <Text as="p">
                  When the affiliate application is approved, these shelves
                  will list the products behind the explainers, with a clear
                  affiliate label on every link. Nothing is for sale here yet.
                </Text>
                <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
                  {SHELVES.map((s) => (
                    <Card key={s.name} padding={4}>
                      <Stack gap={2}>
                        <Heading level={3}>{s.name}</Heading>
                        <Text as="p">{s.note}</Text>
                        <Badge label="Opens after approval" variant="warning" />
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
                </Stack>
                <Text type="supporting">
                  Instagram: 2,404 followers · Facebook profile Bhoothaddam
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
              title="Opens after approval"
              description="No affiliate links are live yet. The Amazon Influencer application comes after this site, and these shelves open only once it is approved."
            />
            <Grid columns={{ minWidth: 280, max: 2 }} gap={4}>
              {SHELVES.map((s) => (
                <Card key={s.name} padding={4}>
                  <Stack gap={2}>
                    <Heading level={3}>{s.name}</Heading>
                    <Text as="p">{s.note}</Text>
                    <Badge label="Opens after approval" variant="warning" />
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
              The channel is on Instagram (@bhoothaddam_3d, 2,404 followers),
              on Facebook as the public profile Bhoothaddam D (400+
              followers), and on YouTube (@bhoothaddam-3d). This website is
              where the full written breakdowns live, and where the finds
              behind the videos will be listed once the affiliate application
              is approved.
            </Text>
            <Text as="p">
              The site is built with Astryx, Meta’s open-source design
              system, in its neutral theme.
            </Text>
          </Stack>
        )}

        {(route === 'disclosure' ||
          route === 'privacy' ||
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
            <Button label="Contact" variant="ghost" onClick={() => go('contact')} />
          </Stack>
          <Text type="supporting">
            Bhoothaddam · bhoothaddam.in · 3D stories that explain how things
            work. No affiliate links live yet — the Influencer application
            comes after this site.
          </Text>
        </Stack>
      </Stack>
    </div>
  )
}
