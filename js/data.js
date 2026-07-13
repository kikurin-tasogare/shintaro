// 栄養値は「日本食品標準成分表（八訂）増補2023年」を基準にした可食部100g当たりの概算。
// 商品差・調理差があるため、包装食品は実際の栄養成分表示を優先する。
export const NUTRITION_SOURCE = {
  name: '日本食品標準成分表（八訂）増補2023年',
  url: 'https://fooddb.mext.go.jp/',
};

export const ORGANIC_FOODS = [
  { id: 'rice-white', name: '精白米（炊飯後）', category: '主食', calories: 156, protein: 2.5, carbs: 37.1, fat: 0.3, glutenFree: true },
  { id: 'rice-brown', name: '玄米（炊飯後）', category: '主食', calories: 152, protein: 2.8, carbs: 35.6, fat: 1.0, glutenFree: true },
  { id: 'sweet-potato', name: 'さつまいも', category: '主食', calories: 127, protein: 0.9, carbs: 30.3, fat: 0.2, glutenFree: true },
  { id: 'potato', name: 'じゃがいも', category: '主食', calories: 59, protein: 1.8, carbs: 17.3, fat: 0.1, glutenFree: true },
  { id: 'quinoa-cooked', name: 'キヌア（ゆで）', category: '主食', calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, glutenFree: true },
  { id: 'rice-noodle', name: '米麺（ゆで）', category: '主食', calories: 109, protein: 1.8, carbs: 24.9, fat: 0.2, glutenFree: true, checkLabel: true },
  { id: 'gf-oats', name: 'GF表示オートミール', category: '主食', calories: 350, protein: 13.7, carbs: 69.1, fat: 5.7, glutenFree: true, checkLabel: true },
  { id: 'rice-cake', name: '切り餅', category: '主食', calories: 223, protein: 4.0, carbs: 50.8, fat: 0.6, glutenFree: true, checkLabel: true },

  { id: 'chicken-thigh', name: '鶏もも肉（皮つき）', category: '肉・魚・卵', calories: 190, protein: 16.6, carbs: 0, fat: 14.2, glutenFree: true },
  { id: 'chicken-breast', name: '鶏むね肉（皮なし）', category: '肉・魚・卵', calories: 105, protein: 23.3, carbs: 0, fat: 1.9, glutenFree: true },
  { id: 'pork-loin', name: '豚ロース', category: '肉・魚・卵', calories: 248, protein: 19.3, carbs: 0.2, fat: 19.2, glutenFree: true },
  { id: 'beef-round', name: '牛もも肉', category: '肉・魚・卵', calories: 176, protein: 21.3, carbs: 0.5, fat: 10.7, glutenFree: true },
  { id: 'salmon', name: '鮭', category: '肉・魚・卵', calories: 124, protein: 22.3, carbs: 0.1, fat: 4.1, glutenFree: true },
  { id: 'mackerel', name: 'さば', category: '肉・魚・卵', calories: 211, protein: 20.6, carbs: 0.3, fat: 16.8, glutenFree: true },
  { id: 'egg', name: '鶏卵', category: '肉・魚・卵', calories: 142, protein: 12.2, carbs: 0.4, fat: 10.2, glutenFree: true },
  { id: 'tofu', name: '木綿豆腐', category: '豆・乳製品', calories: 73, protein: 7.0, carbs: 1.5, fat: 4.9, glutenFree: true, checkLabel: true },
  { id: 'natto', name: '納豆', category: '豆・乳製品', calories: 184, protein: 16.5, carbs: 12.1, fat: 10.0, glutenFree: true, checkLabel: true },
  { id: 'milk', name: '牛乳', category: '豆・乳製品', calories: 61, protein: 3.3, carbs: 4.8, fat: 3.8, glutenFree: true },
  { id: 'yogurt', name: 'プレーンヨーグルト', category: '豆・乳製品', calories: 56, protein: 3.6, carbs: 4.9, fat: 3.0, glutenFree: true, checkLabel: true },
  { id: 'protein', name: 'GF表示プロテイン', category: '豆・乳製品', calories: 390, protein: 75, carbs: 10, fat: 6, glutenFree: true, checkLabel: true },

  { id: 'banana', name: 'バナナ', category: '果物・野菜', calories: 93, protein: 1.1, carbs: 22.5, fat: 0.2, glutenFree: true },
  { id: 'berries', name: 'ベリー類', category: '果物・野菜', calories: 48, protein: 0.7, carbs: 12.2, fat: 0.1, glutenFree: true },
  { id: 'avocado', name: 'アボカド', category: '果物・野菜', calories: 176, protein: 2.1, carbs: 7.9, fat: 17.5, glutenFree: true },
  { id: 'broccoli', name: 'ブロッコリー', category: '果物・野菜', calories: 37, protein: 5.4, carbs: 6.6, fat: 0.6, glutenFree: true },
  { id: 'spinach', name: 'ほうれん草', category: '果物・野菜', calories: 18, protein: 2.2, carbs: 3.1, fat: 0.4, glutenFree: true },
  { id: 'tomato', name: 'トマト', category: '果物・野菜', calories: 20, protein: 0.7, carbs: 4.7, fat: 0.1, glutenFree: true },
  { id: 'mushroom', name: 'きのこ', category: '果物・野菜', calories: 25, protein: 3.0, carbs: 4.4, fat: 0.4, glutenFree: true },

  { id: 'olive-oil', name: 'オリーブオイル', category: '油・ナッツ', calories: 894, protein: 0, carbs: 0, fat: 100, glutenFree: true },
  { id: 'nuts', name: '無塩ミックスナッツ', category: '油・ナッツ', calories: 606, protein: 20.0, carbs: 21.0, fat: 54.0, glutenFree: true, checkLabel: true },
  { id: 'peanut-butter', name: '無糖ピーナッツバター', category: '油・ナッツ', calories: 599, protein: 25.4, carbs: 18.2, fat: 50.7, glutenFree: true, checkLabel: true },
  { id: 'honey', name: 'はちみつ', category: '調味料', calories: 329, protein: 0.3, carbs: 81.9, fat: 0, glutenFree: true },
  { id: 'gf-tamari', name: '小麦不使用たまり醤油', category: '調味料', calories: 60, protein: 10, carbs: 5, fat: 0, glutenFree: true, checkLabel: true },
  { id: 'rice-miso', name: '小麦不使用の米味噌', category: '調味料', calories: 182, protein: 12.5, carbs: 21.9, fat: 6.0, glutenFree: true, checkLabel: true },
];

