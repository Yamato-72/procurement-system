/**
 * YS調達ナビ - ダッシュボード機能
 */

// グローバル変数
let inventory = [];
let archivedInventory = [];
let projects = [];
let suppliers = [];
let knowledge = [];
let salesData = [];
let charts = {};

// 売上データ（6期・7期）
const SALES_RAW_DATA = [
    // 6期 2024年7月〜2025年6月
    {period:'6期',month:'2024-07',category:'マルチディスプレイ',amount:4638400},
    {period:'6期',month:'2024-07',category:'液晶ディスプレイ(屋外)',amount:4409800},
    {period:'6期',month:'2024-07',category:'液晶ディスプレイ(屋内)',amount:912000},
    {period:'6期',month:'2024-07',category:'LEDビジョン',amount:263000},
    {period:'6期',month:'2024-07',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2024-07',category:'レンタル',amount:497550},
    {period:'6期',month:'2024-07',category:'その他',amount:1132700},
    {period:'6期',month:'2024-08',category:'マルチディスプレイ',amount:4618700},
    {period:'6期',month:'2024-08',category:'液晶ディスプレイ(屋外)',amount:2278670},
    {period:'6期',month:'2024-08',category:'液晶ディスプレイ(屋内)',amount:472800},
    {period:'6期',month:'2024-08',category:'LEDビジョン',amount:0},
    {period:'6期',month:'2024-08',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2024-08',category:'レンタル',amount:497550},
    {period:'6期',month:'2024-08',category:'その他',amount:658000},
    {period:'6期',month:'2024-09',category:'マルチディスプレイ',amount:6371600},
    {period:'6期',month:'2024-09',category:'液晶ディスプレイ(屋外)',amount:4151850},
    {period:'6期',month:'2024-09',category:'液晶ディスプレイ(屋内)',amount:1263500},
    {period:'6期',month:'2024-09',category:'LEDビジョン',amount:424000},
    {period:'6期',month:'2024-09',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2024-09',category:'レンタル',amount:497550},
    {period:'6期',month:'2024-09',category:'その他',amount:163400},
    {period:'6期',month:'2024-10',category:'マルチディスプレイ',amount:14377550},
    {period:'6期',month:'2024-10',category:'液晶ディスプレイ(屋外)',amount:1189000},
    {period:'6期',month:'2024-10',category:'液晶ディスプレイ(屋内)',amount:1549450},
    {period:'6期',month:'2024-10',category:'LEDビジョン',amount:3943600},
    {period:'6期',month:'2024-10',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2024-10',category:'レンタル',amount:564550},
    {period:'6期',month:'2024-10',category:'その他',amount:4329500},
    {period:'6期',month:'2024-11',category:'マルチディスプレイ',amount:2508000},
    {period:'6期',month:'2024-11',category:'液晶ディスプレイ(屋外)',amount:3125000},
    {period:'6期',month:'2024-11',category:'液晶ディスプレイ(屋内)',amount:1608500},
    {period:'6期',month:'2024-11',category:'LEDビジョン',amount:3600000},
    {period:'6期',month:'2024-11',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2024-11',category:'レンタル',amount:590400},
    {period:'6期',month:'2024-11',category:'その他',amount:615081},
    {period:'6期',month:'2024-12',category:'マルチディスプレイ',amount:2272600},
    {period:'6期',month:'2024-12',category:'液晶ディスプレイ(屋外)',amount:4912500},
    {period:'6期',month:'2024-12',category:'液晶ディスプレイ(屋内)',amount:0},
    {period:'6期',month:'2024-12',category:'LEDビジョン',amount:8018000},
    {period:'6期',month:'2024-12',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2024-12',category:'レンタル',amount:564550},
    {period:'6期',month:'2024-12',category:'その他',amount:1912400},
    {period:'6期',month:'2025-01',category:'マルチディスプレイ',amount:5888600},
    {period:'6期',month:'2025-01',category:'液晶ディスプレイ(屋外)',amount:0},
    {period:'6期',month:'2025-01',category:'液晶ディスプレイ(屋内)',amount:0},
    {period:'6期',month:'2025-01',category:'LEDビジョン',amount:0},
    {period:'6期',month:'2025-01',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2025-01',category:'レンタル',amount:590200},
    {period:'6期',month:'2025-01',category:'その他',amount:2430950},
    {period:'6期',month:'2025-02',category:'マルチディスプレイ',amount:10515000},
    {period:'6期',month:'2025-02',category:'液晶ディスプレイ(屋外)',amount:16768000},
    {period:'6期',month:'2025-02',category:'液晶ディスプレイ(屋内)',amount:2808000},
    {period:'6期',month:'2025-02',category:'LEDビジョン',amount:0},
    {period:'6期',month:'2025-02',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2025-02',category:'レンタル',amount:855700},
    {period:'6期',month:'2025-02',category:'その他',amount:5633600},
    {period:'6期',month:'2025-03',category:'マルチディスプレイ',amount:24491800},
    {period:'6期',month:'2025-03',category:'液晶ディスプレイ(屋外)',amount:13100700},
    {period:'6期',month:'2025-03',category:'液晶ディスプレイ(屋内)',amount:4173340},
    {period:'6期',month:'2025-03',category:'LEDビジョン',amount:0},
    {period:'6期',month:'2025-03',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2025-03',category:'レンタル',amount:1105450},
    {period:'6期',month:'2025-03',category:'その他',amount:4537025},
    {period:'6期',month:'2025-04',category:'マルチディスプレイ',amount:11374400},
    {period:'6期',month:'2025-04',category:'液晶ディスプレイ(屋外)',amount:2429500},
    {period:'6期',month:'2025-04',category:'液晶ディスプレイ(屋内)',amount:0},
    {period:'6期',month:'2025-04',category:'LEDビジョン',amount:8966600},
    {period:'6期',month:'2025-04',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2025-04',category:'レンタル',amount:650100},
    {period:'6期',month:'2025-04',category:'その他',amount:737850},
    {period:'6期',month:'2025-05',category:'マルチディスプレイ',amount:8712000},
    {period:'6期',month:'2025-05',category:'液晶ディスプレイ(屋外)',amount:0},
    {period:'6期',month:'2025-05',category:'液晶ディスプレイ(屋内)',amount:0},
    {period:'6期',month:'2025-05',category:'LEDビジョン',amount:4941000},
    {period:'6期',month:'2025-05',category:'STUDIA(電子黒板)',amount:0},
    {period:'6期',month:'2025-05',category:'レンタル',amount:650100},
    {period:'6期',month:'2025-05',category:'その他',amount:137250},
    {period:'6期',month:'2025-06',category:'マルチディスプレイ',amount:16854000},
    {period:'6期',month:'2025-06',category:'液晶ディスプレイ(屋外)',amount:23601980},
    {period:'6期',month:'2025-06',category:'液晶ディスプレイ(屋内)',amount:2253000},
    {period:'6期',month:'2025-06',category:'LEDビジョン',amount:7223900},
    {period:'6期',month:'2025-06',category:'STUDIA(電子黒板)',amount:537800},
    {period:'6期',month:'2025-06',category:'レンタル',amount:650100},
    {period:'6期',month:'2025-06',category:'その他',amount:2383950},
    // 7期 2025年7月〜
    {period:'7期',month:'2025-07',category:'マルチディスプレイ',amount:9185000},
    {period:'7期',month:'2025-07',category:'液晶ディスプレイ(屋外)',amount:3776000},
    {period:'7期',month:'2025-07',category:'液晶ディスプレイ(屋内)',amount:0},
    {period:'7期',month:'2025-07',category:'LEDビジョン',amount:3359000},
    {period:'7期',month:'2025-07',category:'STUDIA(電子黒板)',amount:1126000},
    {period:'7期',month:'2025-07',category:'レンタル',amount:650100},
    {period:'7期',month:'2025-07',category:'その他',amount:1511750},
    {period:'7期',month:'2025-08',category:'マルチディスプレイ',amount:0},
    {period:'7期',month:'2025-08',category:'液晶ディスプレイ(屋外)',amount:1603000},
    {period:'7期',month:'2025-08',category:'液晶ディスプレイ(屋内)',amount:0},
    {period:'7期',month:'2025-08',category:'LEDビジョン',amount:358000},
    {period:'7期',month:'2025-08',category:'STUDIA(電子黒板)',amount:3924240},
    {period:'7期',month:'2025-08',category:'レンタル',amount:650100},
    {period:'7期',month:'2025-08',category:'その他',amount:4249250},
    {period:'7期',month:'2025-09',category:'マルチディスプレイ',amount:4692640},
    {period:'7期',month:'2025-09',category:'液晶ディスプレイ(屋外)',amount:773000},
    {period:'7期',month:'2025-09',category:'液晶ディスプレイ(屋内)',amount:283800},
    {period:'7期',month:'2025-09',category:'LEDビジョン',amount:4000000},
    {period:'7期',month:'2025-09',category:'STUDIA(電子黒板)',amount:537800},
    {period:'7期',month:'2025-09',category:'レンタル',amount:650100},
    {period:'7期',month:'2025-09',category:'その他',amount:2302750},
    {period:'7期',month:'2025-10',category:'マルチディスプレイ',amount:9579564},
    {period:'7期',month:'2025-10',category:'液晶ディスプレイ(屋外)',amount:2735000},
    {period:'7期',month:'2025-10',category:'液晶ディスプレイ(屋内)',amount:395000},
    {period:'7期',month:'2025-10',category:'LEDビジョン',amount:0},
    {period:'7期',month:'2025-10',category:'STUDIA(電子黒板)',amount:11516700},
    {period:'7期',month:'2025-10',category:'レンタル',amount:361600},
    {period:'7期',month:'2025-10',category:'その他',amount:6681527}
];

/**
 * 認証成功時のコールバック
 */
function onAuthSuccess() {
    showMain();
    loadData();
}

/**
 * 初期化
 */
function init() {
    initDarkMode();
    lucide.createIcons();
    gapi.load('client', async () => {
        await gapi.client.init({ discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'] });
        const t = sessionStorage.getItem('googleAccessToken');
        if (t) {
            accessToken = t;
            gapi.client.setToken({ access_token: accessToken });
            showMain();
            loadData();
        }
    });
}

/**
 * メイン画面表示
 */
function showMain() {
    document.getElementById('loginSection').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
    document.getElementById('knowledgeBtn').classList.remove('hidden');
    lucide.createIcons();
}

/**
 * サインアウト
 */
function signOut() {
    if (confirm('サインアウトしますか？')) {
        sessionStorage.removeItem('googleAccessToken');
        accessToken = null;
        google.accounts.oauth2.revoke(sessionStorage.getItem('googleAccessToken'), () => {});
        document.getElementById('mainContent').classList.add('hidden');
        document.getElementById('knowledgeBtn').classList.add('hidden');
        document.getElementById('loginSection').classList.remove('hidden');
    }
}

/**
 * データ読み込み
 */
async function loadData() {
    if (!accessToken) return;
    try {
        const [supRes, prjRes, invRes] = await Promise.all([
            gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: CONFIG.SPREADSHEET_ID, range: 'サプライヤー!A2:C' }),
            gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: CONFIG.SPREADSHEET_ID, range: '案件!A2:N' }),
            gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: CONFIG.SPREADSHEET_ID, range: '在庫!A2:Q' })
        ]);
        suppliers = (supRes.result.values || []).map(r => ({ id: parseInt(r[0] || 0), name: r[1] || '' }));
        projects = (prjRes.result.values || []).map(r => ({
            id: r[0],
            projectPrefix: r[1] || 'AD',
            projectNumber: parseInt(r[2]) || 0,
            supplierId: parseInt(r[3] || 0),
            productName: r[4] || '',
            totalAmount: parseFloat(r[5] || 0),
            depositSchedule: JSON.parse(r[6] || '[]'),
            pickupDate: r[10] || '',
            registeredDate: r[11] || '',
            receivedComplete: r[13] === 'true'
        }));
        inventory = (invRes.result.values || []).map(r => ({
            serial: r[1] || '',
            category: r[2] || '',
            productName: r[3] || '',
            receiveDate: r[7] || '',
            status: r[8] || '',
            shipDate: r[9] || '',
            costJPY: r[12] || '',
            shelfNo: r[14] || '',
            supplierId: r[16] || ''
        }));

        try {
            const a = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: CONFIG.SPREADSHEET_ID,
                range: '在庫アーカイブ!A2:Q'
            });
            archivedInventory = (a.result.values || []).map(r => ({
                receiveDate: r[7] || '',
                shipDate: r[9] || '',
                category: r[2] || ''
            }));
        } catch {
            archivedInventory = [];
        }

        await loadKnowledgeData();
        updateAll();
        document.getElementById('lastUpdate').textContent = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        console.error(e);
    }
}

/**
 * ナレッジ読み込み
 */
async function loadKnowledgeData() {
    try {
        const r = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: 'ナレッジ!A2:F'
        });
        knowledge = (r.result.values || []).map((v, i) => ({
            id: i + 2,
            date: v[0] || '',
            category: v[1] || 'note',
            content: v[2] || ''
        }));
    } catch {
        knowledge = [];
    }
    document.getElementById('knowledgeCount').textContent = knowledge.length;
}

/**
 * 全体更新
 */
function updateAll() {
    updateKPIs();
    updateTimeline();
    updateUnpaidTable();
    updateStaleList();
    updateQuickActions();
    updateCharts();
    lucide.createIcons();
}

/**
 * KPI更新
 */
function updateKPIs() {
    const today = new Date();
    const inStock = inventory.filter(i => i.status === '在庫中');
    const waiting = inventory.filter(i => i.status === '入庫待ち');
    const inStockValue = inStock.reduce((s, i) => s + (parseInt(i.costJPY) || 0), 0);

    const we = new Date(today);
    we.setDate(we.getDate() + 7);
    const arrivingThisWeek = projects.filter(p => p.pickupDate && !p.receivedComplete && new Date(p.pickupDate) >= today && new Date(p.pickupDate) <= we).length;

    let unpaidTotal = 0, unpaidCount = 0, overdueCount = 0;
    projects.forEach(p => {
        (p.depositSchedule || []).forEach((d, i) => {
            if (!d.paid) {
                unpaidTotal += d.amountJPY || (d.amountUSD * 150) || 0;
                unpaidCount++;
                if (i === 0 && p.registeredDate && Math.floor((today - new Date(p.registeredDate)) / 86400000) > 30) overdueCount++;
            }
        });
    });

    const tm = today.toISOString().slice(0, 7);
    const lm = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().slice(0, 7);
    let thisMonthTotal = 0, lastMonthTotal = 0;
    projects.forEach(p => {
        (p.depositSchedule || []).forEach(d => {
            if (d.paid && d.paidDate) {
                if (d.paidDate.startsWith(tm)) thisMonthTotal += d.amountJPY || 0;
                if (d.paidDate.startsWith(lm)) lastMonthTotal += d.amountJPY || 0;
            }
        });
    });
    const momChange = lastMonthTotal > 0 ? Math.round((thisMonthTotal - lastMonthTotal) / lastMonthTotal * 100) : 0;

    const stayDays = inStock.filter(i => i.receiveDate).map(i => Math.floor((today - new Date(i.receiveDate)) / 86400000));
    const avgStay = stayDays.length ? Math.round(stayDays.reduce((a, b) => a + b, 0) / stayDays.length) : 0;

    const thisMonthShipped = [...inventory, ...archivedInventory].filter(i => i.shipDate && i.shipDate.startsWith(tm)).length;
    const turnover = ((thisMonthShipped / (inStock.length || 1))).toFixed(1);

    const noShelf = inStock.filter(i => !i.shelfNo).length;
    const stale60 = stayDays.filter(d => d >= 60).length;
    let healthHtml = '';
    if (overdueCount > 0) healthHtml += `<div class="tag tag-red">支払遅延 ${overdueCount}</div>`;
    if (noShelf > 0) healthHtml += `<div class="tag tag-yellow">棚番未設定 ${noShelf}</div>`;
    if (stale60 > 0) healthHtml += `<div class="tag tag-yellow">長期滞留 ${stale60}</div>`;
    if (!healthHtml) healthHtml = '<div class="tag tag-green">問題なし</div>';

    const sales7 = SALES_RAW_DATA.filter(s => s.period === '7期').reduce((a, s) => a + s.amount, 0);
    const sales7Months = SALES_RAW_DATA.filter(s => s.period === '7期').map(s => s.month);
    const uniqueMonths7 = [...new Set(sales7Months)].length;

    document.getElementById('kpiInStock').textContent = inStock.length + '件';
    document.getElementById('kpiInStockSub').textContent = '¥' + (inStockValue / 10000).toFixed(0) + '万';
    document.getElementById('kpiWaiting').textContent = waiting.length + '件';
    document.getElementById('kpiWaitingSub').textContent = arrivingThisWeek > 0 ? `今週${arrivingThisWeek}件` : '-';
    document.getElementById('kpiUnpaid').textContent = '¥' + Math.round(unpaidTotal / 10000) + '万';
    document.getElementById('kpiUnpaidSub').textContent = unpaidCount + '件';
    document.getElementById('kpiThisMonth').textContent = '¥' + Math.round(thisMonthTotal / 10000) + '万';
    document.getElementById('kpiThisMonthSub').innerHTML = `<span class="tag ${momChange >= 0 ? 'tag-red' : 'tag-green'}">${momChange >= 0 ? '+' : ''}${momChange}%</span>`;
    document.getElementById('kpiAvgStay').textContent = avgStay + '日';
    document.getElementById('kpiAvgStaySub').innerHTML = avgStay > 45 ? '<span class="tag tag-yellow">長め</span>' : '<span class="tag tag-green">良好</span>';
    document.getElementById('kpiTurnover').textContent = turnover;
    document.getElementById('kpiSales7').textContent = '¥' + (sales7 / 10000).toFixed(0) + '万';
    document.getElementById('kpiSales7Sub').textContent = uniqueMonths7 + 'ヶ月経過';
    document.getElementById('kpiOverdue').textContent = overdueCount + '件';
    document.getElementById('kpiOverdueSub').innerHTML = overdueCount > 0 ? '<span class="tag tag-red">要対応</span>' : '<span class="tag tag-gray">-</span>';
    document.getElementById('healthMini').innerHTML = healthHtml;
}

/**
 * タイムライン更新
 */
function updateTimeline() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const we = new Date(today);
    we.setDate(we.getDate() + 7);
    const wed = new Date(today);
    wed.setDate(wed.getDate() + 6);
    document.getElementById('weekRange').textContent = `${today.getMonth() + 1}/${today.getDate()}-${wed.getMonth() + 1}/${wed.getDate()}`;

    const events = [];
    projects.forEach(p => {
        const pn = `${p.projectPrefix}-${String(p.projectNumber).padStart(4, '0')}`;
        if (p.pickupDate && !p.receivedComplete) {
            const d = new Date(p.pickupDate);
            if (d >= today && d <= we) events.push({ date: d, type: 'pickup', title: pn, sub: p.productName.slice(0, 12) });
        }
        if (p.registeredDate) {
            (p.depositSchedule || []).forEach((dep, i) => {
                if (dep.paid) return;
                let due;
                if (i === 0) { due = new Date(p.registeredDate); due.setDate(due.getDate() + 7); }
                else if (p.pickupDate) { due = new Date(p.pickupDate); due.setDate(due.getDate() - 7); }
                if (due && due >= today && due <= we) events.push({ date: due, type: 'payment', title: pn, sub: `${dep.percentage}%` });
            });
        }
    });
    events.sort((a, b) => a.date - b.date);

    const c = document.getElementById('timeline');
    if (!events.length) { c.innerHTML = '<p class="t-sub text-center py-4">今週の予定なし</p>'; return; }

    const dn = ['日', '月', '火', '水', '木', '金', '土'];
    c.innerHTML = events.slice(0, 8).map(e => {
        const isToday = e.date.toDateString() === today.toDateString();
        const color = e.type === 'pickup' ? COLORS.orange : COLORS.red;
        const icon = e.type === 'pickup' ? 'truck' : 'wallet';
        return `<div class="flex items-center gap-2 hover-bg p-1.5 rounded ${isToday ? 'bg-card' : ''}">
            <span class="w-12 text-right ${isToday ? 'font-medium' : 't-sub'}">${e.date.getMonth() + 1}/${e.date.getDate()}(${dn[e.date.getDay()]})</span>
            <div class="w-5 h-5 rounded flex items-center justify-center" style="background:${color}20"><i data-lucide="${icon}" class="w-3 h-3" style="color:${color}"></i></div>
            <span class="font-medium">${e.title}</span>
            <span class="t-sub truncate flex-1">${e.sub}</span>
        </div>`;
    }).join('');
    lucide.createIcons();
}

/**
 * 未払い一覧更新
 */
function updateUnpaidTable() {
    const today = new Date();
    const unpaid = [];
    projects.forEach(p => {
        const pn = `${p.projectPrefix}-${String(p.projectNumber).padStart(4, '0')}`;
        (p.depositSchedule || []).forEach((d, i) => {
            if (!d.paid) {
                const days = p.registeredDate ? Math.floor((today - new Date(p.registeredDate)) / 86400000) : 0;
                unpaid.push({ pn, amount: d.amountUSD || 0, days, overdue: i === 0 && days > 30 });
            }
        });
    });
    unpaid.sort((a, b) => b.days - a.days);

    const tbody = document.getElementById('unpaidTable');
    tbody.innerHTML = unpaid.slice(0, 6).map(u => `
        <tr>
            <td class="font-medium">${u.pn}</td>
            <td>$${u.amount.toLocaleString()}</td>
            <td>${u.days}日</td>
            <td><span class="tag ${u.overdue ? 'tag-red' : 'tag-green'}">${u.overdue ? '遅延' : 'OK'}</span></td>
        </tr>
    `).join('') || '<tr><td colspan="4" class="text-center t-sub py-4">未払いなし</td></tr>';
}

/**
 * 滞留リスト更新
 */
function updateStaleList() {
    const today = new Date();
    const stale = inventory.filter(i => i.status === '在庫中' && i.receiveDate)
        .map(i => ({ serial: i.serial, days: Math.floor((today - new Date(i.receiveDate)) / 86400000), cat: i.category }))
        .filter(i => i.days >= 45)
        .sort((a, b) => b.days - a.days);

    const c = document.getElementById('staleList');
    if (!stale.length) { c.innerHTML = '<p class="t-sub text-center py-2">長期滞留なし ✓</p>'; return; }
    c.innerHTML = stale.slice(0, 5).map(s => `
        <div class="flex items-center gap-2 hover-bg p-1.5 rounded">
            <span class="font-medium" style="color:var(--orange)">${s.serial}</span>
            <span class="tag ${s.days >= 60 ? 'tag-red' : 'tag-yellow'}">${s.days}日</span>
            <span class="t-sub truncate">${s.cat}</span>
        </div>
    `).join('');
}

/**
 * クイックアクション更新
 */
function updateQuickActions() {
    const actions = [];
    inventory.filter(i => i.status === '入庫待ち').slice(0, 3).forEach(i => {
        actions.push({ icon: 'package', color: COLORS.blue, title: i.serial, sub: '入庫処理', link: `inventory.html?search=${i.serial}` });
    });
    const today = new Date();
    const unpaidProjects = [];
    projects.forEach(p => {
        const u = (p.depositSchedule || []).find(d => !d.paid);
        if (u && p.registeredDate) unpaidProjects.push({ p, u, d: new Date(p.registeredDate) });
    });
    unpaidProjects.sort((a, b) => a.d - b.d).slice(0, 3).forEach(({ p, u }) => {
        const pn = `${p.projectPrefix}-${String(p.projectNumber).padStart(4, '0')}`;
        actions.push({ icon: 'credit-card', color: COLORS.green, title: pn, sub: `${u.percentage}%支払`, link: `index.html?project=${pn}` });
    });

    const c = document.getElementById('quickActions');
    if (!actions.length) { c.innerHTML = '<p class="t-sub text-center py-2">アクションなし ✓</p>'; return; }
    c.innerHTML = actions.slice(0, 5).map(a => `
        <a href="${a.link}" class="flex items-center gap-2 hover-bg p-1.5 rounded">
            <div class="w-5 h-5 rounded flex items-center justify-center" style="background:${a.color}20">
                <i data-lucide="${a.icon}" class="w-3 h-3" style="color:${a.color}"></i>
            </div>
            <span class="font-medium">${a.title}</span>
            <span class="t-sub">${a.sub}</span>
        </a>
    `).join('');
    lucide.createIcons();
}

/**
 * グラフ更新
 */
function updateCharts() {
    const today = new Date();
    const inStock = inventory.filter(i => i.status === '在庫中');
    const defaultOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

    // 売上推移（直近6ヶ月）
    const salesMonths = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        salesMonths.push({ key: d.toISOString().slice(0, 7), label: `${d.getMonth() + 1}月`, total: 0 });
    }
    SALES_RAW_DATA.forEach(s => {
        const m = salesMonths.find(m => m.key === s.month);
        if (m) m.total += s.amount;
    });
    if (charts.sales) charts.sales.destroy();
    charts.sales = new Chart(document.getElementById('salesChart'), {
        type: 'bar',
        data: { labels: salesMonths.map(m => m.label), datasets: [{ data: salesMonths.map(m => m.total), backgroundColor: COLORS.green, borderRadius: 3 }] },
        options: { ...defaultOpts, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 }, callback: v => (v / 10000000).toFixed(0) + '千万' } } } }
    });

    // カテゴリ別売上（直近6ヶ月合計）
    const salesCatData = {};
    const recentMonths = salesMonths.map(m => m.key);
    SALES_RAW_DATA.filter(s => recentMonths.includes(s.month)).forEach(s => {
        const cat = s.category.replace('液晶ディスプレイ', '液晶').replace('STUDIA(電子黒板)', '電子黒板');
        salesCatData[cat] = (salesCatData[cat] || 0) + s.amount;
    });
    const salesCatLabels = Object.keys(salesCatData).sort((a, b) => salesCatData[b] - salesCatData[a]).slice(0, 5);
    const salesCatValues = salesCatLabels.map(l => salesCatData[l]);
    if (charts.salesCategory) charts.salesCategory.destroy();
    charts.salesCategory = new Chart(document.getElementById('salesCategoryChart'), {
        type: 'doughnut',
        data: { labels: salesCatLabels, datasets: [{ data: salesCatValues, backgroundColor: COLORS.chart }] },
        options: { ...defaultOpts, cutout: '55%', plugins: { legend: { display: true, position: 'right', labels: { boxWidth: 8, padding: 4, font: { size: 9 } } } } }
    });

    // 支払い予定
    const weeks = [];
    for (let i = 0; i < 4; i++) {
        const ws = new Date(today);
        ws.setDate(ws.getDate() + i * 7);
        const we = new Date(ws);
        we.setDate(we.getDate() + 6);
        weeks.push({ label: `${i + 1}週`, start: ws, end: we, total: 0 });
    }
    projects.forEach(p => {
        (p.depositSchedule || []).forEach((d, i) => {
            if (d.paid) return;
            let due;
            if (i === 0 && p.registeredDate) { due = new Date(p.registeredDate); due.setDate(due.getDate() + 14); }
            else if (p.pickupDate) { due = new Date(p.pickupDate); }
            if (due) { const w = weeks.find(w => due >= w.start && due <= w.end); if (w) w.total += d.amountJPY || (d.amountUSD * 150) || 0; }
        });
    });
    if (charts.forecast) charts.forecast.destroy();
    charts.forecast = new Chart(document.getElementById('forecastChart'), {
        type: 'bar',
        data: { labels: weeks.map(w => w.label), datasets: [{ data: weeks.map(w => w.total), backgroundColor: COLORS.green, borderRadius: 3 }] },
        options: { ...defaultOpts, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 }, callback: v => '¥' + (v / 10000).toFixed(0) + '万' } } } }
    });

    // 入出庫推移
    const months = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        months.push({ key: d.toISOString().slice(0, 7), label: `${d.getMonth() + 1}月`, receive: 0, ship: 0 });
    }
    [...inventory, ...archivedInventory].forEach(item => {
        if (item.receiveDate) { const m = months.find(m => m.key === item.receiveDate.slice(0, 7)); if (m) m.receive++; }
        if (item.shipDate) { const m = months.find(m => m.key === item.shipDate.slice(0, 7)); if (m) m.ship++; }
    });
    if (charts.flow) charts.flow.destroy();
    charts.flow = new Chart(document.getElementById('flowChart'), {
        type: 'line',
        data: {
            labels: months.map(m => m.label),
            datasets: [
                { label: '入庫', data: months.map(m => m.receive), borderColor: COLORS.blue, backgroundColor: COLORS.blue + '20', fill: true, tension: 0.3, pointRadius: 3, borderWidth: 2 },
                { label: '出庫', data: months.map(m => m.ship), borderColor: COLORS.purple, backgroundColor: 'transparent', tension: 0.3, pointRadius: 3, borderWidth: 2 }
            ]
        },
        options: { ...defaultOpts, scales: { x: { grid: { display: false }, ticks: { font: { size: 10 } } }, y: { grid: { color: 'rgba(0,0,0,0.05)' }, ticks: { font: { size: 10 } } } }, plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10, padding: 8, font: { size: 10 } } } } }
    });
}

