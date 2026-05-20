// Bauhaus-leaning geometric owl — constructed from primitives (circle, square, triangle).
// Monochrome by default; orange (--or) as the single accent eye light.
// Moods: happy | content | suspicious | worried | hungry | starving | critical | dead

const OwlMood = {
  happy:     { brow: 'flat',  pupil: 'normal', mouth: 'flat',  eyeOpen: 1 },
  content:   { brow: 'flat',  pupil: 'normal', mouth: 'flat',  eyeOpen: 1 },
  suspicious:{ brow: 'down',  pupil: 'side',   mouth: 'flat',  eyeOpen: 0.7 },
  worried:   { brow: 'up',    pupil: 'down',   mouth: 'frown', eyeOpen: 1 },
  hungry:    { brow: 'flat',  pupil: 'big',    mouth: 'open',  eyeOpen: 1 },
  starving:  { brow: 'down',  pupil: 'big',    mouth: 'open',  eyeOpen: 1 },
  critical:  { brow: 'down',  pupil: 'tiny',   mouth: 'open',  eyeOpen: 1 },
  dead:      { brow: 'flat',  pupil: 'x',      mouth: 'flat',  eyeOpen: 0 },
};

// styles: 'geometric' (default), 'outline', 'mono'
function Owl({ mood = 'content', style = 'geometric', size = 120, accent = 'var(--or)' }) {
  const m = OwlMood[mood] || OwlMood.content;
  const isOutline = style === 'outline';
  const isMono    = style === 'mono';

  // Palette — Flexoki-warm monochrome
  const bodyMain  = isMono ? 'currentColor' : 'var(--flx-base-200)';
  const bodyDark  = isMono ? 'currentColor' : 'var(--flx-base-700)';
  const bodyMid   = isMono ? 'currentColor' : 'var(--flx-base-500)';
  const beak      = isMono ? 'currentColor' : accent;
  const eyeBg     = isMono ? 'var(--bg)'    : 'var(--flx-black)';
  const stroke    = 'var(--flx-black)';

  const fill = (c) => (isOutline ? 'none' : c);

  return (
    <svg viewBox="0 0 100 110" width={size} height={size * 1.1} style={{ display: 'block', overflow: 'visible' }} aria-hidden="true">
      <g>
        {/* Feet — short orange lines */}
        <g stroke={accent} strokeWidth="1.8" strokeLinecap="square" fill="none">
          <path d="M 40 102 V 108 M 44 102 V 108 M 48 102 V 108" />
          <path d="M 52 102 V 108 M 56 102 V 108 M 60 102 V 108" />
        </g>

        {/* Body — rectangular with hairline outline, no rounded corners */}
        <rect x="22" y="58" width="56" height="46"
              fill={fill(bodyMain)}
              stroke={isOutline ? stroke : bodyDark}
              strokeWidth={isOutline ? 1.5 : 1} />

        {/* Belly chevron pattern (Bauhaus stripes) */}
        {!isOutline && !isMono && (
          <g stroke={bodyDark} strokeWidth="0.8" fill="none" opacity="0.4">
            <line x1="32" y1="72" x2="68" y2="72" />
            <line x1="32" y1="80" x2="68" y2="80" />
            <line x1="32" y1="88" x2="68" y2="88" />
            <line x1="32" y1="96" x2="68" y2="96" />
          </g>
        )}

        {/* Wings — triangles flanking the body */}
        <path d="M 22 58 L 22 95 L 14 78 Z"
              fill={fill(bodyDark)}
              stroke={isOutline ? stroke : 'none'}
              strokeWidth="1.5" strokeLinejoin="miter" />
        <path d="M 78 58 L 78 95 L 86 78 Z"
              fill={fill(bodyDark)}
              stroke={isOutline ? stroke : 'none'}
              strokeWidth="1.5" strokeLinejoin="miter" />

        {/* Head — circle (Bauhaus primitive) */}
        <circle cx="50" cy="38" r="28"
                fill={fill(bodyMain)}
                stroke={isOutline ? stroke : bodyDark}
                strokeWidth={isOutline ? 1.5 : 1} />

        {/* Ear tufts — small triangles */}
        <path d="M 28 16 L 22 6 L 34 14 Z"
              fill={fill(bodyDark)}
              stroke={isOutline ? stroke : 'none'} strokeWidth="1.5" strokeLinejoin="miter" />
        <path d="M 72 16 L 78 6 L 66 14 Z"
              fill={fill(bodyDark)}
              stroke={isOutline ? stroke : 'none'} strokeWidth="1.5" strokeLinejoin="miter" />

        {/* Face — invisible disc bound for eyes */}
        {/* Eyes */}
        <Eye side="left"  cx={38} cy={38} mood={m} eyeBg={eyeBg} stroke={bodyDark} accent={accent} isOutline={isOutline} />
        <Eye side="right" cx={62} cy={38} mood={m} eyeBg={eyeBg} stroke={bodyDark} accent={accent} isOutline={isOutline} />

        {/* Brow */}
        <Brow side="left"  cx={38} cy={28} mood={m} stroke={bodyDark} />
        <Brow side="right" cx={62} cy={28} mood={m} stroke={bodyDark} />

        {/* Beak — triangle */}
        <Beak mood={m} fill={fill(beak)} stroke={isOutline ? stroke : 'none'} />

        {/* Bauhaus signature — small orange square on body */}
        {!isOutline && !isMono && (
          <rect x="46" y="62" width="8" height="8" fill={accent} />
        )}
      </g>
    </svg>
  );
}

