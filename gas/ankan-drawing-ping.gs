// ============================================================
// 図面の通知 ― AN-KAN を10分おきに呼ぶだけの係
//   案件フォルダに名前に「図面」か「drawing」が入ったファイルが入ると、
//   AN-KAN がそれを見つけて案件のチャットスペースに知らせる。
//   このスクリプトは「見に行って」と AN-KAN に声をかけるだけ（Driveもチャットも触らない）。
//
//   使い方（新しいGASプロジェクトに貼る）
//     1) checkDrawings を一度実行 → 許可を出す
//        （初回は今ある図面を記録するだけで、通知は飛ばない）
//     2) installDrawingTrigger を一度実行（以後10分おきに自動）
// ============================================================

const ANKAN_URL = 'https://an-kan-47228502594.europe-west1.run.app';

function checkDrawings() {
  const res = UrlFetchApp.fetch(ANKAN_URL + '/api/projects/drawing-check', {
    method: 'post',
    muteHttpExceptions: true,
  });
  console.log(res.getResponseCode() + ' ' + res.getContentText());
}

function installDrawingTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'checkDrawings'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('checkDrawings').timeBased().everyMinutes(10).create();
  console.log('10分おきのトリガーを設定しました');
}
