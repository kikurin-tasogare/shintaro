import { store } from './storage.js?v=4';
import {
  ORGANIC_FOODS, MEAL_TEMPLATES, WORKOUT_TEMPLATES, DAYS, MEAL_TYPES,
  BULK_TIPS, ORGANIC_SHOPS, calcBulkTargets, getFoodById,
  estimateMealNutrition, buildDailyMealPlan, getWorkoutWeek, NUTRITION_SOURCE,
  todayStr, formatDate,
} from './data.js?v=4';

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

function profileWithLatestWeight(data) {
  return { ...data.profile, weight: data.weightLogs[0]?.weight || data.profile.weight };
}

function averageWeight(logs) {
  if (!logs.length) return null;
  return logs.reduce((sum, log) => sum + Number(log.weight), 0) / logs.length;
}

function getWeightTrend(data) {
  const sorted = [...data.weightLogs].sort((a, b) => b.date.localeCompare(a.date));
  const recent = averageWeight(sorted.slice(0, 7));
  const previous = sorted.length >= 14 ? averageWeight(sorted.slice(7, 14)) : null;
  return {
    average: recent,
    weeklyChange: recent !== null && previous !== null ? recent - previous : null,
  };
}

function weightTrendAdvice(data, trend) {
  if (trend.weeklyChange === null || trend.average === null) return '14日分たまると、増量ペースから食事量の調整目安を表示します。';
  const rate = trend.weeklyChange / Math.max(trend.average, 1) * 100;
  if (rate < 0.25) return `週${rate.toFixed(2)}%。2週間続けて低ければ、まず1日+100kcalを検討。`;
  if (rate > 0.5) return `週${rate.toFixed(2)}%。脂肪増加を抑えたい場合は、1日-100kcalを検討。`;
  return `週${rate.toFixed(2)}%。一般的な増量目安（週0.25〜0.5%）の範囲です。`;
}

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
  const targets = calcBulkTargets(profileWithLatestWeight(data));
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
  const liveProfile = profileWithLatestWeight(data);
  const targets = calcBulkTargets(liveProfile);
  const today = todayStr();
  const nutrition = getTodayNutrition(today);
  const { workouts } = store.getLogsForDate(today);
  const weightLogs = data.weightLogs.slice(0, 14).reverse();
  const tip = BULK_TIPS[new Date().getDate() % BULK_TIPS.length];
  const trend = getWeightTrend(data);
  const dailyPlan = buildDailyMealPlan(today, targets);

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

  main().innerHTML = `
    <div class="tip-box">✦ ${tip}</div>

    <div class="card">
      <div class="card-title">✦ 今日の進捗 <span class="tag tag-bulk">増量中</span></div>
      ${progressBar('☽ カロリー', nutrition.calories, targets.calories, 'calories')}
      ${progressBar('✧ タンパク質', nutrition.protein, targets.protein, 'protein')}
      <p style="font-size:0.8rem;color:var(--brown-muted);margin-top:0.5rem">
        目標: ${targets.calories}kcal（TDEE ${targets.tdee} + サープラス ${targets.surplus}）
      </p>
    </div>

    <div class="card">
      <div class="card-title">☾ 今日のトレーニング</div>
      ${workouts.length ? workouts.map(w => `
        <div class="log-item">
          <div class="log-item-main">
            <div class="log-item-title">${esc(w.title)}</div>
            <div class="log-item-meta">${w.exercises?.length || 0}種目 · ${w.duration || '—'}分</div>
          </div>
        </div>`).join('')
      : `<div class="empty-state"><div class="emoji">✧</div><p>今日はまだ記録なし</p></div>`}
    </div>

    <div class="card">
      <div class="card-title">☽ 体重の推移</div>
      ${weightLogs.length ? `
        <div class="weight-chart">${chartBars}</div>
        <p style="font-size:0.85rem;text-align:center;margin-top:0.5rem">
          現在 ${data.weightLogs[0].weight}kg → 目標 ${data.profile.targetWeight}kg
          ${gained !== null ? `（変化: ${gained > 0 ? '+' : ''}${gained}kg）` : ''}
        </p>` : `
        <div class="empty-state"><div class="emoji">☾</div><p>体重を記録するとグラフが表示されます</p></div>`}
      ${goalWeightProgress(data)}
      <p class="evidence-note" style="margin-top:0.75rem">
        7日平均: ${trend.average === null ? '記録待ち' : `${trend.average.toFixed(1)}kg`}
        ${trend.weeklyChange === null ? '' : ` · 前週比 ${trend.weeklyChange >= 0 ? '+' : ''}${trend.weeklyChange.toFixed(2)}kg`}
        <br>${weightTrendAdvice(data, trend)}
      </p>
    </div>

    <div class="card">
      <div class="card-title">✦ 今日の食事</div>
      ${renderTodayMeals(today)}
    </div>

    <div class="card">
      <div class="card-title">☾ 今日のGF増量プラン <span class="tag tag-gf">GF優先</span></div>
      <p class="card-lead">毎日組み合わせを変え、分量から栄養を計算しています。</p>
      ${dailyPlan.map(item => `
        <div class="plan-meal">
          <div class="plan-meal-head"><span class="tag tag-meal">${item.mealType}</span><strong>${esc(item.name)}</strong></div>
          <div class="log-item-meta">${item.nutrition.calories}kcal · P${item.nutrition.protein}g · C${item.nutrition.carbs}g · F${item.nutrition.fat}g</div>
          <details><summary>材料・作り方</summary>
            <ul class="ingredient-list">${item.ingredients.map(entry => {
              const food = getFoodById(entry.id);
              return `<li>${esc(food?.name || entry.id)} ${Math.round(entry.grams * item.servings)}g${food?.checkLabel ? ' <span class="label-check">表示確認</span>' : ''}</li>`;
            }).join('')}</ul>
            <p class="recipe-steps">${item.steps.map((step, i) => `${i + 1}. ${esc(step)}`).join('<br>')}</p>
          </details>
        </div>`).join('')}
      <div class="evidence-note">
        栄養値出典: <a href="${NUTRITION_SOURCE.url}" target="_blank" rel="noopener">${NUTRITION_SOURCE.name}</a>。商品表示がある場合は商品値を優先してください。<br>
        参考: <a href="https://pubmed.ncbi.nlm.nih.gov/31247944/" target="_blank" rel="noopener">増量期の栄養レビュー</a> ·
        <a href="https://www.maff.go.jp/j/syouan/keikaku/soukatu/okome_summary/04/functio_nality_03.html" target="_blank" rel="noopener">農林水産省のGF解説</a>
      </div>
    </div>`;
}

