import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomDropdown
 *
 * Props:
 *  - label: string          — field label shown above
 *  - options: Array<{ value: string, label: string }>
 *  - value: string          — currently selected value
 *  - onChange: fn(value)    — called with selected value string
 *  - placeholder: string    — shown when nothing selected
 *  - searchable: boolean    — show search input inside dropdown (default false)
 */
export default function Dropdown({
    label,
    options = [],
    value,
    onChange,
    placeholder = 'Select an option...',
    searchable = false,
}) {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef(null);
    const searchRef = useRef(null);

    const selected = options.find((o) => o.value === value);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
                setSearch('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Focus search input when dropdown opens
    useEffect(() => {
        if (open && searchable && searchRef.current) {
            searchRef.current.focus();
        }
    }, [open, searchable]);

    const filtered = searchable
        ? options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
        : options;

    const handleSelect = (val) => {
        onChange(val);
        setOpen(false);
        setSearch('');
    };

    return (
        <div className="relative" ref={containerRef}>
            {label && (
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-tight mb-1 ml-1">
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className={`w-full flex items-center justify-between px-3 py-[8px] border rounded-[5px] text-[13.5px] transition-all cursor-pointer shadow-[0_1px_1px_rgba(0,0,0,.04)]
          ${open
                        ? 'border-[#5469d4] shadow-[0_0_0_3px_rgba(84,105,212,.15)]'
                        : 'border-[#d1d5db] dark:border-white/[0.08]'
                    }
          bg-white dark:bg-[#0d0d0e] text-[#30313d] dark:text-white
          hover:border-gray-300 dark:hover:border-white/20
        `}
            >
                <span className={`block truncate text-left flex-1 ${selected ? 'text-[#30313d] dark:text-white' : 'text-[#9ea3b0]'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-[#9ea3b0] transition-transform duration-200 ml-2 flex-shrink-0 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown panel */}
            {open && (
                <div className="absolute z-50 mt-1 w-full bg-white dark:bg-[#111] border border-gray-200 dark:border-[#333] rounded shadow-lg overflow-hidden">

                    {/* Search input */}
                    {searchable && (
                        <div className="p-2 border-b border-gray-100 dark:border-[#222]">
                            <input
                                ref={searchRef}
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search..."
                                className="w-full px-2 py-1.5 text-sm bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#333] rounded text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-[#246dff]"
                            />
                        </div>
                    )}

                    {/* Options list */}
                    <ul className="max-h-52 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <li className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500">No results found</li>
                        ) : (
                            filtered.map((option) => (
                                <li
                                    key={option.value}
                                    onClick={() => handleSelect(option.value)}
                                    className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors
                    ${option.value === value
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-[#246dff]'
                                            : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#1a1a1a]'
                                        }
                  `}
                                >
                                    <span>{option.label}</span>
                                    {option.value === value && <Check className="w-3.5 h-3.5 text-[#246dff]" />}
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}