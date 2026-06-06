/**
 * YS検品ナビ - 検品機能
 */

// グローバル変数
let inventory = [];
let inspectionHistory = [];
let suppliers = [];
let html5QrCode = null;
let currentUser = localStorage.getItem('inspectionUser') || '';
let inspectionItemsMaster = {};

/**
 * 認証成功時のコールバック
 */
function onAuthSuccess() {
    loadData();
}

/**
 * ログイン画面表示
 */
function renderSignIn() {
    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
                <div class="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg class="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                </div>
                <h1 class="text-3xl font-bold text-slate-800 mb-2">YS検品ナビ</h1>
                <p class="text-slate-500 mb-8">品質管理・検品記録システム</p>
                <button onclick="handleAuthClick()" class="w-full py-4 bg-green-600 text-white text-lg font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg">
                    Googleでログイン
                </button>
                <p class="mt-6 text-xs text-slate-400">スプレッドシートへのアクセス許可が必要です</p>
            </div>
        </div>
    `;
}

/**
 * データ読み込み
 */
async function loadData() {
    try {
        showStatus('データ読み込み中...');

        // サプライヤー読み込み
        const suppliersRes = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: 'サプライヤー!A2:E',
        });
        suppliers = (suppliersRes.result.values || []).map(row => ({
            id: row[0],
            name: row[1],
        }));

        // 検品項目マスタ読み込み
        await loadInspectionItems();

        // 在庫読み込み
        const invRes = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: '在庫!A2:U',
        });
        inventory = (invRes.result.values || []).map(row => ({
            id: row[0] || '',
            serial: row[1] || '',
            category: row[2] || '',
            productName: row[3] || '',
            orderPrefix: row[4] || '',
            orderNumber: row[5] || '',
            orderDate: row[6] || '',
            receiveDate: row[7] || '',
            status: row[8] || '入庫待ち',
            shipDate: row[9] || '',
            shipPrefix: row[10] || '',
            shipNumber: row[11] || '',
            costPrice: parseFloat(row[12]) || 0,
            note: row[13] || '',
            shelf: row[14] || '',
            location: row[15] || '',
            supplierId: row[16] || '',
            inspectionDate: row[17] || '',
            inspector: row[18] || '',
            defectReason: row[19] || '',
            inspectionNote: row[20] || ''
        }));

        // 検品履歴読み込み
        await loadInspectionHistoryData();

        renderMain();
    } catch (err) {
        console.error('読み込みエラー:', err);
        if (err.status === 401) {
            localStorage.removeItem('lastToken');
            renderSignIn();
        } else {
            showStatus('エラー: ' + err.message, 'error');
        }
    }
}

/**
 * 検品項目マスタ読み込み
 */
async function loadInspectionItems() {
    try {
        const res = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: '検品項目!A2:G',
        });
        const rows = res.result.values || [];
        inspectionItemsMaster = {};
        rows.forEach(row => {
            const category = row[0] || '';
            if (category) {
                const items = row.slice(1).filter(item => item && item.trim());
                inspectionItemsMaster[category] = items;
            }
        });
        console.log('検品項目マスタ読み込み完了:', inspectionItemsMaster);
    } catch (e) {
        console.log('検品項目シートがありません。デフォルト項目を使用します。');
        inspectionItemsMaster = {
            'default': ['外観チェック', '動作確認', '付属品確認']
        };
    }
}

/**
 * 種別から検品項目を取得
 */
function getInspectionItemsForCategory(category) {
    return inspectionItemsMaster[category] || inspectionItemsMaster['default'] || ['外観チェック', '動作確認', '付属品確認'];
}

/**
 * 検品履歴読み込み
 */
async function loadInspectionHistoryData() {
    try {
        const res = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: '検品履歴!A2:L',
        });
        inspectionHistory = (res.result.values || []).map(row => ({
            inspectionId: row[0] || '',
            inventoryId: row[1] || '',
            serial: row[2] || '',
            productName: row[3] || '',
            supplierId: row[4] || '',
            projectNumber: row[5] || '',
            inspectionDate: row[6] || '',
            inspector: row[7] || '',
            result: row[8] || '',
            defectReason: row[9] || '',
            defectDetail: row[10] || '',
            action: row[11] || ''
        }));
    } catch (e) {
        console.log('検品履歴シートを作成します');
        await createInspectionHistorySheet();
        inspectionHistory = [];
    }
}

/**
 * 検品履歴シート作成
 */
async function createInspectionHistorySheet() {
    try {
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            resource: {
                requests: [{
                    addSheet: {
                        properties: { title: '検品履歴' }
                    }
                }]
            }
        });
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: '検品履歴!A1:L1',
            valueInputOption: 'RAW',
            resource: {
                values: [['検品ID', '在庫ID', 'Serial', '製品名', 'サプライヤーID', '案件番号', '検品日', '検品者', '結果', '不良理由', '不良詳細', '対応']]
            }
        });
    } catch (e) {
        console.error('シート作成エラー:', e);
    }
}

/**
 * 検品待ちアイテムを取得
 */
function getPendingInspectionItems() {
    return inventory.filter(i => i.status === '検品待ち');
}

/**
 * 今日の検品済み件数
 */
function getTodayInspectionCount() {
    const today = new Date().toISOString().split('T')[0];
    return inspectionHistory.filter(h => h.inspectionDate === today).length;
}

/**
 * 不良率計算（今期のみ）
 */
function getDefectRate() {
    const fiscalStart = getCurrentFiscalYearStart();
    const currentPeriodHistory = inspectionHistory.filter(h => h.inspectionDate >= fiscalStart);

    if (currentPeriodHistory.length === 0) return { rate: 0, total: 0, defects: 0, period: fiscalStart };
    const defects = currentPeriodHistory.filter(h => h.result === '不良品').length;
    return {
        rate: (defects / currentPeriodHistory.length * 100).toFixed(1),
        total: currentPeriodHistory.length,
        defects: defects,
        period: fiscalStart
    };
}

/**
 * サプライヤー名取得
 */
function getSupplierNameById(supplierId) {
    const s = suppliers.find(sup => String(sup.id) === String(supplierId));
    return s ? s.name : '不明';
}

/**
 * 検品者更新
 */
function updateInspector(name) {
    currentUser = name;
    localStorage.setItem('inspectionUser', name);
}

/**
 * メイン画面レンダリング
 */
function renderMain() {
    const pending = getPendingInspectionItems();
    const todayCount = getTodayInspectionCount();
    const defectRate = getDefectRate();

    document.getElementById('app').innerHTML = `
        <div class="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors">
            <!-- ヘッダー -->
            <header class="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg sticky top-0 z-30">
                <div class="max-w-4xl mx-auto px-4 py-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                            </div>
                            <div>
                                <h1 class="text-xl font-bold">YS検品ナビ</h1>
                                <p class="text-xs text-green-100">品質管理システム</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <a href="inventory.html" class="p-2 bg-white/20 rounded-lg hover:bg-white/30" title="在庫ナビ">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                                </svg>
                            </a>
                            <a href="index.html" class="p-2 bg-white/20 rounded-lg hover:bg-white/30" title="調達ナビ">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                                </svg>
                            </a>
                            <button onclick="toggleDarkMode()" class="p-2 bg-white/20 rounded-lg hover:bg-white/30">
                                ${isDarkMode ? '☀️' : '🌙'}
                            </button>
                            <button onclick="handleSignoutClick()" class="p-2 bg-white/20 rounded-lg hover:bg-white/30" title="サインアウト">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main class="max-w-4xl mx-auto px-4 py-6">
                <!-- 検品者設定 -->
                <div class="mb-4 flex items-center gap-3">
                    <label class="text-sm text-slate-600 dark:text-slate-400">検品者:</label>
                    <input type="text" id="inspectorName" value="${currentUser}"
                           onchange="updateInspector(this.value)"
                           class="px-3 py-1.5 border dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-white"
                           placeholder="名前を入力">
                </div>

                <!-- サマリーカード -->
                <div class="grid grid-cols-3 gap-3 mb-6">
                    <div class="bg-amber-100 dark:bg-amber-900/30 rounded-xl p-4 text-center">
                        <p class="text-3xl font-bold text-amber-700 dark:text-amber-400">${pending.length}</p>
                        <p class="text-xs text-amber-600 dark:text-amber-500">検品待ち</p>
                    </div>
                    <div class="bg-green-100 dark:bg-green-900/30 rounded-xl p-4 text-center">
                        <p class="text-3xl font-bold text-green-700 dark:text-green-400">${todayCount}</p>
                        <p class="text-xs text-green-600 dark:text-green-500">本日検品</p>
                    </div>
                    <div class="bg-red-100 dark:bg-red-900/30 rounded-xl p-4 text-center" title="今期: ${defectRate.defects}件/${defectRate.total}件">
                        <p class="text-3xl font-bold text-red-700 dark:text-red-400">${defectRate.rate}%</p>
                        <p class="text-xs text-red-600 dark:text-red-500">今期不良率</p>
                    </div>
                </div>

                <!-- QRスキャンボタン -->
                <button onclick="openQRScanner()" class="w-full mb-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"/>
                    </svg>
                    QRスキャンで検品開始
                </button>

                <!-- 検品待ちリスト -->
                <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                    <div class="px-4 py-3 bg-slate-50 dark:bg-slate-700 border-b dark:border-slate-600">
                        <h2 class="font-bold text-slate-800 dark:text-white">検品待ちリスト</h2>
                    </div>
                    <div class="divide-y dark:divide-slate-700">
                        ${pending.length === 0 ? `
                            <div class="p-8 text-center text-slate-400">
                                <svg class="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                <p>検品待ちのアイテムはありません</p>
                            </div>
                        ` : pending.map(item => `
                            <div onclick="startInspection('${item.id}')" class="p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <p class="font-semibold text-slate-900 dark:text-white">${item.productName}</p>
                                        <p class="text-sm text-slate-500 dark:text-slate-400">
                                            ${formatProjectNumber(item.orderPrefix, item.orderNumber)} |
                                            ${item.serial || 'Serial未設定'}
                                        </p>
                                        <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                            サプライヤー: ${getSupplierNameById(item.supplierId)}
                                        </p>
                                    </div>
                                    <div class="text-green-600 dark:text-green-400">
                                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- 最近の検品履歴 -->
                <div class="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
                    <div class="px-4 py-3 bg-slate-50 dark:bg-slate-700 border-b dark:border-slate-600 flex justify-between items-center">
                        <h2 class="font-bold text-slate-800 dark:text-white">最近の検品（10件）</h2>
                        <button onclick="loadData()" class="text-sm text-green-600 hover:text-green-800">更新</button>
                    </div>
                    <div class="divide-y dark:divide-slate-700 max-h-64 overflow-y-auto">
                        ${inspectionHistory.slice(-10).reverse().map(h => `
                            <div class="p-3 flex justify-between items-center">
                                <div>
                                    <p class="text-sm font-medium text-slate-900 dark:text-white">${h.productName}</p>
                                    <p class="text-xs text-slate-500">${h.inspectionDate} by ${h.inspector}</p>
                                </div>
                                <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                    h.result === '良品'
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                                        : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
                                }">
                                    ${h.result}
                                </span>
                            </div>
                        `).join('') || '<div class="p-4 text-center text-slate-400">履歴なし</div>'}
                    </div>
                </div>
            </main>
        </div>
    `;
}

/**
 * QRスキャナー開く
 */
function openQRScanner() {
    const modal = document.createElement('div');
    modal.id = 'qrScannerModal';
    modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden">
            <div class="p-4 bg-green-600 text-white flex justify-between items-center">
                <h3 class="font-bold">QRスキャン</h3>
                <button onclick="closeQRScanner()" class="p-1 hover:bg-white/20 rounded">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
            <div id="qr-reader" style="width: 100%;"></div>
            <div class="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                QRコードをカメラにかざしてください
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    html5QrCode = new Html5Qrcode("qr-reader");
    html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {}
    ).catch(err => {
        console.error('カメラエラー:', err);
        document.getElementById('qr-reader').innerHTML = `
            <div class="p-8 text-center text-red-500">
                <p>カメラを起動できません</p>
                <p class="text-sm mt-2">${err.message || err}</p>
            </div>
        `;
    });
}

