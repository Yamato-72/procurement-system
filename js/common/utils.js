/**
 * YS調達システム - ユーティリティ関数
 * 共通で使用するヘルパー関数
 */

/**
 * 案件番号フォーマット
 * @param {string} prefix - 接頭辞 (例: 'AD')
 * @param {number} number - 番号
 * @returns {string} フォーマットされた案件番号 (例: 'AD-1234')
 */
function formatProjectNumber(prefix, number) {
    if (!prefix && !number) return '';
    return `${prefix || 'AD'}-${number || 0}`;
}

/**
 * 案件番号文字列からprefix/numberを分解
 * @param {string} str - 案件番号文字列
 * @returns {object} { prefix, number }
 */
function parseProjectNumberString(str) {
    if (!str) return { prefix: '', number: '' };
    const match = str.match(/^([A-Z]+)-?(\d+)$/i);
    if (match) {
        return { prefix: match[1].toUpperCase(), number: match[2] };
    }
    const numMatch = str.match(/^(\d+)$/);
    if (numMatch) {
        return { prefix: 'AD', number: numMatch[1] };
    }
    return { prefix: '', number: '' };
}

/**
 * ステータス正規化（後方互換）
 * @param {string} status - ステータス
 * @returns {string} 正規化されたステータス
 */
function normalizeStatus(status) {
    if (status === '発送済' || status === '引渡済') {
        return '出庫済';
    }
    if (status === '不具合') {
        return '不良品';
    }
    return status;
}

/**
 * 営業日計算（日曜と中国祝日を除外）
 * @param {Date|string} startDate - 開始日
 * @param {number} days - 営業日数
 * @returns {Date} 終了日
 */
function addWorkingDays(startDate, days) {
    let date = new Date(startDate);
    date.setDate(date.getDate() + 1);
    let count = 0;

    while (count < days) {
        const dayOfWeek = date.getDay();
        const dateStr = date.toISOString().split('T')[0];

        if (dayOfWeek !== 0 && !CHINA_HOLIDAYS.includes(dateStr)) {
            count++;
        }

        if (count < days) {
            date.setDate(date.getDate() + 1);
        }
    }

    return date;
}

/**
 * Serial番号から数値部分を取得
 * @param {string} serial - Serial番号
 * @returns {number} 数値部分
 */
function getSerialNumber(serial) {
    const match = serial.match(/YS(\d+)/);
    return match ? parseInt(match[1]) : 0;
}

/**
 * 製品名から種別を自動判定
 * @param {string} productName - 製品名
 * @returns {string} 種別
 */
function detectCategory(productName) {
    const name = (productName || '').toLowerCase();

    if (name.includes('video wall') || name.includes('videowall') || name.includes('ビデオウォール')) {
        return 'Video Wall';
    }
    if (name.includes('touch') || name.includes('タッチ')) {
        return 'タッチディスプレイ';
    }
    if (name.includes('outdoor') || name.includes('屋外') || name.includes('自立')) {
        return '屋外サイネージ';
    }
    if (name.includes('led') || name.includes('エルイーディー')) {
        return 'LEDビジョン';
    }
    if (name.includes('stb') || name.includes('player') || name.includes('プレイヤー')) {
        return 'STB';
    }
    if (name.includes('display') || name.includes('monitor') || name.includes('ディスプレイ') || name.includes('モニター') || name.includes('インチ')) {
        return 'ディスプレイ';
    }
    if (name.includes('stand') || name.includes('スタンド') || name.includes('什器')) {
        return 'スタンド・什器';
    }

    return 'その他';
}

/**
 * 金額フォーマット（円）
 * @param {number} amount - 金額
 * @returns {string} フォーマットされた金額
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY'
    }).format(amount);
}

/**
 * 金額フォーマット（万円）
 * @param {number} amount - 金額
 * @returns {string} フォーマットされた金額（万円）
 */
function formatManYen(amount) {
    return '¥' + Math.round(amount / 10000) + '万';
}

/**
 * 金額フォーマット（USD）
 * @param {number} amount - 金額
 * @returns {string} フォーマットされた金額
 */
function formatUSD(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

/**
 * 日付フォーマット
 * @param {Date|string} date - 日付
 * @param {string} format - フォーマット ('short', 'long', 'iso')
 * @returns {string} フォーマットされた日付
 */
function formatDate(date, format = 'short') {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    if (format === 'iso') {
        return d.toISOString().split('T')[0];
    }
    if (format === 'long') {
        return d.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    // short
    return `${d.getMonth() + 1}/${d.getDate()}`;
}

/**
 * 日数計算
 * @param {Date|string} fromDate - 開始日
 * @param {Date|string} toDate - 終了日（省略時は今日）
 * @returns {number} 日数
 */
function daysBetween(fromDate, toDate = new Date()) {
    const from = new Date(fromDate);
    const to = new Date(toDate);
    return Math.floor((to - from) / (1000 * 60 * 60 * 24));
}

/**
 * ステータス表示用HTMLを生成
 * @param {string} message - メッセージ
 */
function showStatus(message, type = 'info') {
    console.log(`[${type}] ${message}`);
    const statusEl = document.getElementById('statusMessage');
    if (statusEl) {
        statusEl.textContent = message;
        statusEl.className = type === 'error' ? 'text-red-500' : 'text-slate-500';
    }
}

/**
 * サプライヤー名取得
 * @param {number|string} supplierId - サプライヤーID
 * @param {Array} suppliers - サプライヤーリスト
 * @returns {string} サプライヤー名
 */
function getSupplierName(supplierId, suppliers) {
    const s = suppliers.find(sup => String(sup.id) === String(supplierId));
    return s ? s.name : '不明';
}

/**
 * 今期の開始日を取得（7月〜6月が会計年度）
 * @returns {string} 会計年度開始日 (YYYY-MM-DD)
 */
function getCurrentFiscalYearStart() {
    const now = new Date();
    const year = now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
    return `${year}-07-01`;
}

/**
 * 配列をシャッフル
 * @param {Array} array - 配列
 * @returns {Array} シャッフルされた配列
 */
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * デバウンス関数
 * @param {Function} func - 実行する関数
 * @param {number} wait - 待機時間（ms）
 * @returns {Function} デバウンスされた関数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * スロットル関数
 * @param {Function} func - 実行する関数
 * @param {number} limit - 制限時間（ms）
 * @returns {Function} スロットルされた関数
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * URLパラメータ取得
 * @param {string} name - パラメータ名
 * @returns {string|null} パラメータ値
 */
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

/**
 * ローカルストレージ操作（JSON対応）
 */
const storage = {
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch {
            return defaultValue;
        }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('localStorage set error:', e);
        }
    },
    remove(key) {
        localStorage.removeItem(key);
    }
};
