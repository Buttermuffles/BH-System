import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { toast } from 'sonner';

// Small helpers for formatting numbers/currency
const formatNumber = (n) => typeof n === 'number' ? n.toLocaleString() : n;
const formatCurrency = (n) => typeof n === 'number' ? `₱${n.toLocaleString()}` : n;

export default function Dashboard({ stats }) {
    // Default stats if not provided from backend
    const dashboardStats = stats || {
        totalRooms: 24,
        occupiedRooms: 18,
        vacantRooms: 6,
        totalTenants: 22,
        pendingPayments: 5,
        totalRevenue: 45000,
        monthlyRevenue: 12500,
        occupancyRate: 75,
    };

    const StatCard = ({ title, value, subtitle, icon, trend, trendValue, bgColor = 'bg-white' }) => (
        <div
            role="region"
            aria-label={title}
            className={`${bgColor} overflow-hidden shadow-lg rounded-xl border border-gray-100 transition-transform transform hover:shadow-xl hover:-translate-y-1 focus-within:ring-2 focus-within:ring-indigo-200`}
            tabIndex={0}
        >
            <div className="p-6">
                <div className="flex items-center justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">{title}</p>
                        <p className="mt-2 text-3xl font-bold text-gray-900">{typeof value === 'number' ? formatNumber(value) : value}</p>
                        {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
                        {trend && (
                            <div className="mt-2 flex items-center">
                                <span className={`text-sm font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                    {trend === 'up' ? '↑' : '↓'} {trendValue}
                                </span>
                                <span className="ml-2 text-xs text-gray-500">vs last month</span>
                            </div>
                        )}
                    </div>
                    <div className={`p-3 rounded-full ${icon.bgColor} flex items-center justify-center`} aria-hidden>
                        {icon.svg}
                    </div>
                </div>
            </div>
        </div>
    );

    const QuickActionCard = ({ title, description, icon, onClick, href }) => {
        const content = (
            <div className="w-full bg-white p-6 rounded-xl shadow-md hover:shadow-lg border border-gray-100 transition-transform transform hover:-translate-y-0.5 text-left hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <div className="flex items-start space-x-4">
                    <div className="p-3 bg-indigo-100 rounded-lg flex items-center justify-center" aria-hidden>
                        {icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            </div>
        );

        if (href) {
            return (
                <Link href={href} as="button" className="w-full text-left">
                    {content}
                </Link>
            );
        }

        return (
            <button onClick={onClick} aria-label={title} type="button">
                {content}
            </button>
        );
    };

    const RecentActivityItem = ({ type, description, time, status }) => (
        <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
            <div className={`p-2 rounded-full ${
                type === 'payment' ? 'bg-green-100' :
                type === 'checkout' ? 'bg-red-100' :
                type === 'checkin' ? 'bg-blue-100' : 'bg-gray-100'
            }`} aria-hidden>
                {type === 'payment' && (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                )}
                {type === 'checkout' && (
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                )}
                {type === 'checkin' && (
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">{description}</p>
                <p className="text-xs text-gray-500 mt-1" aria-label={`Time: ${time}`}>{time}</p>
            </div>
            {status && (
                <span className={`text-xs px-2 py-1 rounded-full ${
                    status === 'completed' ? 'bg-green-100 text-green-800' :
                    status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                }`}>
                    {status}
                </span>
            )}
        </div>
    );

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-white">
                        Dashboard Analytics
                    </h2>
                    <div className="text-sm text-white">
                        Last updated: {new Date().toLocaleDateString()}
                    </div>
                </div>
            }
        >
            <Head title="Dashboard" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                        <StatCard
                            title="Total Rooms"
                            value={dashboardStats.totalRooms}
                            subtitle={`${dashboardStats.occupiedRooms} occupied, ${dashboardStats.vacantRooms} vacant`}
                            icon={{
                                bgColor: 'bg-blue-100',
                                svg: (
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                )
                            }}
                            trend="up"
                            trendValue="+2"
                        />

                        <StatCard
                            title="Total Tenants"
                            value={dashboardStats.totalTenants}
                            subtitle="Active residents"
                            icon={{
                                bgColor: 'bg-green-100',
                                svg: (
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                )
                            }}
                            trend="up"
                            trendValue="+3"
                        />

                        <StatCard
                            title="Monthly Revenue"
                            value={formatCurrency(dashboardStats.monthlyRevenue)}
                            subtitle="Current month"
                            icon={{
                                bgColor: 'bg-purple-100',
                                svg: (
                                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                )
                            }}
                            trend="up"
                            trendValue="+12%"
                        />

                        <StatCard
                            title="Occupancy Rate"
                            value={`${dashboardStats.occupancyRate}%`}
                            subtitle={<>
                                <div className="text-sm text-gray-500">{dashboardStats.pendingPayments} pending payments</div>
                                <div className="mt-2 w-36 bg-gray-100 rounded-full h-2 overflow-hidden">
                                    <div className="h-2 bg-yellow-400" style={{ width: `${dashboardStats.occupancyRate}%` }} />
                                </div>
                            </>}
                            icon={{
                                bgColor: 'bg-yellow-100',
                                svg: (
                                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                )
                            }}
                            trend="up"
                            trendValue="+5%"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Quick Actions */}
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <QuickActionCard
                                        title="Add New Tenant"
                                        description="Register a new tenant to a room"
                                        icon={
                                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                            </svg>
                                        }
                                        href="/tenants"
                                    />
                                    <QuickActionCard
                                        title="Generate Bill"
                                        description="Create water/electricity bill"
                                        icon={
                                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        }
                                        href="/bills"
                                    />
                                    <QuickActionCard
                                        title="Room Map"
                                        description="View interactive room layout"
                                        icon={
                                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                        }
                                        href="/map"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="lg:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                                    <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-1">
                                    <RecentActivityItem
                                        type="payment"
                                        description="Payment received from John Doe - Room 101"
                                        time="5 minutes ago"
                                        status="completed"
                                    />
                                    <RecentActivityItem
                                        type="checkin"
                                        description="New tenant checked in - Jane Smith, Room 205"
                                        time="2 hours ago"
                                        status="completed"
                                    />
                                    <RecentActivityItem
                                        type="payment"
                                        description="Electricity bill generated for Room 103"
                                        time="3 hours ago"
                                        status="pending"
                                    />
                                    <RecentActivityItem
                                        type="checkout"
                                        description="Tenant checked out - Mike Johnson, Room 302"
                                        time="1 day ago"
                                        status="completed"
                                    />
                                    <RecentActivityItem
                                        type="payment"
                                        description="Water bill payment - Room 204"
                                        time="1 day ago"
                                        status="completed"
                                    />
                                    <RecentActivityItem
                                        type="payment"
                                        description="Monthly rent collected - Room 105"
                                        time="2 days ago"
                                        status="completed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Room Status Overview */}
                    <div className="mt-6">
                        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Room Status Overview</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-green-600 uppercase">Occupied</p>
                                            <p className="text-2xl font-bold text-green-900 mt-1">{dashboardStats.occupiedRooms}</p>
                                        </div>
                                        <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center">
                                            <span className="text-2xl font-bold text-green-700">{Math.round((dashboardStats.occupiedRooms / dashboardStats.totalRooms) * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-blue-600 uppercase">Vacant</p>
                                            <p className="text-2xl font-bold text-blue-900 mt-1">{dashboardStats.vacantRooms}</p>
                                        </div>
                                        <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center">
                                            <span className="text-2xl font-bold text-blue-700">{Math.round((dashboardStats.vacantRooms / dashboardStats.totalRooms) * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-purple-600 uppercase">Total Revenue</p>
                                            <p className="text-2xl font-bold text-purple-900 mt-1">{formatCurrency(dashboardStats.totalRevenue)}</p>
                                        </div>
                                        <svg className="w-12 h-12 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
