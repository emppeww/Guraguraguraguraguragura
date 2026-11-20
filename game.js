"use strict";
const $ = (id) => document.getElementById(id);
const cap = 1e280,
  key = "rem-garden-v2",
  clock = () => Date.now();
const bound = (n, max = cap) =>
  Number.isFinite(n) ? Math.max(0, Math.min(n, max)) : 0;
const items = [];
function item(id, name, group, base, scale, effect, power, unit) {
  items.push({ id, name, group, base, scale, effect, power, unit });
}
item(
  "finger",
  "Stronger Clicks",
  "Click arts",
  15,
  1.5,
  "tap",
  1,
  "hearts per tap",
);
for (const [i, name] of [
  "Rem’s Encouragement",
  "Oni Strength",
  "Demon Maid Power",
  "Heart Multiplier",
  "Critical Click Boost",
  "Ultimate Click Power",
  "Moonlit Promise",
].entries())
  item(
    "art" + i,
    name,
    "Click arts",
    90 * 8 ** i,
    1.22,
    "tap",
    4 * 5 ** i,
    "hearts per tap",
  );
for (const [id, name, base, scale, power] of [
  ["maid", "Maid Helpers", 30, 1.17, 1],
  ["tea", "Tea Service", 180, 1.18, 5],
  ["mansion", "Roswaal Mansion", 1200, 1.2, 25],
  ["spirit", "Spirit Blessing", 8500, 1.22, 100],
  ["legend", "Legendary Rem", 75000, 1.25, 1000],
  ["staff", "Mansion Workers", 560, 1.19, 13],
  ["sprite", "Spirit Helpers", 3000, 1.2, 52],
  ["royal", "Royal Support", 28000, 1.2, 340],
  ["magic", "Magical Production", 430000, 1.19, 4400],
  ["army", "Oni Army", 3e6, 1.18, 21000],
  ["factory", "Legendary Rem Factory", 2e7, 1.19, 1.2e5],
  ["dimension", "Infinite Rem Dimension", 2e8, 1.2, 9e5],
])
  item(
    id,
    name,
    "Estate generators",
    base,
    scale,
    "auto",
    power,
    "hearts per second",
  );
for (const [id, name, base, power, unit] of [
  ["crit", "Critical Chance", 500, 0.5, "% critical chance (max 75%)"],
  ["damage", "Critical Damage", 750, 0.25, "critical multiplier"],
  ["global", "Global Production", 3000, 5, "% all earnings"],
  ["offline", "Offline Earnings", 2500, 1, "hour away (max 48h)"],
  ["combo", "Combo Duration", 350, 0.25, "seconds between taps"],
  ["gold", "Golden Invitation", 1200, 2, "% faster encounters"],
  ["duration", "Event Duration", 850, 1, "second per blessing"],
  ["luck", "Lucky Charm", 1500, 0.25, "% lucky chance (max 25%)"],
  ["echo", "Crystal Echo", 5e4, 1, "% permanent bonus on rebirth"],
  ["hearth", "Warm Hearth", 3500, 5, "% offline hearts"],
])
  item(id, name, "Enchantments", base, 1.45, id, power, unit);
