"use client";

import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import Image from "next/image";
import Link from "next/link";
import { LoginLink } from "@/components/auth/login-link";
import { NavbarAvatarMenu } from "@/components/navbar/navbar-avatar-menu";
import { MobileNavSheet } from "@/components/navbar/mobile-nav-sheet";
import { buildLoginHref } from "@/lib/auth/return-to";
import { useSessionQuery } from "@/lib/auth/use-session";

interface MenuItem {
  title: string;
  url: string;
  description?: string;
  icon?: React.ReactNode;
  items?: MenuItem[];
}

const NAV_LOGO = {
  url: "/discover",
  src: "/logoname.svg",
  alt: "Tribel",
};

const NAV_MENU: MenuItem[] = [
  { title: "Search Property", url: "/search" },
  {
    title: "Your Bookings",
    url: "/yourBookings",
  },
];

const Navbar = () => {
  const { data: session, isLoading: sessionLoading } = useSessionQuery();
  const tenant = session?.tenant ?? null;

  return (
    <section className="bg-background">
      <div className="container px-4 sm:px-6 lg:px-8">
        {/* Desktop Menu — three-zone: logo | links | actions */}
        <nav className="hidden h-16 grid-cols-[1fr_auto_1fr] items-center lg:grid">
          <div className="justify-self-start">
            <Link href={NAV_LOGO.url} className="flex items-center gap-2">
              <Image
                width={116}
                height={32}
                src={NAV_LOGO.src}
                className="dark:invert"
                alt={NAV_LOGO.alt}
                priority
              />
            </Link>
          </div>
          <div className="justify-self-center">
            <NavigationMenu>
              <NavigationMenuList>
                {NAV_MENU.map((item) => renderMenuItem(item))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="flex items-center justify-end gap-2 justify-self-end">
            {sessionLoading ? (
              // Invisible fixed-size slots: no skeleton, no wrong-state flash
              <div
                className="invisible flex h-9 items-center gap-2"
                aria-hidden="true"
              >
                <span className="text-sm font-medium">Log in</span>
                <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
                  Become a host
                </span>
              </div>
            ) : session ? (
              <>
                {tenant && (
                  <Button asChild variant="outline" className="min-h-9">
                    <Link href="/main">Go to Dashboard</Link>
                  </Button>
                )}
                <NavbarAvatarMenu session={session} tenant={tenant} />
              </>
            ) : (
              <>
                <LoginLink className="inline-flex h-10 items-center rounded-md px-3 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground">
                  Log in
                </LoginLink>
                <Button asChild className="min-h-9">
                  <Link href={buildLoginHref("/createTenant")}>
                    Become a host
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className="relative flex h-16 items-center justify-end lg:hidden">
          {/* Logo — centered in the bar */}
          <Link
            href={NAV_LOGO.url}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2"
          >
            <Image
              width={116}
              height={32}
              src={NAV_LOGO.src}
              className="dark:invert"
              alt={NAV_LOGO.alt}
            />
          </Link>
          <MobileNavSheet
            session={session}
            tenant={tenant}
            sessionLoading={sessionLoading}
            logo={NAV_LOGO}
          />
        </div>
      </div>
    </section>
  );
};

const renderMenuItem = (item: MenuItem) => {
  if (item.items) {
    return (
      <NavigationMenuItem key={item.title}>
        <NavigationMenuTrigger>{item.title}</NavigationMenuTrigger>
        <NavigationMenuContent className="bg-popover text-popover-foreground">
          {item.items.map((subItem) => (
            <NavigationMenuLink asChild key={subItem.title} className="w-80">
              <SubMenuLink item={subItem} />
            </NavigationMenuLink>
          ))}
        </NavigationMenuContent>
      </NavigationMenuItem>
    );
  }

  return (
    <NavigationMenuItem key={item.title}>
      <NavigationMenuLink asChild>
        <Link
          href={item.url}
          className="bg-background hover:bg-muted hover:text-accent-foreground group inline-flex h-10 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors"
        >
          {item.title}
        </Link>
      </NavigationMenuLink>
    </NavigationMenuItem>
  );
};

const SubMenuLink = ({ item }: { item: MenuItem }) => {
  return (
    <Link
      className="hover:bg-muted hover:text-accent-foreground flex min-w-80 select-none flex-row gap-4 rounded-md p-3 leading-none no-underline outline-none transition-colors"
      href={item.url}
    >
      <div className="text-foreground">{item.icon}</div>
      <div>
        <div className="text-sm font-semibold">{item.title}</div>
        {item.description && (
          <p className="text-muted-foreground text-sm leading-snug">
            {item.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export { Navbar };
