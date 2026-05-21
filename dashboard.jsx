// Dashboard — Swiss layout, Flexoki, with Day / Week / Month / 6mo / All Time tabs

const { useState: useStateD } = React;

function Dashboard({ layout, week, hour, hunger, mood, owlStyle, onClose }) {
  const [timeframe, setTimeframe] = useStateD('week');

  // Source data per timeframe
  const data = (() => {
    if (timeframe === 'day')    return window.mockToday(hour);
    if (timeframe === 'week')   return week;
    if (timeframe === 'month')  return window.mockMonth(hour);
    if (timeframe === '6mo')    return window.mockSixMonths(hour);
    return window.mockAllTime(hour);
  })();

  // Stats — for week-like data (raw stop time per period)
  const valid = data.filter(d => d.raw != null);
  const score = window.shameScore(data.map(d => ({ raw: d.raw })).filter(d => d.raw != null));
  const scoreInfo = window.shameLabel(score);
  const lateCount = valid.filter(d => d.raw >= 22).length;
  const avgRaw   = valid.length ? (valid.reduce((a, b) => a + b.raw, 0) / valid.length) : 0;
  const worstRaw = valid.length ? Math.max(...valid.map(d => d.raw)) : 0;
  const today = week[week.length - 1];

  const fmtRaw = (raw) => {
    if (raw == null) return '—';
    const wholeH = Math.floor(raw) % 24;
    const mins = Math.floor((raw - Math.floor(raw)) * 60);
    const period = wholeH < 12 ? 'AM' : 'PM';
    const disp = (wholeH % 12) || 12;
    return `${disp}:${mins.toString().padStart(2,'0')} ${period}`;
  };

  const props = { data, timeframe, hour, hunger, mood, owlStyle, score, scoreInfo, today,
                  lateCount, avgRaw, worstRaw, fmtRaw, valid };

  return (
    <div className="browser">
      <div className="bw-titlebar">
        <div className="bw-traffic">
          <button className="tl tl-r" onClick={onClose} aria-label="Close"></button>
          <button className="tl tl-y" aria-label="Minimize"></button>
          <button className="tl tl-g" aria-label="Zoom"></button>
        </div>
        <div className="bw-nav">
          <button><svg width="10" height="10" viewBox="0 0 10 10"><path d="M7 1 L 3 5 L 7 9" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg></button>
          <button><svg width="10" height="10" viewBox="0 0 10 10"><path d="M3 1 L 7 5 L 3 9" stroke="currentColor" strokeWidth="1.2" fill="none"/></svg></button>
        </div>
        <div className="bw-address">
          <span className="bw-lock">
            <svg width="9" height="11" viewBox="0 0 9 11" fill="none"><rect x="1" y="4.5" width="7" height="6" stroke="currentColor"/><path d="M2.5 4.5 V 3 a 2 2 0 0 1 4 0 V 4.5" stroke="currentColor" fill="none"/></svg>
          </span>
          <span className="bw-url">file:///Users/enzo/NightOwl/dashboard.html</span>
        </div>
        <div className="bw-spacer"/>
      </div>

      <div className="bw-body">
        <div className="dash">
          <DashHeader timeframe={timeframe} hour={hour} mood={mood} owlStyle={owlStyle} />

          <TimeframeTabs value={timeframe} onChange={setTimeframe} />

          {layout === 'cards' && <LayoutCards {...props} />}
          {layout === 'hero' && <LayoutHero {...props} />}
          {layout === 'timeline' && <LayoutTimeline {...props} />}
        </div>
      </div>
    </div>
  );
}

// ── Tabs ─────────────────────────────────────────────────────────────────────
function TimeframeTabs({ value, onChange }) {
  const tabs = [
    { id: 'day',   label: 'Today',     mono: 'Day' },
    { id: 'week',  label: 'Week',      mono: 'Wk'  },
    { id: 'month', label: 'Month',     mono: 'Mo'  },
    { id: '6mo',   label: '6 months',  mono: '6mo' },
    { id: 'all',   label: 'All time',  mono: 'All' },
  ];
  return (
    <div className="tabs">
      {tabs.map((t, i) => (
        <button
          key={t.id}
          className={"tab" + (value === t.id ? ' is-active' : '')}
          onClick={() => onChange(t.id)}
        >
          <span className="tab-idx">{String(i + 1).padStart(2, '0')}</span>
          <span className="tab-lbl">{t.label}</span>
        </button>
      ))}
    </div>
  );
}

