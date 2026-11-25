/**
 * 品質ナビ：毎朝の Google Chat 通知
 *
 * 毎朝1回、在庫ナビ・支払ナビ・品質ログを読んで、倉庫の「今日やること」を Google Chat のスペースに送ります。
 *   ・今日／明日の入荷予定（支払ナビの「入荷予定日」×在庫ナビで「入庫待ち」の製品）
 *   ・入荷予定日を過ぎても届いていない注文
 *   ・入荷検品まち／定期検品の期限切れ／不良品 の点数
 *
 * 使い方（最初の1回だけ）
 *   1. このコードを script.google.com の新しいプロジェクトに貼り付ける
 *   2. 「プロジェクトの設定」→「スクリプト プロパティ」に CHAT_WEBHOOK_URL（Google Chat の Webhook URL）を追加
 *   3. testNotify を実行して、スペースに届くか確認（初回は Google の承認画面が出ます）
 *   4. installTrigger を1回だけ実行（平日の毎朝8時ごろに自動で送るようになります）
 *
 * Webhook URL はこのファイルに書かないでください（スクリプト プロパティにだけ入れる）。
 */

const INV_ID = '1-Sv1ci9aQ80d5U42lTa2_eWfDCpsp2HESIOpHkOaxQQ';   // 調達管理データ（在庫ナビ・支払ナビ）
const LOG_ID = '1JdFUk07s9KsBskn3qfYu1pym4uY1xq2evS-5N4xRtXg';   // イベントログ（品質ログ）
const LOG_SHEET = '品質イベントログ（倉庫を通り抜けたもの）';
const QUALITY_URL = 'https://yamato-72.github.io/procurement-system/quality.html';
const INSPECT_MONTHS = 3;                                       // 定期検品の間隔（品質ナビと同じ）
const INCLUDE_ALLOCATED = true;                                 // 定期検品に「引当済」を含める（品質ナビの初期設定と同じ）
const TZ = 'Asia/Tokyo';

const WH = ['在庫中', '検品待ち', '引当済', '不良品'];
const INSP = ['入荷検品', '定期検品', '処置・修理', '返却受入'];

function dailyNotify() {
  const now = new Date();
  const dow = Number(Utilities.formatDate(now, TZ, 'u')); // 1=月 … 7=日
  if (dow >= 6) return;                                    // 土日は送らない
  const text = buildMessage_(now);
  if (text) post_(text);
}

function testNotify() {
  post_(buildMessage_(new Date()) || '（テスト）今日お知らせすることはありません');
}

function installTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(t => t.getHandlerFunction() === 'dailyNotify')
    .forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dailyNotify').timeBased().everyDays(1).atHour(8).inTimezone(TZ).create();
}

// ---------- ここから中身 ----------

