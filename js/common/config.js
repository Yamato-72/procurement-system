/**
 * YS調達システム - 設定ファイル
 * 共通設定値を定義
 */

// Google API設定
const CONFIG = {
    // Google Client ID
    CLIENT_ID: '47228502594-hk66ecflb2s5iq02rim3o8j0j87d2p3c.apps.googleusercontent.com',

    // Google Spreadsheet ID (メインデータ)
    SPREADSHEET_ID: '1-Sv1ci9aQ80d5U42lTa2_eWfDCpsp2HESIOpHkOaxQQ',

    // 製品マスタ Spreadsheet ID
    PRODUCT_MASTER_ID: '1YnEJ5LEYBwZJ2zDYnjUpkpjnB2naHFVAtPdzcv81nvI',

    // Google Drive フォルダID
    PARENT_FOLDER_ID: '1EvObQiCJgxJCzd_kQJ1PNbOUMD5P-Zxp',
    IMPORT_PERMIT_FOLDER_ID: '1YELi1u_fn1NiH09P_CONfBlUNQ_DtjwL',
    INVOICE_FOLDER_ID: '1NzYjGGFzbNdG2wBYT1nreiehPH_TpRJr',

    // API Scopes
    SCOPES: 'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.readonly',

    // 自動リロード間隔（秒）
    AUTO_RELOAD_SECONDS: 60,

    // トークンリフレッシュ間隔（分）
    TOKEN_REFRESH_MINUTES: 50
};

// 製品マスタのシート一覧
const PRODUCT_MASTER_SHEETS = [
    { name: 'LCD', category: 'ディスプレイ' },
    { name: 'LED', category: 'LEDビジョン' },
    { name: 'LED_others', category: 'LEDコントローラー' },
    { name: 'matrix-switcher', category: 'マトリクス' },
    { name: 'TVwall_controller', category: 'マルチディスプレイ' },
    { name: 'STUDIA', category: 'STUDIA' },
    { name: 'OPS', category: 'OPS' },
    { name: 'dongle', category: '周辺機器' },
    { name: 'e-board_stand', category: 'スタンド・什器' },
    { name: 'player', category: 'メディアプレーヤー' }
];

// 種別リスト
const CATEGORIES = [
    'マルチディスプレイ',
    '屋外',
    '屋外LED',
    '屋内',
    '屋内LED',
    'LEDコントローラー',
    'STUDIA',
    'マトリクス',
    'メディアプレーヤー',
    'OPS',
    'スタンド/金具',
    '周辺機器'
];

// ステータスリスト
const STATUSES = ['入庫待ち', '検品待ち', '在庫中', '出庫済', '不良品'];

// 保管場所リスト
const LOCATIONS = ['蓮田', '東京', '大阪'];

// 不良理由リスト
const DEFECT_REASONS = [
    '破損（輸送中）',
    '破損（製造不良）',
    '動作不良',
    '外観不良',
    '欠品・付属品不足',
    '仕様違い',
    'その他'
];

// 対応リスト
const DEFECT_ACTIONS = [
    '返品',
    '交換依頼',
    '修理',
    '値引き交渉',
    '廃棄',
    '保留'
];

// 中国の祝日（2025年・2026年）
const CHINA_HOLIDAYS = [
    // 2025年
    '2025-01-01',
    '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04',
    '2025-04-04', '2025-04-05', '2025-04-06',
    '2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05',
    '2025-05-31', '2025-06-01', '2025-06-02',
    '2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04', '2025-10-05', '2025-10-06', '2025-10-07',
    // 2026年
    '2026-01-01',
    '2026-02-17', '2026-02-18', '2026-02-19', '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23',
    '2026-04-04', '2026-04-05', '2026-04-06',
    '2026-05-01', '2026-05-02', '2026-05-03',
    '2026-06-19', '2026-06-20', '2026-06-21',
    '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04', '2026-10-05', '2026-10-06', '2026-10-07'
];

// カラーパレット
const COLORS = {
    blue: '#2383e2',
    green: '#0f7b6c',
    orange: '#d9730d',
    red: '#e03e3e',
    purple: '#6940a5',
    yellow: '#dfab01',
    gray: '#787774',
    chart: ['#2383e2', '#0f7b6c', '#d9730d', '#6940a5', '#dfab01']
};
