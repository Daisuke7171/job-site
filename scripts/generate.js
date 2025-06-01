// scripts/generate.js

import fs from 'fs/promises'
import fetch from 'node-fetch'
import { parse } from 'csv-parse/sync'

// ─────────────────────────────────────────────────────────────────────────────
// 1. Google スプレッドシートから CSV を取得するための URL を設定
//    （適宜、ご自身のスプレッドシートの「CSV 出力」URL に置き換えてください）
// ─────────────────────────────────────────────────────────────────────────────
const CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vTi95JqDq1YqLvhInMToDFlMRYKx0mZUv7ZPFWWHG3e-Ncw4O3cxptIS8rfDMyfq_z0WDrpYU4q5ZyL/pub?output=csv'

// ─────────────────────────────────────────────────────────────────────────────
// 2. 生成される HTML のベース URL を設定（ご自身の Cloudflare Pages ドメインに合わせてください）
// ─────────────────────────────────────────────────────────────────────────────
const BASE_URL = 'https://job-site-6aa.pages.dev'

// ─────────────────────────────────────────────────────────────────────────────
// main(): CSV を読み込み、HTML と sitemap.xml を出力する
// ─────────────────────────────────────────────────────────────────────────────
async function main() {
  try {
    // ───────────────────────────────────────────────────────────────────────────
    // 1) Google スプレッドシートから CSV を fetch してテキストを取得
    // ───────────────────────────────────────────────────────────────────────────
    const res = await fetch(CSV_URL)
    if (!res.ok) {
      throw new Error(`CSV のダウンロードに失敗しました: ${res.status} ${res.statusText}`)
    }
    const csvText = await res.text()

    // ───────────────────────────────────────────────────────────────────────────
    // 2) csv-parse で「ヘッダー行あり・空行スキップ」のオプションを指定して
    //    JavaScript のオブジェクト配列に変換する
    // ───────────────────────────────────────────────────────────────────────────
    const records = parse(csvText, {
      columns: true,       // 1 行目をキーとして使う
      skip_empty_lines: true
    })
    // records はたとえばこんな形の配列になります:
    // [
    //   {
    //     id: '1',
    //     '職種名': '法人営業',
    //     '求人キャッチコピー': 'リーダー候補：ビジネスプロデューサー...',
    //     '会社名': '株式会社ジョリーグッド',
    //     '勤務地': '東京都中央区日本橋富沢町10-13 WORK EDITION NIHONBASHI 701',
    //     '都道府県': '東京都',
    //     '市区町村': '中央区',
    //     '郵便番号': '1030006',
    //     '雇用形態': '正社員',
    //     '仕事内容（仕事内容）': '自社VRの技術を活かし、〜…',
    //     '仕事内容（勤務時間・曜日）': '10:00〜19:00\n所定労働時間：8時間、休憩1時間',
    //     '休暇・休日': '完全週休2日制（土日祝日休み）\n年間休日125日以上\n…',
    //     '受動喫煙対策': '受動喫煙対策： 喫煙スペースあり\n受動喫煙対策（詳細）： 屋内全面禁煙',
    //     '待遇・福利厚生': '■時差出勤（9時〜11時出社）可能\n■各種社会保険完備\n…',
    //     '給与（下限）': '5500000',
    //     '給与上限': '7000000',
    //     '給与種別': '年収',
    //     '職種カテゴリー': '営業',
    //     '掲載画像': '',
    //     '応募': ''
    //   },
    //   { ... },
    //   …
    // ]

    console.log(`―――――― records の最初の 3 件: ――――――`)
    console.log(records.slice(0, 3))
    console.log(`―――――― 全件数: ${records.length} ――――――\n`)

    // ───────────────────────────────────────────────────────────────────────────
    // 3) dist フォルダを作成（なければ）。各レコードを HTML に変換して書き出し
    // ───────────────────────────────────────────────────────────────────────────
    await fs.mkdir('dist', { recursive: true })

    for (const [idx, job] of records.entries()) {
      // generate individual job HTML
      const html = buildJobHtml(job, idx + 1)
      const filename = `dist/job-${idx + 1}.html`
      await fs.writeFile(filename, html, 'utf8')
      console.log(`✓ ${filename} を生成しました`)
    }

    // ───────────────────────────────────────────────────────────────────────────
    // 4) sitemap.xml を生成して書き出し
    // ───────────────────────────────────────────────────────────────────────────
    const sitemapXml = buildSitemapXml(records.length)
    await fs.writeFile('dist/sitemap.xml', sitemapXml, 'utf8')
    console.log(`✓ dist/sitemap.xml を生成しました`)

  } catch (err) {
    console.error('✗ エラーが発生しました:', err)
    process.exit(1)
  }
}

