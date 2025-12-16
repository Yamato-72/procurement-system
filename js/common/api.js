/**
 * YS調達システム - API共通モジュール
 * Google Sheets/Drive API呼び出しのラッパー
 */

// フォルダキャッシュ
let folderCache = {};

/**
 * スプレッドシートからデータを取得
 * @param {string} spreadsheetId - スプレッドシートID
 * @param {string} range - 範囲
 * @returns {Promise<Array>} データ行
 */
async function getSheetData(spreadsheetId, range) {
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: range
    });
    return response.result.values || [];
}

/**
 * スプレッドシートにデータを書き込み
 * @param {string} spreadsheetId - スプレッドシートID
 * @param {string} range - 範囲
 * @param {Array} values - 書き込むデータ
 */
async function updateSheetData(spreadsheetId, range, values) {
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'RAW',
        resource: { values: values }
    });
}

/**
 * スプレッドシートにデータを追加
 * @param {string} spreadsheetId - スプレッドシートID
 * @param {string} range - 範囲
 * @param {Array} values - 追加するデータ
 */
async function appendSheetData(spreadsheetId, range, values) {
    await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: spreadsheetId,
        range: range,
        valueInputOption: 'USER_ENTERED',
        resource: { values: values }
    });
}

/**
 * スプレッドシートの範囲をクリア
 * @param {string} spreadsheetId - スプレッドシートID
 * @param {string} range - 範囲
 */
async function clearSheetData(spreadsheetId, range) {
    await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: spreadsheetId,
        range: range
    });
}

/**
 * 複数範囲を一括更新
 * @param {string} spreadsheetId - スプレッドシートID
 * @param {Array} data - { range, values } の配列
 */
async function batchUpdateSheetData(spreadsheetId, data) {
    await gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId: spreadsheetId,
        resource: {
            valueInputOption: 'USER_ENTERED',
            data: data
        }
    });
}

/**
 * Driveフォルダを検索してURLを取得
 * @param {string} projectNumber - 案件番号
 * @param {string} parentFolderId - 親フォルダID
 * @returns {Promise<string|null>} フォルダURL
 */