// ナレッジ機能
function showKnowledgeModal() {
    document.getElementById('knowledgeModal').classList.remove('hidden');
    renderKnowledgeList();
    lucide.createIcons();
}

function closeKnowledgeModal() {
    document.getElementById('knowledgeModal').classList.add('hidden');
}

function renderKnowledgeList() {
    const icons = { important: 'pin', supplier: 'factory', cost: 'coins', pattern: 'bar-chart-2', note: 'file-text' };
    const iconColors = { important: COLORS.red, supplier: COLORS.orange, cost: COLORS.green, pattern: COLORS.purple, note: COLORS.gray };
    const c = document.getElementById('knowledgeList');
    if (!knowledge.length) { c.innerHTML = '<p class="t-sub text-center py-8">ナレッジなし</p>'; return; }
    c.innerHTML = [...knowledge].reverse().map(k => `
        <div class="hover-bg p-2 rounded flex items-start gap-2">
            <div class="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style="background:${iconColors[k.category] || COLORS.gray}20">
                <i data-lucide="${icons[k.category] || 'file-text'}" class="w-3 h-3" style="color:${iconColors[k.category] || COLORS.gray}"></i>
            </div>
            <div><p>${k.content}</p><p class="text-xs t-sub mt-1">${k.date}</p></div>
        </div>
    `).join('');
    lucide.createIcons();
}

