/**
 * YS調達システム - Google認証モジュール
 * Google OAuth2認証とトークン管理
 */

// 認証状態
let tokenClient = null;
let gapiInited = false;
let gisInited = false;
let accessToken = null;
let tokenRefreshTimer = null;
let tokenExpiresAt = null;

/**
 * GAPI初期化
 */
function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

/**
 * GAPIクライアント初期化
 */
async function initializeGapiClient() {
    await gapi.client.init({
        discoveryDocs: [
            'https://sheets.googleapis.com/$discovery/rest?version=v4',
            'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
        ],
    });
    gapiInited = true;
    maybeEnableButtons();
}

/**
 * GIS初期化
 */
function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CONFIG.CLIENT_ID,
        scope: CONFIG.SCOPES,
        callback: handleTokenResponse,
    });
    gisInited = true;
    maybeEnableButtons();
}

/**
 * トークンレスポンス処理
 */
function handleTokenResponse(resp) {
    if (resp.error !== undefined) {
        console.error('認証エラー:', resp.error);
        return;
    }
    accessToken = resp.access_token;
    sessionStorage.setItem('googleAccessToken', accessToken);

    const expiresIn = resp.expires_in || 3600;
    tokenExpiresAt = Date.now() + (expiresIn * 1000);
    sessionStorage.setItem('tokenExpiresAt', tokenExpiresAt.toString());

    startTokenRefreshTimer();

    if (typeof onAuthSuccess === 'function') {
        onAuthSuccess();
    }
}

/**
 * 初期化完了チェック
 */
function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        const savedToken = sessionStorage.getItem('googleAccessToken');
        const savedExpiry = sessionStorage.getItem('tokenExpiresAt');

        if (savedToken && savedExpiry) {
            const expiresAt = parseInt(savedExpiry);
            const now = Date.now();

            if (expiresAt > now + 300000) {
                accessToken = savedToken;
                tokenExpiresAt = expiresAt;
                gapi.client.setToken({ access_token: accessToken });
                startTokenRefreshTimer();

                if (typeof onAuthSuccess === 'function') {
                    onAuthSuccess();
                }
                return;
            } else {
                console.log('トークン期限切れ、再ログインが必要');
                sessionStorage.removeItem('googleAccessToken');
                sessionStorage.removeItem('tokenExpiresAt');
            }
        }

        if (typeof renderSignIn === 'function') {
            renderSignIn();
        }
    }
}

/**
 * 認証ボタンクリック
 */
function handleAuthClick() {
    tokenClient.callback = handleTokenResponse;

    if (accessToken === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

/**
 * サインアウト
 */
function handleSignoutClick() {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken);
    }
    accessToken = null;
    sessionStorage.removeItem('googleAccessToken');
    sessionStorage.removeItem('tokenExpiresAt');
    gapi.client.setToken(null);

    if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
        tokenRefreshTimer = null;
    }

    if (typeof renderSignIn === 'function') {
        renderSignIn();
    }
}

/**
 * トークン自動リフレッシュタイマー
 */
function startTokenRefreshTimer() {
    if (tokenRefreshTimer) {
        clearTimeout(tokenRefreshTimer);
    }

    tokenRefreshTimer = setTimeout(() => {
        console.log('トークン自動リフレッシュ中...');
        silentTokenRefresh();
    }, CONFIG.TOKEN_REFRESH_MINUTES * 60 * 1000);

    console.log(`トークンリフレッシュ予定: ${CONFIG.TOKEN_REFRESH_MINUTES}分後`);
}

/**
 * サイレントリフレッシュ
 */
function silentTokenRefresh() {
    if (!tokenClient) return;

    tokenClient.callback = (resp) => {
        if (resp.error !== undefined) {
            console.error('トークンリフレッシュ失敗:', resp.error);
            showConnectionStatus('warning');
            return;
        }
        accessToken = resp.access_token;
        sessionStorage.setItem('googleAccessToken', accessToken);

        const expiresIn = resp.expires_in || 3600;
        tokenExpiresAt = Date.now() + (expiresIn * 1000);
        sessionStorage.setItem('tokenExpiresAt', tokenExpiresAt.toString());

        console.log('トークンリフレッシュ成功');
        showConnectionStatus('connected');
        startTokenRefreshTimer();
    };

    tokenClient.requestAccessToken({ prompt: '' });
}

/**
 * 接続状態表示
 */
function showConnectionStatus(status) {
    const indicator = document.getElementById('connectionIndicator');
    if (!indicator) return;

    if (status === 'connected') {
        indicator.className = 'w-2 h-2 rounded-full bg-green-400';
        indicator.title = '接続中';
    } else if (status === 'warning') {
        indicator.className = 'w-2 h-2 rounded-full bg-yellow-400 animate-pulse';
        indicator.title = '再接続が必要な可能性があります';
    } else {
        indicator.className = 'w-2 h-2 rounded-full bg-red-400';
        indicator.title = '接続エラー';
    }
}

/**
 * API呼び出しラッパー（エラー時に自動再認証）
 */
async function apiCallWithRetry(apiCall) {
    try {
        return await apiCall();
    } catch (err) {
        if (err.status === 401 || err.status === 403) {
            console.log('認証エラー、再認証を試行...');

            return new Promise((resolve, reject) => {
                tokenClient.callback = async (resp) => {
                    if (resp.error) {
                        showConnectionStatus('error');
                        reject(new Error('再認証に失敗しました。ページを更新してください。'));
                        return;
                    }
                    accessToken = resp.access_token;
                    sessionStorage.setItem('googleAccessToken', accessToken);
                    gapi.client.setToken({ access_token: accessToken });

                    tokenExpiresAt = Date.now() + 3600000;
                    sessionStorage.setItem('tokenExpiresAt', tokenExpiresAt.toString());
                    startTokenRefreshTimer();
                    showConnectionStatus('connected');

                    try {
                        const result = await apiCall();
                        resolve(result);
                    } catch (retryErr) {
                        reject(retryErr);
                    }
                };
                tokenClient.requestAccessToken({ prompt: '' });
            });
        }
        throw err;
    }
}

/**
 * 認証済みかどうか
 */
function isAuthenticated() {
    return accessToken !== null;
}