// ── Header ───────────────────────────────────────────────────────────────────
function DashHeader({ timeframe, hour, mood, owlStyle }) {
  const tfTitle = {
    day:    "Today",
    week:   "This week",
    month:  "This month",
    '6mo':  "Last six months",
    all:    "All time",
  }[timeframe];
  const tfRange = {
    day:    `May 20, 2026 \u2192 ${window.hourLabel(hour)}`,
    week:   'May 14 \u2192 May 20, 2026',
    month:  'May 1 \u2192 May 30, 2026',
    '6mo':  'Dec 2025 \u2192 May 2026',
    all:    'Aug 2025 \u2192 May 2026',
  }[timeframe];

  return (
    <div className="dash-header">
      <div className="dh-left">
        <div className="dh-eyebrow">— NightOwl &nbsp;/&nbsp; late-night report</div>
        <div className="dh-title">
          {tfTitle}<span className="dh-title-dot" aria-hidden="true"></span>
        </div>
        <div className="dh-sub">{tfRange}</div>
      </div>
      <div className="dh-owl-bg">
        <Owl mood={mood} style={owlStyle} size={64} accent="var(--or)" />
      </div>
    </div>
  );
}

// ── Layout A — Stat row + mid panels + chart ─────────────────────────────────
function LayoutCards({ data, timeframe, score, scoreInfo, today, lateCount, avgRaw, worstRaw, fmtRaw, hour, mood, owlStyle }) {
  const shameTitle = {
    day:   "Today's shame score",
    week:  "Weekly shame score",
    month: "Monthly shame score",
    '6mo': "6-month shame score",
    all:   "All-time shame score",
  }[timeframe] || "Shame score";

  return (
    <div className="dash-cards">
      <div className="stats-grid">
        <StatCard idx="01" label={timeframe === 'day' ? "Active hours" : "Late nights"}
                  value={timeframe === 'day' ? data.length : lateCount}
                  sub={timeframe === 'day' ? 'logged today' : 'past 10 PM'} />
        <StatCard idx="02" label="Average stop" value={fmtRaw(avgRaw)} sub="mean across period" small />
        <StatCard idx="03" label="Worst stop"   value={fmtRaw(worstRaw)} sub="latest you stayed up" small />
        <StatCard idx="04" label="Shame score"  value={score} sub={scoreInfo.label} featured tone={scoreInfo.tone} />
      </div>

      <div className="mid-row">
        <div className="panel">
          <div className="panel-top">
            <div className="panel-title">{shameTitle}</div>
            <div className="panel-eyebrow">— Score</div>
          </div>
          <div className="shame-figure">
            <span className="shame-num">{score}</span>
            <span className="shame-of">/ 100</span>
            <span className="shame-label" style={{ color: scoreInfo.color, borderColor: scoreInfo.color }}>
              {scoreInfo.label}
            </span>
          </div>
          <div className="bar-track">
            <div className={"bar-fill tone-" + scoreInfo.tone} style={{ width: `${score}%` }} />
            <div className="bar-marker" style={{ left: `${score}%` }} />
          </div>
          <div className="bar-labels">
            <span>Angel</span><span>Suspicious</span><span>Goblin</span><span>Vampire</span>
          </div>
        </div>

        <div className="panel">
          <div className="panel-top">
            <div className="panel-title">Tonight</div>
            <div className="panel-eyebrow">— Live</div>
          </div>
          <TodayStatus hour={hour} />
        </div>
      </div>

      <PeriodChart data={data} timeframe={timeframe} />
    </div>
  );
}

