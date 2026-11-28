// ============================================================
// AN-KANを定期的に呼ぶ係（Drive・チャットには触らない。声をかけるだけ）
//   1) 図面・PL/CI通知：10分おき。案件フォルダに入った図面・PL/CIを案件スペースへ
//   2) 連携の見張り：平日の朝8時半ごろ。ずれや止まりがあるときだけ「システム見張り」スペースへ
//      AN-KAN自体が返事をしないときは、このGASから和田さんにメールで知らせる
//
//   使い方：このファイルの中身を全部貼り替える →
//     installDrawingTrigger と installWatchTrigger をそれぞれ1回実行（以後は自動）
// ============================================================

const ANKAN_URL = 'https://an-kan-47228502594.asia-southeast1.run.app';
const ALERT_EMAIL = 'toshihiro.wada8010@yamato-signage.com';

function checkDrawings() {
  const res = UrlFetchApp.fetch(ANKAN_URL + '/api/projects/drawing-check', { method: 'post', muteHttpExceptions: true });
  console.log(res.getResponseCode() + ' ' + res.getContentText());
}

function installDrawingTrigger() {
  replaceTrigger_('checkDrawings', function (b) { return b.everyMinutes(10); });
  console.log('図面・PL/CI通知：10分おきのトリガーを設定しました');
}

function checkWatch() {
  const day = new Date().getDay(); // 0=日, 6=土
  if (day === 0 || day === 6) return;
  let res;
  try {
    res = UrlFetchApp.fetch(ANKAN_URL + '/api/watch', { method: 'post', muteHttpExceptions: true });
  } catch (e) {
    MailApp.sendEmail(ALERT_EMAIL, '【連携の見張り】AN-KANに届きません', 'AN-KANを呼べませんでした：' + e);
    return;
  }
  const code = res.getResponseCode();
  console.log(code + ' ' + res.getContentText());
  if (code >= 500 || code === 0) {
    MailApp.sendEmail(ALERT_EMAIL, '【連携の見張り】AN-KANが返事をしません', 'ステータス ' + code + '\n' + res.getContentText().slice(0, 500));
  }
}

function installWatchTrigger() {
  replaceTrigger_('checkWatch', function (b) { return b.everyDays(1).atHour(8).nearMinute(30); });
  console.log('連携の見張り：毎朝8時半ごろのトリガーを設定しました（土日は何もしません）');
}

function replaceTrigger_(fn, schedule) {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === fn; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  schedule(ScriptApp.newTrigger(fn).timeBased()).create();
}