/**
 * QRスキャナー閉じる
 */
function closeQRScanner() {
    if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
        html5QrCode = null;
    }
    const modal = document.getElementById('qrScannerModal');
    if (modal) modal.remove();
}

/**
 * スキャン成功
 */
function onScanSuccess(decodedText) {
    closeQRScanner();

    const item = inventory.find(i =>
        String(i.id) === decodedText.trim() ||
        i.serial?.toUpperCase() === decodedText.trim().toUpperCase()
    );

    if (item) {
        startInspection(item.id);
    } else {
        alert(`「${decodedText}」に該当するアイテムが見つかりません`);
    }
}

/**
 * 検品開始
 */
function startInspection(itemId) {
    const item = inventory.find(i => String(i.id) === String(itemId));
    if (!item) return;

    if (!currentUser) {
        alert('検品者名を入力してください');
        document.getElementById('inspectorName')?.focus();
        return;
    }

    const checkItems = getInspectionItemsForCategory(item.category);
    const checklistHtml = checkItems.map((itemName, index) => `
        <label class="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-700 rounded-lg cursor-pointer">
            <input type="checkbox" id="check${index}" class="w-5 h-5 rounded text-green-600">
            <span class="text-sm text-slate-700 dark:text-slate-300">${itemName}</span>
        </label>
    `).join('');

    const modal = document.createElement('div');
    modal.id = 'inspectionModal';
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div class="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <h3 class="font-bold text-lg">検品実施</h3>
                <p class="text-sm text-green-100">検品者: ${currentUser}</p>
            </div>

            <div class="p-4 border-b dark:border-slate-700">
                <p class="text-lg font-bold text-slate-900 dark:text-white">${item.productName}</p>
                <p class="text-sm text-blue-600 dark:text-blue-400 font-mono">${formatProjectNumber(item.orderPrefix, item.orderNumber)}</p>
                <p class="text-sm text-slate-500 dark:text-slate-400">Serial: ${item.serial || '未設定'}</p>
                <p class="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    サプライヤー: ${getSupplierNameById(item.supplierId)} | 種別: ${item.category || '未設定'}
                </p>
            </div>

            <div class="p-4 space-y-4">
                <div class="space-y-2">
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        チェック項目
                        <span class="text-xs font-normal text-slate-500">（${item.category || '共通'}）</span>
                    </p>
                    ${checklistHtml}
                </div>

                <div id="defectSection" class="hidden space-y-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div>
                        <label class="block text-sm font-semibold text-red-700 dark:text-red-400 mb-1">不良理由</label>
                        <select id="defectReason" class="w-full p-2 border border-red-300 dark:border-red-700 rounded-lg dark:bg-slate-700 dark:text-white">
                            <option value="">選択してください</option>
                            ${DEFECT_REASONS.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-red-700 dark:text-red-400 mb-1">詳細</label>
                        <textarea id="defectDetail" rows="2" class="w-full p-2 border border-red-300 dark:border-red-700 rounded-lg dark:bg-slate-700 dark:text-white" placeholder="具体的な不良内容"></textarea>
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-red-700 dark:text-red-400 mb-1">対応</label>
                        <select id="defectAction" class="w-full p-2 border border-red-300 dark:border-red-700 rounded-lg dark:bg-slate-700 dark:text-white">
                            <option value="">選択してください</option>
                            ${DEFECT_ACTIONS.map(a => `<option value="${a}">${a}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <div class="p-4 border-t dark:border-slate-700 space-y-3">
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="completeInspection('${item.id}', '良品')" class="py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        良品
                    </button>
                    <button id="defectBtn" class="py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        不良品
                    </button>
                </div>
                <button onclick="closeInspectionModal()" class="w-full py-2 border dark:border-slate-600 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700">
                    キャンセル
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 不良品ボタンの動作
    document.getElementById('defectBtn').onclick = function() {
        const section = document.getElementById('defectSection');
        if (section.classList.contains('hidden')) {
            section.classList.remove('hidden');
            this.textContent = '不良品で確定';
        } else {
            completeInspection(item.id, '不良品');
        }
    };
}

/**
 * 検品モーダルを閉じる
 */
function closeInspectionModal() {
    const modal = document.getElementById('inspectionModal');
    if (modal) modal.remove();
}

/**
 * 検品完了
 */
async function completeInspection(itemId, result) {
    const item = inventory.find(i => String(i.id) === String(itemId));
    if (!item) return;

    const today = new Date().toISOString().split('T')[0];
    let defectReason = '';
    let defectDetail = '';
    let defectAction = '';

    if (result === '不良品') {
        defectReason = document.getElementById('defectReason')?.value || '';
        defectDetail = document.getElementById('defectDetail')?.value || '';
        defectAction = document.getElementById('defectAction')?.value || '';

        if (!defectReason) {
            alert('不良理由を選択してください');
            return;
        }
    }

    try {
        // 在庫シートの行を特定
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: '在庫!A2:A',
        });
        const ids = response.result.values || [];
        const rowIndex = ids.findIndex(row => String(row[0]) === String(itemId));

        if (rowIndex === -1) {
            alert('アイテムが見つかりません');
            return;
        }
        const rowNum = rowIndex + 2;

        // 在庫シートを更新（ステータス + 検品情報）
        const newStatus = result === '良品' ? '在庫中' : '不良品';
        await gapi.client.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            resource: {
                valueInputOption: 'USER_ENTERED',
                data: [
                    {
                        range: `在庫!I${rowNum}`,
                        values: [[newStatus]]
                    },
                    {
                        range: `在庫!R${rowNum}:U${rowNum}`,
                        values: [[today, currentUser, defectReason, defectDetail]]
                    }
                ]
            }
        });

        // 検品履歴に追加
        const inspectionId = 'INS-' + Date.now();
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: CONFIG.SPREADSHEET_ID,
            range: '検品履歴!A:L',
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[
                    inspectionId,
                    item.id,
                    item.serial,
                    item.productName,
                    item.supplierId,
                    formatProjectNumber(item.orderPrefix, item.orderNumber),
                    today,
                    currentUser,
                    result,
                    defectReason,
                    defectDetail,
                    defectAction
                ]]
            }
        });

        closeInspectionModal();

        // 成功フィードバック
        const feedback = document.createElement('div');
        feedback.className = `fixed top-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg text-white font-bold z-50 ${
            result === '良品' ? 'bg-green-600' : 'bg-red-600'
        }`;
        feedback.textContent = `${result}として記録しました`;
        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 2000);

        // データ再読み込み
        await loadData();

    } catch (err) {
        console.error('検品記録エラー:', err);
        alert('エラーが発生しました: ' + err.message);
    }
}

// 初期化
function checkAndInit() {
    if (typeof gapi !== 'undefined' && typeof google !== 'undefined') {
        gapiLoaded();
        gisLoaded();
    } else {
        setTimeout(checkAndInit, 100);
    }
}

document.addEventListener('DOMContentLoaded', checkAndInit);