function buildMessage_(now) {
  const today = ymd_(now);
  const tomorrow = ymd_(new Date(now.getTime() + 864e5));

  const inv = vals_(INV_ID, '在庫!A2:Q').filter(r => r[1] || r[3]).map(r => ({
    id: String(r[0] || ''), s: String(r[1] || '').trim(), key: norm_(r[1]), p: String(r[3] || ''),
    o: (r[5] !== '' && r[5] !== undefined) ? String(r[4] || '') + '-' + r[5] : String(r[4] || ''),
    st: String(r[8] || '入庫待ち'), shelf: String(r[14] || '')
  }));
  const arrival = {};
  vals_(INV_ID, '案件!A2:Q').forEach(r => {
    const d = toYmd_(r[16]); if (!d) return;
    const p1 = String(r[1] || '');
    const k = okn_(/^[A-Z]+-\d+$/i.test(p1) ? p1 : (p1 || 'AD').replace(/-$/, '') + '-' + (r[2] || ''));
    if (!arrival[k] || d < arrival[k]) arrival[k] = d;
  });
  const lastInsp = {};
  vals_(LOG_ID, "'" + LOG_SHEET + "'!A2:N").forEach(r => {
    const k = norm_(r[1]), d = toYmd_(r[0]), t = String(r[5] || '');
    if (k && d && INSP.indexOf(t) >= 0 && (!lastInsp[k] || d > lastInsp[k])) lastInsp[k] = d;
  });

  // 入荷予定（入庫待ちの製品を注文ごとにまとめる）
  const waiting = {};
  inv.filter(x => x.s && x.st === '入庫待ち').forEach(x => { (waiting[x.o] = waiting[x.o] || []).push(x); });
  const line = (o, a) => '・' + o + '　' + a[0].p + (new Set(a.map(x => x.p)).size > 1 ? ' ほか' : '') + ' × ' + a.length + '点';
  const todayL = [], tomorrowL = [], lateL = [];
  Object.keys(waiting).forEach(o => {
    const d = arrival[okn_(o)]; if (!d) return;
    if (d === today) todayL.push(line(o, waiting[o]));
    else if (d === tomorrow) tomorrowL.push(line(o, waiting[o]));
    else if (d < today) lateL.push(line(o, waiting[o]) + '（予定 ' + d.replace(/-/g, '/') + '）');
  });

  // 倉庫の山
  const wh = inv.filter(x => x.s && WH.indexOf(x.st) >= 0);
  const wait = wh.filter(x => x.st === '検品待ち').length;
  const bad = wh.filter(x => x.st === '不良品').length;
  const due = wh.filter(x => x.st !== '検品待ち' && (INCLUDE_ALLOCATED || x.st !== '引当済')).filter(x => {
    const li = lastInsp[x.key]; return li && addMonths_(li, INSPECT_MONTHS) <= today;
  }).length;

  const out = ['*品質ナビ ' + Utilities.formatDate(now, TZ, 'M/d') + ' の倉庫*'];
  if (todayL.length) out.push('', '*今日入荷予定*', ...todayL);
  if (tomorrowL.length) out.push('', '*明日入荷予定*', ...tomorrowL);
  if (lateL.length) out.push('', '*予定日を過ぎてまだ届いていない*', ...lateL);
  out.push('', '入荷検品まち ' + wait + '点／定期検品の期限切れ ' + due + '点／不良品 ' + bad + '点');
  out.push(QUALITY_URL);
  return out.join('\n');
}

function post_(text) {
  const url = PropertiesService.getScriptProperties().getProperty('CHAT_WEBHOOK_URL');
  if (!url) throw new Error('スクリプト プロパティに CHAT_WEBHOOK_URL を入れてください');
  UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json; charset=UTF-8',
    payload: JSON.stringify({ text: text }), muteHttpExceptions: false
  });
}

function vals_(id, range) {
  try { return SpreadsheetApp.openById(id).getRange(range).getDisplayValues(); }
  catch (e) {
    // シート名を含む範囲は getRangeByName ではなく getSheetByName で読む
    const m = range.match(/^'?(.+?)'?!(.+)$/);
    const sh = SpreadsheetApp.openById(id).getSheetByName(m[1]);
    return sh ? sh.getRange(m[2]).getDisplayValues() : [];
  }
}
function norm_(s) { return String(s || '').replace(/[\s　]/g, '').toUpperCase().replace(/-0+(\d)/g, '-$1'); }
function okn_(o) { return String(o || '').toUpperCase().replace(/\s/g, '').replace(/-0+(\d)/, '-$1'); }
function ymd_(d) { return Utilities.formatDate(d, TZ, 'yyyy-MM-dd'); }
function toYmd_(v) {
  const m = String(v || '').trim().match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/);
  return m ? m[1] + '-' + ('0' + m[2]).slice(-2) + '-' + ('0' + m[3]).slice(-2) : '';
}
function addMonths_(d, n) { const x = new Date(d + 'T00:00:00+09:00'); x.setMonth(x.getMonth() + n); return ymd_(x); }
