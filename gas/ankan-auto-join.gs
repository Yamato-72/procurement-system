// ============================================================
// AN-KAN Chatアプリ 自動追加
//   スペース名に案件番号（AD- / SP- / TS-）が入っているスペースへ、
//   AN-KANアプリを自動で追加する。1日1回（朝7時台）見回す。
//
//   ・和田さんの権限で動く（和田さんが入っているスペースだけが対象）
//   ・このスクリプトのGoogle Cloudプロジェクトを、AN-KANアプリと同じ
//     プロジェクト（番号 47228502594）にしておく必要がある
//
//   使い方
//     1) addAnkanToSpaces を一度実行 → 許可を出す（既存スペースにまとめて追加）
//     2) installTrigger を一度実行（以後毎朝7時台に自動）
// ============================================================

// 対象にするスペース名のパターン（AD-1666 / SP0123 / TS 77 など）
const PROJECT_RE = /(^|[^A-Za-z])(AD|SP|TS)[-\s]?\d+/i;

function addAnkanToSpaces() {
  const props = PropertiesService.getScriptProperties();
  const done = JSON.parse(props.getProperty('DONE_SPACES') || '{}'); // 追加済みのスペース

  let pageToken;
  let checked = 0, added = 0, already = 0, failed = 0;
  do {
    const res = Chat.Spaces.list({ pageSize: 1000, pageToken: pageToken, filter: 'spaceType = "SPACE"' });
    (res.spaces || []).forEach(function (sp) {
      const name = sp.displayName || '';
      if (!PROJECT_RE.test(name)) return;
      checked++;
      if (done[sp.name]) return;
      try {
        Chat.Spaces.Members.create({ member: { name: 'users/app', type: 'BOT' } }, sp.name);
        done[sp.name] = 1; added++;
        console.log('追加: ' + name);
      } catch (e) {
        const msg = String(e && e.message || e);
        if (/ALREADY_EXISTS|already/i.test(msg) || /409/.test(msg)) {
          done[sp.name] = 1; already++;
        } else {
          failed++;
          console.warn('失敗: ' + name + ' / ' + msg);
        }
      }
    });
    pageToken = res.nextPageToken;
  } while (pageToken);

  props.setProperty('DONE_SPACES', JSON.stringify(done));
  console.log('案件スペース ' + checked + ' 件 / 新しく追加 ' + added + ' / もともと参加 ' + already + ' / 失敗 ' + failed);
}

// 毎朝7時台に自動実行（一度だけ実行する）
function installTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) { return t.getHandlerFunction() === 'addAnkanToSpaces'; })
    .forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('addAnkanToSpaces').timeBased().everyDays(1).atHour(7).inTimezone('Asia/Tokyo').create();
  console.log('毎朝7時台の自動実行を設定しました');
}

// 追加済みの記録を消す（AN-KANをスペースから外した後に入れ直したいとき用）
function resetDone() {
  PropertiesService.getScriptProperties().deleteProperty('DONE_SPACES');
  console.log('記録を消しました');
}
