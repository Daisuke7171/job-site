// pages/jobs/[prefecture]/[jobType]/[page].js
import Link from 'next/link'
import { fetchJobs } from '../../../../lib/fetchJobs'  // ← projects/lib

const PAGE_SIZE = 50

export async function getStaticPaths() {
  const all = await fetchJobs()
  const groups = all.reduce((acc, job) => {
    const key = `${job.prefecture}|${job.jobType}`
    if (!acc[key]) acc[key] = []
    acc[key].push(job)
    return acc
  }, {})

  const paths = []
  Object.entries(groups).forEach(([key, jobs]) => {
    const [prefecture, jobType] = key.split('|')
    const total = Math.ceil(jobs.length / PAGE_SIZE)
    for (let p = 1; p <= total; p++) {
      paths.push({ params: { prefecture, jobType, page: String(p) } })
    }
  })
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const { prefecture, jobType, page } = params
  const all = await fetchJobs()
  const filtered = all.filter(
    j => j.prefecture === prefecture && j.jobType === jobType
  )
  const pageNum = Number(page)
  const slice = filtered.slice((pageNum - 1) * PAGE_SIZE, pageNum * PAGE_SIZE)

  return {
    props: {
      jobs: slice,
      prefecture,
      jobType,
      page: pageNum,
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
    }
  }
}

export default function JobListPage({ jobs, prefecture, jobType, page, totalPages }) {
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>{prefecture} ／ {jobType} ({page}/{totalPages})</h1>
      <ul>
        {jobs.map(j => (
          <li key={j.id}>
            <Link href={`/jobs/${prefecture}/${jobType}/detail/${j.id}`}>
              {j.title}
            </Link>
          </li>
        ))}
      </ul>
      <nav>
        {page > 1 && (
          <Link href={`/jobs/${prefecture}/${jobType}/${page - 1}`}>← 前へ</Link>
        )}{' '}
        {page < totalPages && (
          <Link href={`/jobs/${prefecture}/${jobType}/${page + 1}`}>次へ →</Link>
        )}
      </nav>
    </div>
  )
}


