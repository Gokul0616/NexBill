import React from 'react';
import { Search } from 'lucide-react';

export default function SearchFilters({ searchQuery, setSearchQuery, statusFilter, setStatusFilter }) {
  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'verified', label: 'Verified' },
    { key: 'action_required', label: 'Action Required' },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search merchants..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 rounded-lg text-zinc-900 dark:text-white text-[13px] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder-zinc-400 dark:placeholder-zinc-600"
        />
      </div>

      {/* Status Pills */}
      <div className="flex gap-1.5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setStatusFilter(f.key)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all ${
              statusFilter === f.key
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white dark:bg-[#111113] border border-zinc-200/80 dark:border-zinc-800/80 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