// ── Layout B — Hero ──────────────────────────────────────────────────────────
function LayoutHero({ data, timeframe, score, scoreInfo, lateCount, avgRaw, worstRaw, fmtRaw, hour }) {
  return (
    <div className="dash-hero">
      <div className="hero-panel">
        <div className="hero-left">
          <div className="hero-eyebrow">— Shame score</div>
          <div className="hero-score">
            {score}<span className="hero-score-of">&nbsp;/ 100</span>
          </div>
          <div className="hero-label" style={{ color: scoreInfo.color, borderColor: scoreInfo.color }}>
            <span style={{ display: 'inline-block', width: 8, height: 8, background: scoreInfo.color }}/>
            {scoreInfo.label}
          </div>
          <div className="hero-bar">
            <div className="bar-track thick">
              <div className={"bar-fill tone-" + scoreInfo.tone} style={{ width: `${score}%` }} />
              <div className="bar-marker" style={{ left: `${score}%` }} />
            </div>
            <div className="bar-labels">
              <span>Angel</span><span>Suspicious</span><span>Goblin</span><span>Vampire</span>
            </div>
          </div>
        </div>
        <div className="hero-right">
          <MiniStat idx="01" label={timeframe === 'day' ? "Active hrs" : "Late nights"} value={timeframe === 'day' ? data.length : lateCount} />
          <MiniStat idx="02" label="Avg stop" value={fmtRaw(avgRaw)} mono />
          <MiniStat idx="03" label="Worst stop" value={fmtRaw(worstRaw)} mono />
          <MiniStat idx="04" label="Sample size" value={data.filter(d => d.raw != null).length} sub={timeframe === 'day' ? "hours" : "tracked"} />
        </div>
      </div>

      <div className="mid-row">
        <div className="panel">
          <div className="panel-top">
            <div className="panel-title">Tonight</div>
            <div className="panel-eyebrow">— Live</div>
          </div>
          <TodayStatus hour={hour} />
        </div>
        <div className="panel">
          <div className="panel-top">
            <div className="panel-title">The owl says</div>
            <div className="panel-eyebrow">— Verdict</div>
          </div>
          <div className="verdict">{getVerdict(hour, score)}</div>
        </div>
      </div>

      <PeriodChart data={data} timeframe={timeframe} />
    </div>
  );
}