function goalWeightProgress(data) {
  const start = Number(data.profile.startWeight || data.profile.weight);
  const current = Number(data.weightLogs[0]?.weight || data.profile.weight);
  const target = Number(data.profile.targetWeight);
  const span = target - start;
  const pct = span > 0 ? Math.max(0, Math.min(100, Math.round(((current - start) / span) * 100))) : 0;
  return `<div class="progress-group">
    <div class="progress-label"><span>✦ 目標まで</span><span>${current}kg / ${target}kg（${pct}%）</span></div>
    <div class="progress-bar"><div class="progress-fill weight" style="width:${pct}%"></div></div>
  </div>`;
}

function renderTodayMeals(date) {
  const { meals } = store.getLogsForDate(date);
  if (!meals.length) return `<div class="empty-state"><div class="emoji">✦</div><p>今日はまだ食事記録なし</p></div>`;
  return `<ul class="log-list">${meals.map(m => `
    <li class="log-item">
      <div class="log-item-main">
        <div class="log-item-title">${esc(m.name)} <span class="tag tag-meal">${esc(m.mealType || '')}</span></div>
        <div class="log-item-meta">${m.calories || 0}kcal · P${m.protein || 0}g · C${m.carbs || 0}g · F${m.fat || 0}g
          ${m.organic ? '<span class="tag tag-organic">✧ 素材中心</span>' : ''}
        </div>
      </div>
    </li>`).join('')}</ul>`;
}

