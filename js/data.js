// オーガニック食材データベース（増量向け・高カロリー・高タンパク）
export const ORGANIC_FOODS = [
  { id: 'rice-brown', name: '有機玄米', category: '炭水化物', calories: 165, protein: 3.5, carbs: 35, fat: 1.2, organic: true, bulkScore: 3 },
  { id: 'rice-white', name: '有機白米', category: '炭水化物', calories: 168, protein: 2.7, carbs: 37, fat: 0.3, organic: true, bulkScore: 3 },
  { id: 'sweet-potato', name: '有機さつまいも', category: '炭水化物', calories: 132, protein: 1.2, carbs: 31, fat: 0.1, organic: true, bulkScore: 4 },
  { id: 'oats', name: '有機オートミール', category: '炭水化物', calories: 389, protein: 17, carbs: 66, fat: 7, organic: true, bulkScore: 5 },
  { id: 'pasta', name: '有機全粒パスタ', category: '炭水化物', calories: 348, protein: 13, carbs: 71, fat: 2, organic: true, bulkScore: 4 },
  { id: 'bread', name: '有機全粒パン', category: '炭水化物', calories: 247, protein: 9, carbs: 45, fat: 3, organic: true, bulkScore: 3 },
  { id: 'quinoa', name: '有機キヌア', category: '炭水化物', calories: 368, protein: 14, carbs: 64, fat: 6, organic: true, bulkScore: 4 },

  { id: 'chicken-thigh', name: '有機鶏もも肉', category: 'タンパク質', calories: 200, protein: 19, carbs: 0, fat: 13, organic: true, bulkScore: 5 },
  { id: 'chicken-breast', name: '有機鶏むね肉', category: 'タンパク質', calories: 165, protein: 31, carbs: 0, fat: 3.6, organic: true, bulkScore: 4 },
  { id: 'pork', name: '有機豚ロース', category: 'タンパク質', calories: 263, protein: 19, carbs: 0, fat: 20, organic: true, bulkScore: 5 },
  { id: 'beef', name: '有機牛もも肉', category: 'タンパク質', calories: 250, protein: 26, carbs: 0, fat: 15, organic: true, bulkScore: 5 },
  { id: 'salmon', name: '有機サーモン', category: 'タンパク質', calories: 208, protein: 20, carbs: 0, fat: 13, organic: true, bulkScore: 5 },
  { id: 'mackerel', name: '有機サバ', category: 'タンパク質', calories: 205, protein: 19, carbs: 0, fat: 14, organic: true, bulkScore: 4 },
  { id: 'sardine', name: '有機イワシ', category: 'タンパク質', calories: 208, protein: 25, carbs: 0, fat: 11, organic: true, bulkScore: 4 },
  { id: 'tofu', name: '有機木綿豆腐', category: 'タンパク質', calories: 72, protein: 7, carbs: 2, fat: 4, organic: true, bulkScore: 2 },
  { id: 'tempeh', name: '有機テンペ', category: 'タンパク質', calories: 193, protein: 19, carbs: 9, fat: 11, organic: true, bulkScore: 4 },
  { id: 'eggs', name: '有機卵', category: 'タンパク質', calories: 151, protein: 13, carbs: 1, fat: 10, organic: true, bulkScore: 5 },

  { id: 'avocado', name: '有機アボカド', category: '脂質', calories: 160, protein: 2, carbs: 9, fat: 15, organic: true, bulkScore: 5 },
  { id: 'olive-oil', name: '有機エクストラバージンオリーブオイル', category: '脂質', calories: 884, protein: 0, carbs: 0, fat: 100, organic: true, bulkScore: 5 },
  { id: 'coconut-oil', name: '有機ココナッツオイル', category: '脂質', calories: 862, protein: 0, carbs: 0, fat: 100, organic: true, bulkScore: 4 },
  { id: 'nuts-mix', name: '有機ミックスナッツ', category: '脂質', calories: 607, protein: 20, carbs: 21, fat: 54, organic: true, bulkScore: 5 },
  { id: 'almond-butter', name: '有機アーモンドバター', category: '脂質', calories: 614, protein: 21, carbs: 19, fat: 56, organic: true, bulkScore: 5 },
  { id: 'peanut-butter', name: '有機ピーナッツバター', category: '脂質', calories: 588, protein: 25, carbs: 20, fat: 50, organic: true, bulkScore: 5 },

  { id: 'milk', name: '有機牛乳', category: '乳製品', calories: 67, protein: 3.3, carbs: 5, fat: 3.8, organic: true, bulkScore: 3 },
  { id: 'yogurt', name: '有機プレーンヨーグルト', category: '乳製品', calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, organic: true, bulkScore: 3 },
  { id: 'cheese', name: '有機チーズ', category: '乳製品', calories: 402, protein: 25, carbs: 1, fat: 33, organic: true, bulkScore: 4 },
  { id: 'protein-powder', name: 'オーガニックプロテインパウダー', category: 'サプリ', calories: 400, protein: 80, carbs: 8, fat: 5, organic: true, bulkScore: 5 },

  { id: 'banana', name: '有機バナナ', category: '果物', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, organic: true, bulkScore: 4 },
  { id: 'berries', name: '有機ベリー類', category: '果物', calories: 57, protein: 0.7, carbs: 14, fat: 0.3, organic: true, bulkScore: 2 },
  { id: 'dates', name: '有機デーツ', category: '果物', calories: 282, protein: 2.5, carbs: 75, fat: 0.4, organic: true, bulkScore: 5 },

  { id: 'spinach', name: '有機ほうれん草', category: '野菜', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, organic: true, bulkScore: 1 },
  { id: 'broccoli', name: '有機ブロッコリー', category: '野菜', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, organic: true, bulkScore: 2 },
  { id: 'kale', name: '有機ケール', category: '野菜', calories: 49, protein: 4.3, carbs: 9, fat: 0.9, organic: true, bulkScore: 2 },
  { id: 'carrot', name: '有機にんじん', category: '野菜', calories: 41, protein: 0.9, carbs: 10, fat: 0.2, organic: true, bulkScore: 2 },

  { id: 'honey', name: '有機はちみつ', category: '調味料', calories: 304, protein: 0.3, carbs: 82, fat: 0, organic: true, bulkScore: 4 },
  { id: 'miso', name: '有機味噌', category: '調味料', calories: 198, protein: 12, carbs: 26, fat: 6, organic: true, bulkScore: 3 },
  { id: 'tamari', name: '有機たまり醤油', category: '調味料', calories: 60, protein: 10, carbs: 5, fat: 0, organic: true, bulkScore: 1 },
];

