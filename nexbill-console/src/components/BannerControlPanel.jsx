import React, { useState, useEffect } from 'react';
import { Megaphone, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import api from '../config/api';

export default function BannerControlPanel({ merchantId }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [editForm, setEditForm] = useState({ message: '', type: 'info', cta_label: '', cta_link: '', is_enabled: true, is_dismissed: false });
  const [isCreating, setIsCreating] = useState(false);
  const [newForm, setNewForm] = useState({ bannerKey: '', message: '', type: 'info', cta_label: '', cta_link: '', is_enabled: true, is_dismissed: false });

  const fetchBanners = async () => {
    if (!merchantId) return;
    setLoading(true);
    try {
      const res = await api.get(`/admin/merchants/${merchantId}/banners`);
      if (res.data?.banners) setBanners(res.data.banners);
    } catch (err) {
      console.error('Failed to fetch banners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBanners(); setEditingKey(null); }, [merchantId]);

  const parseBool = (v) => v === true || v === 'true' || v === 't';

  // Quick toggle — saves immediately without opening edit mode
  const handleQuickToggle = async (banner) => {
    const newEnabled = !parseBool(banner.is_enabled);
    
    // Snappy optimistic UI: if enabling one, automatically disable all other banners locally
    if (newEnabled) {
      setBanners(prev => prev.map(b => 
        b.banner_key === banner.banner_key 
          ? { ...b, is_enabled: true } 
          : { ...b, is_enabled: false }
      ));
    } else {
      setBanners(prev => prev.map(b => 
        b.banner_key === banner.banner_key 
          ? { ...b, is_enabled: false } 
          : b
      ));
    }

    try {
      await api.put(`/admin/merchants/${merchantId}/banners/${banner.banner_key}`, {
        message: banner.message,
        type: banner.type,
        cta_label: banner.cta_label,
        cta_link: banner.cta_link,
        is_enabled: newEnabled,
        is_dismissed: parseBool(banner.is_dismissed)
      });
      fetchBanners();
    } catch (err) {
      console.error('Failed to toggle banner', err);
      fetchBanners();
    }
  };

  const handleEditClick = (b) => {
    setEditingKey(b.banner_key);
    setEditForm({
      message: b.message || '', type: b.type || 'info',
      cta_label: b.cta_label || '', cta_link: b.cta_link || '',
      is_enabled: parseBool(b.is_enabled), is_dismissed: parseBool(b.is_dismissed)
    });
  };

  const handleSave = async (key) => {
    try {
      const res = await api.put(`/admin/merchants/${merchantId}/banners/${key}`, editForm);
      if (res.data?.success) { setEditingKey(null); fetchBanners(); }
    } catch (err) { console.error('Save failed', err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newForm.bannerKey || !newForm.message) return alert('Key and message required.');
    try {
      const res = await api.post(`/admin/merchants/${merchantId}/banners`, {
        bannerKey: newForm.bannerKey.trim().toLowerCase().replace(/\s+/g, '-'),
        message: newForm.message, type: newForm.type,
        cta_label: newForm.cta_label || null, cta_link: newForm.cta_link || null,
        is_enabled: newForm.is_enabled, is_dismissed: newForm.is_dismissed
      });
      if (res.data?.success) {
        setIsCreating(false);
        setNewForm({ bannerKey: '', message: '', type: 'info', cta_label: '', cta_link: '', is_enabled: true, is_dismissed: false });
        fetchBanners();
      }
    } catch (err) { console.error('Create failed', err); }
  };

  const typeColors = {
    critical: 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800/30',
    warning: 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/30',
    success: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30',
    info: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/30',
  };

  const inputCls = "w-full p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-[12px] text-zinc-900 dark:text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder-zinc-400 dark:placeholder-zinc-600";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
          <Megaphone className="w-3.5 h-3.5 text-indigo-500" /> Banner Control Panel
        </h4>
        <button
          type="button" onClick={() => setIsCreating(p => !p)}
          className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-semibold flex items-center gap-1 cursor-pointer bg-indigo-50 dark:bg-indigo-950/30 px-2.5 py-1 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/30"
        >
          {isCreating ? <><X className="w-3 h-3" /> Close</> : <><Plus className="w-3 h-3" /> New Alert</>}
        </button>
      </div>

      {/* Create Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="mb-4 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 bg-indigo-50/30 dark:bg-indigo-950/10 space-y-3">
          <h5 className="text-[12px] font-bold text-zinc-900 dark:text-white">Create Custom Alert</h5>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">Banner Key</label>
              <input type="text" required placeholder="e.g. promo-alert" value={newForm.bannerKey}
                onChange={e => setNewForm({ ...newForm, bannerKey: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">Type</label>
              <select value={newForm.type} onChange={e => setNewForm({ ...newForm, type: e.target.value })} className={inputCls}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
                <option value="success">Success</option>
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-400 uppercase font-semibold">Message</label>
            <textarea required placeholder="Alert text..." value={newForm.message}
              onChange={e => setNewForm({ ...newForm, message: e.target.value })}
              className={`${inputCls} min-h-[50px] resize-none`} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">CTA Label</label>
              <input type="text" placeholder="e.g. Read more" value={newForm.cta_label}
                onChange={e => setNewForm({ ...newForm, cta_label: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">CTA Link</label>
              <input type="text" placeholder="e.g. /news" value={newForm.cta_link}
                onChange={e => setNewForm({ ...newForm, cta_link: e.target.value })} className={inputCls} />
            </div>
          </div>
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-400">
              <input type="checkbox" checked={newForm.is_enabled} onChange={e => {
                const val = e.target.checked;
                setNewForm({ ...newForm, is_enabled: val });
                if (val) {
                  // Snappy local UI update: automatically uncheck all existing checkboxes
                  setBanners(prev => prev.map(b => ({ ...b, is_enabled: false })));
                  setEditForm(prev => ({ ...prev, is_enabled: false }));
                }
              }}
                className="w-3.5 h-3.5 rounded border-zinc-300 dark:border-zinc-700 accent-indigo-600 cursor-pointer" />
              Enable immediately (visible in merchant app)
            </label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setIsCreating(false); fetchBanners(); }} className="px-3 py-1.5 text-zinc-500 text-[11px] font-medium cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer">Create</button>
            </div>
          </div>
        </form>
      )}

      {/* Banner List */}
      {loading ? (
        <div className="flex items-center justify-center py-8 gap-2 text-zinc-400">
          <RefreshCw className="w-4 h-4 animate-spin text-indigo-500" />
          <span className="text-[12px]">Loading banners...</span>
        </div>
      ) : (
        <div className="space-y-2.5">
          {banners.map(b => {
            const isEditing = editingKey === b.banner_key;
            const isEnabled = parseBool(b.is_enabled);
            const isDismissed = parseBool(b.is_dismissed);
            return (
              <div key={b.banner_key} className={`rounded-xl border transition-all duration-200 ${
                isEnabled && !isDismissed
                  ? 'bg-white dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/70'
                  : 'bg-zinc-50 dark:bg-zinc-950/30 border-zinc-100 dark:border-zinc-900/50 opacity-60'
              }`}>
                {/* Banner Header Row — always visible */}
                <div className="px-4 py-3 flex items-center gap-3">
                  {/* Quick-toggle Enable checkbox */}
                  <button
                    type="button"
                    onClick={() => handleQuickToggle(b)}
                    className={`w-8 h-5 rounded-full relative transition-colors duration-200 flex-shrink-0 cursor-pointer ${
                      isEnabled ? 'bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                    }`}
                    title={isEnabled ? 'Click to disable — hides from merchant app' : 'Click to enable — shows in merchant app'}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      isEnabled ? 'left-3.5' : 'left-0.5'
                    }`} />
                  </button>

                  {/* Key + Type badge */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-300 truncate">{b.banner_key}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase border ${typeColors[b.type] || typeColors.info}`}>{b.type}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5">{b.message}</p>
                  </div>

                  {/* Status badges + Edit button */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isDismissed && (
                      <span className="text-[9px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 px-1.5 py-0.5 rounded-md font-semibold">Dismissed</span>
                    )}
                    {isEnabled && !isDismissed && (
                      <span className="text-[9px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                        <Eye className="w-3 h-3" /> Live
                      </span>
                    )}
                    {!isEnabled && (
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded-md font-semibold flex items-center gap-1">
                        <EyeOff className="w-3 h-3" /> Off
                      </span>
                    )}
                    <button type="button" onClick={() => isEditing ? setEditingKey(null) : handleEditClick(b)}
                      className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer flex items-center gap-0.5">
                      {isEditing ? <><ChevronUp className="w-3 h-3" /> Close</> : <><ChevronDown className="w-3 h-3" /> Edit</>}
                    </button>
                  </div>
                </div>

                {/* Edit Form — collapsible */}
                {isEditing && (
                  <div className="px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-zinc-800/50 space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase font-semibold">Message</label>
                      <textarea value={editForm.message} onChange={e => setEditForm({ ...editForm, message: e.target.value })}
                        className={`${inputCls} min-h-[50px] resize-none`} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase font-semibold">Type</label>
                        <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })} className={inputCls}>
                          <option value="info">Info</option><option value="warning">Warning</option>
                          <option value="critical">Critical</option><option value="success">Success</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-zinc-400 uppercase font-semibold">CTA Label</label>
                        <input type="text" value={editForm.cta_label} placeholder="e.g. Activate" onChange={e => setEditForm({ ...editForm, cta_label: e.target.value })} className={inputCls} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-zinc-400 uppercase font-semibold">CTA Link</label>
                      <input type="text" value={editForm.cta_link} placeholder="e.g. /activate" onChange={e => setEditForm({ ...editForm, cta_link: e.target.value })} className={inputCls} />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-400">
                          <input type="checkbox" checked={editForm.is_enabled} onChange={e => {
                            const val = e.target.checked;
                            setEditForm({ ...editForm, is_enabled: val });
                            if (val) {
                              // Snappy local UI update: automatically disable all other checkboxes
                              setBanners(prev => prev.map(b => 
                                b.banner_key === editingKey 
                                  ? b 
                                  : { ...b, is_enabled: false }
                              ));
                            }
                          }}
                            className="w-3.5 h-3.5 rounded accent-indigo-600 cursor-pointer" />
                          Enabled
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-[11px] text-zinc-600 dark:text-zinc-400">
                          <input type="checkbox" checked={editForm.is_dismissed} onChange={e => setEditForm({ ...editForm, is_dismissed: e.target.checked })}
                            className="w-3.5 h-3.5 rounded accent-amber-600 cursor-pointer" />
                          Force Dismissed
                        </label>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => { setEditingKey(null); fetchBanners(); }} className="px-3 py-1.5 text-zinc-500 text-[11px] font-medium cursor-pointer">Cancel</button>
                        <button type="button" onClick={() => handleSave(b.banner_key)}
                          className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold transition-colors cursor-pointer">Save</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