async function findFolderUrl(projectNumber, parentFolderId = CONFIG.PARENT_FOLDER_ID) {
    if (folderCache[projectNumber]) {
        return folderCache[projectNumber];
    }

    try {
        const response = await gapi.client.drive.files.list({
            q: `name = '${projectNumber}' and '${parentFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
            fields: 'files(id, name, webViewLink)',
            pageSize: 1,
            supportsAllDrives: true,
            includeItemsFromAllDrives: true,
            corpora: 'allDrives'
        });

        const files = response.result.files;
        if (files && files.length > 0) {
            const url = files[0].webViewLink;
            folderCache[projectNumber] = url;
            return url;
        }
        return null;
    } catch (error) {
        console.error('フォルダ検索エラー:', error);
        return null;
    }
}

/**
 * フォルダキャッシュをクリア
 */
function clearFolderCache() {
    folderCache = {};
}

/**
 * サプライヤーデータを読み込み
 * @returns {Promise<Array>} サプライヤーリスト
 */
async function loadSuppliers() {
    const rows = await getSheetData(CONFIG.SPREADSHEET_ID, 'サプライヤー!A2:C');
    return rows.map(row => ({
        id: parseInt(row[0] || Date.now()),
        name: row[1] || '',
        paymentPatterns: JSON.parse(row[2] || '[{"name":"標準","rates":[50,50]}]')
    }));
}

/**
 * 在庫データを読み込み
 * @returns {Promise<Array>} 在庫リスト
 */
async function loadInventory() {
    const rows = await getSheetData(CONFIG.SPREADSHEET_ID, '在庫!A2:U');
    return rows.map(row => ({
        id: row[0] || '',
        serial: row[1] || '',
        category: row[2] || '',
        productName: row[3] || '',
        orderPrefix: row[4] || '',
        orderNumber: row[5] || '',
        orderDate: row[6] || '',
        receiveDate: row[7] || '',
        status: normalizeStatus(row[8] || '入庫待ち'),
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
}

/**
 * 案件データを読み込み
 * @param {Array} suppliers - サプライヤーリスト
 * @returns {Promise<Array>} 案件リスト
 */
async function loadProjects(suppliers) {
    const rows = await getSheetData(CONFIG.SPREADSHEET_ID, '案件!A2:N');
    return rows.map(row => {
        let projectPrefix = row[1] || 'AD';
        let projectNumber = parseInt(row[2]) || 0;

        if (row[1] && row[1].match(/^[A-Z]+-\d+$/i)) {
            const match = row[1].match(/^([A-Z]+)-(\d+)$/i);
            if (match) {
                projectPrefix = match[1].toUpperCase();
                projectNumber = parseInt(match[2]) || 0;
            }
        } else if (row[1] && row[1].endsWith('-')) {
            projectPrefix = row[1].slice(0, -1).toUpperCase();
        }

        const data = {
            id: row[0] || String(Date.now()),
            projectPrefix: projectPrefix,
            projectNumber: projectNumber,
            supplierId: parseInt(row[3] || 0),
            productName: row[4] || '',
            totalAmount: parseFloat(row[5] || 0),
            depositSchedule: [],
            serial: (row[7] && row[7] !== '[]') ? row[7] : '',
            quantity: parseInt(row[8] || 1),
            workingDays: parseInt(row[9] || 30),
            pickupDate: (row[10] && row[10].includes('-')) ? row[10] : '',
            registeredDate: row[11] || '',
            expenses: [],
            receivedComplete: row[13] === 'true' || row[13] === true
        };

        try {
            data.expenses = JSON.parse(row[12] || '[]');
        } catch (e) {
            data.expenses = [];
        }

        const supplier = suppliers.find(s => s.id === data.supplierId);
        try {
            data.depositSchedule = JSON.parse(row[6] || '[]');
        } catch (e) {
            if (supplier) {
                const defaultPattern = supplier.paymentPatterns[0] || { rates: [50, 50] };
                data.depositSchedule = defaultPattern.rates.map((rate, idx) => ({
                    depositNumber: idx + 1,
                    percentage: rate,
                    amountUSD: (data.totalAmount * rate / 100),
                    paid: false,
                    paidDate: null,
                    exchangeRate: null,
                    amountJPY: null
                }));
            }
        }

        return data;
    });
}

/**
 * 製品マスタを読み込み
 * @returns {Promise<Array>} 製品マスタリスト
 */
async function loadProductMaster() {
    const productMaster = [];

    for (const sheet of PRODUCT_MASTER_SHEETS) {
        try {
            const rows = await getSheetData(CONFIG.PRODUCT_MASTER_ID, `${sheet.name}!A1:Z`);

            if (rows.length < 2) continue;

            const headers = rows[0];
            const pnFullIndex = headers.indexOf('pn_full');
            const pnIndex = headers.indexOf('pn');
            const typeIndex = headers.indexOf('type');
            const categoryIndex = headers.indexOf('category');
            const supplierIndex = headers.indexOf('supplier');
            const isActiveIndex = headers.indexOf('is_active');
            const inchIndex = headers.indexOf('inch');

            for (let i = 1; i < rows.length; i++) {
                const row = rows[i];
                const isActive = isActiveIndex >= 0 ? row[isActiveIndex] : 'TRUE';

                if (isActive === 'FALSE' || isActive === false) continue;

                const pnFull = pnFullIndex >= 0 ? row[pnFullIndex] : '';
                const pn = pnIndex >= 0 ? row[pnIndex] : '';

                if (!pnFull && !pn) continue;

                productMaster.push({
                    pn: pn || '',
                    pnFull: pnFull || pn || '',
                    type: typeIndex >= 0 ? row[typeIndex] : '',
                    category: categoryIndex >= 0 ? row[categoryIndex] : sheet.category,
                    supplier: supplierIndex >= 0 ? row[supplierIndex] : '',
                    inch: inchIndex >= 0 ? row[inchIndex] : '',
                    sheetName: sheet.name
                });
            }
        } catch (e) {
            console.log(`シート ${sheet.name} の読み込みスキップ:`, e.message);
        }
    }

    // 重複を除去（pn_fullベース）
    const seen = new Set();
    return productMaster.filter(p => {
        if (seen.has(p.pnFull)) return false;
        seen.add(p.pnFull);
        return true;
    });
}

/**
 * 検品履歴を読み込み
 * @returns {Promise<Array>} 検品履歴リスト
 */
async function loadInspectionHistory() {
    try {
        const rows = await getSheetData(CONFIG.SPREADSHEET_ID, '検品履歴!A2:L');
        return rows.map(row => ({
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
        console.log('検品履歴シートがありません');
        return [];
    }
}

/**
 * アーカイブ在庫を読み込み
 * @returns {Promise<Array>} アーカイブ在庫リスト
 */
async function loadArchivedInventory() {
    try {
        const rows = await getSheetData(CONFIG.SPREADSHEET_ID, '在庫アーカイブ!A2:Q');
        return rows.map(r => ({
            receiveDate: r[7] || '',
            shipDate: r[9] || '',
            category: r[2] || ''
        }));
    } catch {
        return [];
    }
}

/**
 * ナレッジを読み込み
 * @returns {Promise<Array>} ナレッジリスト
 */
async function loadKnowledge() {
    try {
        const rows = await getSheetData(CONFIG.SPREADSHEET_ID, 'ナレッジ!A2:F');
        return rows.map((v, i) => ({
            id: i + 2,
            date: v[0] || '',
            category: v[1] || 'note',
            content: v[2] || ''
        }));
    } catch {
        return [];
    }
}

/**
 * ナレッジを追加
 * @param {string} content - 内容
 * @returns {Promise}
 */
async function addKnowledge(content) {
    const today = new Date().toISOString().split('T')[0];
    await appendSheetData(CONFIG.SPREADSHEET_ID, 'ナレッジ!A:F', [
        [today, 'note', content, '中', '', 'manual']
    ]);
}
