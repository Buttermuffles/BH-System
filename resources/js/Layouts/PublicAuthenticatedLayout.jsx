import React, { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import site from '@/config/site';

const initials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export default function PublicAuthenticatedLayout({ header, children, user = null }) {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const hasAuth = !!user;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 border-b border-indigo-800 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 items-center h-16">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
                <ApplicationLogo theme="dark" className="h-9 w-9" />
                <span className="hidden md:inline text-lg font-bold text-white drop-shadow-sm">{site.name}</span>
              </a>
            </div>

            <div className="col-span-2 flex items-center justify-end space-x-4">
              <a href="/" className="text-white hover:opacity-90">Home</a>
              <a href="/bill-receipt" className="text-white hover:opacity-90">Electrical Bill</a>
              {hasAuth ? (
                <div className="flex items-center space-x-2">
                  <div className="text-white font-medium">{user.name}</div>
                </div>
              ) : (
                <a href="/login" className="text-white hover:opacity-90">Sign in</a>
              )}
            </div>
          </div>
        </div>

        {showMobileNav && (
          <div className="md:hidden bg-indigo-700/95 backdrop-blur-sm">
            <div className="space-y-1 px-2 pt-2 pb-3">
              <a href="/" className="text-white block px-3 py-2 rounded-md">Home</a>
              <a href="/bill-receipt" className="text-white block px-3 py-2 rounded-md">Electrical Bill</a>
            </div>
          </div>
        )}
      </nav>

      {header && (
        <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 shadow-lg border-b border-indigo-800">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-white/3 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex items-center justify-between" style={{ color: '#ffffff' }}>
              <div className="flex-1">
                <div className="!text-white font-semibold drop-shadow-sm">{header}</div>
              </div>
              <div className="hidden md:block ml-6">
                <img src={site.leftPanel.image} alt={site.leftPanel.imageAlt} className="h-12 w-12 opacity-90 hover:opacity-100 transition" />
              </div>
            </div>
          </div>
        </header>
      )}

      <main>{children}</main>
    </div>
  );
}
