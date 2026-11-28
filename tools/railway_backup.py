# Railway（MySQL）のデータを書き出して保存する（2026-11-28 Railway停止前のバックアップ用）
# Cloud Shell で: python3 railway_backup.py
# 接続情報は Cloud Run の各サービスの設定から読む（画面には出さない）
import json, subprocess, os, urllib.parse as u
os.makedirs('rb', exist_ok=True)
seen = {}
def env(s):
    j = json.loads(subprocess.check_output(['gcloud', 'run', 'services', 'describe', s, '--region', 'europe-west1', '--format=json']))
    return {e['name']: e.get('value', '') for e in j['spec']['template']['spec']['containers'][0].get('env', [])}
for s in ['oda-pay', 'zaiko', 'master-edit-app', 'an-kan-admin']:
    e = env(s)
    for k, v in e.items():
        if v.startswith('mysql://'):
            p = u.urlparse(v)
            seen[(p.hostname, p.port)] = (u.unquote(p.username), u.unquote(p.password or ''), p.path.strip('/') or 'railway')
    for pre in ['DB_', 'DB_APP_', 'DB_MASTER_']:
        h = e.get(pre + 'HOST')
        if h:
            seen[(h, int(e.get(pre + 'PORT') or 3306))] = (e.get(pre + 'USER'), e.get(pre + 'PASSWORD', ''), e.get(pre + 'NAME') or e.get(pre + 'DATABASE') or 'railway')
for (h, pt), (us, pw, db) in seen.items():
    f = 'rb/%s_%s.sql' % (h.split('.')[0], db)
    with open(f, 'w') as out:
        r = subprocess.run(['mysqldump', '-h', h, '-P', str(pt), '-u', us, '-p' + pw, '--single-transaction', '--routines', '--triggers',
                            '--set-gtid-purged=OFF', '--column-statistics=0', '--no-tablespaces', db], stdout=out, stderr=subprocess.PIPE, text=True)
    err = '\n'.join(l for l in r.stderr.splitlines() if 'Warning' not in l)
    tables = sum(1 for l in open(f, errors='ignore') if l.startswith('CREATE TABLE'))
    print(h, pt, db, 'OK' if r.returncode == 0 else 'NG ' + err[-200:], '%d bytes' % os.path.getsize(f), '%d tables' % tables)
