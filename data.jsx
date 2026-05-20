// Mock data + helpers

const SHAME = {
  sharp: {
    22: [
      "10 PM. You're not a night owl yet — just a suspicious evening pigeon.",
      "Still working? Your future self just sighed audibly.",
      "The responsible people closed their laptops an hour ago.",
    ],
    23: [
      "11 PM. Whatever this is, it will look the same tomorrow morning.",
      "73% of 'quick tasks' started at 9 PM are still going at 11 PM. You're a statistic.",
      "Your pillow has filed a missing persons report.",
    ],
    0: [
      "Midnight. You've officially entered the 'I'll regret this' timezone.",
      "Cinderella went home at midnight. You are not Cinderella.",
      "The earlier version of you would be devastated.",
    ],
    1: [
      "1 AM. Your future self just woke up, saw what you're doing, and went back to sleep in protest.",
      "No important decision has ever been made at 1 AM. Zero. In all of human history.",
      "The raccoons outside are asleep. You are losing to raccoons.",
    ],
    2: [
      "2 AM. You absolute goblin. What is wrong with you. Go to bed.",
      "Your bug-fixing is now a bug-generating service.",
      "You have transcended night owl status. You are a cryptid.",
    ],
    3: [
      "3 AM. I'm legally required to ask — have you blinked? Remembered your own name?",
      "Even I, a menu bar app, am tired on your behalf.",
      "At 3 AM, the gap between how good you think your work is and how good it is — infinite.",
    ],
    4: [
      "4 AM. You're speedrunning tomorrow. Any% no sleep.",
      "I have run out of shame. I am simply watching. Concerned.",
      "You are beyond circadian rhythm. You are eternal. You are exhausted.",
    ],
  },
  dry: {
    22: ["22:00. Optimal sleep window closed.", "Subject continues to type. Logging.", "Hour 14 of consciousness. Diminishing returns expected."],
    23: ["23:00. Cognitive performance below baseline.", "Recommendation — stop. Will be ignored.", "Working memory degrading at expected rate."],
    0:  ["00:00. Sleep debt accruing.", "Date boundary crossed. Tomorrow has begun without you.", "Cortisol elevation detected."],
    1:  ["01:00. Productivity metrics unreliable.", "Recommend ceasing operations.", "All subsequent decisions flagged for morning review."],
    2:  ["02:00. Sleep deficit — severe.", "Logging this. For the record.", "Judgment is now compromised. Documented."],
    3:  ["03:00. Below all reasonable thresholds.", "Recovery time has now exceeded sleep time.", "I cannot recommend any of this."],
    4:  ["04:00. Subject appears nocturnal.", "Database is concerned but professional.", "Filing this under 'incidents'."],
  },
  gentle: {
    22: ["It's getting late — maybe save your spot?", "Big day tomorrow. Rest is part of the work.", "I'd love for you to get some sleep tonight."],
    23: ["11 PM. Whatever it is, it'll wait.", "You've done enough today. Truly.", "Time to wind down, friend."],
    0:  ["Midnight. Please consider stopping.", "Your future self will thank you.", "It's okay to leave it for tomorrow."],
    1:  ["1 AM. I'm worried about you.", "This isn't urgent. Sleep is.", "Please. For me."],
    2:  ["2 AM. Please go to bed.", "Nothing good happens at 2 AM.", "I'll still be here tomorrow."],
    3:  ["3 AM. I'm just going to leave this here.", "You need rest more than you need this.", "Please?"],
    4:  ["4 AM. The sun will be up soon.", "Please rest.", "I love you. Go to sleep."],
  },
};

function getShame(hour, tone = 'sharp') {
  const t = SHAME[tone] || SHAME.sharp;
  const key = hour >= 22 ? hour : (hour <= 4 ? hour : 4);
  return (t[key] || t[4])[0];
}

function hourLabel(hour) {
  const h = Math.floor(hour);
  const m = Math.floor((hour - h) * 60);
  const period = h < 12 ? 'AM' : 'PM';
  const disp = (h % 12) || 12;
  return `${disp}:${m.toString().padStart(2, '0')} ${period}`;
}
function hourLabelShort(hour) {
  const h = Math.floor(hour) % 24;
  const m = Math.floor((hour - Math.floor(hour)) * 60);
  const period = h < 12 ? 'a' : 'p';
  const disp = (h % 12) || 12;
  return `${disp}:${m.toString().padStart(2,'0')}${period}`;
}

function owlMood(hour, hunger) {
  if (hunger >= 100) return 'dead';
  if (hunger >= 90)  return 'critical';
  if (hunger >= 75)  return 'starving';
  if (hunger >= 50)  return 'hungry';
  const h = Math.floor(hour) % 24;
  if (h >= 2 && h < 6) return 'critical';
  if (h === 0 || h === 1) return 'worried';
  if (h >= 22) return 'suspicious';
  return 'content';
}

// raw = stop-time in linear night hours (18 = 6 PM, 24 = midnight, 26 = 2 AM)
function normHour(h) { return h < 12 ? h + 24 : h; }
function rawTone(raw) {
  if (raw == null || raw < 18) return 'ok';
  if (raw >= 26) return 'danger';
  if (raw >= 24) return 'bad';
  if (raw >= 22) return 'mid';
  return 'ok';
}
function rawVerdict(raw) {
  if (raw >= 26) return 'Goblin mode';
  if (raw >= 24) return 'Past midnight';
  if (raw >= 22) return 'Night owl';
  return 'Human hours';
}

