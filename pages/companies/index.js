// pages/company/index.js
import Link from 'next/link'
import { fetchJobs } from '../../lib/fetchJobs'
import { slugify } from '../../lib/slugify'

export async function getStaticProps() {
  const all = await fetchJobs()
  // 会社名の一覧を重複なく取得
  const companies = Array.from(
    new Set(all.map(j => j.company).filter(Boolean))
  )
  return { props: { companies } }
}

export default function CompanyIndex({ companies }) {
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>会社一覧</h1>
      <ul>
        {companies.map(name => (
          <li key={name}>
            {/* slugify(name) で /company/your-company-slug に飛ばす */}
            <Link href={`/company/${slugify(name)}`}>
              {name}
            </Link>
          </li>
        ))}
      </ul>
      <p>
        <Link href="/">← トップに戻る</Link>
      </p>
    </div>
  )
}
