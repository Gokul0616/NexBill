/**
 * DataTable — Generic, fully prop-driven table component (Mantine-style API)
 *
 * ─── QUICK START ────────────────────────────────────────────────────────────
 *
 * import DataTable from './DataTable';
 *
 * <DataTable
 *   title="Payments"
 *   idKey="id"
 *   columns={[
 *     { key: 'id',     label: 'ID',       sortable: true, width: 80,
 *       render: (val) => <span className="font-mono text-xs text-gray-400">#{val}</span> },
 *     { key: 'name',   label: 'Customer', sortable: true },
 *     { key: 'amount', label: 'Amount',   sortable: true, align: 'right',
 *       render: (val) => `$${Number(val).toFixed(2)}` },
 *     { key: 'status', label: 'Status',   hidden: true },   // hidden by default
 *   ]}
 *   data={rows}
 *   filters={[
 *     { key: 'status', label: 'Status',
 *       options: [{ value: 'paid', label: 'Paid' }, { value: 'failed', label: 'Failed' }] },
 *   ]}
 *   withSearch
 *   withSelection
 *   withColumnVisibility
 *   withExport
 *   pageSizeOptions={[10, 20, 50]}
 *   defaultPageSize={10}
 *   onRowClick={(row) => navigate(`/payments/${row.id}`)}
 *   rowActions={(row) => [
 *     { label: 'View',   onClick: () => navigate(`/payments/${row.id}`) },
 *     { label: 'Refund', onClick: () => handleRefund(row), danger: true },
 *   ]}
 *   bulkActions={(selectedRows) => [
 *     { label: 'Export', onClick: () => handleExport(selectedRows) },
 *     { label: 'Delete', onClick: () => handleDelete(selectedRows), danger: true },
 *   ]}
 *   loading={isFetching}
 *   emptyState={<p>No payments found.</p>}
 * />
 *
 * ─── COLUMN DEFINITION ──────────────────────────────────────────────────────
 * {
 *   key:      string            — field name in the data object (required)
 *   label:    string            — header text (required)
 *   sortable: boolean           — enable click-to-sort (default false)
 *   width:    number | string   — column width (e.g. 120 or '10%')
 *   align:    'left'|'right'|'center'  (default 'left')
 *   hidden:   boolean           — hide from column-visibility panel by default
 *   noVis:    boolean           — exclude from column-visibility panel entirely
 *   render:   (value, row, rowIndex) => ReactNode   — custom cell renderer
 * }
 *
 * ─── FILTER DEFINITION ──────────────────────────────────────────────────────
 * {
 *   key:     string              — must match a key in the data object
 *   label:   string              — dropdown label
 *   options: { value, label }[]  — dropdown options (all = default 'all statuses')
 * }
 */

import {
  Search, X, Columns, Download, Check, ChevronDown, ChevronUp,
  ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  MoreHorizontal, Loader2, FileText,
} from 'lucide-react';
import { useState, useMemo, useRef, useEffect, useCallback } from 'react';

// ─── tiny hook: close on outside click ──────────────────────
function useDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);
  return { open, setOpen, ref, toggle: () => setOpen(o => !o) };
}

// ─── sort helper ─────────────────────────────────────────────
function sortRows(rows, key, dir) {
  return [...rows].sort((a, b) => {
    let va = a[key]; let vb = b[key];
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return dir === 'asc' ? -1 : 1;
    if (va > vb) return dir === 'asc' ? 1 : -1;
    return 0;
  });
}

// ─── export CSV ──────────────────────────────────────────────
function toCSV(rows, columns) {
  const header = columns.map(c => `"${c.label}"`).join(',');
  const lines = rows.map(row =>
    columns.map(c => {
      const v = row[c.key];
      const rendered = typeof c.render === 'function' ? c.render(v, row) : v;
      const str = typeof rendered === 'string' || typeof rendered === 'number' ? String(rendered) : String(v ?? '');
      return `"${str.replace(/"/g, '""')}"`;
    }).join(',')
  );
  return [header, ...lines].join('\n');
}