// ─── Log Page ───
function renderLog() {
  main().innerHTML = `
    <div class="sub-tabs">
      <button class="sub-tab ${state.logTab === 'workout' ? 'active' : ''}" data-log-tab="workout">☾ 筋トレ</button>
      <button class="sub-tab ${state.logTab === 'meal' ? 'active' : ''}" data-log-tab="meal">✦ 食事</button>
      <button class="sub-tab ${state.logTab === 'weight' ? 'active' : ''}" data-log-tab="weight">☽ 体重</button>
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
      <div class="card-title">☾ 筋トレを記録</div>
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
              <div><label>重量kg</label><input name="exWeight" type="number" step="0.5" min="0" placeholder="40"></div>
              <div><label>セット</label><input name="exSets" type="number" placeholder="4" min="1"></div>
              <div><label>レップ</label><input name="exReps" placeholder="8-10"></div>
              <div><label>RIR</label><input name="exRir" type="number" min="0" max="10" placeholder="2"></div>
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
      ${renderTrainingAdvice(recent[0])}
    </div>
    <div class="card">
      <div class="card-title">◇ 最近の記録</div>
      ${recent.length ? `<ul class="log-list">${recent.map(w => `
        <li class="log-item">
          <div class="log-item-main">
            <div class="log-item-title">${esc(w.title)}</div>
            <div class="log-item-meta">${formatDate(w.date)} · ${w.exercises?.length || 0}種目 · ${w.duration || '—'}分</div>
            ${w.exercises?.length ? `<div class="log-item-meta">${w.exercises.map(e => `${esc(e.name)} ${esc(e.weight || '—')}kg · ${esc(e.sets)}×${esc(e.reps)} · RIR${esc(e.rir || '—')}`).join('<br>')}</div>` : ''}
          </div>
          <div class="log-item-actions">
            <button class="btn btn-danger btn-sm" data-delete-workout="${w.id}">削除</button>
          </div>
        </li>`).join('')}</ul>`
      : `<div class="empty-state"><p>まだ記録がありません</p></div>`}
    </div>`;
}

function renderTrainingAdvice(lastWorkout) {
  if (!lastWorkout?.exercises?.length) return `<div class="evidence-note" style="margin-top:1rem">最初はテンプレートを選び、フォームを崩さず「あと2回できる」程度で記録してください。</div>`;
  const rows = lastWorkout.exercises.map(ex => {
    const hasRir = ex.rir !== '' && ex.rir !== null && ex.rir !== undefined;
    const rir = hasRir ? Number(ex.rir) : NaN;
    let advice = '同じ重量で回数を1回ずつ伸ばす';
    if (Number.isFinite(rir) && rir >= 3) advice = '余裕あり。次回は最小幅だけ重量を上げる候補';
    if (Number.isFinite(rir) && rir === 0) advice = '限界。次回は重量維持か少し軽くする';
    return `<li><strong>${esc(ex.name)}</strong>：${advice}</li>`;
  }).join('');
  return `<div class="training-advice"><strong>次回の目安</strong><ul>${rows}</ul><small>痛みがある場合は数値に関係なく中止し、痛くない種目へ変更してください。</small></div>`;
}

