// macOS menu bar + NightOwl dropdown + Today's preview popover + Pet stats popover

function MenuBar({ hour, hunger, mood, owlStyle, dropdownOpen, setDropdownOpen, onMenuAction }) {
  const time = window.hourLabel(hour);
  return (
    <div className="menubar">
      <div className="menubar-left">
        <div className="mb-apple">
          <svg width="13" height="15" viewBox="0 0 14 16"><path d="M9.3 3.6c-.5.6-1.3 1-2 1-.1-.7.2-1.5.7-2 .5-.6 1.4-1 2.1-1 .1.8-.3 1.5-.8 2zm.7 1.2c-1.1-.1-2 .6-2.6.6-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.2 2.2-.3 5.4.9 7.2.6.9 1.3 1.8 2.2 1.8.9 0 1.2-.6 2.3-.6s1.4.6 2.3.6c1 0 1.6-.9 2.2-1.8.7-1 1-2 1-2-.6-.2-1.8-.8-1.8-2.4 0-1.3 1.1-1.9 1.1-2-.6-.9-1.6-1-1.9-1z"/></svg>
        </div>
        <div className="mb-app">NightOwl</div>
        <div className="mb-menu">File</div>
        <div className="mb-menu">Edit</div>
        <div className="mb-menu">View</div>
        <div className="mb-menu">Window</div>
        <div className="mb-menu">Help</div>
      </div>

      <div className="menubar-right">
        <div className="mb-icon" title="Battery">
          <svg width="22" height="11" viewBox="0 0 22 11" fill="none">
            <rect x="0.5" y="0.5" width="18" height="10" stroke="currentColor" />
            <rect x="2" y="2" width="13" height="7" fill="currentColor" />
            <rect x="19" y="3.5" width="2" height="4" fill="currentColor" />
          </svg>
        </div>
        <div className="mb-icon" title="Wifi">
          <svg width="14" height="11" viewBox="0 0 14 11" fill="none">
            <path d="M7 9.5 L 7 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M3.5 6.5C4.5 5.7 5.5 5.3 7 5.3C8.5 5.3 9.5 5.7 10.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M1 3.8C2.5 2.5 4.5 1.7 7 1.7C9.5 1.7 11.5 2.5 13 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </div>
        <button
          className={"mb-owl" + (dropdownOpen ? " open" : "")}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <OwlIcon mood={mood} size={16} accent="currentColor" />
        </button>
        <div className="mb-time">{time}</div>
      </div>
    </div>
  );
}

function OwlDropdown({ hour, hunger, mood, owlStyle, onMenuAction }) {
  const h = Math.floor(hour) % 24;
  const status = (h >= 22 || h < 6) ? 'Night owl territory' :
                 (h === 0 || h === 1) ? 'Deeply irresponsible' :
                 'Human hours';
  const hungerTone = hunger >= 75 ? 'tone-danger' : hunger >= 50 ? 'tone-bad' : hunger >= 25 ? 'tone-mid' : 'tone-ok';

  return (
    <div className="owl-dropdown">
      <div className="dd-header">
        <div className="dd-owl">
          <Owl mood={mood} style={owlStyle} size={42} accent="var(--or)" />
        </div>
        <div className="dd-meta">
          <div className="dd-name">NightOwl</div>
          <div className="dd-status">{status}</div>
        </div>
      </div>

      <div className="dd-section-label">— Reports</div>
      <button className="dd-item" onClick={() => onMenuAction('dashboard')}>
        <span className="dd-item-idx">01</span>
        <span>Open dashboard</span>
        <span className="dd-shortcut">⌘D</span>
      </button>
      <button className="dd-item" onClick={() => onMenuAction('today')}>
        <span className="dd-item-idx">02</span>
        <span>Today's stats</span>
        <span className="dd-arrow">→</span>
      </button>
      <button className="dd-item" onClick={() => onMenuAction('pet')}>
        <span className="dd-item-idx">03</span>
        <span>Pet stats</span>
        <span className="dd-arrow">→</span>
      </button>

      <div className="dd-sep"/>

      <div className="dd-section-label">— Care</div>
      <button className="dd-feed-row" onClick={() => onMenuAction('feed')}>
        <span className="dd-item-idx">04</span>
        <div className="dd-feed-meta">
          <div className="dd-feed-title">Feed the owl</div>
          <div className="dd-feed-bar">
            <div className="dd-hunger-track">
              <div className={"dd-hunger-fill bar-fill " + hungerTone} style={{ width: `${hunger}%` }} />
            </div>
            <div className="dd-hunger-num">{hunger}</div>
          </div>
        </div>
      </button>

      <div className="dd-sep"/>

      <div className="dd-section-label">— Export</div>
      <button className="dd-item" onClick={() => onMenuAction('obsidian')}>
        <span className="dd-item-idx">05</span>
        <span>Export to Obsidian</span>
        <span className="dd-arrow">↗</span>
      </button>

      <div className="dd-sep"/>

      <button className="dd-item dd-quit" onClick={() => onMenuAction('quit')}>
        <span className="dd-item-idx">06</span>
        <span>Quit NightOwl</span>
        <span className="dd-shortcut">⌘Q</span>
      </button>
    </div>
  );
}