// ─── PageBtn ─────────────────────────────────────────────────
function PageBtn({ children, onClick, disabled, active, title }) {
  return (
    <button
      onClick={onClick} disabled={disabled} title={title}
      className={`min-w-[28px] h-7 flex items-center justify-center text-[12px] rounded px-1.5 font-medium border transition-colors
        ${active   ? 'bg-[#1d4ed8] border-[#1d4ed8] text-white cursor-default'
        : disabled ? 'bg-white dark:bg-white/5 border-[#e5e7eb] dark:border-white/10 text-[#d1d5db] dark:text-gray-600 cursor-not-allowed'
                   : 'bg-white dark:bg-white/5 border-[#e5e7eb] dark:border-white/10 text-[#374151] dark:text-gray-300 hover:bg-[#f3f4f6] dark:hover:bg-white/10 cursor-pointer'}`}
    >
      {children}
    </button>
  );
}

// ─── FilterChip ──────────────────────────────────────────────
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-[#eff6ff] text-[#1e40af] px-2 py-0.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-[#1d4ed8] cursor-pointer ml-0.5">
        <X className="w-2.5 h-2.5" />
      </button>
    </span>
  );
}

// ─── Checkbox ────────────────────────────────────────────────
function Checkbox({ checked, indeterminate, onChange }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current) ref.current.indeterminate = !!indeterminate; }, [indeterminate]);
  return (
    <span
      onClick={onChange}
      className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors cursor-pointer flex-shrink-0
        ${checked || indeterminate ? 'bg-[#1d4ed8] border-[#1d4ed8]' : 'border-[#d1d5db] dark:border-white/25 hover:border-[#93c5fd]'}`}
    >
      {(checked || indeterminate) && (
        <Check className={`w-2.5 h-2.5 text-white ${indeterminate ? 'opacity-60' : ''}`} />
      )}
    </span>
  );
}

// ─── SortIcon ────────────────────────────────────────────────
function SortIcon({ active, dir }) {
  if (!active) return <ArrowUpDown className="w-3 h-3 opacity-25" />;
  return dir === 'asc'
    ? <ChevronUp   className="w-3 h-3 text-[#1d4ed8]" />
    : <ChevronDown className="w-3 h-3 text-[#1d4ed8]" />;
}

// ─── Row action menu ─────────────────────────────────────────
function RowActionMenu({ actions }) {
  const dd = useDropdown();
  if (!actions || actions.length === 0) return null;
  return (
    <div className="relative" ref={dd.ref}>
      <button
        onClick={(e) => { e.stopPropagation(); dd.toggle(); }}
        className="w-7 h-7 flex items-center justify-center text-[#9ca3af] hover:text-[#374151] dark:hover:text-gray-200 hover:bg-[#f3f4f6] dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {dd.open && (
        <div className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#1c1c1c] border border-[#e5e7eb] dark:border-white/10 rounded-lg shadow-xl z-30 py-1 overflow-hidden">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={(e) => { e.stopPropagation(); action.onClick(); dd.setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[12.5px] font-medium transition-colors cursor-pointer
                ${action.danger
                  ? 'text-[#dc2626] hover:bg-[#fef2f2] dark:hover:bg-red-900/20'
                  : 'text-[#374151] dark:text-gray-300 hover:bg-[#f9fafb] dark:hover:bg-white/5'}`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// DataTable
// ═══════════════════════════════════════════════════════════════
export default function DataTable({
  // ── Data & identity
  data            = [],
  idKey           = 'id',

  // ── Columns  (see Column Definition in JSDoc above)
  columns         = [],

  // ── Header
  title,
  toolbar,                  // ReactNode — extra buttons next to title

  // ── Features (all off by default, opt-in)
  withSearch           = false,
  withColumnVisibility = false,
  withExport           = false,
  withSelection        = false,

  // ── Filters — [{ key, label, options: [{value, label}] }]
  filters         = [],

  // ── Pagination
  defaultPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50],

  // ── Callbacks
  onRowClick,               // (row) => void
  rowActions,               // (row) => [{ label, onClick, danger? }]
  bulkActions,              // (selectedRows) => [{ label, onClick, danger? }]
  onExport,                 // (rows, columns) => void — override default CSV export

  // ── State
  loading         = false,
  emptyState,               // ReactNode

  // ── Style
  className       = '',
  striped         = false,
  highlightOnHover = true,
}) {

  // ── Initial column visibility (respect col.hidden) ─────────
  const [visibleKeys, setVisibleKeys] = useState(() =>
    new Set(columns.filter(c => !c.hidden).map(c => c.key))
  );

  // ── Search ──────────────────────────────────────────────────
  const [search, setSearch] = useState('');

  // ── Filter values: { [filterKey]: value } ──────────────────
  const [filterVals, setFilterVals] = useState(
    () => Object.fromEntries(filters.map(f => [f.key, 'all']))
  );

  // ── Sort ────────────────────────────────────────────────────
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  // ── Page ────────────────────────────────────────────────────
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  // ── Selection ───────────────────────────────────────────────
  const [selected, setSelected] = useState(new Set());

  // ── Column visibility dropdown ──────────────────────────────
  const colDrop = useDropdown();

  // ── Reset page on any filter/search/sort/pageSize change ────
  useEffect(() => { setPage(1); }, [search, filterVals, sort.key, sort.dir, pageSize]);

  // ── Derived: filtered + sorted rows ─────────────────────────
  const processed = useMemo(() => {
    let rows = data;

    // search across all visible string/number fields
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(row =>
        columns.some(col =>
          String(row[col.key] ?? '').toLowerCase().includes(q)
        )
      );
    }

    // per-filter
    filters.forEach(f => {
      const val = filterVals[f.key];
      if (val && val !== 'all') {
        rows = rows.filter(row => String(row[f.key]) === String(val));
      }
    });

    // sort
    if (sort.key) rows = sortRows(rows, sort.key, sort.dir);

    return rows;
  }, [data, search, filterVals, sort, columns, filters]);

  // ── Pagination ──────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const pageRows   = processed.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ── Visible column defs (ordered) ───────────────────────────
  const visibleCols = columns.filter(c => visibleKeys.has(c.key));

  // ── Sort toggle ─────────────────────────────────────────────
  const handleSort = useCallback((key) => {
    setSort(s => s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  }, []);

  // ── Selection helpers ────────────────────────────────────────
  const pageIds       = pageRows.map(r => r[idKey]);
  const allSelected   = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const someSelected  = pageIds.some(id => selected.has(id));

  const toggleAll = () => {
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) pageIds.forEach(id => next.delete(id));
      else pageIds.forEach(id => next.add(id));
      return next;
    });
  };

  const toggleRow = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Column toggle ────────────────────────────────────────────
  const toggleCol = (key) => {
    setVisibleKeys(prev => {
      const manageable = columns.filter(c => !c.noVis);
      const currentlyVisible = manageable.filter(c => prev.has(c.key));
      if (prev.has(key) && currentlyVisible.length === 1) return prev;
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // ── Export ──────────────────────────────────────────────────
  const handleExport = () => {
    const rows = selected.size > 0
      ? processed.filter(r => selected.has(r[idKey]))
      : processed;
    if (onExport) { onExport(rows, visibleCols); return; }
    const csv  = toCSV(rows, visibleCols);
    const blob = new Blob([csv], { type: 'text/csv' });
    const a    = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(title || 'data').toLowerCase().replace(/\s+/g, '-')}.csv`;
    a.click();
  };

  // ── Active filter count ──────────────────────────────────────
  const activeFilterCount = filters.filter(f => filterVals[f.key] !== 'all').length
    + (search.trim() ? 1 : 0);

  // ── Pagination range ─────────────────────────────────────────
  const pageNums = useMemo(() => {
    const nums = []; const delta = 1;
    const left  = Math.max(2, safePage - delta);
    const right = Math.min(totalPages - 1, safePage + delta);
    nums.push(1);
    if (left > 2)             nums.push('…l');
    for (let i = left; i <= right; i++) nums.push(i);
    if (right < totalPages - 1) nums.push('…r');
    if (totalPages > 1) nums.push(totalPages);
    return nums;
  }, [safePage, totalPages]);

  // ── Selected rows (objects) ─────────────────────────────────
  const selectedRows = useMemo(
    () => processed.filter(r => selected.has(r[idKey])),
    [processed, selected, idKey]
  );

  // ── Has any active filter ────────────────────────────────────
  const hasActiveFilters = activeFilterCount > 0;

  // ═══════════════════════════════════════════════════════════
  return (
    <div className={`bg-white dark:bg-[#111] border border-[#e5e7eb] dark:border-white/10 rounded-lg overflow-hidden font-sans ${className}`}>

      {/* ── Toolbar ── */}
      <div className="relative">

        {/* Bulk action bar (slides over toolbar) */}
        {withSelection && selected.size > 0 && (
          <div className="absolute inset-0 flex items-center gap-3 px-4 bg-[#1d4ed8] z-10 rounded-t-lg">
            <Check className="w-4 h-4 text-white/80" />
            <span className="text-[13px] font-bold text-white">
              {selected.size} row{selected.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center gap-2 ml-auto">
              {(bulkActions ? bulkActions(selectedRows) : []).map((a, i) => (
                <button key={i} onClick={a.onClick}
                  className={`text-[12px] font-semibold px-3 py-1 rounded transition-colors cursor-pointer
                    ${a.danger ? 'bg-red-500/30 hover:bg-red-500/50 text-white' : 'bg-white/20 hover:bg-white/30 text-white'}`}>
                  {a.label}
                </button>
              ))}
              {withExport && (
                <button onClick={handleExport}
                  className="text-[12px] font-semibold px-3 py-1 rounded bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer">
                  Export {selected.size > 0 ? `(${selected.size})` : ''}
                </button>
              )}
              <button onClick={() => setSelected(new Set())}
                className="p-1 rounded hover:bg-white/20 transition-colors cursor-pointer text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main toolbar row */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#e5e7eb] dark:border-white/10 bg-[#f9fafb] dark:bg-white/2 gap-3 flex-wrap min-h-[48px]">

          {/* Left */}
          <div className="flex items-center gap-3">
            {title && (
              <p className="text-[13px] font-bold text-[#111827] dark:text-white whitespace-nowrap">{title}</p>
            )}
            <span className="text-[11px] bg-[#f3f4f6] dark:bg-white/10 text-[#6b7280] dark:text-gray-400 font-bold px-2 py-0.5 rounded">
              {processed.length.toLocaleString()}
            </span>
            {toolbar}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2 flex-wrap">

            {/* Search */}
            {withSearch && (
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[#9ca3af] absolute left-2 pointer-events-none" />
                <input
                  type="text" value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="pl-7 pr-7 py-1.5 text-[12px] border border-[#e5e7eb] dark:border-white/10 rounded-md bg-white dark:bg-white/5 text-[#111827] dark:text-white placeholder-[#9ca3af] focus:outline-none focus:border-[#93c5fd] w-40 focus:w-52 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 text-[#9ca3af] hover:text-[#374151] cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}

            {/* Filters (selects) */}
            {filters.map(f => (
              <select
                key={f.key}
                value={filterVals[f.key]}
                onChange={e => setFilterVals(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="text-[12px] border border-[#e5e7eb] dark:border-white/10 rounded-md px-2.5 py-1.5 bg-white dark:bg-white/5 text-[#374151] dark:text-gray-300 focus:outline-none focus:border-[#93c5fd] cursor-pointer"
              >
                <option value="all">All {f.label}</option>
                {f.options.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            ))}

            {/* Column visibility */}
            {withColumnVisibility && (
              <div className="relative" ref={colDrop.ref}>
                <button
                  onClick={colDrop.toggle}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#6b7280] dark:text-gray-400 border border-[#e5e7eb] dark:border-white/10 rounded-md px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-[#f9fafb] dark:hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <Columns className="w-3 h-3" />
                  Columns
                </button>
                {colDrop.open && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-[#1c1c1c] border border-[#e5e7eb] dark:border-white/10 rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                    <p className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#9ca3af] px-3 pt-2 pb-1">
                      Toggle columns
                    </p>
                    {columns.filter(c => !c.noVis).map(col => (
                      <button
                        key={col.key}
                        onClick={() => toggleCol(col.key)}
                        className="flex items-center gap-2.5 w-full px-3 py-1.5 text-[12.5px] text-[#374151] dark:text-gray-300 hover:bg-[#f9fafb] dark:hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 transition-colors border
                          ${visibleKeys.has(col.key) ? 'bg-[#1d4ed8] border-[#1d4ed8]' : 'border-[#d1d5db] dark:border-white/25'}`}>
                          {visibleKeys.has(col.key) && <Check className="w-2.5 h-2.5 text-white" />}
                        </span>
                        {col.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Export */}
            {withExport && selected.size === 0 && (
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 text-[12px] font-medium text-[#6b7280] dark:text-gray-400 border border-[#e5e7eb] dark:border-white/10 rounded-md px-3 py-1.5 bg-white dark:bg-white/5 hover:bg-[#f9fafb] dark:hover:bg-white/10 cursor-pointer transition-colors"
              >
                <Download className="w-3 h-3" />
                Export
              </button>
            )}

          </div>
        </div>
      </div>

      {/* ── Active filters chip bar ── */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 px-4 py-2 border-b border-[#f3f4f6] dark:border-white/5 bg-[#fafafa] dark:bg-white/1 flex-wrap">
          <span className="text-[11px] text-[#9ca3af] font-medium">Active:</span>
          {search.trim() && (
            <FilterChip label={`Search: "${search}"`} onRemove={() => setSearch('')} />
          )}
          {filters.map(f => filterVals[f.key] !== 'all' && (
            <FilterChip
              key={f.key}
              label={`${f.label}: ${f.options.find(o => String(o.value) === String(filterVals[f.key]))?.label ?? filterVals[f.key]}`}
              onRemove={() => setFilterVals(prev => ({ ...prev, [f.key]: 'all' }))}
            />
          ))}
          <button
            onClick={() => { setSearch(''); setFilterVals(Object.fromEntries(filters.map(f => [f.key, 'all']))); }}
            className="text-[11px] font-semibold text-[#9ca3af] hover:text-[#374151] dark:hover:text-gray-300 cursor-pointer transition-colors ml-auto"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#9ca3af]">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-[13px]">Loading…</span>
          </div>
        ) : (
          <table className="w-full border-collapse" style={{ tableLayout: 'fixed', minWidth: 400 }}>
            <colgroup>
              {withSelection && <col style={{ width: 40 }} />}
              {visibleCols.map(c => (
                <col key={c.key} style={{ width: c.width ?? 'auto' }} />
              ))}
              {rowActions && <col style={{ width: 44 }} />}
            </colgroup>

            {/* ── Head ── */}
            <thead>
              <tr className="bg-[#f9fafb] dark:bg-white/2 border-b border-[#e5e7eb] dark:border-white/10">
                {withSelection && (
                  <th className="px-3 py-2.5">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={toggleAll}
                    />
                  </th>
                )}
                {visibleCols.map(col => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && handleSort(col.key)}
                    style={{ textAlign: col.align ?? 'left' }}
                    className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.5px] text-[#9ca3af] whitespace-nowrap select-none
                      ${col.sortable ? 'cursor-pointer hover:text-[#6b7280] dark:hover:text-gray-300' : ''}`}
                  >
                    <span className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'flex-row-reverse' : ''}`}>
                      {col.label}
                      {col.sortable && <SortIcon active={sort.key === col.key} dir={sort.dir} />}
                    </span>
                  </th>
                ))}
                {rowActions && <th />}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={visibleCols.length + (withSelection ? 1 : 0) + (rowActions ? 1 : 0)}
                    className="py-14 text-center">
                    {emptyState || (
                      <div className="text-[#9ca3af]">
                        <FileText className="w-7 h-7 mx-auto mb-2 opacity-20" />
                        <p className="text-[13px]">No results found.</p>
                        {hasActiveFilters && (
                          <button
                            onClick={() => { setSearch(''); setFilterVals(Object.fromEntries(filters.map(f => [f.key, 'all']))); }}
                            className="mt-2 text-[12px] font-semibold text-[#1d4ed8] hover:underline cursor-pointer"
                          >
                            Clear filters
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ) : pageRows.map((row, rowIdx) => {
                const id         = row[idKey];
                const isSelected = selected.has(id);
                const globalIdx  = (safePage - 1) * pageSize + rowIdx;
                const isEven     = globalIdx % 2 === 0;

                return (
                  <tr
                    key={id ?? rowIdx}
                    onClick={() => onRowClick?.(row)}
                    className={`border-b border-[#f3f4f6] dark:border-white/5 last:border-0 transition-colors
                      ${onRowClick ? 'cursor-pointer' : ''}
                      ${isSelected ? 'bg-[#eff6ff] dark:bg-[#1d4ed8]/10'
                        : striped && !isEven ? 'bg-[#fafafa] dark:bg-white/2'
                        : ''}
                      ${highlightOnHover && !isSelected ? 'hover:bg-[#f9fafb] dark:hover:bg-white/3' : ''}`}
                  >
                    {withSelection && (
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <Checkbox checked={isSelected} onChange={() => toggleRow(id)} />
                      </td>
                    )}

                    {visibleCols.map(col => {
                      const rawValue = row[col.key];
                      const cell = typeof col.render === 'function'
                        ? col.render(rawValue, row, globalIdx)
                        : rawValue ?? '—';
                      return (
                        <td
                          key={col.key}
                          className="px-3 py-2.5 text-[12.5px] text-[#374151] dark:text-gray-300 overflow-hidden"
                          style={{ textAlign: col.align ?? 'left' }}
                        >
                          {cell}
                        </td>
                      );
                    })}

                    {rowActions && (
                      <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
                        <RowActionMenu actions={rowActions(row)} />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-[#e5e7eb] dark:border-white/10 bg-[#f9fafb] dark:bg-white/2 gap-4 flex-wrap min-h-[44px]">

        {/* Left: summary + rows-per-page */}
        <div className="flex items-center gap-4">
          <span className="text-[12px] text-[#9ca3af]">
            {processed.length === 0 ? 'No results' : (
              <>
                Showing{' '}
                <span className="font-semibold text-[#374151] dark:text-gray-300">
                  {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, processed.length)}
                </span>
                {' '}of{' '}
                <span className="font-semibold text-[#374151] dark:text-gray-300">{processed.length}</span>
              </>
            )}
          </span>
          {pageSizeOptions.length > 1 && (
            <div className="flex items-center gap-1.5">
              <span className="text-[12px] text-[#9ca3af]">Rows:</span>
              <select
                value={pageSize}
                onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="text-[12px] border border-[#e5e7eb] dark:border-white/10 rounded px-1.5 py-0.5 bg-white dark:bg-white/5 text-[#374151] dark:text-gray-300 focus:outline-none cursor-pointer"
              >
                {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Right: pagination */}
        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <PageBtn onClick={() => setPage(1)} disabled={safePage === 1} title="First"><ChevronsLeft className="w-3.5 h-3.5" /></PageBtn>
            <PageBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} title="Previous"><ChevronLeft className="w-3.5 h-3.5" /></PageBtn>
            {pageNums.map((n, i) =>
              String(n).startsWith('…')
                ? <span key={n} className="px-1 text-[12px] text-[#9ca3af]">…</span>
                : <PageBtn key={n} onClick={() => setPage(n)} active={safePage === n}>{n}</PageBtn>
            )}
            <PageBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} title="Next"><ChevronRight className="w-3.5 h-3.5" /></PageBtn>
            <PageBtn onClick={() => setPage(totalPages)} disabled={safePage === totalPages} title="Last"><ChevronsRight className="w-3.5 h-3.5" /></PageBtn>
          </div>
        )}
      </div>

    </div>
  );
}