export const MEAL_TEMPLATES = [
  {
    id: 'breakfast-oats',
    name: '増量オーツボウル',
    mealType: '朝食',
    ingredients: ['oats', 'milk', 'banana', 'peanut-butter', 'honey', 'protein-powder'],
    description: 'オートミール＋牛乳＋バナナ＋ピーナッツバター＋プロテイン。朝から600kcal超え',
    organicOnly: true,
  },
  {
    id: 'lunch-rice-chicken',
    name: '鶏もも丼（大盛り）',
    mealType: '昼食',
    ingredients: ['rice-white', 'chicken-thigh', 'avocado', 'spinach', 'miso'],
    description: '有機白米大盛り＋鶏もも肉200g＋アボカド。脂質もしっかり',
    organicOnly: true,
  },
  {
    id: 'lunch-pasta',
    name: 'サーモンパスタ',
    mealType: '昼食',
    ingredients: ['pasta', 'salmon', 'olive-oil', 'broccoli', 'cheese'],
    description: '全粒パスタ＋サーモン＋オリーブオイル。Omega-3も摂れる',
    organicOnly: true,
  },
  {
    id: 'snack-nuts',
    name: 'ナッツ＆プロテインシェイク',
    mealType: '間食',
    ingredients: ['nuts-mix', 'protein-powder', 'milk', 'banana'],
    description: 'トレ前後の間食に最適。400kcal前後',
    organicOnly: true,
  },
  {
    id: 'dinner-beef-rice',
    name: '牛もも肉のステーキ定食',
    mealType: '夕食',
    ingredients: ['rice-brown', 'beef', 'sweet-potato', 'kale', 'olive-oil'],
    description: '玄米＋牛もも200g＋さつまいも。一日の締めに最高カロリー',
    organicOnly: true,
  },
  {
    id: 'dinner-pork',
    name: '豚ロース＋キヌアサラダ',
    mealType: '夕食',
    ingredients: ['quinoa', 'pork', 'avocado', 'carrot', 'olive-oil'],
    description: '高タンパク＋良質な脂質。キヌアでビタミンも',
    organicOnly: true,
  },
  {
    id: 'snack-eggs',
    name: 'オーガニック卵3個＋全粒パン',
    mealType: '間食',
    ingredients: ['eggs', 'bread', 'avocado'],
    description: '手軽に450kcal。夜食にも',
    organicOnly: true,
  },
  {
    id: 'breakfast-eggs',
    name: 'スクランブルエッグ定食',
    mealType: '朝食',
    ingredients: ['eggs', 'bread', 'avocado', 'spinach', 'milk'],
    description: '卵4個＋全粒パン2枚＋アボカド',
    organicOnly: true,
  },
];

