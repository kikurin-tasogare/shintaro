import { store } from './storage.js';
import {
  ORGANIC_FOODS, MEAL_TEMPLATES, WORKOUT_TEMPLATES, DAYS, MEAL_TYPES,
  BULK_TIPS, ORGANIC_SHOPS, calcBulkTargets, getFoodById,
  estimateMealNutrition, todayStr, formatDate, getTodayDayKey,
  getRecentDates, calcWeeklyStats,
} from './data.js';

let state = {
  page: 'home',
  logTab: 'workout',
  menuTab: 'workout',
  expandedDays: {},
};

const $ = (sel) => document.querySelector(sel);
const main = () => $('#mainContent');

function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

function getData() { return store.getAll(); }

function getTodayNutrition(date) {
  const { meals } = store.getLogsForDate(date);
  return meals.reduce((acc, m) => ({
    calories: acc.calories + (m.calories || 0),
    protein: acc.protein + (m.protein || 0),
    carbs: acc.carbs + (m.carbs || 0),
    fat: acc.fat + (m.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}

function progressBar(label, current, target, cls) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return `
    <div class="progress-group">
      <div class="progress-label">
        <span>${label}</span>
        <span>${current} / ${target}${label.includes('タンパク') ? 'g' : label.includes('カロ') ? 'kcal' : 'kg'}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${cls}" style="width:${pct}%"></div>
      </div>
    </div>`;
}

// ─── Header ───
function renderHeader() {
  const data = getData();
  const targets = calcBulkTargets(data.profile);
  const today = todayStr();
  const nutrition = getTodayNutrition(today);
  const latestWeight = data.weightLogs[0]?.weight || data.profile.weight;

  $('#headerStats').innerHTML = `
    <div class="stat-pill">
      <span class="label">今日のカロリー</span>
      <span class="value">${nutrition.calories}</span>
    </div>
    <div class="stat-pill">
      <span class="label">タンパク質</span>
      <span class="value">${nutrition.protein}g</span>
    </div>
    <div class="stat-pill">
      <span class="label">最新体重</span>
      <span class="value">${latestWeight}kg</span>
    </div>`;
}

// ─── Home ───
function renderHome() {
  const data = getData();
  const targets = calcBulkTargets(data.profile);
  const today = todayStr();
  const nutrition = getTodayNutrition(today);
  const { workouts } = store.getLogsForDate(today);
  const weightLogs = data.weightLogs.slice(0, 14).reverse();
  const tip = BULK_TIPS[new Date().getDate() % BULK_TIPS.length];

  const weightMin = weightLogs.length ? Math.min(...weightLogs.map(w => w.weight)) - 1 : data.profile.weight - 2;
  const weightMax = weightLogs.length ? Math.max(...weightLogs.map(w => w.weight)) + 1 : data.profile.targetWeight + 1;
  const range = weightMax - weightMin || 1;

  const chartBars = weightLogs.map(w => {
    const h = Math.round(((w.weight - weightMin) / range) * 100);
    const label = w.date.slice(5).replace('-', '/');
    return `<div class="chart-bar-wrap">
      <div class="chart-bar" style="height:${Math.max(h, 5)}%" title="${w.weight}kg"></div>
      <span class="chart-label">${label}</span>
    </div>`;
  }).join('');

  const gained = data.weightLogs.length >= 2
    ? (data.weightLogs[0].weight - data.weightLogs[data.weightLogs.length - 1].weight).toFixed(1)
    : null;

  const startWeight = data.weightLogs.length
    ? data.weightLogs[data.weightLogs.length - 1].weight
    : data.profile.weight;
  const currentWeight = data.weightLogs[0]?.weight || data.profile.weight;
  const targetWeight = data.profile.targetWeight;
  const weightProgress = targetWeight > startWeight
    ? Math.round(((currentWeight - startWeight) / (targetWeight - startWeight)) * 100)
    : 0;

  main().innerHTML = `
    <div class="tip-box">💡 ${tip}</div>

    ${renderWeeklyReport()}
    ${renderTodayPlan()}

    <div class="card">
      <div class="card-title">📊 今日の進捗 <span class="tag tag-bulk">増量中</span></div>
      ${progressBar('🔥 カロリー', nutrition.calories, targets.calories, 'calories')}
      ${progressBar('💪 タンパク質', nutrition.protein, targets.protein, 'protein')}
      <p style="font-size:0.8rem;color:var(--brown-muted);margin-top:0.5rem">
        目標: ${targets.calories}kcal（TDEE ${targets.tdee} + サープラス ${targets.surplus}）
      </p>
    </div>

    <div class="card">
      <div class="card-title">🏋️ 今日のトレーニング</div>
      ${workouts.length ? workouts.map(w => `
        <div class="log-item">
          <div class="log-item-main">
            <div class="log-item-title">${esc(w.title)}</div>
            <div class="log-item-meta">${w.exercises?.length || 0}種目 · ${w.duration || '—'}分</div>
          </div>
        </div>`).join('')
      : `<div class="empty-state"><div class="emoji">💪</div><p>今日はまだ記録なし</p></div>`}
      <button class="btn btn-primary btn-block" style="margin-top:0.75rem" onclick="navigate('log','workout')">
        筋トレを記録する
      </button>
    </div>

    <div class="card">
      <div class="card-title">⚖️ 体重の推移</div>
      ${weightLogs.length ? `
        <div class="weight-chart">${chartBars}</div>
        <p style="font-size:0.85rem;text-align:center;margin-top:0.5rem">
          現在 ${data.weightLogs[0].weight}kg → 目標 ${data.profile.targetWeight}kg
          ${gained !== null ? `（変化: ${gained > 0 ? '+' : ''}${gained}kg）` : ''}
        </p>` : `
        <div class="empty-state"><div class="emoji">⚖️</div><p>体重を記録するとグラフが表示されます</p></div>`}
      <div class="progress-group">
        <div class="progress-label">
          <span>🎯 目標まで</span>
          <span>${currentWeight} / ${targetWeight}kg（${Math.max(0, Math.min(100, weightProgress))}%）</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill weight" style="width:${Math.max(0, Math.min(100, weightProgress))}%"></div>
        </div>
      </div>
      <button class="btn btn-secondary btn-block" style="margin-top:0.75rem" onclick="navigate('log','weight')">
        体重を記録する
      </button>
    </div>

    <div class="card">
      <div class="card-title">🌿 今日の食事</div>
      ${renderTodayMeals(today)}
      <button class="btn btn-primary btn-block" style="margin-top:0.75rem" onclick="navigate('log','meal')">
        食事を記録する
      </button>
    </div>`;
}

function renderTodayMeals(date) {
  const { meals } = store.getLogsForDate(date);
  if (!meals.length) return `<div class="empty-state"><div class="emoji">🍽️</div><p>今日はまだ食事記録なし</p></div>`;
  return `<ul class="log-list">${meals.map(m => `
    <li class="log-item">
      <div class="log-item-main">
        <div class="log-item-title">${esc(m.name)} <span class="tag tag-meal">${m.mealType || ''}</span></div>
        <div class="log-item-meta">${m.calories || 0}kcal · P${m.protein || 0}g · C${m.carbs || 0}g · F${m.fat || 0}g
          ${m.organic ? '<span class="tag tag-organic">🌿 オーガニック</span>' : ''}
        </div>
      </div>
    </li>`).join('')}</ul>`;
}

function renderWeeklyReport() {
  const data = getData();
  const targets = calcBulkTargets(data.profile);
  const stats = calcWeeklyStats(data, targets);
  const maxCal = Math.max(targets.calories, ...stats.dailyCals.map(d => d.calories), 1);

  const chartBars = stats.dailyCals.map(d => {
    const h = Math.round((d.calories / maxCal) * 100);
    const label = d.date.slice(5).replace('-', '/');
    const hit = d.calories >= targets.calories * 0.9;
    return `<div class="chart-bar-wrap">
      <div class="chart-bar ${hit ? 'chart-bar-hit' : ''}" style="height:${Math.max(h, 4)}%" title="${d.calories}kcal"></div>
      <span class="chart-label">${label}</span>
    </div>`;
  }).join('');

  return `
    <div class="card">
      <div class="card-title">📈 週間レポート <span class="tag tag-bulk">過去7日</span></div>
      <div class="stats-grid">
        <div class="stat-box">
          <span class="stat-box-label">平均カロリー</span>
          <span class="stat-box-value">${stats.avgCalories}</span>
          <span class="stat-box-sub">目標 ${stats.calHitRate}%</span>
        </div>
        <div class="stat-box">
          <span class="stat-box-label">平均タンパク質</span>
          <span class="stat-box-value">${stats.avgProtein}g</span>
          <span class="stat-box-sub">目標 ${stats.proHitRate}%</span>
        </div>
        <div class="stat-box">
          <span class="stat-box-label">トレーニング</span>
          <span class="stat-box-value">${stats.workoutDays}回</span>
          <span class="stat-box-sub">7日中</span>
        </div>
        <div class="stat-box">
          <span class="stat-box-label">体重変化</span>
          <span class="stat-box-value">${stats.weightChange !== null ? (stats.weightChange > 0 ? '+' : '') + stats.weightChange + 'kg' : '—'}</span>
          <span class="stat-box-sub">7日間</span>
        </div>
      </div>
      <p style="font-size:0.8rem;color:var(--brown-muted);margin:0.75rem 0 0.5rem">日別カロリー（緑=目標90%以上）</p>
      <div class="weight-chart">${chartBars}</div>
    </div>`;
}

function renderTodayPlan() {
  const data = getData();
  const dayKey = getTodayDayKey();
  const workoutId = data.workoutMenu.days[dayKey];
  const workoutTpl = workoutId ? WORKOUT_TEMPLATES.find(t => t.id === workoutId) : null;
  const dayMeals = data.mealMenu.days[dayKey] || {};
  const plannedMeals = MEAL_TYPES.map(mt => {
    const mealId = dayMeals[mt];
    const tpl = mealId ? MEAL_TEMPLATES.find(t => t.id === mealId) : null;
    return tpl ? { mealType: mt, tpl } : null;
  }).filter(Boolean);

  if (!workoutTpl && !plannedMeals.length) {
    return `
      <div class="card">
        <div class="card-title">📅 今日（${dayKey}）の予定</div>
        <div class="empty-state"><div class="emoji">📋</div><p>週間メニューが未設定です</p></div>
        <button class="btn btn-secondary btn-block" style="margin-top:0.75rem" onclick="navigate('menu')">
          メニューを設定する
        </button>
      </div>`;
  }

  const workoutSection = workoutTpl ? `
    <div class="menu-meal" style="margin-bottom:0.75rem">
      <div class="menu-meal-name">🏋️ ${esc(workoutTpl.name)}</div>
      <div class="menu-meal-detail">${workoutTpl.exercises.length}種目 · ${workoutTpl.description}</div>
      <button class="btn btn-primary btn-sm" style="margin-top:0.5rem" data-quick-workout="${workoutTpl.id}">
        このメニューで記録
      </button>
    </div>` : `
    <div class="menu-meal" style="margin-bottom:0.75rem">
      <div class="menu-meal-name">🏋️ 休養日</div>
      <div class="menu-meal-detail">今日の筋トレメニューは未設定です</div>
    </div>`;

  const mealSection = plannedMeals.length ? plannedMeals.map(({ mealType, tpl }) => {
    const n = estimateMealNutrition(tpl.ingredients);
    return `
      <div class="menu-meal" style="margin-bottom:0.5rem">
        <div class="menu-meal-name">${mealType} — ${esc(tpl.name)}</div>
        <div class="menu-meal-detail">約 ${n.calories}kcal · P${n.protein}g</div>
        <button class="btn btn-outline btn-sm" style="margin-top:0.35rem" data-quick-meal="${tpl.id}">
          記録する
        </button>
      </div>`;
  }).join('') : `<div class="empty-state" style="padding:1rem 0"><p>食事メニュー未設定</p></div>`;

  return `
    <div class="card">
      <div class="card-title">📅 今日（${dayKey}）の予定</div>
      ${workoutSection}
      <div class="section-divider">🍽️ 食事プラン</div>
      ${mealSection}
      ${plannedMeals.length ? `
        <button class="btn btn-secondary btn-block" id="quickLogAllMeals" style="margin-top:0.75rem">
          今日の食事をまとめて記録
        </button>` : ''}
    </div>`;
}

function bindHomeEvents() {
  document.querySelectorAll('[data-quick-workout]').forEach(btn => {
    btn.addEventListener('click', () => {
      quickLogWorkout(btn.dataset.quickWorkout);
    });
  });
  document.querySelectorAll('[data-quick-meal]').forEach(btn => {
    btn.addEventListener('click', () => {
      quickLogMeal(btn.dataset.quickMeal);
    });
  });
  $('#quickLogAllMeals')?.addEventListener('click', quickLogAllMeals);
}

function quickLogWorkout(templateId) {
  const tpl = WORKOUT_TEMPLATES.find(t => t.id === templateId);
  if (!tpl) return;
  store.addWorkoutLog({
    date: todayStr(),
    title: tpl.name,
    duration: '',
    exercises: tpl.exercises.map(ex => ({ name: ex.name, sets: ex.sets, reps: ex.reps })),
    note: '週間メニューから記録',
  });
  toast('今日の筋トレを記録しました 💪');
  renderAll();
}

function quickLogMeal(templateId) {
  const tpl = MEAL_TEMPLATES.find(t => t.id === templateId);
  if (!tpl) return;
  const today = todayStr();
  const existing = store.getLogsForDate(today).meals;
  if (existing.some(m => m.name === tpl.name && m.mealType === tpl.mealType)) {
    toast('この食事はすでに記録済みです');
    return;
  }
  const nutrition = estimateMealNutrition(tpl.ingredients);
  store.addMealLog({
    date: today,
    mealType: tpl.mealType,
    name: tpl.name,
    ...nutrition,
    organic: tpl.organicOnly,
    note: '週間メニューから記録',
  });
  toast('食事を記録しました 🍽️');
  renderAll();
}

function quickLogAllMeals() {
  const data = getData();
  const dayKey = getTodayDayKey();
  const dayMeals = data.mealMenu.days[dayKey] || {};
  const today = todayStr();
  const existing = store.getLogsForDate(today).meals;
  let count = 0;

  for (const mt of MEAL_TYPES) {
    const mealId = dayMeals[mt];
    if (!mealId) continue;
    const tpl = MEAL_TEMPLATES.find(t => t.id === mealId);
    if (!tpl) continue;
    if (existing.some(m => m.name === tpl.name && m.mealType === tpl.mealType)) continue;
    const nutrition = estimateMealNutrition(tpl.ingredients);
    store.addMealLog({
      date: today,
      mealType: tpl.mealType,
      name: tpl.name,
      ...nutrition,
      organic: tpl.organicOnly,
      note: '週間メニューから記録',
    });
    count++;
  }

  if (!count) {
    toast('記録できる食事がありません（すべて記録済み）');
  } else {
    toast(`${count}件の食事を記録しました 🍽️`);
    renderAll();
  }
}

// ─── Log Page ───
function renderLog() {
  main().innerHTML = `
    <div class="sub-tabs">
      <button class="sub-tab ${state.logTab === 'workout' ? 'active' : ''}" data-log-tab="workout">🏋️ 筋トレ</button>
      <button class="sub-tab ${state.logTab === 'meal' ? 'active' : ''}" data-log-tab="meal">🍽️ 食事</button>
      <button class="sub-tab ${state.logTab === 'weight' ? 'active' : ''}" data-log-tab="weight">⚖️ 体重</button>
    </div>
    <div id="logContent"></div>`;

  document.querySelectorAll('[data-log-tab]').forEach(btn => {
    btn.addEventListener('click', () => { state.logTab = btn.dataset.logTab; renderLog(); bindLogEvents(); });
  });

  const content = $('#logContent');
  if (state.logTab === 'workout') content.innerHTML = renderWorkoutLog();
  else if (state.logTab === 'meal') content.innerHTML = renderMealLog();
  else content.innerHTML = renderWeightLog();
}

function renderWorkoutLog() {
  const data = getData();
  const recent = data.workoutLogs.slice(0, 20);
  return `
    <div class="card">
      <div class="card-title">🏋️ 筋トレを記録</div>
      <form id="workoutForm">
        <div class="form-group">
          <label>日付</label>
          <input type="date" name="date" value="${todayStr()}" required>
        </div>
        <div class="form-group">
          <label>タイトル</label>
          <input type="text" name="title" placeholder="例: Push Day" required>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>時間（分）</label>
            <input type="number" name="duration" placeholder="60" min="1">
          </div>
          <div class="form-group">
            <label>テンプレート</label>
            <select id="workoutTemplate">
              <option value="">選択（任意）</option>
              ${WORKOUT_TEMPLATES.map(t => `<option value="${t.id}">${t.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group">
          <label>種目</label>
          <div id="exerciseList">
            <div class="set-row exercise-entry">
              <div><label>種目名</label><input name="exName" placeholder="ベンチプレス"></div>
              <div><label>セット</label><input name="exSets" type="number" placeholder="4" min="1"></div>
              <div><label>レップ</label><input name="exReps" placeholder="8-10"></div>
              <button type="button" class="btn btn-danger btn-sm remove-exercise" style="visibility:hidden">✕</button>
            </div>
          </div>
          <button type="button" class="btn btn-outline btn-sm" id="addExercise" style="margin-top:0.5rem">＋ 種目を追加</button>
        </div>
        <div class="form-group">
          <label>メモ</label>
          <textarea name="note" placeholder="調子、重量の感触など"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block">記録を保存</button>
      </form>
    </div>
    <div class="card">
      <div class="card-title">📜 最近の記録</div>
      ${recent.length ? `<ul class="log-list">${recent.map(w => `
        <li class="log-item">
          <div class="log-item-main">
            <div class="log-item-title">${esc(w.title)}</div>
            <div class="log-item-meta">${formatDate(w.date)} · ${w.exercises?.length || 0}種目 · ${w.duration || '—'}分</div>
            ${w.exercises?.length ? `<div class="log-item-meta">${w.exercises.map(e => `${e.name} ${e.sets}×${e.reps}`).join(' / ')}</div>` : ''}
          </div>
          <div class="log-item-actions">
            <button class="btn btn-outline btn-sm" data-edit-workout="${w.id}">編集</button>
            <button class="btn btn-danger btn-sm" data-delete-workout="${w.id}">削除</button>
          </div>
        </li>`).join('')}</ul>`
      : `<div class="empty-state"><p>まだ記録がありません</p></div>`}
    </div>`;
}

function renderMealLog() {
  const data = getData();
  const recent = data.mealLogs.slice(0, 20);
  return `
    <div class="card">
      <div class="card-title">🍽️ 食事を記録</div>
      <form id="mealForm">
        <div class="form-row">
          <div class="form-group">
            <label>日付</label>
            <input type="date" name="date" value="${todayStr()}" required>
          </div>
          <div class="form-group">
            <label>食事タイプ</label>
            <select name="mealType">${MEAL_TYPES.map(t => `<option>${t}</option>`).join('')}</select>
          </div>
        </div>
        <div class="form-group">
          <label>メニュー名</label>
          <input type="text" name="name" placeholder="例: 鶏もも丼（大盛り）" required>
        </div>
        <div class="form-group">
          <label>テンプレートから選ぶ</label>
          <select id="mealTemplate">
            <option value="">選択（任意）</option>
            ${MEAL_TEMPLATES.map(t => `<option value="${t.id}">${t.name}（${t.mealType}）</option>`).join('')}
          </select>
        </div>
        <div class="form-row-3">
          <div class="form-group"><label>カロリー</label><input type="number" name="calories" placeholder="kcal" min="0"></div>
          <div class="form-group"><label>タンパク質(g)</label><input type="number" name="protein" placeholder="g" min="0"></div>
          <div class="form-group"><label>炭水化物(g)</label><input type="number" name="carbs" placeholder="g" min="0"></div>
        </div>
        <div class="form-group">
          <label>脂質(g)</label>
          <input type="number" name="fat" placeholder="g" min="0" style="max-width:33%">
        </div>
        <div class="form-group">
          <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
            <input type="checkbox" name="organic" style="width:auto"> 🌿 オーガニック食材使用
          </label>
        </div>
        <div class="form-group">
          <label>メモ</label>
          <textarea name="note" placeholder="使用した食材、調理法など"></textarea>
        </div>
        <button type="submit" class="btn btn-primary btn-block">記録を保存</button>
      </form>
    </div>
    <div class="card">
      <div class="card-title">📜 最近の記録</div>
      ${recent.length ? `<ul class="log-list">${recent.map(m => `
        <li class="log-item">
          <div class="log-item-main">
            <div class="log-item-title">${esc(m.name)} <span class="tag tag-meal">${m.mealType || ''}</span>
              ${m.organic ? '<span class="tag tag-organic">🌿</span>' : ''}
            </div>
            <div class="log-item-meta">${formatDate(m.date)} · ${m.calories || 0}kcal · P${m.protein || 0}g</div>
          </div>
          <div class="log-item-actions">
            <button class="btn btn-outline btn-sm" data-edit-meal="${m.id}">編集</button>
            <button class="btn btn-danger btn-sm" data-delete-meal="${m.id}">削除</button>
          </div>
        </li>`).join('')}</ul>`
      : `<div class="empty-state"><p>まだ記録がありません</p></div>`}
    </div>`;
}

function renderWeightLog() {
  const data = getData();
  const logs = data.weightLogs.slice(0, 30);
  const targets = calcBulkTargets(data.profile);
  return `
    <div class="card">
      <div class="card-title">⚖️ 体重を記録</div>
      <div class="tip-box">増量期は週1回、同じ条件（朝・排泄後）で測定。月+0.5〜1kgが理想ペース。</div>
      <form id="weightForm">
        <div class="form-row">
          <div class="form-group">
            <label>日付</label>
            <input type="date" name="date" value="${todayStr()}" required>
          </div>
          <div class="form-group">
            <label>体重 (kg)</label>
            <input type="number" name="weight" step="0.1" min="30" max="200" placeholder="60.0" required>
          </div>
        </div>
        <div class="form-group">
          <label>メモ</label>
          <input type="text" name="note" placeholder="体調、睡眠時間など">
        </div>
        <button type="submit" class="btn btn-primary btn-block">記録を保存</button>
      </form>
      <p style="font-size:0.8rem;color:var(--brown-muted);margin-top:0.75rem">
        目標: ${data.profile.targetWeight}kg（現在 ${logs[0]?.weight || data.profile.weight}kg）
      </p>
    </div>
    <div class="card">
      <div class="card-title">📜 体重履歴</div>
      ${logs.length ? `<ul class="log-list">${logs.map(w => `
        <li class="log-item">
          <div class="log-item-main">
            <div class="log-item-title">${w.weight} kg</div>
            <div class="log-item-meta">${formatDate(w.date)}${w.note ? ' · ' + esc(w.note) : ''}</div>
          </div>
          <div class="log-item-actions">
            <button class="btn btn-outline btn-sm" data-edit-weight="${w.id}">編集</button>
            <button class="btn btn-danger btn-sm" data-delete-weight="${w.id}">削除</button>
          </div>
        </li>`).join('')}</ul>`
      : `<div class="empty-state"><p>まだ記録がありません</p></div>`}
    </div>`;
}

function bindLogEvents() {
  // Workout form
  const wf = $('#workoutForm');
  if (wf) {
    wf.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(wf);
      const exercises = [];
      wf.querySelectorAll('.exercise-entry').forEach(row => {
        const name = row.querySelector('[name="exName"]').value.trim();
        if (name) exercises.push({
          name,
          sets: row.querySelector('[name="exSets"]').value || '—',
          reps: row.querySelector('[name="exReps"]').value || '—',
        });
      });
      store.addWorkoutLog({
        date: fd.get('date'),
        title: fd.get('title'),
        duration: fd.get('duration'),
        exercises,
        note: fd.get('note'),
      });
      toast('筋トレ記録を保存しました 💪');
      renderAll();
    });

    $('#addExercise')?.addEventListener('click', () => {
      const list = $('#exerciseList');
      const row = document.createElement('div');
      row.className = 'set-row exercise-entry';
      row.innerHTML = `
        <div><label>種目名</label><input name="exName" placeholder="種目名"></div>
        <div><label>セット</label><input name="exSets" type="number" placeholder="3" min="1"></div>
        <div><label>レップ</label><input name="exReps" placeholder="10"></div>
        <button type="button" class="btn btn-danger btn-sm remove-exercise">✕</button>`;
      list.appendChild(row);
      row.querySelector('.remove-exercise').addEventListener('click', () => row.remove());
    });

    $('#workoutTemplate')?.addEventListener('change', (e) => {
      const tpl = WORKOUT_TEMPLATES.find(t => t.id === e.target.value);
      if (!tpl) return;
      wf.querySelector('[name="title"]').value = tpl.name;
      const list = $('#exerciseList');
      list.innerHTML = '';
      tpl.exercises.forEach(ex => {
        const row = document.createElement('div');
        row.className = 'set-row exercise-entry';
        row.innerHTML = `
          <div><label>種目名</label><input name="exName" value="${esc(ex.name)}"></div>
          <div><label>セット</label><input name="exSets" type="number" value="${ex.sets}" min="1"></div>
          <div><label>レップ</label><input name="exReps" value="${esc(ex.reps)}"></div>
          <button type="button" class="btn btn-danger btn-sm remove-exercise">✕</button>`;
        list.appendChild(row);
        row.querySelector('.remove-exercise').addEventListener('click', () => row.remove());
      });
    });
  }

  // Meal form
  const mf = $('#mealForm');
  if (mf) {
    mf.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(mf);
      store.addMealLog({
        date: fd.get('date'),
        mealType: fd.get('mealType'),
        name: fd.get('name'),
        calories: Number(fd.get('calories')) || 0,
        protein: Number(fd.get('protein')) || 0,
        carbs: Number(fd.get('carbs')) || 0,
        fat: Number(fd.get('fat')) || 0,
        organic: fd.get('organic') === 'on',
        note: fd.get('note'),
      });
      toast('食事記録を保存しました 🍽️');
      renderAll();
    });

    $('#mealTemplate')?.addEventListener('change', (e) => {
      const tpl = MEAL_TEMPLATES.find(t => t.id === e.target.value);
      if (!tpl) return;
      mf.querySelector('[name="name"]').value = tpl.name;
      mf.querySelector('[name="mealType"]').value = tpl.mealType;
      const nutrition = estimateMealNutrition(tpl.ingredients);
      mf.querySelector('[name="calories"]').value = nutrition.calories;
      mf.querySelector('[name="protein"]').value = nutrition.protein;
      mf.querySelector('[name="carbs"]').value = nutrition.carbs;
      mf.querySelector('[name="fat"]').value = nutrition.fat;
      mf.querySelector('[name="organic"]').checked = tpl.organicOnly;
    });
  }

  // Weight form
  $('#weightForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    store.addWeightLog({
      date: fd.get('date'),
      weight: Number(fd.get('weight')),
      note: fd.get('note'),
    });
    toast('体重を記録しました ⚖️');
    renderAll();
  });

  // Delete buttons
  document.querySelectorAll('[data-delete-workout]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('この記録を削除しますか？')) {
        store.deleteWorkoutLog(btn.dataset.deleteWorkout);
        toast('削除しました');
        renderAll();
      }
    });
  });
  document.querySelectorAll('[data-delete-meal]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('この記録を削除しますか？')) {
        store.deleteMealLog(btn.dataset.deleteMeal);
        toast('削除しました');
        renderAll();
      }
    });
  });
  document.querySelectorAll('[data-delete-weight]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('この記録を削除しますか？')) {
        store.deleteWeightLog(btn.dataset.deleteWeight);
        toast('削除しました');
        renderAll();
      }
    });
  });

  document.querySelectorAll('[data-edit-workout]').forEach(btn => {
    btn.addEventListener('click', () => openEditWorkout(btn.dataset.editWorkout));
  });
  document.querySelectorAll('[data-edit-meal]').forEach(btn => {
    btn.addEventListener('click', () => openEditMeal(btn.dataset.editMeal));
  });
  document.querySelectorAll('[data-edit-weight]').forEach(btn => {
    btn.addEventListener('click', () => openEditWeight(btn.dataset.editWeight));
  });
}

// ─── Edit Modal ───
function openModal(title, contentHtml, onBind) {
  const root = $('#modalRoot');
  root.innerHTML = `
    <div class="modal-overlay" id="editModalOverlay">
      <div class="modal">
        <div class="modal-title">${title}</div>
        ${contentHtml}
        <button type="button" class="btn btn-outline btn-block" id="editModalCancel" style="margin-top:0.75rem">キャンセル</button>
      </div>
    </div>`;
  $('#editModalCancel').addEventListener('click', closeModal);
  $('#editModalOverlay').addEventListener('click', (e) => {
    if (e.target.id === 'editModalOverlay') closeModal();
  });
  onBind?.();
}

function closeModal() {
  $('#modalRoot').innerHTML = '';
}

function openEditWorkout(id) {
  const log = store.getWorkoutLog(id);
  if (!log) return;
  const exercisesHtml = (log.exercises?.length ? log.exercises : [{ name: '', sets: '', reps: '' }]).map(ex => `
    <div class="set-row exercise-entry">
      <div><label>種目名</label><input name="exName" value="${esc(ex.name)}"></div>
      <div><label>セット</label><input name="exSets" type="number" value="${ex.sets}" min="1"></div>
      <div><label>レップ</label><input name="exReps" value="${esc(ex.reps)}"></div>
      <button type="button" class="btn btn-danger btn-sm remove-exercise">✕</button>
    </div>`).join('');

  openModal('🏋️ 筋トレ記録を編集', `
    <form id="editWorkoutForm">
      <input type="hidden" name="id" value="${log.id}">
      <div class="form-group"><label>日付</label><input type="date" name="date" value="${log.date}" required></div>
      <div class="form-group"><label>タイトル</label><input type="text" name="title" value="${esc(log.title)}" required></div>
      <div class="form-group"><label>時間（分）</label><input type="number" name="duration" value="${log.duration || ''}" min="1"></div>
      <div class="form-group"><label>種目</label><div id="editExerciseList">${exercisesHtml}</div>
        <button type="button" class="btn btn-outline btn-sm" id="editAddExercise" style="margin-top:0.5rem">＋ 種目を追加</button>
      </div>
      <div class="form-group"><label>メモ</label><textarea name="note">${esc(log.note || '')}</textarea></div>
      <button type="submit" class="btn btn-primary btn-block">更新を保存</button>
    </form>`, () => {
    const form = $('#editWorkoutForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const exercises = [];
      form.querySelectorAll('.exercise-entry').forEach(row => {
        const name = row.querySelector('[name="exName"]').value.trim();
        if (name) exercises.push({
          name,
          sets: row.querySelector('[name="exSets"]').value || '—',
          reps: row.querySelector('[name="exReps"]').value || '—',
        });
      });
      store.updateWorkoutLog(fd.get('id'), {
        date: fd.get('date'),
        title: fd.get('title'),
        duration: fd.get('duration'),
        exercises,
        note: fd.get('note'),
      });
      closeModal();
      toast('記録を更新しました 💪');
      renderAll();
    });
    $('#editAddExercise').addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'set-row exercise-entry';
      row.innerHTML = `
        <div><label>種目名</label><input name="exName"></div>
        <div><label>セット</label><input name="exSets" type="number" min="1"></div>
        <div><label>レップ</label><input name="exReps"></div>
        <button type="button" class="btn btn-danger btn-sm remove-exercise">✕</button>`;
      $('#editExerciseList').appendChild(row);
      row.querySelector('.remove-exercise').addEventListener('click', () => row.remove());
    });
    form.querySelectorAll('.remove-exercise').forEach(btn => {
      btn.addEventListener('click', () => btn.closest('.exercise-entry').remove());
    });
  });
}

function openEditMeal(id) {
  const log = store.getMealLog(id);
  if (!log) return;
  openModal('🍽️ 食事記録を編集', `
    <form id="editMealForm">
      <input type="hidden" name="id" value="${log.id}">
      <div class="form-row">
        <div class="form-group"><label>日付</label><input type="date" name="date" value="${log.date}" required></div>
        <div class="form-group"><label>食事タイプ</label>
          <select name="mealType">${MEAL_TYPES.map(t => `<option ${log.mealType === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
        </div>
      </div>
      <div class="form-group"><label>メニュー名</label><input type="text" name="name" value="${esc(log.name)}" required></div>
      <div class="form-row-3">
        <div class="form-group"><label>カロリー</label><input type="number" name="calories" value="${log.calories || 0}" min="0"></div>
        <div class="form-group"><label>タンパク質(g)</label><input type="number" name="protein" value="${log.protein || 0}" min="0"></div>
        <div class="form-group"><label>炭水化物(g)</label><input type="number" name="carbs" value="${log.carbs || 0}" min="0"></div>
      </div>
      <div class="form-group"><label>脂質(g)</label><input type="number" name="fat" value="${log.fat || 0}" min="0" style="max-width:33%"></div>
      <div class="form-group">
        <label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer">
          <input type="checkbox" name="organic" style="width:auto" ${log.organic ? 'checked' : ''}> 🌿 オーガニック食材使用
        </label>
      </div>
      <div class="form-group"><label>メモ</label><textarea name="note">${esc(log.note || '')}</textarea></div>
      <button type="submit" class="btn btn-primary btn-block">更新を保存</button>
    </form>`, () => {
    $('#editMealForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      store.updateMealLog(fd.get('id'), {
        date: fd.get('date'),
        mealType: fd.get('mealType'),
        name: fd.get('name'),
        calories: Number(fd.get('calories')) || 0,
        protein: Number(fd.get('protein')) || 0,
        carbs: Number(fd.get('carbs')) || 0,
        fat: Number(fd.get('fat')) || 0,
        organic: fd.get('organic') === 'on',
        note: fd.get('note'),
      });
      closeModal();
      toast('記録を更新しました 🍽️');
      renderAll();
    });
  });
}

function openEditWeight(id) {
  const log = store.getWeightLog(id);
  if (!log) return;
  openModal('⚖️ 体重記録を編集', `
    <form id="editWeightForm">
      <input type="hidden" name="id" value="${log.id}">
      <div class="form-row">
        <div class="form-group"><label>日付</label><input type="date" name="date" value="${log.date}" required></div>
        <div class="form-group"><label>体重 (kg)</label><input type="number" name="weight" step="0.1" value="${log.weight}" required></div>
      </div>
      <div class="form-group"><label>メモ</label><input type="text" name="note" value="${esc(log.note || '')}"></div>
      <button type="submit" class="btn btn-primary btn-block">更新を保存</button>
    </form>`, () => {
    $('#editWeightForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      store.updateWeightLog(fd.get('id'), {
        date: fd.get('date'),
        weight: Number(fd.get('weight')),
        note: fd.get('note'),
      });
      closeModal();
      toast('記録を更新しました ⚖️');
      renderAll();
    });
  });
}