const opts = {
  master: 80,
  volume: 80,
  cooldown: 380,
  intensity: 75,
  particles: 2,
  shake: false,
  light: false,
  notation: "Short",
  reduced: false,
  autosave: true,
  idle: false,
  garden: "Moonlit",
  effect: "Hearts",
  season: false,
};
const initial = () => ({
  version: 2,
  points: 0,
  total: 0,
  run: 0,
  clicks: 0,
  critical: 0,
  highest: 0,
  bought: 0,
  golden: 0,
  prestige: 0,
  time: 0,
  offline: 0,
  peak: 0,
  crystals: 0,
  memory: 0,
  daily: 0,
  last: clock(),
  muted: false,
  owned: {},
  skills: {},
  settings: { ...opts },
  badges: {},
  goals: 0,
  lucky: 0,
});
const skills = [
  ["Roots", "Estate roots", "+15% generator output"],
  ["Focus", "Oni focus", "+20% tap strength"],
  ["Star", "Star garden", "Unlock crystal generators"],
];
item(
  "nova",
  "Crystal Observatory",
  "Crystal generators",
  1e6,
  1.18,
  "auto",
  15000,
  "hearts per second",
);
function decode(raw) {
  if (
    !raw ||
    typeof raw !== "object" ||
    !Number.isFinite(raw.points) ||
    !Number.isFinite(raw.total) ||
    (raw.version !== undefined && raw.version !== 2)
  )
    throw Error("Invalid save");
  const s = initial();
  for (const k in s)
    if (typeof s[k] === "number" && k !== "version")
      s[k] = bound(raw[k] ?? s[k]);
  for (const u of items)
    s.owned[u.id] = Math.floor(bound(raw.owned?.[u.id], 10000));
  for (const [id] of skills)
    s.skills[id] = Math.floor(bound(raw.skills?.[id], 1000));
  if (!raw.version) {
    s.run = s.total;
    s.bought = Object.values(s.owned).reduce((a, b) => a + b, 0);
  }
  s.peak = Math.max(s.peak, s.points);
  s.muted = raw.muted === true;
  for (const [k, v] of Object.entries(opts)) {
    const val = raw.settings?.[k];
    if (typeof val === typeof v)
      s.settings[k] =
        typeof v === "number"
          ? bound(val, k === "cooldown" ? 1500 : k === "particles" ? 5 : 100)
          : val;
  }
  for (const a of awards)
    if (raw.badges?.[a.id] === true) s.badges[a.id] = true;
  return s;
}
const awards = [];
for (const [metric, title, start] of [
  ["clicks", "Garden visitor", 1],
  ["total", "Heart keeper", 1],
  ["auto", "Estate steward", 1],
  ["bought", "Collector", 1],
  ["critical", "Oni spark", 1],
  ["highest", "Rhythm keeper", 2],
  ["golden", "Golden witness", 1],
  ["prestige", "Reborn", 1],
  ["time", "Moon watcher", 60],
  ["lucky", "Lucky star", 1],
]) {
  for (let i = 0; i < 12; i++) {
    const goal =
      start *
      (metric === "highest" ? i + 1 : metric === "prestige" ? i + 1 : 2 ** i);
    awards.push({
      id: metric + i,
      metric,
      title: title + " " + (i + 1),
      goal,
      rarity:
        metric === "lucky"
          ? "Secret"
          : ["Common", "Rare", "Epic", "Legendary"][Math.floor(i / 3)],
    });
  }
}
for (const [i, title] of [
  "First Love",
  "Rem Fan",
  "Dedicated",
  "Mansion Royalty",
  "Rem Forever",
  "Legendary",
].entries())
  awards.push({
    id: "legacy" + i,
    metric: "total",
    title,
    goal: [1, 100, 1000, 10000, 100000, 1000000][i],
    rarity: "Rare",
  });
let s,
  loadError = false;
for (const slot of [key, "rem-clicker-v1"]) {
  try {
    const raw = localStorage.getItem(slot);
    if (raw) {
      s = decode(JSON.parse(raw));
      break;
    }
  } catch {
    loadError = true;
    try {
      const raw = localStorage.getItem(slot);
      if (raw) localStorage.setItem(slot + "-recovery", raw);
    } catch {}
  }
}
s ??= decode(initial());
const owned = (id) => s.owned[id] || 0;
const rate = (type) =>
  Math.min(
    cap,
    items.reduce(
      (v, u) => v + (u.effect === type ? u.power * owned(u.id) : 0),
      type === "tap" ? 1 : 0,
    ) *
      (1 + s.memory / 100 + owned("global") * 0.05) *
      (1 +
        (s.skills[type === "tap" ? "Focus" : "Roots"] || 0) *
          (type === "tap" ? 0.2 : 0.15)),
  );