/**
 * buildJobHtml:
 *  各求人レコード(job オブジェクト)を受け取り、文字列としての HTML を返す関数です。
 * 例：
 *    job = {
 *      id: '1',
 *      '職種名': '法人営業',
 *      '求人キャッチコピー': 'リーダー候補：ビジネスプロデューサー',
 *      '会社名': '株式会社ジョリーグッド',
 *      '勤務地': '東京都中央区日本橋富沢町10-13 WORK EDITION NIHONBASHI 701',
 *      '雇用形態': '正社員',
 *      '仕事内容（仕事内容）': '自社VRの技術を活かし、…',
 *      '仕事内容（勤務時間・曜日）': '10:00〜19:00…',
 *      '休暇・休日': '完全週休2日制…',
 *      '受動喫煙対策': '受動喫煙対策：…',
 *      '待遇・福利厚生': '■時差出勤…',
 *      '給与（下限）': '5500000',
 *      '給与上限': '7000000',
 *      '給与種別': '年収',
 *      '職種カテゴリー': '営業',
 *      '掲載画像': '',
 *      '応募': ''
 *    }
 *
 *  このテンプレートを参考に、実際の見た目（CSS など）はすでに完成していた
 *  job-1.html の構造をほぼコピーしています。ご自身のレイアウトに合わせてカスタマイズしてください。
 */
function buildJobHtml(job, idx) {
  // 各フィールドを安全に取り出す。存在しない場合は空文字にフォールバック
  const title = job['職種名'] || 'タイトル未設定'
  const subtitle = job['求人キャッチコピー'] || ''
  const company = job['会社名'] || ''
  const location = job['勤務地'] || ''
  const employmentType = job['雇用形態'] || ''
  const description = job['仕事内容（仕事内容）'] || ''
  const workHours = job['仕事内容（勤務時間・曜日）'] || ''
  const holidays = job['休暇・休日'] || ''
  const smoking = job['受動喫煙対策'] || ''
  const benefits = job['待遇・福利厚生'] || ''
  const salaryMin = job['給与（下限）'] || ''
  const salaryMax = job['給与上限'] || ''
  const salaryUnit = job['給与種別'] || ''
  const category = job['職種カテゴリー'] || ''

  // JSON-LD 用の日付（本日時点）：たとえば「2025-06-01」形式にします
  const today = new Date().toISOString().slice(0, 10)
  // 求人有効期限（適宜設定。ここでは通知のため「1 ヶ月後」にしています）
  const validThrough = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30)
    .toISOString()
    .replace(/\..+$/, '')

  // HTML 本体をテンプレートとして返す
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <!-- Google サイト認証タグ等があればここに追加 -->
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${title}</title>
  <style>
    /* ──────────── 以下は job-1.html のスタイルをほぼコピー ──────────── */
    body {
      font-family: "Noto Sans JP", sans-serif;
      background: #f2f5f8;
      margin: 0;
      padding: 0;
    }
    header {
      background: #fff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .banner__inner {
      max-width: 720px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      padding: 1em;
    }
    .banner__icon {
      width: 48px;
      height: 48px;
      margin-right: 1em;
      color: #0073aa;
      flex-shrink: 0;
    }
    .banner__text h1 {
      margin: 0;
      font-size: 1.5em;
      color: #0073aa;
    }
    .banner__text .tagline {
      margin: 0.2em 0 0;
      font-size: 0.95em;
      color: #0073aa;
    }
    @media (max-width: 600px) {
      .banner__inner {
        flex-direction: column;
        text-align: center;
      }
      .banner__icon {
        margin: 0 0 0.5em;
      }
      .banner__text h1 {
        font-size: 1.2em;
      }
      .banner__text .tagline {
        font-size: 0.85em;
      }
    }
    .container {
      max-width: 720px;
      margin: 1.5em auto;
      padding: 0 1em;
    }
    section.job-detail {
      background: #ffffff;
      padding: 1.5em;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    section.job-detail h1 {
      margin-top: 0;
      font-size: 1.4em;
      color: #0073aa;
    }
    section.job-detail p {
      margin: 0.6em 0;
      color: #555;
      line-height: 1.6;
    }
    section.job-detail h3 {
      margin: 1em 0 0.5em;
      color: #333;
    }
    .form-button {
      display: inline-block;
      margin-top: 1em;
      background: #0073aa;
      color: #fff;
      padding: 0.6em 1.2em;
      border-radius: 4px;
      text-decoration: none;
      font-weight: bold;
    }
    .form-button:hover {
      background: #005f8d;
    }
    /* ───────────────────────────────────────────────────────────────────────── */
  </style>

  <!-- JSON-LD の構造化データ -->
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "${title}",
  "description": "${escapeJsonLd(description).replace(/\n/g, ' ')}",
  "datePosted": "${today}",
  "validThrough": "${validThrough}",
  "employmentType": "${employmentType}",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "${company}"
  },
  "jobLocation": {
    "@type": "Place",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "${location}",
      "addressLocality": "${job['市区町村'] || ''}",
      "addressRegion": "${job['都道府県'] || ''}",
      "postalCode": "${job['郵便番号'] || ''}",
      "addressCountry": "JP"
    }
  },
  "baseSalary": {
    "@type": "MonetaryAmount",
    "currency": "JPY",
    "value": {
      "@type": "QuantitativeValue",
      "minValue": ${Number(salaryMin) || 0},
      "maxValue": ${Number(salaryMax) || 0},
      "unitText": "${salaryUnit}"
    }
  },
  "workHours": "${escapeJsonLd(workHours)}",
  "jobBenefits": [
    ${benefits.split('\n').map((line) => `"${escapeJsonLd(line)}"`).join(', ')}
  ],
  "occupationalCategory": "${category}"
}
  </script>
