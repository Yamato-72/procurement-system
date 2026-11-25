/**
 * 調達データ 毎晩バックアップ
 *
 *  毎晩2時台に、次の2つのスプレッドシートを丸ごとコピーして
 *  Googleドライブの「調達データ バックアップ」フォルダに保存する。
 *    ・調達管理データ（支払ナビ・在庫ナビ・品質ナビの在庫）
 *    ・イベントログ（品質ナビの記録）
 *  ファイル名は「2026-11-25 調達管理データ」のように日付つき。
 *  KEEP_DAYS 日より古いバックアップは、自動でゴミ箱へ移す（ゴミ箱から30日間は戻せる）。
 *
 *  コピーは和田さんだけが見られる非公開ファイルになる（元の共有設定は引き継がない）。
 *
 *  使い方
 *    1) backupNow を一度実行 → 許可を出す（フォルダができ、1回目のバックアップが入る）
 *    2) installTrigger を一度実行（以後毎晩自動）
 *
 *  戻したいとき：フォルダから該当日のファイルを開き、必要なシートや行をコピーして元に貼る。
 */

const BACKUP_TARGETS = [
  { id: '1-Sv1ci9aQ80d5U42lTa2_eWfDCpsp2HESIOpHkOaxQQ', name: '調達管理データ' },
  { id: '1JdFUk07s9KsBskn3qfYu1pym4uY1xq2evS-5N4xRtXg', name: 'イベントログ' },
];
const BACKUP_FOLDER_NAME = '調達データ バックアップ';
const KEEP_DAYS = 30;

function backupNow() {
  const folder = getBackupFolder_();
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  BACKUP_TARGETS.forEach(function (t) {
    const title = today + ' ' + t.name;
    // 同じ日に2回動いたときは、古い方を置き換える
    const dup = folder.getFilesByName(title);
    while (dup.hasNext()) dup.next().setTrashed(true);
    DriveApp.getFileById(t.id).makeCopy(title, folder);
    console.log('保存: ' + title);
  });
  cleanupOld_(folder);
}

// KEEP_DAYS 日より古いバックアップをゴミ箱へ
function cleanupOld_(folder) {
  const limit = new Date(Date.now() - KEEP_DAYS * 24 * 60 * 60 * 1000);
  const files = folder.getFiles();
  let n = 0;
  while (files.hasNext()) {
    const f = files.next();
    const m = f.getName().match(/^(\d{4})-(\d{2})-(\d{2}) /);
    if (!m) continue; // 日付で始まらないファイルは触らない
    const d = new Date(+m[1], +m[2] - 1, +m[3]);
    if (d < limit) { f.setTrashed(true); n++; }
  }
  if (n) console.log('古いバックアップをゴミ箱へ: ' + n + '件');
}

function getBackupFolder_() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty('BACKUP_FOLDER_ID');
  if (id) {
    try { const f = DriveApp.getFolderById(id); if (!f.isTrashed()) return f; } catch (e) {}
  }
  const found = DriveApp.getFoldersByName(BACKUP_FOLDER_NAME);
  const folder = found.hasNext() ? found.next() : DriveApp.createFolder(BACKUP_FOLDER_NAME);
  props.setProperty('BACKUP_FOLDER_ID', folder.getId());
  console.log('バックアップ先: ' + folder.getUrl());
  return folder;
}

// 毎晩2時台に自動実行（一度だけ実行する）
function installTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'backupNow'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('backupNow').timeBased().everyDays(1).atHour(2).inTimezone('Asia/Tokyo').create();
  console.log('毎晩2時台の自動バックアップを設定しました');
}