// macOS notification toast — sharp, hairline, mono eyebrow
function NotificationToast({ id, title, body, kind, mood, owlStyle, onDismiss }) {
  return (
    <div className={"notif-toast kind-" + (kind || 'default')}>
      <div className="notif-icon">
        <Owl mood={mood || 'suspicious'} style={owlStyle} size={32} accent="var(--or)" />
      </div>
      <div className="notif-body">
        <div className="notif-app"><span>NightOwl</span></div>
        <div className="notif-title">{title}</div>
        <div className="notif-text">{body}</div>
      </div>
      <button className="notif-dismiss" onClick={() => onDismiss(id)} aria-label="Dismiss">
        <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 1.5 L 7.5 7.5 M 7.5 1.5 L 1.5 7.5" stroke="currentColor" strokeWidth="1.2"/></svg>
      </button>
    </div>
  );
}

// Pet stats popover — owl-only, no today graph
function PetStatsPopover({ hunger, totalFeeds, timesDied, mood, owlStyle, onClose, onFeed }) {
  const moodText = {
    happy: "Happy", content: "Content", suspicious: "Suspicious", worried: "Worried",
    hungry: "Hungry", starving: "Starving", critical: "Critical", dead: "Deceased",
  }[mood];
  const moodSub = {
    happy: "All needs met. Watching you.",
    content: "Fed. Judging silently.",
    suspicious: "It's getting late. The owl notices.",
    worried: "Why are we still awake.",
    hungry: "Demands tribute.",
    starving: "Eating the WiFi signal.",
    critical: "Writing its will. You're not in it.",
    dead: "Respawned. Remembers everything.",
  }[mood];
  const filled = Math.round(hunger / 10);

  return (
    <div className="popover">
      <div className="pop-header">
        <div className="pop-title">— Pet stats</div>
        <button className="pop-close" onClick={onClose}>
          <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 1.5 L 7.5 7.5 M 7.5 1.5 L 1.5 7.5" stroke="currentColor" strokeWidth="1.2"/></svg>
        </button>
      </div>

      <div className="pop-hero">
        <div className="pop-owl-wrap">
          <Owl mood={mood} style={owlStyle} size={104} accent="var(--or)" />
        </div>
        <div className="pop-mood">{moodText}</div>
        <div className="pop-mood-sub">{moodSub}</div>
      </div>

      <div className="pop-section">
        <div className="pop-section-row">
          <div className="pop-section-label">— Hunger</div>
          <div className="pop-section-value">{hunger} / 100</div>
        </div>
        <div className="pop-hunger-row">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={"pop-hunger-cell" + (i < filled ? " full" : "")}
              style={i < filled ? { background:
                hunger >= 75 ? 'var(--re)' : hunger >= 50 ? 'var(--or)' : hunger >= 25 ? 'var(--ye)' : 'var(--gr)' } : undefined}
            />
          ))}
        </div>
      </div>

      <div className="pop-grid">
        <div className="pop-stat-cell">
          <div className="pop-stat-num">{totalFeeds}</div>
          <div className="pop-stat-lbl">Feeds given</div>
        </div>
        <div className="pop-stat-cell">
          <div className="pop-stat-num" style={{ color: timesDied > 0 ? 'var(--re)' : undefined }}>{timesDied}</div>
          <div className="pop-stat-lbl">Times killed</div>
        </div>
      </div>

      <button className="pop-feed-btn" onClick={onFeed}>
        Feed the owl
      </button>
    </div>
  );
}