const meal = (id, name, mealType, ingredients, description, steps) => ({
  id, name, mealType, ingredients, description, steps, glutenFree: true, minimallyProcessed: true,
});

export const MEAL_TEMPLATES = [
  meal('breakfast-rice-eggs', '卵と納豆の朝ごはん', '朝食',
    [{ id: 'rice-white', grams: 220 }, { id: 'egg', grams: 100 }, { id: 'natto', grams: 45 }, { id: 'spinach', grams: 60 }],
    'ご飯を中心に、卵2個と納豆でタンパク質を確保。', ['卵とほうれん草を焼く', '温かいご飯と納豆を添える']),
  meal('breakfast-oats', 'GFオーツのバナナボウル', '朝食',
    [{ id: 'gf-oats', grams: 70 }, { id: 'milk', grams: 200 }, { id: 'banana', grams: 100 }, { id: 'peanut-butter', grams: 20 }],
    'GF表示のオーツを使用。商品ラベルを必ず確認。', ['オーツを牛乳で煮る', 'バナナとピーナッツバターをのせる']),
  meal('breakfast-potato-omelet', 'じゃがいもオムレツ', '朝食',
    [{ id: 'potato', grams: 250 }, { id: 'egg', grams: 150 }, { id: 'tomato', grams: 100 }, { id: 'olive-oil', grams: 10 }],
    '小麦粉を使わない、腹持ちのよいオムレツ。', ['じゃがいもを加熱する', '卵と野菜を加えて焼く']),
  meal('breakfast-yogurt-mochi', 'ヨーグルトと焼き餅セット', '朝食',
    [{ id: 'rice-cake', grams: 100 }, { id: 'yogurt', grams: 200 }, { id: 'banana', grams: 100 }, { id: 'nuts', grams: 20 }],
    '餅でエネルギーを取り、ヨーグルトとナッツを合わせる。', ['餅を焼く', 'ヨーグルトに果物とナッツを添える']),

  meal('lunch-chicken-rice', '鶏ももアボカド丼', '昼食',
    [{ id: 'rice-white', grams: 280 }, { id: 'chicken-thigh', grams: 160 }, { id: 'avocado', grams: 70 }, { id: 'broccoli', grams: 100 }, { id: 'gf-tamari', grams: 12 }],
    '小麦不使用たまり醤油を使う、エネルギー密度の高い丼。', ['鶏肉を焼く', 'ご飯に野菜と一緒に盛る']),
  meal('lunch-salmon-rice', '鮭ときのこの玄米プレート', '昼食',
    [{ id: 'rice-brown', grams: 280 }, { id: 'salmon', grams: 180 }, { id: 'mushroom', grams: 100 }, { id: 'spinach', grams: 80 }, { id: 'olive-oil', grams: 10 }],
    '鮭と玄米を合わせたシンプルな定食。', ['鮭ときのこを焼く', '玄米と青菜を添える']),
  meal('lunch-beef-potato', '牛ももとじゃがいもの温サラダ', '昼食',
    [{ id: 'rice-white', grams: 220 }, { id: 'beef-round', grams: 180 }, { id: 'potato', grams: 200 }, { id: 'tomato', grams: 100 }, { id: 'olive-oil', grams: 12 }],
    'ルーや市販ソースを使わず、塩と香辛料で仕上げる。', ['肉とじゃがいもを焼く', '野菜と合わせる']),
  meal('lunch-rice-noodle', '鶏むね米麺', '昼食',
    [{ id: 'rice-noodle', grams: 300 }, { id: 'chicken-breast', grams: 180 }, { id: 'egg', grams: 50 }, { id: 'spinach', grams: 80 }, { id: 'gf-tamari', grams: 12 }, { id: 'olive-oil', grams: 8 }],
    '小麦麺の代わりに原材料が米だけの米麺を選ぶ。', ['米麺をゆでる', '鶏肉・卵・青菜と炒める']),

  meal('dinner-pork-quinoa', '豚ロースとキヌアのプレート', '夕食',
    [{ id: 'quinoa-cooked', grams: 260 }, { id: 'pork-loin', grams: 180 }, { id: 'avocado', grams: 60 }, { id: 'broccoli', grams: 120 }, { id: 'olive-oil', grams: 8 }],
    'キヌアと豚肉で主食・主菜をまとめる。', ['豚肉を焼く', 'キヌアと野菜を添える']),
  meal('dinner-mackerel-rice', 'さばとさつまいもの定食', '夕食',
    [{ id: 'rice-white', grams: 220 }, { id: 'mackerel', grams: 160 }, { id: 'sweet-potato', grams: 180 }, { id: 'spinach', grams: 80 }],
    '脂のある魚と芋を組み合わせた増量向け定食。', ['さばを焼く', 'ご飯・芋・青菜を添える']),
  meal('dinner-tofu-beef', '牛肉と豆腐の甘辛丼', '夕食',
    [{ id: 'rice-white', grams: 280 }, { id: 'beef-round', grams: 150 }, { id: 'tofu', grams: 150 }, { id: 'mushroom', grams: 100 }, { id: 'gf-tamari', grams: 15 }, { id: 'honey', grams: 8 }],
    '小麦不使用たまり醤油で味付けする。', ['牛肉・豆腐・きのこを煮る', 'ご飯にかける']),
  meal('dinner-chicken-miso', '鶏むねの米味噌焼き定食', '夕食',
    [{ id: 'rice-brown', grams: 280 }, { id: 'chicken-breast', grams: 220 }, { id: 'rice-miso', grams: 18 }, { id: 'sweet-potato', grams: 150 }, { id: 'broccoli', grams: 120 }, { id: 'olive-oil', grams: 10 }],
    '麦味噌ではなく、小麦不使用表示を確認した米味噌を使う。', ['鶏肉に米味噌を塗って焼く', '玄米・芋・野菜を添える']),

  meal('snack-shake', 'バナナプロテインシェイク', '間食',
    [{ id: 'milk', grams: 250 }, { id: 'banana', grams: 120 }, { id: 'protein', grams: 30 }, { id: 'peanut-butter', grams: 15 }],
    'プロテインはGF表示と原材料の短い商品を選ぶ。', ['材料をミキサーにかける']),
  meal('snack-mochi-nuts', 'きなこ風ナッツ餅', '間食',
    [{ id: 'rice-cake', grams: 100 }, { id: 'peanut-butter', grams: 20 }, { id: 'honey', grams: 10 }, { id: 'milk', grams: 200 }],
    'パン菓子の代わりに餅を使う高エネルギー間食。', ['餅を焼く', 'ピーナッツバターとはちみつを添える']),
  meal('snack-yogurt', 'ベリー＆ナッツヨーグルト', '間食',
    [{ id: 'yogurt', grams: 250 }, { id: 'berries', grams: 100 }, { id: 'nuts', grams: 35 }, { id: 'honey', grams: 12 }],
    '無糖ヨーグルトと無塩ナッツを使う。', ['材料を器に盛る']),
  meal('snack-rice-egg', '小さな卵おにぎり', '間食',
    [{ id: 'rice-white', grams: 160 }, { id: 'egg', grams: 50 }, { id: 'avocado', grams: 50 }],
    '市販菓子に頼らず、素材中心で補食する。', ['卵を焼く', 'ご飯とアボカドを合わせる']),
];

