// pages/company/[slug].js
import Link from 'next/link'
import { fetchJobs } from '../../lib/fetchJobs'
import { slugify } from '../../lib/slugify'

export async function getStaticPaths() {
  // ① まず全ジョブを取ってくる
  const all = await fetchJobs()

  // ② 会社名だけを重複なく集める
  const companies = Array.from(new Set(all.map(j => j.company)))

  // ③ それぞれ slugify して params.slug に入れる
  const paths = companies.map(name => ({
    params: { slug: slugify(name) }
  }))

  return {
    paths,
    fallback: false
  }
}
export async function getStaticProps({ params }) {
  const all = await fetchJobs()
  const companyName = all
    .map(j => j.company)
    .find(name => slugify(name) === params.slug)
  if (!companyName) return { notFound: true }
  const jobs = all.filter(j => j.company === companyName)
  return { props: { companyName, jobs } }
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
      <p><Link href="/jobs">← 求人一覧へ戻る</Link></p>
    </div>
  )
}