// ── Layout C — Timeline list ─────────────────────────────────────────────────
function LayoutTimeline({ data, timeframe, score, scoreInfo, lateCount, avgRaw, worstRaw, fmtRaw, hour, valid }) {
  // For day timeframe use the chart in main slot
  if (timeframe === 'day') {
    return (
      <div className="dash-timeline">
        <div className="dash-timeline-day-wrap">
          <PeriodChart data={data} timeframe={timeframe} />
        </div>
        <div className="mid-row">
          <div className="panel">
            <div className="panel-top">
              <div className="panel-title">Tonight</div>
              <div className="panel-eyebrow">— Live</div>
            </div>
            <TodayStatus hour={hour} />
          </div>
          <div className="panel">
            <div className="panel-top">
              <div className="panel-title">The owl says</div>
              <div className="panel-eyebrow">— Verdict</div>
            </div>
            <div className="verdict">{getVerdict(hour, score)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dash-timeline">
      <div className="tl-grid">
        <div>
          <div className="section-head">
            <span className="sh-idx">01</span>
            <span>{timeframe === 'week' ? 'Nightly stop times' : timeframe === 'month' ? 'Daily stop times' : timeframe === '6mo' ? 'Weekly averages' : 'Monthly averages'}</span>
            <span className="sh-spacer"/>
            <span className="sh-meta">{valid.length} tracked</span>
          </div>
          <div className="tl-list">
            {data.map((d, i) => {
              if (timeframe !== 'week' && timeframe !== 'day' && d.raw == null) return (
                <div key={i} className="tl-row tl-row-empty">
                  <div className="tl-day">
                    <div className="tl-day-name">{d.label || ''}</div>
                    <div className="tl-day-num">{d.day || ''}</div>
                  </div>
                  <div className="tl-track-empty">not tracked</div>
                  <div className="tl-end"><div className="tl-time" style={{ color: 'var(--tx-3)' }}>—</div></div>
                </div>
              );
              const tone = window.rawTone(d.raw);
              const isToday = timeframe === 'week' && i === data.length - 1;
              return (
                <div key={i} className={"tl-row" + (isToday ? " is-today" : "")}>
                  <div className="tl-day">
                    <div className="tl-day-name">{d.label || ('W' + (i+1))}</div>
                    <div className="tl-day-num">{d.day || ''}</div>
                  </div>
                  <div className="tl-bar-wrap">
                    <div className="tl-track">
                      <div className={"tl-bar tone-" + tone} style={{
                        left:  `${pctFromHour(18)}%`,
                        width: `${pctFromHour(d.raw) - pctFromHour(18)}%`,
                      }} />
                    </div>
                    <div className="tl-axis">
                      {[18, 20, 22, 24, 26, 28].map(t => (
                        <div key={t} className="tl-tick" style={{ left: `${pctFromHour(t)}%` }}>
                          {tickLabel(t)}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="tl-end">
                    <div className={"tl-time tone-" + tone}>{fmtRaw(d.raw)}</div>
                    <div className="tl-verdict">{window.rawVerdict(d.raw)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="timeline-side">
          <div className="tl-score-card">
            <div className="side-stat-lbl"><span className="side-stat-idx">01</span> Shame score</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 8 }}>
              <div className="tl-score-num">{score}</div>
              <div className="tl-score-of">/ 100</div>
            </div>
            <div className="tl-score-lbl" style={{ color: scoreInfo.color }}>{scoreInfo.label}</div>
          </div>
          <div className="side-stat">
            <div className="side-stat-lbl"><span className="side-stat-idx">02</span> Late nights</div>
            <div className="side-stat-val">{lateCount}</div>
          </div>
          <div className="side-stat">
            <div className="side-stat-lbl"><span className="side-stat-idx">03</span> Avg stop</div>
            <div className="side-stat-val mono">{fmtRaw(avgRaw)}</div>
          </div>
          <div className="side-stat">
            <div className="side-stat-lbl"><span className="side-stat-idx">04</span> Worst stop</div>
            <div className="side-stat-val mono">{fmtRaw(worstRaw)}</div>
          </div>
          <div className="side-verdict">
            <div className="side-verdict-lbl">— Verdict</div>
            <div className="side-verdict-txt">{getVerdict(hour, score)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared pieces ────────────────────────────────────────────────────────────
function StatCard({ idx, label, value, sub, featured, tone, small }) {
  return (
    <div className={"stat-card" + (featured ? " featured" : "")}>
      <div className="sc-label">
        <span className="sc-idx">{idx}</span>
        <span>{label}</span>
      </div>
      <div className={"sc-value" + (small ? " sc-small" : "")}>{value}</div>
      <div className={"sc-sub" + (featured ? " sc-sub-strong" : "")}>{sub}</div>
    </div>
  );
}
function MiniStat({ idx, label, value, sub, mono }) {
  return (
    <div className="mini-stat">
      <div className="ms-lbl">
        <span className="ms-idx">{idx}</span>
        <span>{label}</span>
      </div>
      <div className={"ms-val" + (mono ? " ms-mono" : "")}>{value}</div>
      {sub && <div className="ms-sub">{sub}</div>}
    </div>
  );
}

function TodayStatus({ hour }) {
  const h = Math.floor(hour) % 24;
  const verdict = h >= 2 && h < 6 ? "Goblin mode" :
                   h === 0 || h === 1 ? "Deeply irresponsible" :
                   h >= 22 ? "Night owl" :
                   "Human hours";
  const color = h >= 2 && h < 6 ? 'var(--re)' :
                h === 0 || h === 1 ? 'var(--or)' :
                h >= 22 ? 'var(--ye)' : 'var(--gr)';
  return (
    <div className="today">
      <div className="today-row">
        <div className="today-idx">— First active</div>
        <div className="today-lbl">Today's session start</div>
        <div className="today-val">9:14 AM</div>
      </div>
      <div className="today-row">
        <div className="today-idx">— Last active</div>
        <div className="today-lbl">Most recent input</div>
        <div className="today-val">{window.hourLabel(hour)}</div>
      </div>
      <div className="today-row">
        <div className="today-idx">— Status</div>
        <div className="today-lbl">Current verdict</div>
        <div className="today-verdict" style={{ color }}>{verdict}</div>
      </div>
    </div>
  );
}

// ── Chart ────────────────────────────────────────────────────────────────────
function PeriodChart({ data, timeframe }) {
  const subtitle = {
    day:   'Hourly activity from session start',
    week:  'Nightly stop times \u2014 7 days',
    month: 'Daily stop times \u2014 30 days',
    '6mo': 'Weekly averages \u2014 24 weeks',
    all:   'Monthly averages \u2014 10 months',
  }[timeframe];

  return (
    <div className="chart-block">
      <div className="section-head">
        <span className="sh-idx">{timeframe === 'day' ? '01' : '02'}</span>
        <span>{timeframe === 'day' ? 'Today, hour by hour' : 'History'}</span>
        <span className="sh-spacer"/>
        <span className="sh-meta">{subtitle}</span>
      </div>
      <div className="chart-wrap">
        {timeframe === 'day' ? <TodayChart data={data} /> : <StopChart data={data} timeframe={timeframe} />}
      </div>
    </div>
  );
}

function StopChart({ data, timeframe }) {
  const W = 1080, H = 320;
  const padL = 64, padR = 24, padT = 28, padB = 56;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const yMin = 18, yMax = 28.5;
  const yScale = (v) => padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
  const xStep = innerW / data.length;

  const yTicks = [18, 20, 22, 24, 26, 28];
  const thresholds = [
    { y: 22, label: '10 PM',    color: 'var(--ye)' },
    { y: 24, label: 'Midnight', color: 'var(--or)' },
    { y: 26, label: '2 AM',     color: 'var(--re)' },
  ];

  // Decide which x-labels to show
  const showEvery = timeframe === 'month' ? 5 : timeframe === '6mo' ? 4 : 1;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {/* Y axis */}
      {yTicks.map(t => (
        <g key={t}>
          <line x1={padL} y1={yScale(t)} x2={W - padR} y2={yScale(t)} stroke="var(--ui)" />
          <text x={padL - 10} y={yScale(t) + 4} textAnchor="end"
            fill="var(--tx-3)" fontSize="11" fontFamily="var(--font-mono)">{tickLabel(t)}</text>
        </g>
      ))}

      {/* Thresholds */}
      {thresholds.map(t => (
        <g key={t.y}>
          <line x1={padL} y1={yScale(t.y)} x2={W - padR} y2={yScale(t.y)}
            stroke={t.color} strokeOpacity="0.4" strokeDasharray="2 4" />
          <text x={W - padR - 4} y={yScale(t.y) - 5} textAnchor="end"
            fill={t.color} fontSize="10" fontFamily="var(--font-mono)" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {t.label}
          </text>
        </g>
      ))}

      {/* Bars */}
      {data.map((d, i) => {
        if (d.raw == null) return null;
        const bx = padL + i * xStep + xStep * 0.18;
        const bw = xStep * 0.64;
        const yTop = yScale(d.raw);
        const yBot = yScale(18);
        const tone = window.rawTone(d.raw);
        const fill = tone === 'danger' ? 'var(--re)'
                   : tone === 'bad' ? 'var(--or)'
                   : tone === 'mid' ? 'var(--ye)'
                   : 'var(--gr)';
        const showVal = data.length <= 14;
        return (
          <g key={i}>
            <rect x={bx} y={yTop} width={bw} height={yBot - yTop} fill={fill} />
            {showVal && (
              <text x={bx + bw / 2} y={yTop - 6} textAnchor="middle"
                fill="var(--tx)" fontSize="10" fontFamily="var(--font-mono)">
                {fmtRawShort(d.raw)}
              </text>
            )}
          </g>
        );
      })}

      {/* X axis */}
      <line x1={padL} y1={H - padB} x2={W - padR} y2={H - padB} stroke="var(--ui-3)" />
      {data.map((d, i) => {
        if (i % showEvery !== 0 && i !== data.length - 1) return null;
        const cx = padL + i * xStep + xStep / 2;
        const label = d.label || d.day || (i + 1);
        return (
          <g key={'x' + i}>
            <line x1={cx} y1={H - padB} x2={cx} y2={H - padB + 4} stroke="var(--ui-3)" />
            <text x={cx} y={H - padB + 18} textAnchor="middle"
              fill="var(--tx-2)" fontSize="10" fontFamily="var(--font-mono)" style={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {label}
            </text>
            {d.day && (
              <text x={cx} y={H - padB + 34} textAnchor="middle"
                fill="var(--tx-3)" fontSize="9" fontFamily="var(--font-mono)">
                {String(d.day).padStart(2, '0')}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function TodayChart({ data }) {
  const W = 1080, H = 320;
  const padL = 64, padR = 24, padT = 28, padB = 56;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const barW = innerW / Math.max(data.length, 16);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {/* Y axis (intensity 0-1) */}
      {[0, 0.5, 1].map(v => (
        <g key={v}>
          <line x1={padL} y1={padT + innerH - v * innerH} x2={W - padR} y2={padT + innerH - v * innerH} stroke="var(--ui)" />
          <text x={padL - 10} y={padT + innerH - v * innerH + 4} textAnchor="end"
            fill="var(--tx-3)" fontSize="11" fontFamily="var(--font-mono)">{Math.round(v * 100)}%</text>
        </g>
      ))}
      {data.map((d, i) => {
        const bx = padL + i * barW + 2;
        const bw = Math.max(2, barW - 4);
        const bh = Math.max(2, d.intensity * innerH);
        const y = padT + innerH - bh;
        const fill = d.tone === 'danger' ? 'var(--re)'
                   : d.tone === 'bad' ? 'var(--or)'
                   : d.tone === 'mid' ? 'var(--ye)'
                   : 'var(--gr)';
        return (
          <g key={i}>
            <rect x={bx} y={y} width={bw} height={bh} fill={fill} />
            {(i % 2 === 0 || i === data.length - 1) && (
              <text x={bx + bw / 2} y={H - padB + 18} textAnchor="middle"
                fill="var(--tx-2)" fontSize="10" fontFamily="var(--font-mono)" style={{ letterSpacing: '0.08em' }}>
                {d.label}
              </text>
            )}
          </g>
        );
      })}
      <line x1={padL} y1={padT + innerH} x2={W - padR} y2={padT + innerH} stroke="var(--ui-3)" />
    </svg>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
function tickLabel(t) {
  const h = t % 24;
  if (h === 0) return '12 AM';
  if (h === 12) return '12 PM';
  if (h < 12) return `${h} AM`;
  return `${h - 12} PM`;
}
function pctFromHour(raw) {
  const min = 18, max = 28.5;
  return ((raw - min) / (max - min)) * 100;
}
function fmtRawShort(raw) {
  const h = Math.floor(raw) % 24;
  const m = Math.floor((raw - Math.floor(raw)) * 60);
  const period = h < 12 ? 'a' : 'p';
  const disp = (h % 12) || 12;
  return `${disp}:${m.toString().padStart(2,'0')}${period}`;
}
function getVerdict(hour, score) {
  const h = Math.floor(hour) % 24;
  if (h >= 2 && h < 6) return "The hour of poor decisions. I am documenting them.";
  if (h === 0 || h === 1) return "Whatever this is — it will look the same tomorrow. I promise.";
  if (h >= 22) return "Suspicious evening pigeon detected. Monitoring.";
  if (score >= 60) return "You've been a cryptid all week. An intervention is forthcoming.";
  return "Human hours. Briefly. I'll wait.";
}

Object.assign(window, { Dashboard });
