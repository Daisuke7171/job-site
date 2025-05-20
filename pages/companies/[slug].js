import Link from 'next/link'
import { fetchJobs } from '../../lib/fetchJobs'
import { slugify } from '../../lib/slugify'

export async function getStaticPaths() {
  const all = await fetchJobs()

  // 会社名の重複を除き、空文字はフィルタ
  const companies = Array.from(
    new Set(
      all
        .map(j => j.company || '')
        .map(name => name.trim())
        .filter(name => name.length > 0)
    )
  )

  const paths = companies
    .map(name => ({
      params: { slug: slugify(name) }
    }))
    .filter(path => path.params.slug !== 'companies') // "companies"というスラッグを除外

  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const all = await fetchJobs()
  const companyName = all
    .map(j => j.company)
    .find(name => slugify(name) === params.slug)

  if (!companyName) return { notFound: true }

  const jobs = all.filter(j => j.company === companyName)

  return {
    props: { companyName, jobs }
  }
}

export default function CompanyPage({ companyName, jobs }) {
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>会社：{companyName}</h1>
      <ul>
        {jobs.map(j => (
          <li key={j.id}>
            <Link href={`/jobs/${j.prefecture}/${j.jobType}/detail/${j.id}`}>
              {j.prefecture} ／ {j.jobType} 「{j.title}」
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