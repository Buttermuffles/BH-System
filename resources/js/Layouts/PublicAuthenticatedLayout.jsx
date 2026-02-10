import React, { useState } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
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

export default function PublicAuthenticatedLayout({ header, children, user = null }) {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const hasAuth = !!user;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <nav className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 border-b border-indigo-800 shadow-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <a href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
                <ApplicationLogo theme="dark" className="h-9 w-9" />
                <span className="hidden md:inline text-lg font-bold text-white drop-shadow-sm">{site.name}</span>
              </a>
            </div>

            <div className="hidden md:flex md:items-center md:space-x-6">
            </div>

            <div className="flex items-center space-x-3">

              {/* Mobile menu button */}
              <button
                className="md:hidden text-white p-2 rounded hover:bg-white/10"
                aria-label="Toggle navigation"
                onClick={() => setShowMobileNav((v) => !v)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {showMobileNav && (
          <div className="md:hidden bg-indigo-700/95 backdrop-blur-sm">
            <div className="space-y-1 px-2 pt-2 pb-3">
              <a href="/" className="text-white block px-3 py-2 rounded-md">Home</a>
              <a href="/bill-receipt" className="text-white block px-3 py-2 rounded-md">Electrical Bill</a>
              {hasAuth ? (
                <>
                  <a href="/profile" className="text-white block px-3 py-2 rounded-md">Profile</a>
                  <a href="/logout" className="text-white block px-3 py-2 rounded-md">Log Out</a>
                </>
              ) : (
                <a href="/login" className="text-white block px-3 py-2 rounded-md">Sign in</a>
              )}
            </div>
          </div>
        )}
      </nav>
      <main>{children}</main>
    </div>
  );
}
