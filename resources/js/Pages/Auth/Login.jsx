import React, { useEffect, useRef } from 'react';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import site from '@/config/site';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const emailRef = useRef(null);

    useEffect(() => {
        // Autofocus email on large screens for better UX
        if (typeof window !== 'undefined') {
            try {
                const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
                if (isDesktop) {
                    emailRef.current?.focus();
                }
            } catch (e) {
                // fallback: focus anyway
                emailRef.current?.focus();
            }
        }
    }, []);

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
    <GuestLayout noWrapper={true}>
            <Head title="Boarding House Management - Login" />

            <div className="min-h-screen flex flex-col lg:flex-row">
                {/* Left: Branding / Illustration (visible on large screens) */}
                <div className="hidden lg:flex lg:w-7/12 items-center justify-center bg-gradient-to-br from-indigo-600 via-violet-600 to-pink-500 text-white p-12 relative overflow-hidden">
                    {/* decorative circles */}
                    <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                    <div className="absolute -right-24 -bottom-24 h-96 w-96 rounded-full bg-white/3 blur-2xl pointer-events-none" />

                    <div className="max-w-lg lg:max-w-xl text-center space-y-6 transform-gpu transition-transform duration-700 hover:scale-102 relative z-10">
                        <div className="mx-auto h-44 w-44 bg-white/8 rounded-3xl flex items-center justify-center shadow-2xl overflow-hidden backdrop-blur-sm border border-white/10">
                            <img
                                src={site.leftPanel.image}
                                alt={site.leftPanel.imageAlt}
                                role="img"
                                className="max-h-full max-w-full object-contain transition-transform duration-700 transform-gpu hover:scale-105"
                                loading="lazy"
                            />
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-extrabold drop-shadow-md">{site.leftPanel.title}</h2>
                        <p className="text-lg lg:text-xl opacity-95 max-w-md mx-auto">{site.leftPanel.subtitle}</p>

                        <div className="mt-6">
                            <p className="inline-block text-sm bg-white/10 rounded-full px-4 py-2">Trusted, secure, and built with Laravel + React.</p>
                        </div>
                    </div>
                </div>

                {/* Right: Login Card */}
                <div className="flex w-full lg:w-5/12 items-center justify-center bg-gray-50 p-8">
                    <div className="w-full max-w-md space-y-6">
                        {/* Small header at top for mobile */}
                        <div className="lg:hidden text-center">
                            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                                <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900">Boarding House</h1>
                            <p className="text-sm text-gray-600">Management System</p>
                        </div>

                        {/* Status Message */}
                        {status && (
                            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-2 rounded-lg text-center shadow-sm">
                                {status}
                            </div>
                        )}

                        <div className="bg-white py-6 px-6 shadow-2xl rounded-2xl border border-gray-100">
                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="email" value="Email Address" className="text-gray-700 font-medium text-sm" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        autoComplete="username"
                                        isFocused={false}
                                        ref={emailRef}
                                        aria-label="Email address"
                                        aria-required="true"
                                        aria-invalid={errors.email ? 'true' : 'false'}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Enter your email"
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="Password" className="text-gray-700 font-medium text-sm" />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="mt-1 block w-full px-3 py-2 rounded-lg border border-gray-200 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                        aria-label="Password"
                                        aria-required="true"
                                        aria-invalid={errors.password ? 'true' : 'false'}
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Enter your password"
                                    />
                                    <InputError message={errors.password} className="mt-2" />
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="h-4 w-4 text-indigo-600"
                                        />
                                        <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">Remember me</label>
                                    </div>

                                    {canResetPassword && (
                                        <Link href={route('password.request')} className="text-indigo-600 hover:underline text-sm">Forgot password?</Link>
                                    )}
                                </div>

                                <div>
                                    <PrimaryButton className="w-full py-2 px-4 rounded-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md" disabled={processing}>
                                        {processing ? 'Signing in...' : 'Sign In'}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>

                        <div className="text-center mt-4">
                            <p className="text-xs text-gray-500">Secure login powered by Laravel & React</p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
