const STORAGE_KEY = 'shinyu-bulk-log-v2';
const LEGACY_KEY = 'shinyu-bulk-log-v1';

const DEFAULT_PROFILE = {
  name: '心友', weight: 60, startWeight: 60, targetWeight: 65, height: 170, age: 30,
  sex: 'male', activity: 'moderate', surplus: 300, proteinRatio: 1.8,
  glutenMode: 'prefer', additivePriority: 'high', trainingExperience: 'beginner',
  daysPerWeek: 3, sessionMinutes: 60, equipment: 'gym',
};

const emptyMealDays = () => Object.fromEntries(['月','火','水','木','金','土','日'].map(day => [day, {
  朝食: null, 昼食: null, 夕食: null, 間食: null,
}]));

const DEFAULT_DATA = {
  profile: DEFAULT_PROFILE,
  workoutLogs: [], mealLogs: [], weightLogs: [],
  workoutMenu: { name: '週間メニュー', days: { 月: null, 火: null, 水: null, 木: null, 金: null, 土: null, 日: null } },
  mealMenu: { name: '週間食事プラン', days: emptyMealDays() },
  shoppingChecked: {},
};

const clone = value => structuredClone(value);

function normalize(raw) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const profile = { ...DEFAULT_PROFILE, ...(source.profile && typeof source.profile === 'object' ? source.profile : {}) };
  const workoutDays = { ...DEFAULT_DATA.workoutMenu.days, ...(source.workoutMenu?.days || {}) };
  const incomingMealDays = source.mealMenu?.days || {};
  const mealDays = emptyMealDays();
  for (const day of Object.keys(mealDays)) mealDays[day] = { ...mealDays[day], ...(incomingMealDays[day] || {}) };
  return {
    ...clone(DEFAULT_DATA),
    profile,
    workoutLogs: Array.isArray(source.workoutLogs) ? source.workoutLogs.slice(0, 2000) : [],
    mealLogs: Array.isArray(source.mealLogs) ? source.mealLogs.slice(0, 5000) : [],
    weightLogs: Array.isArray(source.weightLogs) ? source.weightLogs.slice(0, 2000) : [],
    workoutMenu: { name: source.workoutMenu?.name || '週間メニュー', days: workoutDays },
    mealMenu: { name: source.mealMenu?.name || '週間食事プラン', days: mealDays },
    shoppingChecked: source.shoppingChecked && typeof source.shoppingChecked === 'object' ? source.shoppingChecked : {},
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_KEY);
    return raw ? normalize(JSON.parse(raw)) : clone(DEFAULT_DATA);
  } catch {
    return clone(DEFAULT_DATA);
  }
}

function save(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(normalize(data))); }
function generateId() { return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`; }

export const store = {
  getAll: load,
  saveProfile(profile) {
    const data = load();
    const next = { ...data.profile, ...profile };
    if (!data.weightLogs.length && Number(profile.weight) !== Number(data.profile.weight)) next.startWeight = Number(profile.weight);
    if (!next.startWeight) next.startWeight = next.weight;
    data.profile = next;
    save(data);
    return next;
  },
  addWorkoutLog(log) {
    const data = load();
    const entry = { ...log, id: generateId(), date: log.date };
    data.workoutLogs.unshift(entry); save(data); return entry;
  },
  deleteWorkoutLog(id) { const d = load(); d.workoutLogs = d.workoutLogs.filter(x => x.id !== id); save(d); },
  addMealLog(log) {
    const data = load();
    const entry = { ...log, id: generateId(), date: log.date };
    data.mealLogs.unshift(entry); save(data); return entry;
  },
  deleteMealLog(id) { const d = load(); d.mealLogs = d.mealLogs.filter(x => x.id !== id); save(d); },
  addWeightLog(log) {
    const data = load();
    const entry = { id: generateId(), date: log.date, weight: Number(log.weight), note: String(log.note || '') };
    data.weightLogs = data.weightLogs.filter(x => x.date !== log.date);
    data.weightLogs.push(entry);
    data.weightLogs.sort((a, b) => b.date.localeCompare(a.date));
    save(data); return entry;
  },
  deleteWeightLog(id) { const d = load(); d.weightLogs = d.weightLogs.filter(x => x.id !== id); save(d); },
  saveWorkoutMenu(menu) { const d = load(); d.workoutMenu = menu; save(d); },
  saveMealMenu(menu) { const d = load(); d.mealMenu = menu; save(d); },
  toggleShoppingItem(key) { const d = load(); d.shoppingChecked[key] = !d.shoppingChecked[key]; save(d); },
  getLogsForDate(date) {
    const d = load();
    return {
      workouts: d.workoutLogs.filter(x => x.date === date),
      meals: d.mealLogs.filter(x => x.date === date),
      weight: d.weightLogs.find(x => x.date === date),
    };
  },
  exportData() { return JSON.stringify(load(), null, 2); },
  importData(json) {
    const parsed = JSON.parse(json);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('invalid data');
    save(normalize(parsed));
  },
  reset() { localStorage.removeItem(STORAGE_KEY); localStorage.removeItem(LEGACY_KEY); },
};