export const WORKOUT_TEMPLATES = [
  { id: 'full-a', name: '全身A', description: 'スクワット・胸・背中', exercises: [
    { name: 'スクワット', sets: 3, reps: '6-10' }, { name: 'ベンチプレス', sets: 3, reps: '6-10' },
    { name: 'ラットプルダウン', sets: 3, reps: '8-12' }, { name: 'ルーマニアンデッドリフト', sets: 2, reps: '8-12' },
    { name: 'サイドレイズ', sets: 2, reps: '12-15' },
  ]},
  { id: 'full-b', name: '全身B', description: '脚・肩・背中', exercises: [
    { name: 'レッグプレス', sets: 3, reps: '8-12' }, { name: 'ショルダープレス', sets: 3, reps: '6-10' },
    { name: 'シーテッドロー', sets: 3, reps: '8-12' }, { name: 'ヒップスラスト', sets: 3, reps: '8-12' },
    { name: 'アームカール', sets: 2, reps: '10-15' },
  ]},
  { id: 'upper', name: '上半身', description: '胸・背中・肩・腕', exercises: [
    { name: 'ベンチプレス', sets: 3, reps: '6-10' }, { name: 'ラットプルダウン', sets: 3, reps: '8-12' },
    { name: 'ショルダープレス', sets: 2, reps: '8-12' }, { name: 'シーテッドロー', sets: 2, reps: '8-12' },
    { name: 'サイドレイズ', sets: 2, reps: '12-15' }, { name: 'アームカール', sets: 2, reps: '10-15' },
  ]},
  { id: 'lower', name: '下半身', description: '脚・臀部', exercises: [
    { name: 'スクワット', sets: 3, reps: '6-10' }, { name: 'ルーマニアンデッドリフト', sets: 3, reps: '8-12' },
    { name: 'レッグプレス', sets: 3, reps: '10-15' }, { name: 'レッグカール', sets: 2, reps: '10-15' },
    { name: 'カーフレイズ', sets: 3, reps: '12-20' },
  ]},
  { id: 'push', name: 'Push（胸・肩・三頭）', description: '押す動作', exercises: [
    { name: 'ベンチプレス', sets: 3, reps: '6-10' }, { name: 'インクラインダンベルプレス', sets: 3, reps: '8-12' },
    { name: 'ショルダープレス', sets: 3, reps: '8-12' }, { name: 'サイドレイズ', sets: 3, reps: '12-15' },
  ]},
  { id: 'pull', name: 'Pull（背中・二頭）', description: '引く動作', exercises: [
    { name: 'ラットプルダウン', sets: 3, reps: '8-12' }, { name: 'シーテッドロー', sets: 3, reps: '8-12' },
    { name: 'フェイスプル', sets: 3, reps: '12-15' }, { name: 'アームカール', sets: 3, reps: '10-15' },
  ]},
  { id: 'legs', name: 'Legs（脚）', description: '脚・臀部', exercises: [
    { name: 'スクワット', sets: 3, reps: '6-10' }, { name: 'レッグプレス', sets: 3, reps: '10-15' },
    { name: 'ルーマニアンデッドリフト', sets: 3, reps: '8-12' }, { name: 'レッグカール', sets: 3, reps: '10-15' },
  ]},
];

