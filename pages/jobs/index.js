// pages/jobs/index.js
import Link from 'next/link'
import { fetchJobs } from '../../lib/fetchJobs'

export async function getStaticProps() {
  const all = await fetchJobs()
  // 都道府県・職種の組み合わせだけ列挙
  const combos = Array.from(
    new Set(all.map(j => `${j.prefecture}|${j.jobType}`))
  ).map(str => {
    const [prefecture, jobType] = str.split('|')
    return { prefecture, jobType }
  })

  return { props: { combos } }
}

export default function JobsIndex({ combos }) {
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>求人検索一覧</h1>
      <ul>
        {combos.map(({ prefecture, jobType }) => (
          <li key={`${prefecture}|${jobType}`}>
            <Link href={`/jobs/${prefecture}/${jobType}/1`}>
              {prefecture} ／ {jobType} （ページ1へ）
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