const compact = new Intl.NumberFormat("en", {
  notation: "compact",
  maximumFractionDigits: 1,
});
function fmt(v) {
  if (v >= 1e21 || (s.settings.notation === "Scientific" && v >= 1000))
    return v.toExponential(2);
  if (v >= 1e15)
    return (
      (v / (v >= 1e18 ? 1e18 : 1e15)).toFixed(2) + (v >= 1e18 ? " Qi" : " Qa")
    );
  return compact.format(Math.floor(v));
}
function earn(v) {
  for (const k of ["points", "total", "run"]) s[k] = Math.min(cap, s[k] + v);
  s.peak = Math.max(s.peak, s.points);
}
function message(msg) {
  $("notice").textContent = msg;
  clearTimeout(message.timer);
  message.timer = setTimeout(() => ($("notice").textContent = ""), 3200);
}
function save() {
  s.last = clock();
  try {
    localStorage.setItem(key, JSON.stringify(s));
    return true;
  } catch {
    message("Storage unavailable. Export your save in Settings.");
    return false;
  }
}
function offline() {
  const dt = Math.min(
    Math.max(0, (clock() - s.last) / 1000),
    3600 * Math.min(48, 8 + owned("offline")),
  );
  if (dt > 5 && rate("auto")) {
    const n = Math.min(cap, dt * rate("auto") * (1 + 0.05 * owned("hearth")));
    earn(n);
    s.offline = Math.min(cap, s.offline + n);
    $("away").textContent = fmt(n) + " hearts earned while you were away.";
    if (!document.querySelector("dialog").open)
      document.querySelector("dialog").showModal();
  }
  save();
}
let page = "Home",
  streak = 0,
  lastTap = 0,
  lastSound = -Infinity,
  active = "",
  until = 0,
  nextEvent = clock() + 45000,
  offer = "",
  expires = 0,
  lastTick = clock(),
  history = [];