export const WORKOUT_TEMPLATES = [
  {
    id: 'push',
    name: 'Push Day（押す）',
    description: '胸・肩・三頭',
    exercises: [
      { name: 'ベンチプレス', sets: 4, reps: '8-10', note: 'メイン種目' },
      { name: 'インクラインダンベルプレス', sets: 3, reps: '10-12', note: '' },
      { name: 'ショルダープレス', sets: 4, reps: '8-10', note: '' },
      { name: 'サイドレイズ', sets: 3, reps: '12-15', note: '' },
      { name: 'トライセプスエクステンション', sets: 3, reps: '10-12', note: '' },
    ],
  },
  {
    id: 'pull',
    name: 'Pull Day（引く）',
    description: '背中・二頭',
    exercises: [
      { name: 'デッドリフト', sets: 4, reps: '6-8', note: 'メイン種目' },
      { name: 'ラットプルダウン', sets: 4, reps: '8-10', note: '' },
      { name: 'ベントオーバーロー', sets: 3, reps: '8-10', note: '' },
      { name: 'フェイスプル', sets: 3, reps: '15-20', note: '' },
      { name: 'ダンベルカール', sets: 3, reps: '10-12', note: '' },
    ],
  },
  {
    id: 'legs',
    name: 'Leg Day（脚）',
    description: '大腿四頭筋・ハム・臀部',
    exercises: [
      { name: 'スクワット', sets: 4, reps: '8-10', note: 'メイン種目' },
      { name: 'レッグプレス', sets: 4, reps: '10-12', note: '' },
      { name: 'ルーマニアンデッドリフト', sets: 3, reps: '8-10', note: '' },
      { name: 'レッグカール', sets: 3, reps: '10-12', note: '' },
      { name: 'カーフレイズ', sets: 4, reps: '15-20', note: '' },
    ],
  },
  {
    id: 'upper',
    name: 'Upper Body',
    description: '上半身総合',
    exercises: [
      { name: 'ベンチプレス', sets: 3, reps: '8-10', note: '' },
      { name: 'バーベルロー', sets: 3, reps: '8-10', note: '' },
      { name: 'オーバーヘッドプレス', sets: 3, reps: '8-10', note: '' },
      { name: 'チンニング', sets: 3, reps: '最大', note: '' },
      { name: 'ディップス', sets: 3, reps: '8-12', note: '' },
    ],
  },
  {
    id: 'full',
    name: 'Full Body',
    description: '全身（週2-3回向け）',
    exercises: [
      { name: 'スクワット', sets: 3, reps: '8-10', note: '' },
      { name: 'ベンチプレス', sets: 3, reps: '8-10', note: '' },
      { name: 'デッドリフト', sets: 3, reps: '6-8', note: '' },
      { name: 'ショルダープレス', sets: 2, reps: '10', note: '' },
      { name: 'プランク', sets: 3, reps: '60秒', note: '' },
    ],
  },
];

export const DAYS = ['月', '火', '水', '木', '金', '土', '日'];

export const MEAL_TYPES = ['朝食', '昼食', '夕食', '間食'];

export const BULK_TIPS = [
  '増量期は「+300〜500kcal」のカロリーサープラスが目安。急激すぎる増量は脂肪増加の原因に。',
  'タンパク質は体重×1.6〜2.2g/日。有機の鶏もも・卵・サーモンがコスパ良し。',
  'オーガニック食材はコープデリ、自然派クラブ、オーガニック専門店、産直で。',
  'トレーニング前後30分以内の食事（間食）が筋合成に効く。プロテイン＋バナナが定番。',
  '体重は週1回、同じ条件（朝起きて排泄後）で測る。月+0.5〜1kgが理想ペース。',
  '睡眠7時間以上。増量期こそ回復が最重要。',
];

