import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const QUICK_LINKS = [
    { label: 'Customers', to: '/customers' },
    { label: 'Plans', to: '/plans' },
    { label: 'Subscriptions', to: '/subscriptions' },
    { label: 'Invoices', to: '/invoices' },
];

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-full">
            <div className="text-center max-w-md w-full">

                {/* Error label */}
                <p className="text-[11px] font-bold uppercase tracking-widest text-[#246dff] mb-4">
                    Error 404
                </p>

                {/* Ghost number */}
                <h1 className="text-[9rem] font-black leading-none text-gray-100 dark:text-[#1a1a1a] select-none -mt-2">
                    404
                </h1>

                {/* Heading + description overlapping the ghost */}
                <div className="-mt-8 relative z-10">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Page not found
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                        The page you're looking for doesn't exist or may have been moved.
                        Check the URL or head back to a working page.
                    </p>
                </div>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto px-5 py-2 text-sm font-medium border border-gray-200 dark:border-[#333] text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-[#1a1a1a] transition-colors"
                    >
                        Go back
                    </button>
                    <Link
                        to="/"
                        className="w-full sm:w-auto px-5 py-2 text-sm font-medium bg-[#246dff] text-white rounded hover:bg-[#1a5fdd] transition-colors"
                    >
                        Back to dashboard
                    </Link>
                </div>

                {/* Quick links */}
                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-[#1a1a1a]">
                    <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-600 mb-4">
                        You might be looking for
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-left">
                        {QUICK_LINKS.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="flex items-center justify-between px-3 py-2 rounded border border-gray-200 dark:border-[#1a1a1a] text-sm text-gray-700 dark:text-gray-300 hover:border-[#246dff]/30 hover:text-[#246dff] hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all group"
                            >
                                <span>{link.label}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 group-hover:text-[#246dff] transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}