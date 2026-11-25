// 支払ナビ・在庫ナビの見た目（Tailwind）を、あらかじめ1つのCSSファイルにまとめるための設定
// 以前は開くたびにブラウザ内で組み立てていた（cdn.tailwindcss.com）ため、スマホで表示が遅かった
// HTMLを変更したら、GitHub Actions（.github/workflows/tailwind.yml）が assets/tailwind.css を自動で作り直す
// 手元で作る場合： npx tailwindcss@3 -c tailwind/tailwind.config.js -i tailwind/input.css -o assets/tailwind.css --minify
module.exports = {
  darkMode: 'class',
  content: ['./index.html', './inventory.html'],
};