async function addKnowledgeEntry() {
    const inp = document.getElementById('newKnowledge');
    const content = inp.value.trim();
    if (!content) return;
    try {
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: 'ナレッジ!A:F',
            valueInputOption: 'RAW',
            resource: { values: [[new Date().toISOString().split('T')[0], 'note', content, '中', '', 'manual']] }
        });
        inp.value = '';
        await loadKnowledgeData();
        renderKnowledgeList();
    } catch (e) {
        console.error(e);
    }
}

// ポップオーバー
let currentPopover = null;

function showKpiPopover(event, type) {
    event.stopPropagation();
    const popover = document.getElementById('popover');
    const titleEl = document.getElementById('popoverTitle');
    const contentEl = document.getElementById('popoverContent');

    const today = new Date();
    const inStock = inventory.filter(i => i.status === '在庫中');
    const waiting = inventory.filter(i => i.status === '入庫待ち');

    let title = '', content = '';

    switch(type) {
        case 'inStock':
            const catBreakdown = {};
            inStock.forEach(i => { catBreakdown[i.category] = (catBreakdown[i.category] || 0) + 1; });
            const topCats = Object.entries(catBreakdown).sort((a,b) => b[1] - a[1]).slice(0, 3);
            title = '在庫中 詳細';
            content = `<div><strong>${inStock.length}件</strong>の在庫があります</div>
                <div class="mt-2">カテゴリ内訳:</div>
                ${topCats.map(([cat, cnt]) => `<div>・${cat}: ${cnt}件</div>`).join('')}
                <div class="insight">${topCats[0] ? topCats[0][0] + 'が最も多い' : '在庫なし'}</div>`;
            break;
        case 'waiting':
            const thisWeek = new Date(today);
            thisWeek.setDate(thisWeek.getDate() + 7);
            const arriving = projects.filter(p => p.pickupDate && !p.receivedComplete && new Date(p.pickupDate) <= thisWeek);
            title = '入庫待ち 詳細';
            content = `<div><strong>${waiting.length}件</strong>が入庫待ち</div>
                <div class="mt-2">今週到着予定: ${arriving.length}件</div>
                ${arriving.slice(0, 3).map(p => `<div>・${p.projectPrefix}-${String(p.projectNumber).padStart(4,'0')}: ${p.productName.slice(0,15)}</div>`).join('')}
                ${arriving.length > 0 ? '<div class="action" onclick="window.location.href=\'inventory.html\'">→ 入庫処理へ</div>' : '<div class="insight">今週の到着予定なし</div>'}`;
            break;
        case 'unpaid':
            let unpaidList = [];
            projects.forEach(p => {
                (p.depositSchedule || []).forEach((d, i) => {
                    if (!d.paid) {
                        const days = p.registeredDate ? Math.floor((today - new Date(p.registeredDate)) / 86400000) : 0;
                        unpaidList.push({ pn: `${p.projectPrefix}-${String(p.projectNumber).padStart(4,'0')}`, days, amount: d.amountUSD || 0 });
                    }
                });
            });
            unpaidList.sort((a,b) => b.days - a.days);
            const overdue = unpaidList.filter(u => u.days > 30);
            title = '未払い 詳細';
            content = `<div><strong>${unpaidList.length}件</strong>の未払いあり</div>
                ${overdue.length > 0 ? `<div class="warning">${overdue.length}件が30日超過</div>` : '<div class="insight">30日超過なし</div>'}
                <div class="mt-2">経過日数TOP3:</div>
                ${unpaidList.slice(0,3).map(u => `<div>・${u.pn}: ${u.days}日 ($${u.amount})</div>`).join('')}`;
            break;
        case 'payment':
            const tm = today.toISOString().slice(0, 7);
            let thisMonthPaid = 0, thisMonthCount = 0;
            projects.forEach(p => {
                (p.depositSchedule || []).forEach(d => {
                    if (d.paid && d.paidDate && d.paidDate.startsWith(tm)) {
                        thisMonthPaid += d.amountJPY || 0;
                        thisMonthCount++;
                    }
                });
            });
            title = '今月支払い 詳細';
            content = `<div>今月の支払い実績</div>
                <div class="mt-2"><strong>¥${(thisMonthPaid/10000).toFixed(0)}万</strong> (${thisMonthCount}件)</div>
                <div class="insight">月末に向けて支払い予定を確認</div>`;
            break;
        case 'stay':
            const stayDays = inStock.filter(i => i.receiveDate).map(i => ({ serial: i.serial, days: Math.floor((today - new Date(i.receiveDate)) / 86400000), cat: i.category }));
            const longStay = stayDays.filter(s => s.days >= 60).sort((a,b) => b.days - a.days);
            const avgStay = stayDays.length ? Math.round(stayDays.reduce((a,b) => a + b.days, 0) / stayDays.length) : 0;
            title = '滞留日数 詳細';
            content = `<div>平均滞留: <strong>${avgStay}日</strong></div>
                ${longStay.length > 0 ? `<div class="warning">60日超え: ${longStay.length}件</div>` : '<div class="insight">長期滞留なし</div>'}
                ${longStay.slice(0,3).map(s => `<div>・${s.serial}: ${s.days}日</div>`).join('')}
                ${longStay.length > 0 ? '<div class="action" onclick="window.location.href=\'inventory.html\'">→ 在庫確認へ</div>' : ''}`;
            break;
        case 'turnover':
            const thisMonthShipped = [...inventory, ...archivedInventory].filter(i => i.shipDate && i.shipDate.startsWith(today.toISOString().slice(0,7))).length;
            const turnover = (thisMonthShipped / (inStock.length || 1)).toFixed(2);
            title = '回転率 詳細';
            content = `<div>今月の回転率: <strong>${turnover}回</strong></div>
                <div class="mt-2">・今月出庫: ${thisMonthShipped}件</div>
                <div>・現在在庫: ${inStock.length}件</div>
                <div class="insight">回転率1.0以上が理想的</div>`;
            break;
        case 'sales':
            const sales7 = SALES_RAW_DATA.filter(s => s.period === '7期');
            const total7 = sales7.reduce((a,s) => a + s.amount, 0);
            const byCat = {};
            sales7.forEach(s => { byCat[s.category] = (byCat[s.category] || 0) + s.amount; });
            const topSales = Object.entries(byCat).sort((a,b) => b[1] - a[1]).slice(0, 3);
            title = '7期売上 詳細';
            content = `<div>7期累計: <strong>¥${(total7/10000).toFixed(0)}万</strong></div>
                <div class="mt-2">カテゴリTOP3:</div>
                ${topSales.map(([cat, amt]) => `<div>・${cat.replace('液晶ディスプレイ','液晶')}: ¥${(amt/10000).toFixed(0)}万</div>`).join('')}
                <div class="insight">電子黒板が急成長中！</div>`;
            break;
        case 'overdue':
            let overdueList = [];
            projects.forEach(p => {
                (p.depositSchedule || []).forEach((d, i) => {
                    if (!d.paid && i === 0 && p.registeredDate) {
                        const days = Math.floor((today - new Date(p.registeredDate)) / 86400000);
                        if (days > 30) overdueList.push({ pn: `${p.projectPrefix}-${String(p.projectNumber).padStart(4,'0')}`, days, supplier: suppliers.find(s => s.id === p.supplierId)?.name || '不明' });
                    }
                });
            });
            title = '支払遅延 詳細';
            content = overdueList.length > 0
                ? `<div class="warning">${overdueList.length}件が30日超過</div>
                   ${overdueList.slice(0,3).map(o => `<div>・${o.pn}: ${o.days}日 (${o.supplier})</div>`).join('')}
                   <div class="action" onclick="window.location.href='index.html'">→ 支払い処理へ</div>`
                : '<div class="insight">支払い遅延なし</div>';
            break;
    }

    titleEl.textContent = title;
    contentEl.innerHTML = content;

    const rect = event.target.closest('.kpi').getBoundingClientRect();
    popover.style.top = (rect.bottom + 8) + 'px';
    popover.style.left = Math.min(rect.left, window.innerWidth - 300) + 'px';
    popover.classList.add('show');
    currentPopover = popover;
    lucide.createIcons();
}

// ポップオーバーを閉じる
document.addEventListener('click', (e) => {
    const popover = document.getElementById('popover');
    if (currentPopover && !popover.contains(e.target) && !e.target.closest('.kpi')) {
        popover.classList.remove('show');
        currentPopover = null;
    }
});

// 初期化
window.onload = () => {
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.onload = init;
    document.head.appendChild(s);
};