export const ORGANIC_SHOPS = [
  { name: 'コープデリ', note: '有機野菜・卵・乳製品が豊富' },
  { name: '自然派クラブ', note: 'オーガニック食材専門スーパー' },
  { name: 'オーガニックライフ', note: '全国展開のオーガニックスーバー' },
  { name: '産直マルシェ', note: '地元の有機農家直売' },
  { name: '成城石井', note: 'オーガニックコーナー充実' },
];

export function calcTDEE(weight, height, age, sex, activity) {
  // Mifflin-St Jeor
  let bmr;
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  const multipliers = { low: 1.375, moderate: 1.55, high: 1.725, very_high: 1.9 };
  return Math.round(bmr * (multipliers[activity] || 1.55));
}

export function calcBulkTargets(profile) {
  const tdee = calcTDEE(profile.weight, profile.height, profile.age, profile.sex, profile.activity);
  const surplus = profile.surplus || 400;
  const calories = tdee + surplus;
  const protein = Math.round(profile.weight * (profile.proteinRatio || 2.0));
  const carbs = Math.round((calories - protein * 4 - calories * 0.25) / 4);
  const fat = Math.round((calories * 0.25) / 9);
  return { tdee, calories, protein, carbs, fat, surplus };
}

export function getFoodById(id) {
  return ORGANIC_FOODS.find(f => f.id === id);
}

export function estimateMealNutrition(ingredientIds, servings = 1) {
  let calories = 0, protein = 0, carbs = 0, fat = 0;
  for (const id of ingredientIds) {
    const food = getFoodById(id);
    if (food) {
      // per 100g estimate, average serving ~150g for solids, 200ml for liquids
      const factor = ['olive-oil', 'coconut-oil', 'honey', 'peanut-butter', 'almond-butter'].includes(id) ? 0.15
        : ['milk', 'protein-powder'].includes(id) ? 2.0
        : ['eggs'].includes(id) ? 1.0
        : 1.5;
      calories += food.calories * factor;
      protein += food.protein * factor;
      carbs += food.carbs * factor;
      fat += food.fat * factor;
    }
  }
  return {
    calories: Math.round(calories * servings),
    protein: Math.round(protein * servings),
    carbs: Math.round(carbs * servings),
    fat: Math.round(fat * servings),
  };
}

export function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** 今日の曜日キー（月〜日） */
export function getTodayDayKey() {
  const keys = ['日', '月', '火', '水', '木', '金', '土'];
  return keys[new Date().getDay()];
}

/** 直近n日分の日付リスト（古い順） */
export function getRecentDates(n = 7) {
  const dates = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

/** 週間サマリー統計 */
export function calcWeeklyStats(data, targets, dates = getRecentDates(7)) {
  let totalCal = 0;
  let totalPro = 0;
  let workoutDays = 0;
  const dailyCals = [];

  for (const date of dates) {
    const meals = data.mealLogs.filter(l => l.date === date);
    const workouts = data.workoutLogs.filter(l => l.date === date);
    const dayCal = meals.reduce((s, m) => s + (m.calories || 0), 0);
    const dayPro = meals.reduce((s, m) => s + (m.protein || 0), 0);
    totalCal += dayCal;
    totalPro += dayPro;
    if (workouts.length) workoutDays++;
    dailyCals.push({ date, calories: dayCal, protein: dayPro });
  }

  const n = dates.length;
  const weightsInRange = data.weightLogs
    .filter(w => w.date >= dates[0] && w.date <= dates[dates.length - 1])
    .sort((a, b) => a.date.localeCompare(b.date));
  const weightChange = weightsInRange.length >= 2
    ? +(weightsInRange[weightsInRange.length - 1].weight - weightsInRange[0].weight).toFixed(1)
    : null;

  return {
    avgCalories: Math.round(totalCal / n),
    avgProtein: Math.round(totalPro / n),
    workoutDays,
    dailyCals,
    weightChange,
    calHitRate: targets.calories > 0 ? Math.min(100, Math.round((totalCal / n / targets.calories) * 100)) : 0,
    proHitRate: targets.protein > 0 ? Math.min(100, Math.round((totalPro / n / targets.protein) * 100)) : 0,
  };
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}/${d.getDate()}（${days[d.getDay()]}）`;
}
