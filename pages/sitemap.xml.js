// pages/sitemap.xml.js
import { fetchJobs } from '../lib/fetchJobs'  // ← あなたのフェッチ関数へのパス
import { format } from 'date-fns'
import ja from 'date-fns/locale/ja'

// Next.js に「このページは HTML ではなく API レスポンスとして扱ってね」と伝える
export const config = {
  api: {
    bodyParser: false,
  }
}

export default function Sitemap() {
  // このコンポーネントは実際には描画されないので何も返さない
  return null
}

export async function getServerSideProps({ res }) {
  const jobs = await fetchJobs()

  const base = 'https://job-site-y86.pages.dev'
  const today = format(new Date(), 'yyyy-MM-dd', { locale: ja })

  // XML の組み立て
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`
  xml += `<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n`

  // トップページ
  xml += `  <url>\n`
  xml += `    <loc>${base}/</loc>\n`
  xml += `    <lastmod>${today}</lastmod>\n`
  xml += `  </url>\n`

  // 各ジョブ詳細ページ
  jobs.forEach((job) => {
    const lastmod = job.datePosted || today
    xml += `  <url>\n`
    xml += `    <loc>${base}/jobs/${job.prefecture}/${job.jobType}/detail/${job.id}</loc>\n`
    xml += `    <lastmod>${lastmod}</lastmod>\n`
    xml += `  </url>\n`
  })

  xml += `</urlset>`

  // レスポンスヘッダを XML に
  res.setHeader('Content-Type', 'text/xml')
  res.write(xml)
  res.end()

  return { props: {} }
}