export const DAYS = ['月', '火', '水', '木', '金', '土', '日'];
export const MEAL_TYPES = ['朝食', '昼食', '夕食', '間食'];

export const BULK_TIPS = [
  '体重は毎日上下して当然。判断は7日間平均で行おう。',
  'タンパク質は1日合計を優先し、3〜5回に分けると続けやすい。',
  '筋トレは毎回変えるより、同じ基本種目の重量や回数を少しずつ伸ばそう。',
  '全セットを限界まで行う必要はない。基本はあと1〜3回できる強度を目安に。',
  'グルテンフリーでも摂取量不足に注意。米・芋・脂質で必要量を満たそう。',
  '痛みは根性で押し切らない。種目を止めて、痛くない動作に変更しよう。',
];

export const ORGANIC_SHOPS = [
  { name: 'いつものスーパー', note: '生鮮食品を中心に、加工品は原材料表示を確認' },
  { name: '生協・宅配', note: '原材料や産地で絞り込みやすい' },
  { name: '農産物直売所', note: '旬の野菜を選び、生産者や栽培方法を確認' },
  { name: '自然食品店', note: 'GF表示・有機JAS・無添加表示を個別に確認' },
];

export function calcTDEE(weight, height, age, sex, activity) {
  const bmr = sex === 'female'
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;
  const multipliers = { low: 1.375, moderate: 1.55, high: 1.725, very_high: 1.9 };
  return Math.round(bmr * (multipliers[activity] || 1.55));
}