// Week (7 days ending today)
function mockWeek(todayHour) {
  return [
    { label: 'Mon', day: 14, raw: 23.3 },
    { label: 'Tue', day: 15, raw: 22.1 },
    { label: 'Wed', day: 16, raw: 24.7 },
    { label: 'Thu', day: 17, raw: 25.5 },
    { label: 'Fri', day: 18, raw: 21.8 },
    { label: 'Sat', day: 19, raw: 26.2 },
    { label: 'Sun', day: 20, raw: normHour(todayHour) },
  ];
}

// Month (30 days)
function mockMonth(todayHour) {
  // Deterministic pseudo-random; varies by day-of-month
  const out = [];
  const seed = (n) => { let x = Math.sin(n * 137.508) * 10000; return x - Math.floor(x); };
  for (let i = 1; i <= 30; i++) {
    if (i === 30) {
      out.push({ day: i, raw: normHour(todayHour) });
    } else {
      // Weekday vs weekend pattern
      const dow = (i + 1) % 7;
      const weekend = (dow === 0 || dow === 6);
      const base = weekend ? 24.5 : 22.5;
      const variance = (seed(i) - 0.5) * 5;
      const raw = Math.max(20, Math.min(28, base + variance));
      // Skip a few "not tracked" days
      out.push({ day: i, raw: (seed(i + 100) > 0.9) ? null : raw });
    }
  }
  return out;
}

// 6 months — aggregated by week
function mockSixMonths(todayHour) {
  const months = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'];
  const seed = (n) => { let x = Math.sin(n * 91.3) * 10000; return x - Math.floor(x); };
  const out = [];
  let weekNum = 0;
  for (let m = 0; m < 6; m++) {
    for (let w = 0; w < 4; w++) {
      weekNum++;
      const drift = m * 0.15; // gradually getting later toward May
      const variance = (seed(weekNum) - 0.5) * 2.5;
      const raw = 22 + drift + variance + (w === 3 ? 1 : 0);
      out.push({
        label: `${months[m]} W${w + 1}`,
        month: months[m],
        week: w + 1,
        raw: Math.max(20.5, Math.min(27, raw)),
      });
    }
  }
  // Last bar = current week's avg incorporating today
  out[out.length - 1].raw = normHour(todayHour);
  return out;
}

// All time — by month
function mockAllTime(todayHour) {
  const months = [
    { label: 'Aug \u201925', raw: 22.4 },
    { label: 'Sep \u201925', raw: 23.1 },
    { label: 'Oct \u201925', raw: 22.8 },
    { label: 'Nov \u201925', raw: 23.5 },
    { label: 'Dec \u201925', raw: 24.0 },
    { label: 'Jan \u201926', raw: 23.7 },
    { label: 'Feb \u201926', raw: 24.4 },
    { label: 'Mar \u201926', raw: 25.1 },
    { label: 'Apr \u201926', raw: 25.4 },
    { label: 'May \u201926', raw: normHour(todayHour) },
  ];
  return months;
}

// Today — hourly intensity from wake to now
function mockToday(hour) {
  // Synthesize a per-hour "activity" bar from 9 AM to now
  const out = [];
  const startH = 9;
  const endH = hour > startH ? hour : startH;
  for (let h = startH; h < 30; h++) { // 30 = 6am next day, plenty of range
    const actual = h % 24;
    if (h > endH) break;
    const period = actual < 12 ? 'AM' : 'PM';
    const disp = (actual % 12) || 12;
    // Activity intensity: high during workday, dip 6-8pm, climb back
    let intensity = 0.6;
    if (actual >= 9 && actual < 12)  intensity = 0.85;
    else if (actual >= 12 && actual < 14) intensity = 0.55;
    else if (actual >= 14 && actual < 18) intensity = 0.9;
    else if (actual >= 18 && actual < 20) intensity = 0.35;
    else if (actual >= 20 && actual < 22) intensity = 0.7;
    else if (actual >= 22 || actual < 4) intensity = 0.95;
    // Final partial hour
    if (h === Math.floor(endH)) intensity *= (endH - Math.floor(endH)) || 0.4;
    out.push({
      hourRaw: h,
      label: `${disp}${period.toLowerCase()}`,
      intensity,
      tone: actual >= 2 && actual < 6 ? 'danger'
          : actual === 0 || actual === 1 ? 'bad'
          : actual >= 22 ? 'mid'
          : 'ok',
    });
  }
  return out;
}

function shameScore(data) {
  const valid = data.filter(d => d.raw != null);
  if (!valid.length) return 0;
  const scores = valid.map(d => {
    if (d.raw >= 26) return 100;
    if (d.raw >= 24) return 70;
    if (d.raw >= 22) return 40;
    return 10;
  });
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}
function shameLabel(score) {
  if (score >= 80) return { label: 'Vampire',       tone: 'danger', color: 'var(--re)' };
  if (score >= 60) return { label: 'Night goblin',  tone: 'bad',    color: 'var(--or)' };
  if (score >= 40) return { label: 'Suspicious',    tone: 'mid',    color: 'var(--ye)' };
  if (score >= 20) return { label: 'Mostly fine',   tone: 'ok',     color: 'var(--gr)' };
  return                  { label: 'Angel',         tone: 'ok',     color: 'var(--cy)' };
}

Object.assign(window, {
  SHAME, getShame,
  hourLabel, hourLabelShort, owlMood,
  mockWeek, mockMonth, mockSixMonths, mockAllTime, mockToday,
  normHour, rawTone, rawVerdict, shameScore, shameLabel,
});