function renderMealLog() {
  const data = getData();
  const recent = data.mealLogs.slice(0, 20);
  return `
    <div class="card">
      <div class="card-title">✦ 食事を記録</div>
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
        <div class="food-calculator">
          <div class="food-calculator-head">
            <div>
              <strong>☽ 食べた物から自動計算</strong>
              <p>食材と実際に食べた量を入れてください。</p>
            </div>
            <button type="button" class="btn btn-outline btn-sm" id="addFoodItem">＋ 食材</button>
          </div>
          <div id="foodCalculatorRows">
            ${renderFoodCalculatorRow()}
          </div>
          <div class="nutrition-total" id="foodCalculatorTotal">
            <span><strong>0</strong><small>kcal</small></span>
            <span><strong>0</strong><small>たんぱく質 g</small></span>
            <span><strong>0</strong><small>炭水化物 g</small></span>
            <span><strong>0</strong><small>脂質 g</small></span>
          </div>
          <button type="button" class="btn btn-secondary btn-block" id="applyFoodCalculation">計算結果を記録欄へ反映</button>
          <p class="calculator-note">一覧にない市販品・外食は、商品の栄養成分表示を下の欄へ直接入力してください。</p>
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
            <input type="checkbox" name="organic" style="width:auto"> ✧ 素材中心・原材料確認済み
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
      <div class="card-title">◇ 最近の記録</div>
      ${recent.length ? `<ul class="log-list">${recent.map(m => `
        <li class="log-item">
          <div class="log-item-main">
            <div class="log-item-title">${esc(m.name)} <span class="tag tag-meal">${esc(m.mealType || '')}</span>
              ${m.organic ? '<span class="tag tag-organic">✧</span>' : ''}
            </div>
            <div class="log-item-meta">${formatDate(m.date)} · ${m.calories || 0}kcal · P${m.protein || 0}g · C${m.carbs || 0}g · F${m.fat || 0}g</div>
            ${m.ingredients?.length ? `<div class="log-item-meta">${m.ingredients.map(item => `${esc(item.name)} ${item.grams}g`).join('、')}</div>` : ''}
          </div>
          <div class="log-item-actions">
            <button class="btn btn-danger btn-sm" data-delete-meal="${m.id}">削除</button>
          </div>
        </li>`).join('')}</ul>`
      : `<div class="empty-state"><p>まだ記録がありません</p></div>`}
    </div>`;
}

function foodOptions(selectedId = '') {
  const categories = [...new Set(ORGANIC_FOODS.map(food => food.category))];
  return `<option value="">食材を選ぶ</option>${categories.map(category => `
    <optgroup label="${esc(category)}">
      ${ORGANIC_FOODS.filter(food => food.category === category).map(food =>
        `<option value="${food.id}" ${food.id === selectedId ? 'selected' : ''}>${esc(food.name)}</option>`
      ).join('')}
    </optgroup>`).join('')}`;
}

function renderFoodCalculatorRow(selectedId = '', grams = 100) {
  return `<div class="food-calculator-row">
    <select class="food-select" aria-label="食材">${foodOptions(selectedId)}</select>
    <div class="food-grams"><input class="food-grams-input" type="number" value="${grams}" min="1" max="3000" step="1" inputmode="decimal" aria-label="食べた量"><span>g</span></div>
    <button type="button" class="btn btn-danger btn-sm remove-food-item" aria-label="この食材を削除">✕</button>
  </div>`;
}

function calculateFoodRows(form) {
  const ingredients = [...form.querySelectorAll('.food-calculator-row')].map(row => {
    const food = getFoodById(row.querySelector('.food-select').value);
    const grams = Number(row.querySelector('.food-grams-input').value) || 0;
    return food && grams > 0 ? { id: food.id, name: food.name, grams } : null;
  }).filter(Boolean);
  return { ingredients, nutrition: estimateMealNutrition(ingredients) };
}

function updateFoodCalculator(form) {
  const { nutrition } = calculateFoodRows(form);
  const total = $('#foodCalculatorTotal');
  if (!total) return;
  total.innerHTML = `
    <span><strong>${nutrition.calories}</strong><small>kcal</small></span>
    <span><strong>${nutrition.protein}</strong><small>たんぱく質 g</small></span>
    <span><strong>${nutrition.carbs}</strong><small>炭水化物 g</small></span>
    <span><strong>${nutrition.fat}</strong><small>脂質 g</small></span>`;
}