export function calcBulkTargets(profile) {
  const tdee = calcTDEE(Number(profile.weight), Number(profile.height), Number(profile.age), profile.sex, profile.activity);
  const surplus = Number(profile.surplus) || 300;
  const calories = tdee + surplus;
  const protein = Math.round(Number(profile.weight) * (Number(profile.proteinRatio) || 1.8));
  const fat = Math.round((calories * 0.25) / 9);
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4));
  return { tdee, calories, protein, carbs, fat, surplus };
}

export function getFoodById(id) { return ORGANIC_FOODS.find(f => f.id === id); }

export function estimateMealNutrition(ingredients, servings = 1) {
  const total = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  for (const entry of ingredients || []) {
    const id = typeof entry === 'string' ? entry : entry.id;
    const grams = typeof entry === 'string' ? 100 : Number(entry.grams) || 0;
    const food = getFoodById(id);
    if (!food) continue;
    const factor = grams / 100 * servings;
    for (const key of Object.keys(total)) total[key] += food[key] * factor;
  }
  return Object.fromEntries(Object.entries(total).map(([k, v]) => [k, Math.round(v)]));
}

export function buildDailyMealPlan(date, targets) {
  const dayNumber = Number(date.replaceAll('-', '')) || 1;
  const groups = MEAL_TYPES.map(type => MEAL_TEMPLATES.filter(m => m.mealType === type));
  const combinations = [];
  for (const breakfast of groups[0]) for (const lunch of groups[1]) for (const dinner of groups[2]) for (const snack of groups[3]) {
    const items = [breakfast, lunch, dinner, snack];
    const nutrition = items.reduce((sum, item) => {
      const n = estimateMealNutrition(item.ingredients);
      for (const key of Object.keys(sum)) sum[key] += n[key];
      return sum;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
    const servings = Math.min(1.25, Math.max(0.85, targets.calories / Math.max(nutrition.calories, 1)));
    const score = Math.abs(nutrition.calories - targets.calories) / Math.max(targets.calories, 1) * 2
      + Math.abs(nutrition.protein * servings - targets.protein) / Math.max(targets.protein, 1)
      + Math.abs(nutrition.carbs * servings - targets.carbs) / Math.max(targets.carbs, 1)
      + Math.abs(nutrition.fat * servings - targets.fat) / Math.max(targets.fat, 1) * 1.3;
    combinations.push({ items, servings, score });
  }
  combinations.sort((a, b) => a.score - b.score);
  const choice = combinations[dayNumber % Math.min(16, combinations.length)];
  const selected = choice.items;
  const base = selected.reduce((sum, m) => sum + estimateMealNutrition(m.ingredients).calories, 0);
  const servings = Math.min(1.25, Math.max(0.85, choice?.servings || targets.calories / Math.max(base, 1)));
  return selected.map(m => ({ ...m, servings, nutrition: estimateMealNutrition(m.ingredients, servings) }));
}

export function getWorkoutWeek(daysPerWeek = 3) {
  const count = Math.max(2, Math.min(5, Number(daysPerWeek) || 3));
  if (count === 2) return { 月: 'full-a', 木: 'full-b' };
  if (count === 3) return { 月: 'full-a', 水: 'full-b', 土: 'full-a' };
  if (count === 4) return { 月: 'upper', 火: 'lower', 木: 'upper', 土: 'lower' };
  return { 月: 'push', 火: 'pull', 木: 'legs', 金: 'upper', 土: 'lower' };
}

export function todayStr() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  return `${d.getMonth() + 1}/${d.getDate()}（${days[d.getDay()]}）`;
}