// Today's preview popover — graph of today's activity
function TodayPreviewPopover({ hour, todayData, onClose, onOpenDashboard }) {
  const stopRaw = window.normHour(hour);
  const tone = window.rawTone(stopRaw);
  const verdict = window.rawVerdict(stopRaw);
  const startStr = '9:14 AM';
  const lastStr = window.hourLabel(hour);
  const activeHours = todayData.length;

  return (
    <div className="popover popover-today">
      <div className="pop-header">
        <div className="pop-title">— Today's stats</div>
        <button className="pop-close" onClick={onClose}>
          <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1.5 1.5 L 7.5 7.5 M 7.5 1.5 L 1.5 7.5" stroke="currentColor" strokeWidth="1.2"/></svg>
        </button>
      </div>

      <div className="pop-today-hero">
        <div className="pop-today-row">
          <div className="pop-section-label">— Stop time</div>
          <div className={"pop-today-verdict tone-" + tone}>{verdict}</div>
        </div>
        <div className="pop-today-time">{lastStr}</div>
      </div>

      <div className="pop-section">
        <div className="pop-section-row">
          <div className="pop-section-label">— Hourly activity</div>
          <div className="pop-section-value">{startStr} — now</div>
        </div>
        <TodayMiniChart data={todayData} />
      </div>

      <div className="pop-grid">
        <div className="pop-stat-cell">
          <div className="pop-stat-num">{activeHours}</div>
          <div className="pop-stat-lbl">Active hours</div>
        </div>
        <div className="pop-stat-cell">
          <div className="pop-stat-num">{startStr.replace(' AM','')}<span style={{ fontSize: 'var(--fs-14)', color: 'var(--tx-3)', marginLeft: 4 }}>am</span></div>
          <div className="pop-stat-lbl">Started</div>
        </div>
      </div>

      <button className="pop-feed-btn pop-secondary" onClick={onOpenDashboard}>
        Open full dashboard →
      </button>
    </div>
  );
}

function TodayMiniChart({ data }) {
  const W = 308, H = 96, padL = 0, padR = 0, padT = 8, padB = 18;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const barW = innerW / Math.max(data.length, 12);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      <line x1={0} y1={H - padB} x2={W} y2={H - padB} stroke="var(--ui)" />
      {data.map((d, i) => {
        const bx = padL + i * barW + 1;
        const bw = Math.max(1, barW - 2);
        const bh = Math.max(2, d.intensity * innerH);
        const y = H - padB - bh;
        const fill = d.tone === 'danger' ? 'var(--re)'
                   : d.tone === 'bad' ? 'var(--or)'
                   : d.tone === 'mid' ? 'var(--ye)'
                   : 'var(--gr)';
        return (
          <g key={i}>
            <rect x={bx} y={y} width={bw} height={bh} fill={fill} />
            {(i % 3 === 0 || i === data.length - 1) && (
              <text x={bx + bw / 2} y={H - 4} textAnchor="middle" fill="var(--tx-3)" fontSize="9" fontFamily="var(--font-mono)">
                {d.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

Object.assign(window, { MenuBar, OwlDropdown, NotificationToast, PetStatsPopover, TodayPreviewPopover });
