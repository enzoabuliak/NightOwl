// NightOwl — main app

const { useState, useEffect, useRef } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "layout": "cards",
  "owlStyle": "geometric",
  "accent": "#DA702C",
  "tone": "sharp"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Time scrubber: 0 = 6 PM, 660 = 5 AM
  const [minute, setMinute] = useState(60 * 4 + 30); // 10:30 PM
  const hour = (18 + minute / 60) % 24;

  // Pet state
  const [hunger, setHunger] = useState(38);
  const [totalFeeds, setTotalFeeds] = useState(7);
  const [timesDied, setTimesDied] = useState(1);

  // UI state
  const [dropdownOpen, setDropdownOpen] = useState(true);
  const [showPet, setShowPet] = useState(false);
  const [showToday, setShowToday] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(true);
  const [notifs, setNotifs] = useState([]);

  // Mouse position retained for potential effects (currently unused)
  const [mouse, setMouse] = useState({ x: 50, y: 30 });
  useEffect(() => {
    // no-op
  }, []);

  // Hunger from scrubber
  useEffect(() => {
    const h = Math.floor(hour) % 24;
    const isLate = h >= 22 || h < 6;
    const base = 20 + Math.min(80, minute * 0.12 + (isLate ? 15 : 0));
    setHunger(Math.min(100, Math.round(base)));
  }, [minute]);

  const mood = window.owlMood(hour, hunger);
  const week = window.mockWeek(hour);
  const todayData = window.mockToday(hour);

  const pushNotif = (n) => {
    const id = Date.now() + Math.random();
    setNotifs((cur) => [...cur, { id, ...n }]);
    setTimeout(() => setNotifs((cur) => cur.filter(x => x.id !== id)), 8000);
  };
  const dismissNotif = (id) => setNotifs((cur) => cur.filter(x => x.id !== id));

  const lastShameKey = useRef(null);
  useEffect(() => {
    const h = Math.floor(hour);
    if (h >= 22 || h < 6) {
      const key = `shame-${h}`;
      if (lastShameKey.current !== key) {
        lastShameKey.current = key;
        pushNotif({
          title: "Night owl report",
          body: window.getShame(h, t.tone),
          kind: h >= 2 && h < 6 ? 'danger' : h === 0 || h === 1 ? 'warn' : 'default',
          mood,
        });
      }
    } else if (h < 22 && h >= 6) {
      lastShameKey.current = null;
    }
  }, [Math.floor(hour), t.tone]);

  const feed = () => {
    setHunger(h => Math.max(0, h - 35));
    setTotalFeeds(c => c + 1);
    pushNotif({
      title: "Owl fed",
      body: hunger < 50 ? "The owl accepts your offering. It is — mostly satisfied." : "Your owl is happy and full.",
      kind: 'ok',
      mood: 'happy',
    });
  };

  const onMenuAction = (action) => {
    if (action === 'dashboard') { setDashboardOpen(true); setDropdownOpen(false); }
    else if (action === 'today') { setShowToday(true); setShowPet(false); setDropdownOpen(false); }
    else if (action === 'pet') { setShowPet(true); setShowToday(false); setDropdownOpen(false); }
    else if (action === 'feed') { feed(); }
    else if (action === 'obsidian') {
      pushNotif({ title: "Sent to Obsidian", body: "Opening a new note with this week's summary.", kind: 'ok', mood: 'content' });
      setDropdownOpen(false);
    }
    else if (action === 'quit') { setDropdownOpen(false); }
  };

  return (
    <div className="desk-root" style={{
      '--accent': t.accent,
    }}>
      

      <MenuBar
        hour={hour}
        hunger={hunger}
        mood={mood}
        owlStyle={t.owlStyle}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        onMenuAction={onMenuAction}
      />

      {dropdownOpen && (
        <OwlDropdown
          hour={hour}
          hunger={hunger}
          mood={mood}
          owlStyle={t.owlStyle}
          onMenuAction={onMenuAction}
        />
      )}

      <div className="desk-canvas">
        {dashboardOpen ? (
          <Dashboard
            layout={t.layout}
            week={week}
            hour={hour}
            hunger={hunger}
            mood={mood}
            owlStyle={t.owlStyle}
            onClose={() => setDashboardOpen(false)}
          />
        ) : (
          <button className="open-dash-btn" onClick={() => setDashboardOpen(true)}>
            Open dashboard →
          </button>
        )}
      </div>

      {showPet && (
        <PetStatsPopover
          hunger={hunger}
          totalFeeds={totalFeeds}
          timesDied={timesDied}
          mood={mood}
          owlStyle={t.owlStyle}
          onClose={() => setShowPet(false)}
          onFeed={feed}
        />
      )}

      {showToday && (
        <TodayPreviewPopover
          hour={hour}
          todayData={todayData}
          onClose={() => setShowToday(false)}
          onOpenDashboard={() => { setShowToday(false); setDashboardOpen(true); }}
        />
      )}

      <div className="notif-stack">
        {notifs.map(n => (
          <NotificationToast
            key={n.id}
            id={n.id}
            title={n.title}
            body={n.body}
            kind={n.kind}
            mood={n.mood || mood}
            owlStyle={t.owlStyle}
            onDismiss={dismissNotif}
          />
        ))}
      </div>

      <Scrubber
        minute={minute}
        setMinute={setMinute}
        hour={hour}
        hunger={hunger}
        mood={mood}
        owlStyle={t.owlStyle}
        onFeed={feed}
        onPushTest={() => pushNotif({
          title: "Night owl report",
          body: window.getShame(Math.floor(hour), t.tone),
          mood,
        })}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakColor
            label="Accent"
            value={t.accent}
            onChange={v => setTweak('accent', v)}
            options={['#DA702C', '#D14D41', '#D0A215', '#879A39', '#3AA99F', '#4385BE', '#8B7EC8', '#CE5D97']}
          />
        </TweakSection>

        <TweakSection label="Dashboard">
          <TweakSelect label="Layout" value={t.layout} onChange={v => setTweak('layout', v)} options={[
            { value: 'cards', label: 'Stat row + chart' },
            { value: 'hero', label: 'Hero shame score' },
            { value: 'timeline', label: 'Timeline list' },
          ]}/>
        </TweakSection>

        <TweakSection label="Owl">
          <TweakSelect label="Character" value={t.owlStyle} onChange={v => setTweak('owlStyle', v)} options={[
            { value: 'geometric', label: 'Geometric' },
            { value: 'outline', label: 'Outline' },
            { value: 'mono', label: 'Monochrome' },
          ]}/>
        </TweakSection>

        <TweakSection label="Shame voice">
          <TweakRadio label="Voice" value={t.tone} onChange={v => setTweak('tone', v)} options={[
            { value: 'sharp', label: 'Sharp' },
            { value: 'dry', label: 'Dry' },
            { value: 'gentle', label: 'Gentle' },
          ]}/>
          <div className="tweak-preview">
            <div className="tweak-preview-lbl">— Sample at {String(Math.floor(hour) % 24).padStart(2, '0')}:00</div>
            <div className="tweak-preview-txt">{window.getShame(Math.floor(hour) % 24, t.tone)}</div>
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

// ── Scrubber ─────────────────────────────────────────────────────────────────
function Scrubber({ minute, setMinute, hour, hunger, mood, owlStyle, onFeed, onPushTest }) {
  const max = 60 * 11;
  const pct = (minute / max) * 100;
  const tickHours = [18, 20, 22, 24, 26, 28, 29];
  const tLabel = (h) => {
    const x = h % 24;
    if (x === 0) return '12 AM';
    if (x < 12) return `${x} AM`;
    if (x === 12) return '12 PM';
    return `${x - 12} PM`;
  };
  const phaseLabel = (() => {
    const h = Math.floor(hour) % 24;
    if (h >= 18 && h < 22) return 'Dignified hours';
    if (h >= 22 && h < 24) return 'Night owl territory';
    if (h === 0 || h === 1) return 'Deeply irresponsible';
    if (h >= 2 && h < 6) return 'Goblin mode';
    return 'Daytime';
  })();
  const phaseTone = (() => {
    const h = Math.floor(hour) % 24;
    if (h >= 2 && h < 6) return 'var(--re)';
    if (h === 0 || h === 1) return 'var(--or)';
    if (h >= 22) return 'var(--ye)';
    return 'var(--gr)';
  })();

  return (
    <div className="scrubber">
      <div className="scrub-top">
        <div className="scrub-clock">
          <div className="scrub-clock-num">{window.hourLabel(hour)}</div>
          <div className="scrub-clock-phase" style={{ color: phaseTone }}>{phaseLabel}</div>
        </div>
        <div className="scrub-mood">
          <div className="scrub-owl-mini">
            <Owl mood={mood} style={owlStyle} size={36} accent="var(--or)" />
          </div>
          <div className="scrub-mood-info">
            <div className="scrub-mood-lbl">— Mood</div>
            <div className="scrub-mood-val">{mood.replace(/^./, c => c.toUpperCase())}</div>
          </div>
          <div className="scrub-mood-sep"/>
          <div className="scrub-mood-info">
            <div className="scrub-mood-lbl">— Hunger</div>
            <div className="scrub-mood-val">{hunger}<span className="scrub-100">/100</span></div>
          </div>
        </div>
        <div className="scrub-actions">
          <button className="scrub-btn" onClick={onPushTest}>Push shame</button>
          <button className="scrub-btn scrub-btn-primary" onClick={onFeed}>Feed owl</button>
        </div>
      </div>

      <div className="scrub-track-wrap">
        <div className="scrub-zones">
          <div className="scrub-zone z-ok"    style={{ left: '0%',  width: `${4/11*100}%` }} />
          <div className="scrub-zone z-warn"  style={{ left: `${4/11*100}%`, width: `${2/11*100}%` }} />
          <div className="scrub-zone z-bad"   style={{ left: `${6/11*100}%`, width: `${2/11*100}%` }} />
          <div className="scrub-zone z-death" style={{ left: `${8/11*100}%`, width: `${3/11*100}%` }} />
        </div>
        <input
          type="range"
          min="0"
          max={max}
          value={minute}
          step="5"
          onChange={(e) => setMinute(Number(e.target.value))}
          className="scrub-range"
          style={{ '--pct': `${pct}%` }}
        />
        <div className="scrub-thumb-label" style={{ left: `${pct}%` }}>{window.hourLabel(hour)}</div>
        <div className="scrub-ticks">
          {tickHours.map(h => (
            <div key={h} className="scrub-tick" style={{ left: `${((h - 18) / 11) * 100}%` }}>
              <div className="scrub-tick-mark" />
              <div>{tLabel(h)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="scrub-legend">
        <span><i className="ok"/>Human hours</span>
        <span><i className="warn"/>Night owl (10 PM+)</span>
        <span><i className="bad"/>Past midnight</span>
        <span><i className="dn"/>Goblin mode (2 AM+)</span>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