</head>
<body>
  <header>
    <div class="banner__inner">
      <!-- banner アイコンは相対パスで読み込み -->
      <img
        class="banner__icon"
        src="../assets/handshake-icon.svg"
        alt="握手マーク ロゴ"
      />
      <div class="banner__text">
        <h1>日本転職サポートセンター</h1>
        <p class="tagline">あなたの新しいキャリアを、私たちが全力サポートします</p>
      </div>
    </div>
  </header>

  <div class="container">
    <section class="job-detail">
      <h1>${title}</h1>
      ${subtitle ? `<p><em>${subtitle}</em></p>` : ''}
      ${company ? `<p><strong>会社名：</strong>${company}</p>` : ''}
      ${location ? `<p><strong>勤務地：</strong>${location}</p>` : ''}
      ${employmentType ? `<p><strong>雇用形態：</strong>${employmentType}</p>` : ''}
      ${salaryMin || salaryMax
        ? `<p><strong>給与：</strong>${salaryUnit} ${salaryMin || ''}${salaryMin && salaryMax ? '〜' : ''}${salaryMax || ''}</p>`
        : ''}
      ${description
        ? `<h3>仕事内容：</h3><p>${description.replace(/\n/g, '<br>')}</p>`
        : ''}
      ${workHours
        ? `<h3>勤務時間：</h3><p>${workHours.replace(/\n/g, '<br>')}</p>`
        : ''}
      ${holidays
        ? `<h3>休暇・休日：</h3><p>${holidays.replace(/\n/g, '<br>')}</p>`
        : ''}
      ${smoking
        ? `<h3>受動喫煙対策：</h3><p>${smoking.replace(/\n/g, '<br>')}</p>`
        : ''}
      ${benefits
        ? `<h3>福利厚生：</h3>
        <ul>
          ${benefits
            .split('\n')
            .map((line) => `<li>${line}</li>`)
            .join('')}
        </ul>`
        : ''}
      <!-- ↓ 応募リンクがある場合には href を適宜書き換えてください -->
      <p>
        <a
          class="form-button"
          href="${job['応募'] || '#'}"
          target="_blank"
          rel="noopener noreferrer"
        >
          📝 この求人に応募する
        </a>
      </p>
    </section>
  </div>
</body>
</html>`
}

/**
 * buildSitemapXml:
 *  適宜「dist/job-1.html」〜「dist/job-N.html」をすべて列挙して
 *  <urlset> の中に <url> を生成します。
 *  recordsLength にはレコード数（N 件）を渡し、1〜N のループで作成しています。
 */
function buildSitemapXml(recordsLength) {
  // 今日の日付を YYYY-MM-DD 形式で取得して lastmod に使用します
  const today = new Date().toISOString().slice(0, 10)

  // sitemap のヘッダー
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`

  for (let i = 1; i <= recordsLength; i++) {
    xml += `  <url>\n`
    xml += `    <loc>${BASE_URL}/job-${i}.html</loc>\n`
    xml += `    <lastmod>${today}</lastmod>\n`
    xml += `    <changefreq>daily</changefreq>\n`
    xml += `    <priority>0.9</priority>\n`
    xml += `  </url>\n`
  }

  xml += `</urlset>\n`
  return xml
}

/**
 * escapeJsonLd:
 *  JSON-LD 内にそのまま埋め込む文字列をエスケープします。
 *  例：改行やダブルクオートを避けるための単純置き換えロジックです。
 */
function escapeJsonLd(str) {
  return String(str || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n')
}

// スクリプトを実行
main().catch((e) => {
  console.error(e)
  process.exit(1)
})
