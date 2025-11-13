import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';
import Seo from '@/Components/Seo';

export default function GuestLayout({ children, noWrapper = false }) {
    // noWrapper: when true, render children directly without any layout structure
    if (noWrapper) {
        return (
            <>
                <Seo />
                {children}
            </>
        );
    }

    // Default wrapped layout with logo and centered card
    return (
        <div className="min-h-screen bg-gray-100">
            <Seo />
            <div className="flex flex-col items-center pt-6 sm:pt-0">
                <div>
                    <Link href="/">
                        <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                    </Link>
                </div>

                <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                    {children}
                </div>
            </div>
        </div>
    );
}
