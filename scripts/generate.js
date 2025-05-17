import fs from 'fs/promises';
import fetch from 'node-fetch';
import { parse } from 'csv-parse/sync';

const CSV_URL = 'https://…/pub?output=csv';

async function main() {
  // 1) CSV を取得
  const res = await fetch(CSV_URL);
  const text = await res.text();

  // 2) CSV を配列に変換
  const records = parse(text, { columns: true, skip_empty_lines: true });

  // 3) 各レコードから HTML を生成＆書き出し
  await fs.mkdir('dist', { recursive: true });
  records.forEach((job, i) => {
    const html = buildJobHtml(job, i + 1);
    fs.writeFile(`dist/job-${i+1}.html`, html);
  });

  // 4) インデックスや sitemap も生成
  // …いま書いてる buildHTML 関数を呼ぶ …
}

function buildJobHtml(job, idx) {
  // ここに先ほどの buildJobHTML 関数と同じロジックを入れます
  return `<!DOCTYPE html>…`; 
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
