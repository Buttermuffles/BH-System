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
          <ResponsiveNavLink href={route('ocr.demo')} className="text-white hover:bg-white/10 rounded-md">
            OCR
          </ResponsiveNavLink>
          <ResponsiveNavLink href={route('electrical.bill.receipt')} className="text-white hover:bg-white/10 rounded-md">
            Electrical Bill
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
            <main>{children}</main>
        </div>
    );
}
