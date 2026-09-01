import { Compass, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { NotFoundBackButton } from "@/components/not-found-back-button";
import { Button } from "@/components/ui/button";

function WrongBunkIllustration() {
  return (
    <div
      aria-hidden="true"
      className="relative mx-auto aspect-[4/5] w-full max-w-[31rem] overflow-hidden rounded-[2rem] border border-primary/15 bg-[#efe9db] shadow-2xl shadow-primary/10"
    >
      <div className="absolute inset-x-0 top-0 h-28 bg-[#d8dfd4]" />
      <div className="absolute inset-x-0 bottom-0 h-[18%] bg-[#c7b995]" />
      <div className="absolute left-[8%] top-[7%] h-20 w-20 rounded-full bg-accent/35 blur-2xl" />
      <div className="absolute right-[7%] top-[15%] h-28 w-28 rounded-full bg-secondary/20 blur-3xl" />

      <svg
        viewBox="0 0 420 520"
        className="absolute inset-0 size-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M72 437H350" stroke="#72654F" strokeWidth="8" strokeLinecap="round" />
        <path d="M92 84V442M330 84V442" stroke="#234E52" strokeWidth="15" strokeLinecap="round" />

        <rect x="79" y="107" width="264" height="101" rx="18" fill="#285D60" />
        <rect x="94" y="122" width="234" height="64" rx="13" fill="#FBF8EF" />
        <path d="M94 160H328V186H94V160Z" fill="#C2D3CA" />
        <rect x="103" y="129" width="68" height="31" rx="13" fill="#E8DFC8" />
        <rect x="264" y="128" width="48" height="24" rx="9" fill="#E6B65B" />
        <text x="210" y="176" textAnchor="middle" fill="#234E52" fontSize="82" fontWeight="800" fontFamily="Fraunces, serif">4</text>

        <rect x="79" y="329" width="264" height="101" rx="18" fill="#285D60" />
        <rect x="94" y="344" width="234" height="64" rx="13" fill="#FBF8EF" />
        <path d="M94 382H328V408H94V382Z" fill="#D9C6A1" />
        <rect x="251" y="351" width="65" height="30" rx="13" fill="#E8DFC8" />
        <rect x="106" y="351" width="53" height="24" rx="9" fill="#6E9C82" />
        <text x="210" y="398" textAnchor="middle" fill="#234E52" fontSize="82" fontWeight="800" fontFamily="Fraunces, serif">4</text>

        <rect x="99" y="223" width="221" height="89" rx="18" stroke="#285D60" strokeWidth="5" strokeDasharray="11 10" />
        <text x="210" y="291" textAnchor="middle" fill="#285D60" fontSize="82" fontWeight="800" fontFamily="Fraunces, serif">0</text>

        <path d="M108 198V340M108 221H152M108 257H152M108 293H152M108 329H152" stroke="#E6B65B" strokeWidth="11" strokeLinecap="round" />

        <path d="M294 410V448H357V410" stroke="#795E42" strokeWidth="8" strokeLinejoin="round" />
        <path d="M306 410V393C306 380 316 370 329 370C342 370 352 380 352 393V410" stroke="#795E42" strokeWidth="8" strokeLinecap="round" />
        <rect x="292" y="406" width="68" height="45" rx="9" fill="#E6B65B" />
        <path d="M326 407V451" stroke="#B1772C" strokeWidth="5" />

        <path d="M72 442C139 428 201 455 263 442C307 433 348 436 376 445" stroke="#A39475" strokeWidth="4" strokeLinecap="round" />
      </svg>

      <div className="absolute right-5 top-5 rounded-full border border-primary/15 bg-background/90 px-3 py-1 font-mono text-xs font-semibold tracking-[0.18em] text-primary shadow-sm">
        ROOM 404
      </div>
    </div>
  );
}

export default function NotFound() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background px-5 py-6 sm:px-8 lg:px-12 lg:py-10">
      <div className="pointer-events-none absolute -left-24 top-1/3 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col">
        <header className="relative z-10 flex items-center justify-between">
          <Link
            href="/discover"
            aria-label="Zappotel stays"
            className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <Image
              src="/logoname.svg"
              alt="Zappotel"
              width={152}
              height={40}
              priority
              className="h-8 w-auto dark:invert"
            />
          </Link>
          <span className="font-mono text-xs font-semibold tracking-[0.18em] text-muted-foreground">
            LOST &amp; FOUND
          </span>
        </header>

        <div className="relative z-10 grid flex-1 items-center gap-12 py-12 lg:grid-cols-[minmax(0,0.86fr)_minmax(25rem,1fr)] lg:gap-20 lg:py-8">
          <section className="order-2 max-w-2xl lg:order-1">
            <p className="mb-4 font-mono text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
              Error 404
            </p>
            <h1 className="font-serif text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-primary sm:text-7xl lg:text-[6.75rem]">
              Wrong bunk.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
              This bed isn&apos;t on our floor plan. Let&apos;s find one that is.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button asChild size="lg" className="min-h-11 px-6">
                <Link href="/search">
                  <Search aria-hidden="true" />
                  Find a stay
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="min-h-11 px-6">
                <Link href="/discover">
                  <Compass aria-hidden="true" />
                  Explore stays
                </Link>
              </Button>
              <NotFoundBackButton />
            </div>

            <p className="mt-8 border-l-2 border-accent pl-4 text-sm leading-6 text-muted-foreground">
              The bunk is fictional. The booking options are not.
            </p>
          </section>

          <section className="order-1 lg:order-2">
            <WrongBunkIllustration />
          </section>
        </div>
      </div>
    </main>
  );
}
