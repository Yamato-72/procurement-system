/**
 * YS調達システム - ダークモードモジュール
 * テーマ切り替え機能
 */

// ダークモード状態
let isDarkMode = localStorage.getItem('darkMode') === 'true';

/**
 * ダークモード初期化
 */
function initDarkMode() {
    // システム設定を確認
    if (localStorage.getItem('darkMode') === null) {
        isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isDarkMode) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

/**
 * ダークモード切り替え
 */
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('darkMode', isDarkMode);
    document.documentElement.classList.toggle('dark', isDarkMode);

    // カスタムイベント発火
    document.dispatchEvent(new CustomEvent('darkModeChange', { detail: { isDarkMode } }));

    // renderMainが定義されていれば呼び出す
    if (typeof renderMain === 'function') {
        renderMain();
    }
}

/**
 * 現在のダークモード状態を取得
 * @returns {boolean} ダークモードかどうか
 */
function isDarkModeEnabled() {
    return isDarkMode;
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', initDarkMode);

// システム設定の変更を監視
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    // ユーザーが明示的に設定していなければシステム設定に従う
    if (localStorage.getItem('darkMode') === null) {
        isDarkMode = e.matches;
        document.documentElement.classList.toggle('dark', isDarkMode);
        if (typeof renderMain === 'function') {
            renderMain();
        }
    }
});