function Eye({ side, cx, cy, mood, eyeBg, stroke, accent, isOutline }) {
  if (mood.pupil === 'x') {
    return (
      <g stroke={stroke} strokeWidth="2" strokeLinecap="square" fill="none">
        <line x1={cx - 5} y1={cy - 5} x2={cx + 5} y2={cy + 5} />
        <line x1={cx + 5} y1={cy - 5} x2={cx - 5} y2={cy + 5} />
      </g>
    );
  }

  // Outer eye — circle
  const outerR = 8;
  let pupilR = 3;
  let pupilCx = cx, pupilCy = cy;
  if (mood.pupil === 'tiny') pupilR = 1.4;
  if (mood.pupil === 'big')  pupilR = 5;
  if (mood.pupil === 'side') pupilCx = cx + (side === 'left' ? 2 : -2);
  if (mood.pupil === 'down') pupilCy = cy + 2;

  return (
    <g>
      <circle cx={cx} cy={cy} r={outerR}
              fill={isOutline ? 'none' : eyeBg}
              stroke={stroke} strokeWidth="1" />
      <circle cx={pupilCx} cy={pupilCy} r={pupilR} fill={accent} />
      {/* Squint cover */}
      {mood.eyeOpen < 1 && (
        <rect x={cx - outerR - 1} y={cy - outerR - 1}
              width={(outerR + 1) * 2} height={(outerR + 1) * (1 - mood.eyeOpen) + 2}
              fill="var(--bg-2)" />
      )}
    </g>
  );
}

function Brow({ side, cx, cy, mood, stroke }) {
  if (mood.brow === 'flat') return null;
  let d;
  if (mood.brow === 'down') {
    // angry diagonal
    d = side === 'left'
      ? `M ${cx - 7} ${cy - 1} L ${cx + 6} ${cy + 5}`
      : `M ${cx + 7} ${cy - 1} L ${cx - 6} ${cy + 5}`;
  } else {
    // worried, raised inner
    d = side === 'left'
      ? `M ${cx - 7} ${cy + 4} L ${cx + 6} ${cy - 1}`
      : `M ${cx + 7} ${cy + 4} L ${cx - 6} ${cy - 1}`;
  }
  return <path d={d} stroke={stroke} strokeWidth="2" strokeLinecap="square" fill="none" />;
}

function Beak({ mood, fill: f, stroke: s }) {
  if (mood.mouth === 'open') {
    return (
      <g>
        <path d="M 46 49 L 54 49 L 50 58 Z" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="miter" />
      </g>
    );
  }
  if (mood.mouth === 'frown') {
    return (
      <g>
        <path d="M 46 49 L 54 49 L 50 55 Z" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="miter" />
      </g>
    );
  }
  return <path d="M 46 48 L 54 48 L 50 54 Z" fill={f} stroke={s} strokeWidth="1.5" strokeLinejoin="miter" />;
}

// Menu bar icon — uses currentColor, scales to 14-16px
function OwlIcon({ mood = 'content', size = 16, accent = 'var(--or)' }) {
  const m = OwlMood[mood] || OwlMood.content;
  const isDead = mood === 'dead' || mood === 'critical';

  return (
    <svg viewBox="0 0 16 16" width={size} height={size} style={{ display: 'block' }} aria-hidden="true">
      {/* Head circle */}
      <circle cx="8" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.2"/>
      {/* Ear tufts */}
      <path d="M 4 3 L 3 0.5 L 5.5 2.5 Z M 12 3 L 13 0.5 L 10.5 2.5 Z" fill="currentColor"/>
      {/* Eyes */}
      {isDead ? (
        <g stroke="currentColor" strokeWidth="0.8">
          <line x1="4.5" y1="5.5" x2="6.5" y2="7.5"/>
          <line x1="6.5" y1="5.5" x2="4.5" y2="7.5"/>
          <line x1="9.5" y1="5.5" x2="11.5" y2="7.5"/>
          <line x1="11.5" y1="5.5" x2="9.5" y2="7.5"/>
        </g>
      ) : (
        <g>
          <circle cx={5.5 + (m.pupil === 'side' ? 0.5 : 0)} cy={6.5 + (m.pupil === 'down' ? 0.4 : 0)} r={m.pupil === 'tiny' ? 0.6 : m.pupil === 'big' ? 1.4 : 1.1} fill={accent}/>
          <circle cx={10.5 + (m.pupil === 'side' ? -0.5 : 0)} cy={6.5 + (m.pupil === 'down' ? 0.4 : 0)} r={m.pupil === 'tiny' ? 0.6 : m.pupil === 'big' ? 1.4 : 1.1} fill={accent}/>
        </g>
      )}
      {/* Beak triangle */}
      {!isDead && <path d="M 7 9 L 9 9 L 8 11 Z" fill={accent}/>}
    </svg>
  );
}

Object.assign(window, { Owl, OwlIcon, OwlMood });
