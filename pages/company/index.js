// pages/company/index.js
import Link from 'next/link'
import { fetchJobs } from '../../lib/fetchJobs'
import { slugify } from '../../lib/slugify'  // 会社名 → URL 用スラッグ

export async function getStaticProps() {
  // 全求人を取ってきて
  const all = await fetchJobs()
  // 会社名の重複を除く
  const companies = Array.from(new Set(all.map(j => j.company || '―')))

  return {
    props: { companies }
  }
}

export default function CompanyIndex({ companies }) {
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>会社一覧</h1>
      <ul>
        {companies.map(name => (
          <li key={name}>
            <Link href={`/company/${slugify(name)}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
      <p>
        <Link href="/jobs">← 全求人一覧に戻る</Link>
      </p>
    </div>
  )
}