function renderWeightLog() {
  const data = getData();
  const logs = data.weightLogs.slice(0, 30);
  const targets = calcBulkTargets(profileWithLatestWeight(data));
  return `
    <div class="card">
      <div class="card-title">☽ 体重を記録</div>
      <div class="tip-box">測定は毎日でも大丈夫。朝・排泄後など条件をそろえ、日々の上下ではなく7日平均で判断します。</div>
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
      <div class="card-title">◇ 体重履歴</div>
      ${logs.length ? `<ul class="log-list">${logs.map(w => `
        <li class="log-item">
          <div class="log-item-main">
            <div class="log-item-title">${w.weight} kg</div>
            <div class="log-item-meta">${formatDate(w.date)}${w.note ? ' · ' + esc(w.note) : ''}</div>
          </div>
          <div class="log-item-actions">
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
          weight: row.querySelector('[name="exWeight"]').value || '',
          sets: row.querySelector('[name="exSets"]').value || '—',
          reps: row.querySelector('[name="exReps"]').value || '—',
          rir: row.querySelector('[name="exRir"]').value || '',
        });
      });
      store.addWorkoutLog({
        date: fd.get('date'),
        title: fd.get('title'),
        duration: fd.get('duration'),
        exercises,
        note: fd.get('note'),
      });
      toast('筋トレ記録を保存しました ✦');
      renderAll();
    });

    $('#addExercise')?.addEventListener('click', () => {
      const list = $('#exerciseList');
      const row = document.createElement('div');
      row.className = 'set-row exercise-entry';
      row.innerHTML = `
        <div><label>種目名</label><input name="exName" placeholder="種目名"></div>
        <div><label>重量kg</label><input name="exWeight" type="number" step="0.5" min="0" placeholder="40"></div>
        <div><label>セット</label><input name="exSets" type="number" placeholder="3" min="1"></div>
        <div><label>レップ</label><input name="exReps" placeholder="10"></div>
        <div><label>RIR</label><input name="exRir" type="number" min="0" max="10" placeholder="2"></div>
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
          <div><label>重量kg</label><input name="exWeight" type="number" step="0.5" min="0" placeholder="記録"></div>
          <div><label>セット</label><input name="exSets" type="number" value="${ex.sets}" min="1"></div>
          <div><label>レップ</label><input name="exReps" value="${esc(ex.reps)}"></div>
          <div><label>RIR</label><input name="exRir" type="number" min="0" max="10" value="2"></div>
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
      const calculated = calculateFoodRows(mf);
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
        ingredients: calculated.ingredients,
      });
      toast('食事記録を保存しました ✦');
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
      mf.querySelector('[name="organic"]').checked = tpl.minimallyProcessed;
    });

    const calculatorRows = $('#foodCalculatorRows');
    const bindFoodRow = (row) => {
      row.querySelectorAll('select, input').forEach(input => input.addEventListener('input', () => updateFoodCalculator(mf)));
      row.querySelector('.remove-food-item')?.addEventListener('click', () => {
        row.remove();
        if (!calculatorRows.children.length) {
          calculatorRows.insertAdjacentHTML('beforeend', renderFoodCalculatorRow());
          bindFoodRow(calculatorRows.lastElementChild);
        }
        updateFoodCalculator(mf);
      });
    };
    const bindAllFoodRows = () => calculatorRows.querySelectorAll('.food-calculator-row').forEach(bindFoodRow);
    bindAllFoodRows();

    $('#addFoodItem')?.addEventListener('click', () => {
      calculatorRows.insertAdjacentHTML('beforeend', renderFoodCalculatorRow());
      bindFoodRow(calculatorRows.lastElementChild);
      calculatorRows.lastElementChild.querySelector('.food-select').focus();
    });

    $('#applyFoodCalculation')?.addEventListener('click', () => {
      const { ingredients, nutrition } = calculateFoodRows(mf);
      if (!ingredients.length) {
        toast('食材を1つ以上選んでください');
        return;
      }
      mf.querySelector('[name="calories"]').value = nutrition.calories;
      mf.querySelector('[name="protein"]').value = nutrition.protein;
      mf.querySelector('[name="carbs"]').value = nutrition.carbs;
      mf.querySelector('[name="fat"]').value = nutrition.fat;
      if (!mf.querySelector('[name="name"]').value.trim()) {
        mf.querySelector('[name="name"]').value = ingredients.slice(0, 3).map(item => item.name).join('＋') + (ingredients.length > 3 ? 'ほか' : '');
      }
      toast('計算結果を反映しました ☽');
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
    toast('体重を記録しました ☾');
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
}

// ─── Menu Page ───
function renderMenu() {
  main().innerHTML = `
    <div class="sub-tabs">
      <button class="sub-tab ${state.menuTab === 'workout' ? 'active' : ''}" data-menu-tab="workout">☾ 筋トレメニュー</button>
      <button class="sub-tab ${state.menuTab === 'meal' ? 'active' : ''}" data-menu-tab="meal">✦ 食事メニュー</button>
      <button class="sub-tab ${state.menuTab === 'shopping' ? 'active' : ''}" data-menu-tab="shopping">◇ 買い物リスト</button>
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
      <div class="card-title">☾ 週間筋トレメニュー</div>
      <p style="font-size:0.85rem;color:var(--brown-muted);margin-bottom:1rem">
        続けられる日数を優先。基本種目は4〜8週間続け、重量か回数を少しずつ伸ばします。
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
        ◇ 設定した日数で自動作成
      </button>
      <div class="evidence-note" style="margin-top:0.75rem">参考: <a href="https://acsm.org/resistance-training-guidelines-update-2026/" target="_blank" rel="noopener">ACSM 2026 筋力トレーニング指針</a>。筋肥大は各筋群週約10セットを出発点に、継続と回復を優先します。</div>
    </div>`;
}

function renderMealMenuBuilder() {
  const data = getData();
  const menu = data.mealMenu;
  const targets = calcBulkTargets(profileWithLatestWeight(data));

  return `
    <div class="card">
        <div class="card-title">✦ 週間食事メニュー <span class="tag tag-gf">GF優先</span></div>
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
                        <span class="tag tag-gf">GF優先</span>
                      </div>
                      <div class="menu-meal-detail" style="margin-top:0.25rem">
                        材料: ${tpl.ingredients.map(entry => getFoodById(typeof entry === 'string' ? entry : entry.id)?.name || '').filter(Boolean).join('、')}
                      </div>` : ''}
                  </div>`;
              }).join('')}
            </div>` : ''}
          </div>`;
      }).join('')}
      <button class="btn btn-secondary btn-block" id="applyBulkMeals" style="margin-top:0.75rem">
        ◇ 増量向け食事プランを自動設定
      </button>
    </div>

    <div class="card">
      <div class="card-title">◇ GF優先テンプレート一覧</div>
      ${MEAL_TEMPLATES.map(t => `
        <div class="menu-meal">
          <div class="menu-meal-name">${esc(t.name)} <span class="tag tag-meal">${t.mealType}</span> <span class="tag tag-gf">GF</span></div>
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
          if (tpl) tpl.ingredients.forEach(entry => ingredientSet.add(typeof entry === 'string' ? entry : entry.id));
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
      <div class="card-title">◇ 週間買い物リスト</div>
      <p style="font-size:0.85rem;color:var(--brown-muted);margin-bottom:1rem">
        食事メニューから自動生成。包装食品はGF表示と原材料を確認してください。
      </p>
      ${Object.keys(byCategory).length ? Object.entries(byCategory).map(([cat, foods]) => `
        <div class="section-divider">${cat}</div>
        <ul class="shopping-list">
          ${foods.map(f => {
            const key = f.id;
            const checked = data.shoppingChecked[key];
            return `<li class="shopping-item ${checked ? 'checked' : ''}">
              <input type="checkbox" data-shop-check="${key}" ${checked ? 'checked' : ''}>
              <span>${esc(f.name)} ${f.checkLabel ? '<span class="label-check">表示確認</span>' : ''}</span>
            </li>`;
          }).join('')}
        </ul>`).join('')
      : `<div class="empty-state"><div class="emoji">◇</div><p>食事メニューを設定すると買い物リストが自動生成されます</p></div>`}
    </div>

    <div class="card">
      <div class="card-title">✦ 素材中心の購入ヒント</div>
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
    const suggested = getWorkoutWeek(data.profile.daysPerWeek);
    data.workoutMenu.days = { 月: null, 火: null, 水: null, 木: null, 金: null, 土: null, 日: null, ...suggested };
    store.saveWorkoutMenu(data.workoutMenu);
    toast(`週${data.profile.daysPerWeek}日のメニューを設定しました ✦`);
    renderAll();
  });

  $('#applyBulkMeals')?.addEventListener('click', () => {
    const data = getData();
    const targets = calcBulkTargets(profileWithLatestWeight(data));
    const plan = {};
    DAYS.forEach((day, index) => {
      const date = `2026-01-${String(index + 10).padStart(2, '0')}`;
      plan[day] = Object.fromEntries(buildDailyMealPlan(date, targets).map(item => [item.mealType, item.id]));
    });
    data.mealMenu.days = plan;
    store.saveMealMenu(data.mealMenu);
    toast('GF優先の増量食事プランを設定しました ☾');
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
  const targets = calcBulkTargets(profileWithLatestWeight(data));

  main().innerHTML = `
    <div class="card">
      <div class="card-title">☽ プロフィール</div>
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
        <div class="section-divider">食事の方針</div>
        <div class="form-row">
          <div class="form-group">
            <label>グルテンフリー</label>
            <select name="glutenMode">
              <option value="prefer" ${p.glutenMode === 'prefer' ? 'selected' : ''}>できるだけ優先</option>
              <option value="strict" ${p.glutenMode === 'strict' ? 'selected' : ''}>厳格に除外</option>
              <option value="medical" ${p.glutenMode === 'medical' ? 'selected' : ''}>医療上必要（混入も注意）</option>
            </select>
          </div>
          <div class="form-group">
            <label>加工品・添加物</label>
            <select name="additivePriority">
              <option value="high" ${p.additivePriority === 'high' ? 'selected' : ''}>素材中心</option>
              <option value="medium" ${p.additivePriority === 'medium' ? 'selected' : ''}>主要食品だけ確認</option>
              <option value="flexible" ${p.additivePriority === 'flexible' ? 'selected' : ''}>続けやすさ優先</option>
            </select>
          </div>
        </div>
        <div class="section-divider">筋トレ環境</div>
        <div class="form-row-3">
          <div class="form-group"><label>経験</label><select name="trainingExperience">
            <option value="beginner" ${p.trainingExperience === 'beginner' ? 'selected' : ''}>初心者</option>
            <option value="intermediate" ${p.trainingExperience === 'intermediate' ? 'selected' : ''}>中級者</option>
            <option value="advanced" ${p.trainingExperience === 'advanced' ? 'selected' : ''}>上級者</option>
          </select></div>
          <div class="form-group"><label>週の日数</label><input type="number" name="daysPerWeek" min="2" max="5" value="${p.daysPerWeek}"></div>
          <div class="form-group"><label>1回の分数</label><input type="number" name="sessionMinutes" min="20" max="180" step="5" value="${p.sessionMinutes}"></div>
        </div>
        <div class="form-group"><label>設備</label><select name="equipment">
          <option value="gym" ${p.equipment === 'gym' ? 'selected' : ''}>ジム</option>
          <option value="home" ${p.equipment === 'home' ? 'selected' : ''}>自宅（ダンベル等）</option>
          <option value="bodyweight" ${p.equipment === 'bodyweight' ? 'selected' : ''}>自重中心</option>
        </select></div>
        <button type="submit" class="btn btn-primary btn-block">設定を保存</button>
      </form>
    </div>

    <div class="card">
      <div class="card-title">✦ 増量目標（概算）</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.75rem;font-size:0.9rem">
        <div><strong>TDEE</strong><br>${targets.tdee} kcal/日</div>
        <div><strong>目標カロリー</strong><br>${targets.calories} kcal/日</div>
        <div><strong>タンパク質</strong><br>${targets.protein} g/日</div>
        <div><strong>脂質（目安）</strong><br>${targets.fat} g/日</div>
        <div><strong>炭水化物（目安）</strong><br>${targets.carbs} g/日</div>
        <div><strong>サープラス</strong><br>+${targets.surplus} kcal/日</div>
      </div>
      <p class="evidence-note" style="margin-top:0.75rem">TDEEは推定値です。毎日の体重ではなく7日平均の変化を見て、必要に応じてサープラスを100kcal単位で調整してください。</p>
    </div>

    <div class="card">
      <div class="card-title">◇ データ管理</div>
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
      glutenMode: fd.get('glutenMode'),
      additivePriority: fd.get('additivePriority'),
      trainingExperience: fd.get('trainingExperience'),
      daysPerWeek: Number(fd.get('daysPerWeek')),
      sessionMinutes: Number(fd.get('sessionMinutes')),
      equipment: fd.get('equipment'),
    });
    toast('設定を保存しました ✦');
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
    case 'home': renderHome(); break;
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
