import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import React, { useState, cloneElement, isValidElement } from 'react';
import site from '@/config/site';

// Helper for user initials
const initials = (name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
};

export default function AuthenticatedLayout({ header, children }) {
    const pageProps = usePage().props;
    const user = pageProps.auth?.user ?? null;
    const hasAuth = !!user;

    const [showMobileNav, setShowMobileNav] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
       <nav className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 border-b border-indigo-800 shadow-lg">
  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-3 items-center h-16">
      {/* Left: Logo */}
      <div className="flex items-center space-x-3">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
          <ApplicationLogo theme="dark" className="h-9 w-9" />
          <span className="hidden md:inline text-lg font-bold text-white drop-shadow-sm">
            BoardingHouse
          </span>
        </Link>
      </div>

      {/* Center: Navigation Links */}
      <div className="hidden md:flex items-center justify-center space-x-6">
        <NavLink
          href={route('tenants.index')}
          active={route().current('tenants.index')}
          className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2 transition"
        >
          Tenant
        </NavLink>
        <NavLink
          href={route('rooms.index')}
          active={route().current('rooms.index')}
          className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2 transition"
        >
          Room
        </NavLink>
        <NavLink
          href={route('bills.index')}
          active={route().current('bills.index')}
          className="text-white/90 hover:text-white hover:bg-white/10 rounded-lg px-3 py-2 transition"
        >
          Bill
        </NavLink>
      </div>

      {/* Right: Actions + User */}
      <div className="flex items-center justify-end space-x-4">
        {/* Quick actions */}
        <div className="hidden md:flex items-center space-x-2">
          <Link
            href={route('map')}
            className="inline-flex items-center rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25 focus:ring-2 focus:ring-white/40 transition duration-200"
          >
            🗺️ Room Map
          </Link>
          <Link
            href={route('dashboard')}
            className="inline-flex items-center rounded-lg bg-white/15 px-3 py-2 text-sm font-medium text-white hover:bg-white/25 focus:ring-2 focus:ring-white/40 transition duration-200"
          >
            📊 Overview
          </Link>
        </div>

        {/* User */}
        {hasAuth ? (
          <div className="relative">
            <Dropdown>
              <Dropdown.Trigger>
                <button className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 transition">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white font-semibold text-sm">
                    {initials(user.name)}
                  </span>
                  <span className="hidden sm:inline">{user.name}</span>
                </button>
              </Dropdown.Trigger>

              <Dropdown.Content>
                <Dropdown.Link href={route('profile.edit')}>Profile</Dropdown.Link>
                <Dropdown.Link href={route('logout')} method="post" as="button">
                  Log Out
                </Dropdown.Link>
              </Dropdown.Content>
            </Dropdown>
          </div>
        ) : (
          <Link
            href={route('login')}
            className="inline-flex items-center rounded-lg bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20 focus:ring-2 focus:ring-white/30 transition"
          >
            Sign in
          </Link>
        )}

        {/* Mobile menu button */}
        <div className="-mr-2 flex md:hidden">
          <button
            onClick={() => setShowMobileNav((s) => !s)}
            className="inline-flex items-center justify-center rounded-md p-2 text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
              {showMobileNav ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>

  {/* Mobile nav panel */}
  {showMobileNav && (
    <div className="md:hidden bg-indigo-700/95 backdrop-blur-sm">
      <div className="space-y-1 px-2 pt-2 pb-3">
        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')} className="text-white hover:bg-white/10 rounded-md">
          Dashboard
        </ResponsiveNavLink>
        <ResponsiveNavLink href={route('map')} className="text-white hover:bg-white/10 rounded-md">
          Map
        </ResponsiveNavLink>
        <ResponsiveNavLink href={route('tenants.index')} className="text-white hover:bg-white/10 rounded-md">
          Tenant
        </ResponsiveNavLink>
        <ResponsiveNavLink href={route('rooms.index')} className="text-white hover:bg-white/10 rounded-md">
          Room
        </ResponsiveNavLink>
        <ResponsiveNavLink href={route('bills.index')} className="text-white hover:bg-white/10 rounded-md">
          Bill
        </ResponsiveNavLink>
      </div>
      <div className="border-t border-indigo-500/50 pb-3 pt-4 px-4">
        {hasAuth ? (
          <>
            <div className="text-base font-medium text-white">{user.name}</div>
            <div className="text-sm font-medium text-indigo-200">{user.email}</div>
            <div className="mt-3 space-y-1">
              <ResponsiveNavLink href={route('profile.edit')} className="text-white hover:bg-white/10 rounded-md">
                Profile
              </ResponsiveNavLink>
              <ResponsiveNavLink method="post" href={route('logout')} as="button" className="text-white hover:bg-white/10 rounded-md">
                Log Out
              </ResponsiveNavLink>
            </div>
          </>
        ) : (
          <ResponsiveNavLink href={route('login')} className="text-white hover:bg-white/10 rounded-md">
            Sign in
          </ResponsiveNavLink>
        )}
      </div>
    </div>
  )}
</nav>


            {header && (
                <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 shadow-lg border-b border-indigo-800">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/3 blur-2xl pointer-events-none" />
                        <div className="relative z-10 flex items-center justify-between" style={{ color: '#ffffff' }}>
                            <div className="flex-1">
                                {/* Force white text for header and override any child text color utilities */}
                                <div className="!text-white font-semibold drop-shadow-sm">
                                    {header}
                                </div>
                            </div>
                            <div className="hidden md:block ml-6">
                                <img
                                    src={site.leftPanel.image}
                                    alt={site.leftPanel.imageAlt}
                                    className="h-12 w-12 opacity-90 hover:opacity-100 transition"
                                />
                            </div>
                        </div>
                    </div>
                </header>
            )}

            <main>{children}</main>
        </div>
    );
}
