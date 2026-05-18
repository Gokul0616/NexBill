import React, { useRef, useCallback } from 'react';

const W = 600;
const H = 200;

// Round up to a clean ceiling: e.g. 1789 → 2000, 14500 → 20000, 214000 → 250000
function niceMax(val) {
    if (val <= 0) return 1000;
    const exp = Math.pow(10, Math.floor(Math.log10(val)));
    const frac = val / exp;
    let nice;
    if (frac <= 1) nice = 1;
    else if (frac <= 2) nice = 2;
    else if (frac <= 2.5) nice = 2.5;
    else if (frac <= 5) nice = 5;
    else nice = 10;
    return nice * exp;
}

// Format axis label: 1000 → $1K, 1500000 → $1.5M, 250 → $250
function fmtAxis(val) {
    if (val >= 1_000_000) return `$${+(val / 1_000_000).toPrecision(3).replace(/\.?0+$/, '')}M`;
    if (val >= 1_000) return `$${+(val / 1_000).toPrecision(3).replace(/\.?0+$/, '')}K`;
    return `$${val}`;
}

function toXY(i, total, v, maxV) {
    const x = (i / (total - 1)) * W;
    const y = H - (v / maxV) * H;
    return [x, y];
}


function smoothPath(pts, curved = false) {
    if (curved) {
        if (!pts || pts.length < 2) return '';
        let d = `M ${pts[0][0]},${pts[0][1]}`;
        for (let i = 0; i < pts.length - 1; i++) {
            const [x0, y0] = pts[i];
            const [x1, y1] = pts[i + 1];
            const cpx = (x0 + x1) / 2;
            d += ` C ${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
        }
        return d;
    }
    if (!pts || pts.length < 2) return '';
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i][0]},${pts[i][1]}`;
    }
    return d;
}

function getYAtX(pathEl, targetX) {
    const totalLength = pathEl.getTotalLength();
    let lo = 0, hi = totalLength, pt;
    for (let i = 0; i < 64; i++) {
        const mid = (lo + hi) / 2;
        pt = pathEl.getPointAtLength(mid);
        if (Math.abs(pt.x - targetX) < 0.1) break;
        if (pt.x < targetX) lo = mid;
        else hi = mid;
    }
    return pt ? pt.y : null;
}

function svgYToValue(svgY, maxV) {
    return Math.round(((H - svgY) / H) * maxV);
}

function closestDataIdx(pts, svgX) {
    let idx = 0, minD = Infinity;
    pts.forEach(([px], i) => {
        const dist = Math.abs(px - svgX);
        if (dist < minD) { minD = dist; idx = i; }
    });
    return idx;
}

export default function RevenueLineChart({
    data = [],
    color = '#8b5cf6',
    totalLabel = '',
    subLabel = '',
    curved = false,
}) {
    const svgWrapRef = useRef(null);
    const linePathRef = useRef(null);
    const hoverLineRef = useRef(null);
    const hoverDotRef = useRef(null);
    const tooltipRef = useRef(null);

    // Derive max from data
    const dataMax = Math.max(...data.map(d => d.v), 0);
    const maxV = niceMax(dataMax);

    // Y-axis ticks: 4 evenly spaced labels from 0 to maxV
    const yTicks = [maxV, maxV * (2 / 3), maxV * (1 / 3), 0];

    const pts = data.map((d, i) => toXY(i, data.length, d.v, maxV));
    const linePath = smoothPath(pts, curved);
    const fillPath = pts.length > 1
        ? linePath + ` L ${pts[pts.length - 1][0]},${H} L ${pts[0][0]},${H} Z`
        : '';
    const gradId = `grad-${color.replace('#', '')}`;

    const handleMouseMove = useCallback((e) => {
        const wrap = svgWrapRef.current;
        const pathEl = linePathRef.current;
        if (!wrap || !pathEl || pts.length === 0) return;

        const rect = wrap.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        const svgX = Math.max(pts[0][0], Math.min(pts[pts.length - 1][0], ratio * W));

        const svgY = getYAtX(pathEl, svgX);
        if (svgY === null) return;

        const hLine = hoverLineRef.current;
        hLine.setAttribute('x1', svgX);
        hLine.setAttribute('x2', svgX);
        hLine.style.opacity = '1';

        const hDot = hoverDotRef.current;
        hDot.setAttribute('cx', svgX);
        hDot.setAttribute('cy', svgY);
        hDot.style.opacity = '1';

        const value = svgYToValue(svgY, maxV);
        const nearestIdx = closestDataIdx(pts, svgX);
        const date = data[nearestIdx]?.date || '';
        const tooltip = tooltipRef.current;
        tooltip.querySelector('.tt-value').textContent = fmtAxis(value);
        tooltip.querySelector('.tt-date').textContent = date;

        const xPct = (svgX / W) * 100;
        const yPct = (svgY / H) * 100;
        tooltip.style.left = `calc(${xPct}% + 12px)`;
        tooltip.style.top = `calc(${yPct}% - 40px)`;
        tooltip.style.transform = xPct > 70 ? 'translateX(-110%)' : 'none';
        tooltip.style.display = 'block';
    }, [pts, data, maxV]);

    const handleMouseLeave = useCallback(() => {
        if (hoverLineRef.current) hoverLineRef.current.style.opacity = '0';
        if (hoverDotRef.current) hoverDotRef.current.style.opacity = '0';
        if (tooltipRef.current) tooltipRef.current.style.display = 'none';
    }, []);

    if (!data || data.length < 2) {
        return (
            <div className="h-[260px] flex items-center justify-center text-[#9ca3af] text-sm">
                No data available
            </div>
        );
    }

    const xLabel1 = data[Math.floor(data.length * 0.25)]?.date || '';
    const xLabel2 = data[Math.floor(data.length * 0.72)]?.date || '';

    return (
        <div className="w-full font-sans select-none">
            {/* Header */}
            {(totalLabel || subLabel) && (
                <div className="mb-4">
                    {totalLabel && (
                        <p className="text-[22px] font-semibold text-[#111827] dark:text-white tracking-tight leading-none">
                            {totalLabel}
                        </p>
                    )}
                    {subLabel && (
                        <p className="text-[13px] text-[#9ca3af] mt-1">{subLabel}</p>
                    )}
                </div>
            )}

            {/* Chart + Y-axis */}
            <div className="flex" style={{ height: `${H + 4}px` }}>

                <div
                    className="flex-1 relative"
                    ref={svgWrapRef}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{ cursor: 'crosshair' }}
                >
                    <svg
                        viewBox={`0 0 ${W} ${H}`}
                        preserveAspectRatio="none"
                        width="100%"
                        height="100%"
                        style={{ overflow: 'visible' }}
                        role="img"
                        aria-label="Revenue line chart"
                    >
                        <defs>
                            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={color} stopOpacity="0.20" />
                                <stop offset="100%" stopColor={color} stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Grid lines at each tick */}
                        {yTicks.map((tick, i) => {
                            const y = H - (tick / maxV) * H;
                            return (
                                <line
                                    key={i}
                                    x1="0" y1={y} x2={W} y2={y}
                                    stroke={tick === 0 ? '#cbd5e1' : '#e5e7eb'}
                                    strokeWidth={tick === 0 ? 1.2 : 0.8}
                                    strokeDasharray={tick === 0 ? '4,4' : undefined}
                                    vectorEffect="non-scaling-stroke"
                                />
                            );
                        })}

                        {fillPath && <path d={fillPath} fill={`url(#${gradId})`} />}

                        {linePath && (
                            <path
                                ref={linePathRef}
                                d={linePath}
                                fill="none"
                                stroke={color}
                                strokeWidth="2.5"
                                strokeLinejoin="round"
                                strokeLinecap="round"
                                vectorEffect="non-scaling-stroke"
                            />
                        )}

                        <line
                            ref={hoverLineRef}
                            x1="0" y1="0" x2="0" y2={H}
                            stroke="#9ca3af"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                            vectorEffect="non-scaling-stroke"
                            style={{ opacity: 0 }}
                        />
                        <circle
                            ref={hoverDotRef}
                            cx="0" cy="0" r="1"
                            fill="white"
                            stroke={color}
                            strokeWidth="2.5"
                            vectorEffect="non-scaling-stroke"
                            style={{ opacity: 0 }}
                        />
                    </svg>

                    {/* Tooltip */}
                    <div
                        ref={tooltipRef}
                        className="absolute pointer-events-none bg-white dark:bg-[#111] border border-[#e5e7eb] dark:border-white/10 rounded-md px-3 py-1.5 z-10 whitespace-nowrap"
                        style={{ display: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
                    >
                        <span className="tt-value text-[13px] font-semibold text-[#111827] dark:text-white" />
                        <span className="tt-date ml-1.5 text-[12px] font-normal text-[#9ca3af]" />
                    </div>
                </div>

                {/* Y-axis — dynamic labels */}
                <div className="flex flex-col justify-between pl-3 text-[12px] text-[#9ca3af] pb-[2px] pt-[2px] w-12 text-right flex-shrink-0">
                    {yTicks.map((tick, i) => (
                        <span key={i}>{fmtAxis(tick)}</span>
                    ))}
                </div>
            </div>

            {/* X-axis labels */}
            {(xLabel1 || xLabel2) && (
                <div className="relative text-[12px] text-[#9ca3af] mt-2 pr-12" style={{ height: '18px' }}>
                    {xLabel1 && (
                        <span className="absolute" style={{ left: `${(Math.floor(data.length * 0.25) / (data.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
                            {xLabel1}
                        </span>
                    )}
                    {xLabel2 && (
                        <span className="absolute" style={{ left: `${(Math.floor(data.length * 0.72) / (data.length - 1)) * 100}%`, transform: 'translateX(-50%)' }}>
                            {xLabel2}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}