function mult(kind) {
  return clock() < until &&
    (active === "Mansion Festival" ||
      active === "Golden Rem" ||
      kind === "auto")
    ? 2
    : 1;
}
function sound() {
  const now = performance.now();
  if (s.muted || now - lastSound < Math.max(100, s.settings.cooldown)) return;
  lastSound = now;
  const a = $("voice");
  clearTimeout(sound.timer);
  try {
    a.currentTime = 0;
    a.volume = (s.settings.master * s.settings.volume) / 10000;
    a.play().catch(() => {});
    sound.timer = setTimeout(() => a.pause(), 310);
  } catch {}
}
function animate(el, frames) {
  if (
    !s.settings.reduced &&
    !matchMedia("(prefers-reduced-motion: reduce)").matches &&
    s.settings.intensity
  ) {
    el.getAnimations().forEach((a) => a.cancel());
    el.animate(frames, {
      duration: 100 + s.settings.intensity,
      easing: "ease-out",
    });
  }
}
$("tap").onclick = () => {
  const now = clock();
  streak = now - lastTap < 3200 + 250 * owned("combo") ? streak + 1 : 1;
  lastTap = now;
  s.highest = Math.max(s.highest, streak);
  s.clicks++;
  const crit = Math.random() < Math.min(0.75, 0.045 + 0.005 * owned("crit")),
    lucky = Math.random() < Math.min(0.25, 0.012 + 0.0025 * owned("luck"));
  if (crit) s.critical++;
  if (lucky) s.lucky++;
  const n =
    rate("tap") *
    (1 + Math.min(30, streak - 1) / 30) *
    mult("tap") *
    (crit ? 3 + 0.25 * owned("damage") : 1) *
    (lucky ? 5 : 1) *
    (streak % 25 === 0 ? 2 : 1);
  earn(n);
  sound();
  animate($("portrait"), [
    { transform: "scale(.92)" },
    { transform: "scale(1)" },
  ]);
  if (crit && s.settings.shake)
    animate(document.querySelector(".scene"), [
      { transform: "translateX(-3px)" },
      { transform: "translateX(3px)" },
      { transform: "none" },
    ]);
  if (
    !s.settings.idle &&
    !s.settings.reduced &&
    s.settings.intensity &&
    $("tap").childElementCount < 2 + s.settings.particles * 2
  ) {
    let el = document.createElement("span");
    el.className = "float";
    el.textContent =
      (crit ? "Critical! " : lucky ? "Lucky! " : "") +
      "+" +
      fmt(n) +
      (s.settings.effect === "Stars" ? " ✦" : " ♥");
    $("tap").append(el);
    setTimeout(() => el.remove(), 710);
  }
  drawHome();
};
function quote(u) {
  const count = owned(u.id),
    limit = Math.min(
      10000 - count,
      $("quantity").value === "Max" ? 10000 : Number($("quantity").value),
    );
  let cost = 0,
    n = 0;
  for (; n < limit; n++) {
    const p = Math.ceil(u.base * u.scale ** (count + n));
    if (
      p > cap - cost ||
      ($("quantity").value === "Max" && cost + p > s.points)
    )
      break;
    cost += p;
  }
  return {
    cost,
    n,
    ok:
      n > 0 &&
      cost <= s.points &&
      (n === limit || $("quantity").value === "Max"),
  };
}
function card(parent, title, desc, tag) {
  const el = document.createElement("article");
  el.className = "card";
  const small = document.createElement("small"),
    b = document.createElement("strong"),
    p = document.createElement("p");
  small.textContent = tag;
  b.textContent = title;
  p.textContent = desc;
  el.append(small, b, p);
  parent.append(el);
  return el;
}
const buys = [];
for (const group of new Set(items.map((u) => u.group))) {
  let section = document.createElement("details");
  section.open = true;
  section.dataset.group = group;
  const summary = document.createElement("summary");
  summary.textContent = group;
  const rows = document.createElement("div");
  rows.className = "rows";
  section.append(summary, rows);
  $("catalog").append(section);
  for (const u of items.filter((u) => u.group === group)) {
    const el = card(
      rows,
      u.name,
      "+" + u.power + " " + u.unit,
      { tap: "♡ Click", auto: "✧ Production" }[u.effect] || "◇ Enchantment",
    );
    const b = document.createElement("button");
    el.append(b);
    buys.push({ u, b, el, section });
    b.onclick = () => {
      const q = quote(u);
      if (!q.ok) return;
      s.points -= q.cost;
      s.owned[u.id] += q.n;
      s.bought += q.n;
      animate(b, [{ opacity: 0.4 }, { opacity: 1 }]);
      market();
    };
  }
}
function market() {
  for (const { u, b, el, section } of buys) {
    section.hidden =
      (page === "Upgrades") !== (u.group === "Enchantments") ||
      (u.group === "Crystal generators" && !s.skills.Star);
    el.hidden = !u.name.toLowerCase().includes($("search").value.toLowerCase());
    if (section.hidden || el.hidden || !section.open) continue;
    const q = quote(u);
    b.disabled = !q.ok;
    b.textContent =
      owned(u.id) +
      " owned · " +
      (q.n ? "Buy " + q.n + " · " + fmt(q.cost) : "Unavailable");
  }
}
$("catalog").addEventListener("toggle", market, true);
$("search").oninput = $("quantity").onchange = market;
const reward = () => Math.floor(Math.sqrt(s.run / 1e6));
$("rebirth").onclick = () => {
  const n = reward();
  if (
    !n ||
    !confirm(
      "Exchange this run and its shop upgrades for " +
        fmt(n) +
        " permanent Rem Crystals?",
    )
  )
    return;
  s.crystals += n;
  s.memory += 10 * n + owned("echo");
  s.prestige++;
  s.points = s.run = 0;
  for (const u of items) s.owned[u.id] = 0;
  streak = 0;
  active = offer = "";
  until = 0;
  $("event").hidden = true;
  save();
  show("Prestige");
  animate($("crystals"), [
    { transform: "scale(.8)", opacity: 0 },
    { transform: "none", opacity: 1 },
  ]);
  message("Rebirth complete ✦");
};
function tree() {
  const n = reward();
  $("crystals").textContent = fmt(s.crystals) + " Rem Crystals";
  $("rebirthInfo").textContent =
    "Permanent bonus +" +
    fmt(s.memory) +
    "% · Next rebirth grants " +
    fmt(n) +
    " crystals. First crystal at 1 million run hearts.";
  $("rebirth").disabled = !n;
  $("tree").replaceChildren();
  for (const [id, name, desc] of skills) {
    let level = s.skills[id] || 0,
      cost = 1 + level;
    const el = card($("tree"), name, desc, "Level " + level),
      b = document.createElement("button");
    b.textContent = "Learn · " + cost + " crystals";
    b.disabled =
      s.crystals < cost || (id === "Star" && (level > 0 || !s.skills.Roots));
    b.onclick = () => {
      if (s.crystals < cost) return;
      s.crystals -= cost;
      s.skills[id] = level + 1;
      save();
      tree();
    };
    el.append(b);
  }
}
const metrics = () => ({ ...s, auto: rate("auto") });
function check() {
  const m = metrics();
  let first = "";
  for (const a of awards)
    if (!s.badges[a.id] && m[a.metric] >= a.goal) {
      s.badges[a.id] = true;
      first ||= a.title;
    }
  if (first) message("Badge unlocked · " + first);
}
function badges() {
  const m = metrics();
  $("badges").replaceChildren();
  $("completion").textContent =
    Object.keys(s.badges).length +
    " / " +
    awards.length +
    " badges · " +
    Math.floor((100 * Object.keys(s.badges).length) / awards.length) +
    "% complete";
  for (const a of awards) {
    const done = s.badges[a.id],
      el = card(
        $("badges"),
        a.title,
        fmt(Math.min(a.goal, m[a.metric])) +
          " / " +
          fmt(a.goal) +
          " " +
          a.metric,
        a.rarity + (done ? " · Earned" : ""),
      );
    const p = document.createElement("progress");
    p.max = 1;
    p.value = done ? 1 : m[a.metric] / a.goal;
    el.append(p);
  }
}
function stats() {
  const values = {
    "Heart balance": s.points,
    "Lifetime hearts": s.total,
    "Total taps": s.clicks,
    "Base hearts per tap": rate("tap"),
    "Hearts per second": rate("auto") * mult("auto"),
    "Longest combo": s.highest,
    "Critical taps": s.critical,
    "Upgrades purchased": s.bought,
    "Badges earned": Object.keys(s.badges).length,
    Rebirths: s.prestige,
    "Minutes played": s.time / 60,
    "Offline hearts": s.offline,
    "Highest balance": s.peak,
    "Golden encounters": s.golden,
  };
  $("records").replaceChildren();
  for (const [name, v] of Object.entries(values))
    card($("records"), fmt(v), "", name);
  const ctx = $("chart").getContext("2d");
  ctx.clearRect(0, 0, 620, 90);
  ctx.fillStyle = "#8fc6df";
  history.forEach((v, i) =>
    ctx.fillRect(
      i * 10,
      90,
      8,
      -Math.max(1, (85 * v) / Math.max(1, ...history)),
    ),
  );
}
const events = [
  "Golden Rem",
  "Oni Awakening",
  "Mansion Festival",
  "Lucky Heart",
  "Rem’s Blessing",
];
function eventsTick() {
  const now = clock();
  if (offer && now > expires) {
    offer = "";
    $("event").hidden = true;
  }
  if (now >= nextEvent) {
    offer = events[Math.floor(Math.random() * 5)];
    if (offer === "Golden Rem") s.golden++;
    $("event").dataset.event = String(events.indexOf(offer));
    expires = now + 12000;
    nextEvent =
      now +
      15000 +
      (35000 + Math.random() * 35000) / (1 + 0.02 * owned("gold"));
    $("event").textContent = "✦ " + offer;
    $("event").hidden = false;
    animate($("event"), [{ opacity: 0 }, { opacity: 1 }]);
  }
}
$("event").onclick = () => {
  if (!offer || clock() > expires) return;
  if (offer === "Lucky Heart") {
    earn(Math.max(50, rate("auto") * 35, rate("tap") * 25));
    message("Lucky Heart collected");
  } else {
    active = offer;
    until =
      clock() +
      1000 * ([24, 18, 30, 0, 36][events.indexOf(offer)] + owned("duration"));
    message(active + " · double earnings");
  }
  offer = "";
  $("event").hidden = true;
  drawHome();
};
function day() {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}
$("daily").onclick = () => {
  if (s.daily >= day()) return;
  s.daily = day();
  const n = Math.max(75, rate("auto") * 90);
  earn(n);
  save();
  message("Daily gift · +" + fmt(n));
  drawHome();
};
function drawHome() {
  if (clock() - lastTap > 3200 + 250 * owned("combo")) streak = 0;
  $("balance").textContent = fmt(s.points);
  $("rates").textContent =
    fmt(rate("auto") * mult("auto")) +
    " / sec　·　" +
    fmt(rate("tap") * mult("tap")) +
    " / tap";
  $("combo").textContent =
    streak +
    " streak · ×" +
    (1 + Math.min(30, Math.max(0, streak - 1)) / 30).toFixed(2);
  $("meter").value = Math.min(30, streak);
  $("daily").disabled = s.daily >= day();
  $("daily").textContent = $("daily").disabled
    ? "Daily gift collected"
    : "Collect daily gift";
  $("buff").textContent =
    clock() < until
      ? active + " · " + Math.ceil((until - clock()) / 1000) + "s"
      : "";
  $("titleRank").textContent = s.prestige
    ? "Crystal guardian"
    : s.clicks >= 1000
      ? "Estate keeper"
      : s.clicks >= 100
        ? "Garden keeper"
        : "Garden visitor";
  const goal = 25 * 2 ** Math.min(45, s.goals);
  $("quest").textContent =
    s.goals >= 45
      ? "Estate guardian"
      : fmt(s.clicks) + " / " + fmt(goal) + " taps";
  if (s.goals < 45 && s.clicks >= goal) {
    s.goals++;
    earn(goal * 2);
    message("Tap quest complete · +" + fmt(goal * 2));
  }
}
function apply() {
  const o = s.settings;
  document.body.classList.toggle("light", o.light);
  document.body.classList.toggle("quiet", o.reduced || !o.intensity || o.idle);
  document.body.dataset.garden = o.season
    ? ["Moonlit", "Aurora", "Festival", "Moonlit"][
        Math.floor(new Date().getMonth() / 3)
      ]
    : o.garden;
  $("mute").textContent = s.muted ? "Sound off" : "Sound on";
  $("mute").setAttribute("aria-pressed", String(s.muted));
}
function settings() {
  const names = {
    master: "Master volume",
    volume: "Click volume",
    cooldown: "Sound cooldown (ms)",
    intensity: "Animation intensity",
    particles: "Particle density",
    shake: "Critical screen shake",
    light: "Light theme",
    notation: "Number format",
    reduced: "Reduce motion",
    autosave: "Save every 10 seconds",
    idle: "Quiet idle mode",
    garden: "Garden background",
    effect: "Click effect",
    season: "Seasonal colors",
  };
  $("options").replaceChildren();
  for (const [k, v] of Object.entries(opts)) {
    const label = document.createElement("label");
    label.className = "card";
    const title = document.createElement("strong");
    title.textContent = names[k];
    label.append(title);
    let input;
    if (typeof v === "string") {
      input = document.createElement("select");
      const choices =
        k === "garden"
          ? ["Moonlit", "Aurora", "Festival"]
          : k === "effect"
            ? ["Hearts", "Stars"]
            : ["Short", "Scientific"];
      for (const [i, name] of choices.entries()) {
        let option = new Option(name, name);
        option.disabled =
          (k === "garden" || k === "effect") && s.clicks < i * 100;
        if (option.disabled) option.textContent += " · " + i * 100 + " taps";
        input.add(option);
      }
      input.value = s.settings[k];
    } else {
      input = document.createElement("input");
      input.type = typeof v === "boolean" ? "checkbox" : "range";
      input.checked = s.settings[k] === true;
      input.max = k === "cooldown" ? 1500 : k === "particles" ? 5 : 100;
      input.min = k === "cooldown" ? 100 : 0;
      input.value = s.settings[k];
    }
    const out = document.createElement("output");
    if (input.type === "range") out.textContent = input.value;
    input.oninput = () => {
      s.settings[k] =
        input.type === "checkbox"
          ? input.checked
          : input.type === "range"
            ? Number(input.value)
            : input.value;
      if (input.type === "range") out.textContent = input.value;
      apply();
      save();
    };
    label.append(input, out);
    $("options").append(label);
  }
}
function show(name) {
  page = name;
  const marketPage = ["Shop", "Upgrades"].includes(name);
  document
    .querySelectorAll("main>section")
    .forEach((el) => (el.hidden = el.id !== (marketPage ? "market" : name)));
  for (const b of document.querySelectorAll("nav button"))
    b.classList.toggle("active", b.dataset.name === name);
  if (marketPage) {
    $("marketTitle").textContent =
      name === "Shop" ? "Estate shop" : "Enchantment atelier";
    market();
  }
  if (name === "Home") drawHome();
  if (name === "Achievements") badges();
  if (name === "Prestige") tree();
  if (name === "Statistics") stats();
  if (name === "Settings") settings();
}
for (const [i, name] of [
  "Home",
  "Shop",
  "Upgrades",
  "Achievements",
  "Prestige",
  "Statistics",
  "Settings",
].entries()) {
  const b = document.createElement("button");
  b.dataset.name = name;
  b.textContent = ["☾", "♧", "✧", "♜", "◇", "▥", "⚙"][i] + " " + name;
  b.onclick = () => show(name);
  document.querySelector("nav").append(b);
}
$("portrait").className = "original";
let customURL;
$("upload").onchange = (e) => {
  const file = e.target.files[0];
  if (!file?.type.startsWith("image/")) return;
  if (customURL) URL.revokeObjectURL(customURL);
  customURL = URL.createObjectURL(file);
  $("portrait").className = "";
  $("portrait").src = customURL;
  show("Home");
};
$("mute").onclick = () => {
  s.muted = !s.muted;
  if (s.muted) $("voice").pause();
  apply();
  save();
};
$("save").onclick = () => {
  if (save()) message("Progress saved");
};
$("backup").onclick = () => {
  s.last = clock();
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(s)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "rem-garden-save.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};
$("restore").onchange = async (e) => {
  const f = e.target.files[0];
  try {
    if (!f || f.size > 1e6) throw Error();
    const next = decode(JSON.parse(await f.text()));
    if (confirm("Replace current progress with this save?")) {
      s = next;
      save();
      location.reload();
    }
  } catch {
    message("Invalid save file. Current progress is safe.");
  }
  e.target.value = "";
};
$("reset").onclick = () => {
  if (
    confirm(
      "Erase all current progress, crystals and badges? Export a backup first if needed.",
    )
  ) {
    s = decode(initial());
    save();
    location.reload();
  }
};
let lastArchive = 0;
function tick() {
  if (document.hidden) return;
  const now = clock(),
    dt = Math.max(0, (now - lastTick) / 1000);
  lastTick = now;
  s.time += dt;
  earn(rate("auto") * dt * mult("auto"));
  eventsTick();
  check();
  history.push(rate("auto") * mult("auto"));
  if (history.length > 62) history.shift();
  if (page === "Home") drawHome();
  if (["Shop", "Upgrades"].includes(page)) market();
  if (page === "Statistics") stats();
  if (page === "Prestige") tree();
  if (page === "Achievements" && clock() - lastArchive > 5000) {
    badges();
    lastArchive = clock();
  }
}
document.addEventListener("visibilitychange", () => {
  document.body.classList.toggle("paused", document.hidden);
  if (document.hidden) {
    save();
    $("voice").pause();
  } else {
    offline();
    lastTick = clock();
  }
});
window.addEventListener("pagehide", () => {
  if (!document.hidden) save();
});
setInterval(tick, 1000);
setInterval(() => {
  if (!document.hidden && s.settings.autosave) save();
}, 10000);
if (loadError) message("Previous save could not be read");
offline();
apply();
check();
show("Home");