// ─── Menu Page ───
function renderMenu() {
  main().innerHTML = `
    <div class="sub-tabs">
      <button class="sub-tab ${state.menuTab === 'workout' ? 'active' : ''}" data-menu-tab="workout">🏋️ 筋トレメニュー</button>
      <button class="sub-tab ${state.menuTab === 'meal' ? 'active' : ''}" data-menu-tab="meal">🍽️ 食事メニュー</button>
      <button class="sub-tab ${state.menuTab === 'shopping' ? 'active' : ''}" data-menu-tab="shopping">🛒 買い物リスト</button>
    </div>
    <div id="menuContent"></div>`;

  document.querySelectorAll('[data-menu-tab]').forEach(btn => {
    btn.addEventListener('click', () => { state.menuTab = btn.dataset.menuTab; renderMenu(); bindMenuEvents(); });
  });

  const content = $('#menuContent');
  if (state.menuTab === 'workout') content.innerHTML = renderWorkoutMenu();
  else if (state.menuTab === 'meal') content.innerHTML = renderMealMenuBuilder();
  else content.innerHTML = renderShoppingList();
}

function renderWorkoutMenu() {
  const data = getData();
  const menu = data.workoutMenu;
  return `
    <div class="card">
      <div class="card-title">🏋️ 週間筋トレメニュー</div>
      <p style="font-size:0.85rem;color:var(--brown-muted);margin-bottom:1rem">
        増量期は週3〜5回、Compound系（スクワット・デッド・ベンチ）を中心に。
      </p>
      ${DAYS.map(day => {
        const assigned = menu.days[day];
        const tpl = assigned ? WORKOUT_TEMPLATES.find(t => t.id === assigned) : null;
        const expanded = state.expandedDays[`w-${day}`];
        return `
          <div class="menu-day">
            <div class="menu-day-header" data-toggle="w-${day}">
              <span>${day}曜日 ${tpl ? '— ' + tpl.name : '— 休み / 未設定'}</span>
              <span>${expanded ? '▲' : '▼'}</span>
            </div>
            ${expanded ? `<div class="menu-day-body">
              <select class="workout-day-select" data-day="${day}" style="margin-bottom:0.75rem">
                <option value="">休み / 未設定</option>
                ${WORKOUT_TEMPLATES.map(t => `<option value="${t.id}" ${assigned === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
              ${tpl ? tpl.exercises.map(ex => `
                <div class="menu-meal">
                  <div class="menu-meal-name">${esc(ex.name)}</div>
                  <div class="menu-meal-detail">${ex.sets}セット × ${ex.reps} ${ex.note ? '— ' + ex.note : ''}</div>
                </div>`).join('') : ''}
            </div>` : ''}
          </div>`;
      }).join('')}
      <button class="btn btn-secondary btn-block" id="applyBulkSplit" style="margin-top:0.75rem">
        📋 増量向け3分割を自動設定
      </button>
    </div>`;
}

function renderMealMenuBuilder() {
  const data = getData();
  const menu = data.mealMenu;
  const targets = calcBulkTargets(data.profile);

  return `
    <div class="card">
      <div class="card-title">🍽️ 週間食事メニュー <span class="tag tag-organic">🌿 オーガニック</span></div>
      <p style="font-size:0.85rem;color:var(--brown-muted);margin-bottom:1rem">
        1日目標: ${targets.calories}kcal / タンパク質${targets.protein}g
      </p>
      ${DAYS.map(day => {
        const dayMeals = menu.days[day];
        const expanded = state.expandedDays[`m-${day}`];
        const dayNutrition = MEAL_TYPES.reduce((acc, mt) => {
          const mealId = dayMeals[mt];
          if (mealId) {
            const tpl = MEAL_TEMPLATES.find(t => t.id === mealId);
            if (tpl) {
              const n = estimateMealNutrition(tpl.ingredients);
              acc.calories += n.calories;
              acc.protein += n.protein;
            }
          }
          return acc;
        }, { calories: 0, protein: 0 });

        return `
          <div class="menu-day">
            <div class="menu-day-header" data-toggle="m-${day}">
              <span>${day}曜日（${dayNutrition.calories}kcal / P${dayNutrition.protein}g）</span>
              <span>${expanded ? '▲' : '▼'}</span>
            </div>
            ${expanded ? `<div class="menu-day-body">
              ${MEAL_TYPES.map(mt => {
                const mealId = dayMeals[mt];
                const tpl = mealId ? MEAL_TEMPLATES.find(t => t.id === mealId) : null;
                return `
                  <div class="menu-meal">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.35rem">
                      <span class="menu-meal-name">${mt}</span>
                      <select class="meal-day-select" data-day="${day}" data-meal-type="${mt}" style="width:auto;font-size:0.8rem;padding:0.3rem 0.5rem">
                        <option value="">未設定</option>
                        ${MEAL_TEMPLATES.filter(t => t.mealType === mt).map(t =>
                          `<option value="${t.id}" ${mealId === t.id ? 'selected' : ''}>${t.name}</option>`).join('')}
                        ${MEAL_TEMPLATES.filter(t => t.mealType !== mt).map(t =>
                          `<option value="${t.id}" ${mealId === t.id ? 'selected' : ''}>${t.name}（${t.mealType}）</option>`).join('')}
                      </select>
                    </div>
                    ${tpl ? `
                      <div class="menu-meal-detail">${esc(tpl.description)}</div>
                      <div class="menu-meal-detail" style="margin-top:0.25rem">
                        ${(() => { const n = estimateMealNutrition(tpl.ingredients); return `約 ${n.calories}kcal · P${n.protein}g · C${n.carbs}g · F${n.fat}g`; })()}
                        <span class="tag tag-organic">🌿 オーガニック</span>
                      </div>
                      <div class="menu-meal-detail" style="margin-top:0.25rem">
                        材料: ${tpl.ingredients.map(id => getFoodById(id)?.name || id).join('、')}
                      </div>` : ''}
                  </div>`;
              }).join('')}
            </div>` : ''}
          </div>`;
      }).join('')}
      <button class="btn btn-secondary btn-block" id="applyBulkMeals" style="margin-top:0.75rem">
        📋 増量向け食事プランを自動設定
      </button>
    </div>

    <div class="card">
      <div class="card-title">📖 オーガニック食材テンプレート一覧</div>
      ${MEAL_TEMPLATES.map(t => `
        <div class="menu-meal">
          <div class="menu-meal-name">${t.name} <span class="tag tag-meal">${t.mealType}</span> <span class="tag tag-organic">🌿</span></div>
          <div class="menu-meal-detail">${esc(t.description)}</div>
        </div>`).join('')}
    </div>`;
}

function renderShoppingList() {
  const data = getData();
  const menu = data.mealMenu;
  const ingredientSet = new Set();

  for (const day of DAYS) {
    for (const mt of MEAL_TYPES) {
      const mealId = menu.days[day][mt];
      if (mealId) {
        const tpl = MEAL_TEMPLATES.find(t => t.id === mealId);
        if (tpl) tpl.ingredients.forEach(id => ingredientSet.add(id));
      }
    }
  }

  const items = [...ingredientSet].map(id => getFoodById(id)).filter(Boolean);
  const byCategory = {};
  items.forEach(f => {
    if (!byCategory[f.category]) byCategory[f.category] = [];
    byCategory[f.category].push(f);
  });

  return `
    <div class="card">
      <div class="card-title">🛒 週間買い物リスト</div>
      <p style="font-size:0.85rem;color:var(--brown-muted);margin-bottom:1rem">
        食事メニューから自動生成。すべてオーガニック対応食材。
      </p>
      ${Object.keys(byCategory).length ? Object.entries(byCategory).map(([cat, foods]) => `
        <div class="section-divider">${cat}</div>
        <ul class="shopping-list">
          ${foods.map(f => {
            const key = f.id;
            const checked = data.shoppingChecked[key];
            return `<li class="shopping-item ${checked ? 'checked' : ''}">
              <input type="checkbox" data-shop-check="${key}" ${checked ? 'checked' : ''}>
              <span>${f.name} <span class="tag tag-organic">🌿</span></span>
            </li>`;
          }).join('')}
        </ul>`).join('')
      : `<div class="empty-state"><div class="emoji">🛒</div><p>食事メニューを設定すると買い物リストが自動生成されます</p></div>`}
    </div>

    <div class="card">
      <div class="card-title">🏪 オーガニック食材の購入先</div>
      ${ORGANIC_SHOPS.map(s => `
        <div class="menu-meal">
          <div class="menu-meal-name">${s.name}</div>
          <div class="menu-meal-detail">${s.note}</div>
        </div>`).join('')}
    </div>`;
}

function bindMenuEvents() {
  document.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.toggle;
      state.expandedDays[key] = !state.expandedDays[key];
      renderMenu();
      bindMenuEvents();
    });
  });

  document.querySelectorAll('.workout-day-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const data = getData();
      data.workoutMenu.days[sel.dataset.day] = sel.value || null;
      store.saveWorkoutMenu(data.workoutMenu);
      toast('筋トレメニューを更新しました');
      renderMenu();
      bindMenuEvents();
    });
  });

  document.querySelectorAll('.meal-day-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const data = getData();
      data.mealMenu.days[sel.dataset.day][sel.dataset.mealType] = sel.value || null;
      store.saveMealMenu(data.mealMenu);
      toast('食事メニューを更新しました');
      renderMenu();
      bindMenuEvents();
    });
  });

  $('#applyBulkSplit')?.addEventListener('click', () => {
    const data = getData();
    data.workoutMenu.days = { 月: 'push', 火: null, 水: 'pull', 木: null, 金: 'legs', 土: 'full', 日: null };
    store.saveWorkoutMenu(data.workoutMenu);
    toast('増量向け3分割＋全身を設定しました 💪');
    renderAll();
  });

  $('#applyBulkMeals')?.addEventListener('click', () => {
    const data = getData();
    const plan = {
      月: { 朝食: 'breakfast-oats', 昼食: 'lunch-rice-chicken', 夕食: 'dinner-beef-rice', 間食: 'snack-nuts' },
      火: { 朝食: 'breakfast-eggs', 昼食: 'lunch-pasta', 夕食: 'dinner-pork', 間食: 'snack-eggs' },
      水: { 朝食: 'breakfast-oats', 昼食: 'lunch-rice-chicken', 夕食: 'dinner-beef-rice', 間食: 'snack-nuts' },
      木: { 朝食: 'breakfast-eggs', 昼食: 'lunch-pasta', 夕食: 'dinner-pork', 間食: 'snack-eggs' },
      金: { 朝食: 'breakfast-oats', 昼食: 'lunch-rice-chicken', 夕食: 'dinner-beef-rice', 間食: 'snack-nuts' },
      土: { 朝食: 'breakfast-eggs', 昼食: 'lunch-pasta', 夕食: 'dinner-pork', 間食: 'snack-eggs' },
      日: { 朝食: 'breakfast-oats', 昼食: 'lunch-rice-chicken', 夕食: 'dinner-beef-rice', 間食: 'snack-nuts' },
    };
    data.mealMenu.days = plan;
    store.saveMealMenu(data.mealMenu);
    toast('増量向けオーガニック食事プランを設定しました 🌿');
    renderAll();
  });

  document.querySelectorAll('[data-shop-check]').forEach(cb => {
    cb.addEventListener('change', () => {
      store.toggleShoppingItem(cb.dataset.shopCheck);
      renderMenu();
      bindMenuEvents();
    });
  });
}

// ─── Settings ───
function renderSettings() {
  const data = getData();
  const p = data.profile;
  const targets = calcBulkTargets(p);

  main().innerHTML = `
    <div class="card">
      <div class="card-title">👤 プロフィール</div>
      <form id="profileForm">
        <div class="form-group">
          <label>名前</label>
          <input type="text" name="name" value="${esc(p.name)}">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>現在の体重 (kg)</label>
            <input type="number" name="weight" step="0.1" value="${p.weight}" required>
          </div>
          <div class="form-group">
            <label>目標体重 (kg)</label>
            <input type="number" name="targetWeight" step="0.1" value="${p.targetWeight}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>身長 (cm)</label>
            <input type="number" name="height" value="${p.height}" required>
          </div>
          <div class="form-group">
            <label>年齢</label>
            <input type="number" name="age" value="${p.age}" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>性別</label>
            <select name="sex">
              <option value="male" ${p.sex === 'male' ? 'selected' : ''}>男性</option>
              <option value="female" ${p.sex === 'female' ? 'selected' : ''}>女性</option>
            </select>
          </div>
          <div class="form-group">
            <label>活動レベル</label>
            <select name="activity">
              <option value="low" ${p.activity === 'low' ? 'selected' : ''}>低（デスクワーク中心）</option>
              <option value="moderate" ${p.activity === 'moderate' ? 'selected' : ''}>中（週3-4トレ）</option>
              <option value="high" ${p.activity === 'high' ? 'selected' : ''}>高（週5-6トレ）</option>
              <option value="very_high" ${p.activity === 'very_high' ? 'selected' : ''}>非常に高（毎日）</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>カロリーサープラス (kcal/日)</label>
            <input type="number" name="surplus" value="${p.surplus}" min="200" max="800" step="50">
          </div>
          <div class="form-group">
            <label>タンパク質倍率 (× 体重kg)</label>
            <input type="number" name="proteinRatio" value="${p.proteinRatio}" min="1.2" max="2.5" step="0.1">
          </div>
        </div>
        <div class="form-group">
          <label>オーガニック食材の優先度</label>
          <select name="organicPriority">
            <option value="high" ${p.organicPriority === 'high' ? 'selected' : ''}>できる限りオーガニック</option>
            <option value="medium" ${p.organicPriority === 'medium' ? 'selected' : ''}>主要食材はオーガニック</option>
            <option value="flexible" ${p.organicPriority === 'flexible' ? 'selected' : ''}>柔軟に（入手しやすい方を優先）</option>
          </select>
        </div>
        <button type="submit" class="btn btn-primary btn-block">設定を保存</button>
      </form>
    </div>

    <div class="card">
      <div class="card-title">🎯 増量目標（自動計算）</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.9rem">
        <div><strong>TDEE</strong><br>${targets.tdee} kcal/日</div>
        <div><strong>目標カロリー</strong><br>${targets.calories} kcal/日</div>
        <div><strong>タンパク質</strong><br>${targets.protein} g/日</div>
        <div><strong>脂質（目安）</strong><br>${targets.fat} g/日</div>
        <div><strong>炭水化物（目安）</strong><br>${targets.carbs} g/日</div>
        <div><strong>サープラス</strong><br>+${targets.surplus} kcal/日</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">💾 データ管理</div>
      <button class="btn btn-secondary btn-block" id="exportBtn" style="margin-bottom:0.5rem">データをエクスポート</button>
      <button class="btn btn-outline btn-block" id="importBtn" style="margin-bottom:0.5rem">データをインポート</button>
      <button class="btn btn-danger btn-block" id="resetBtn">すべてのデータをリセット</button>
    </div>`;

  $('#profileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    store.saveProfile({
      name: fd.get('name'),
      weight: Number(fd.get('weight')),
      targetWeight: Number(fd.get('targetWeight')),
      height: Number(fd.get('height')),
      age: Number(fd.get('age')),
      sex: fd.get('sex'),
      activity: fd.get('activity'),
      surplus: Number(fd.get('surplus')),
      proteinRatio: Number(fd.get('proteinRatio')),
      organicPriority: fd.get('organicPriority'),
    });
    toast('設定を保存しました ✅');
    renderAll();
  });

  $('#exportBtn').addEventListener('click', () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `shinyu-bulk-log-${todayStr()}.json`;
    a.click();
    toast('エクスポートしました');
  });

  $('#importBtn').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.addEventListener('change', () => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          store.importData(reader.result);
          toast('インポートしました');
          renderAll();
        } catch {
          toast('インポートに失敗しました');
        }
      };
      reader.readAsText(input.files[0]);
    });
    input.click();
  });

  $('#resetBtn').addEventListener('click', () => {
    if (confirm('すべてのデータを削除しますか？この操作は取り消せません。')) {
      store.reset();
      toast('リセットしました');
      renderAll();
    }
  });
}

// ─── Navigation ───
function navigate(page, tab) {
  state.page = page;
  if (tab) {
    if (page === 'log') state.logTab = tab;
    if (page === 'menu') state.menuTab = tab;
  }
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
  renderPage();
}

function renderPage() {
  switch (state.page) {
    case 'home': renderHome(); bindHomeEvents(); break;
    case 'log': renderLog(); bindLogEvents(); break;
    case 'menu': renderMenu(); bindMenuEvents(); break;
    case 'settings': renderSettings(); break;
  }
}

function renderAll() {
  renderHeader();
  renderPage();
}

function esc(str) {
  if (!str) return '';
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

// Global navigate for inline onclick
window.navigate = navigate;

// Init
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => navigate(btn.dataset.page));
});

renderAll();

// PWA: Service Worker登録
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}
