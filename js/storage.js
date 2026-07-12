const STORAGE_KEY = 'shinyu-bulk-log-v1';

const DEFAULT_PROFILE = {
  name: '心友',
  weight: 60,
  targetWeight: 65,
  height: 170,
  age: 30,
  sex: 'male',
  activity: 'moderate',
  surplus: 400,
  proteinRatio: 2.0,
  organicPriority: 'high', // high | medium | flexible
};

const DEFAULT_DATA = {
  profile: DEFAULT_PROFILE,
  workoutLogs: [],
  mealLogs: [],
  weightLogs: [],
  workoutMenu: {
    name: '週間メニュー',
    days: {
      月: null, 火: null, 水: null, 木: null, 金: null, 土: null, 日: null,
    },
  },
  mealMenu: {
    name: '週間食事プラン',
    days: {
      月: { 朝食: null, 昼食: null, 夕食: null, 間食: null },
      火: { 朝食: null, 昼食: null, 夕食: null, 間食: null },
      水: { 朝食: null, 昼食: null, 夕食: null, 間食: null },
      木: { 朝食: null, 昼食: null, 夕食: null, 間食: null },
      金: { 朝食: null, 昼食: null, 夕食: null, 間食: null },
      土: { 朝食: null, 昼食: null, 夕食: null, 間食: null },
      日: { 朝食: null, 昼食: null, 夕食: null, 間食: null },
    },
  },
  shoppingChecked: {},
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(DEFAULT_DATA);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_DATA), ...parsed, profile: { ...DEFAULT_PROFILE, ...parsed.profile } };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export const store = {
  getAll: load,

  saveProfile(profile) {
    const data = load();
    data.profile = { ...data.profile, ...profile };
    save(data);
    return data.profile;
  },

  addWorkoutLog(log) {
    const data = load();
    const entry = { id: generateId(), date: log.date, ...log };
    data.workoutLogs.unshift(entry);
    save(data);
    return entry;
  },

  deleteWorkoutLog(id) {
    const data = load();
    data.workoutLogs = data.workoutLogs.filter(l => l.id !== id);
    save(data);
  },

  updateWorkoutLog(id, log) {
    const data = load();
    const idx = data.workoutLogs.findIndex(l => l.id === id);
    if (idx === -1) return null;
    data.workoutLogs[idx] = { ...data.workoutLogs[idx], ...log, id };
    save(data);
    return data.workoutLogs[idx];
  },

  getWorkoutLog(id) {
    return load().workoutLogs.find(l => l.id === id);
  },

  addMealLog(log) {
    const data = load();
    const entry = { id: generateId(), date: log.date, ...log };
    data.mealLogs.unshift(entry);
    save(data);
    return entry;
  },

  deleteMealLog(id) {
    const data = load();
    data.mealLogs = data.mealLogs.filter(l => l.id !== id);
    save(data);
  },

  updateMealLog(id, log) {
    const data = load();
    const idx = data.mealLogs.findIndex(l => l.id === id);
    if (idx === -1) return null;
    data.mealLogs[idx] = { ...data.mealLogs[idx], ...log, id };
    save(data);
    return data.mealLogs[idx];
  },

  getMealLog(id) {
    return load().mealLogs.find(l => l.id === id);
  },

  addWeightLog(log) {
    const data = load();
    const entry = { id: generateId(), date: log.date, weight: log.weight, note: log.note || '' };
    // Replace same-day entry
    data.weightLogs = data.weightLogs.filter(l => l.date !== log.date);
    data.weightLogs.unshift(entry);
    data.weightLogs.sort((a, b) => b.date.localeCompare(a.date));
    save(data);
    return entry;
  },

  deleteWeightLog(id) {
    const data = load();
    data.weightLogs = data.weightLogs.filter(l => l.id !== id);
    save(data);
  },

  updateWeightLog(id, log) {
    const data = load();
    const idx = data.weightLogs.findIndex(l => l.id === id);
    if (idx === -1) return null;
    const entry = { ...data.weightLogs[idx], ...log, id };
    data.weightLogs = data.weightLogs.filter(l => l.id !== id && l.date !== log.date);
    data.weightLogs.unshift(entry);
    data.weightLogs.sort((a, b) => b.date.localeCompare(a.date));
    save(data);
    return entry;
  },

  getWeightLog(id) {
    return load().weightLogs.find(l => l.id === id);
  },

  saveWorkoutMenu(menu) {
    const data = load();
    data.workoutMenu = menu;
    save(data);
  },

  saveMealMenu(menu) {
    const data = load();
    data.mealMenu = menu;
    save(data);
  },

  toggleShoppingItem(key) {
    const data = load();
    data.shoppingChecked[key] = !data.shoppingChecked[key];
    save(data);
  },

  getLogsForDate(date) {
    const data = load();
    return {
      workouts: data.workoutLogs.filter(l => l.date === date),
      meals: data.mealLogs.filter(l => l.date === date),
      weight: data.weightLogs.find(l => l.date === date),
    };
  },

  exportData() {
    return JSON.stringify(load(), null, 2);
  },

  importData(jsonStr) {
    const parsed = JSON.parse(jsonStr);
    save({ ...structuredClone(DEFAULT_DATA), ...parsed });
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
  },
};
