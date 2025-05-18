// pages/jobs/[prefecture]/[jobType]/detail/[id].js
import Head from 'next/head'
import Link from 'next/link'
import { fetchJobs } from '../../../../../lib/fetchJobs'  // ← ここは5階層上に lib があるので ../../../../../lib/fetchJobs

export async function getStaticPaths() {
  const all = await fetchJobs()
  const paths = all.map(job => ({
    params: {
      prefecture: job.prefecture,
      jobType:    job.jobType,
      id:         String(job.id),
    }
  }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const all = await fetchJobs()
  const job = all.find(
    j =>
      String(j.id) === params.id &&
      j.prefecture === params.prefecture &&
      j.jobType === params.jobType
  )
  if (!job) return { notFound: true }

  // JSON-LD に必要な日付などをここで用意
  const datePosted   = new Date().toISOString().slice(0,10)             // 例: 2025-05-16
  const validThrough = new Date(Date.now() + 30*24*3600*1000)
                       .toISOString().slice(0,10)                      // 30日後

  return {
    props: { job, datePosted, validThrough }
  }
}

export default function JobDetailPage({ job, datePosted, validThrough }) {
  // Google for Jobs 用の構造化データ
  const jsonLd = {
    "@context":       "https://schema.org/",
    "@type":          "JobPosting",
    title:            job.title,
    description:      job.description || job.title,
    datePosted,
    validThrough,
    hiringOrganization: {
      "@type": "Organization",
      name:    job.company || '―',
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type":         "PostalAddress",
        addressLocality: job.location || '―',
      }
    },
    employmentType: "FULL_TIME"
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          // JSON.stringify で安全に出力
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>

      <div style={{ padding:20, fontFamily:'sans-serif' }}>
        <h1>{job.prefecture} ／ {job.jobType} 「{job.title}」</h1>
        <dl>
          <dt>会社名：</dt><dd>{job.company || '―'}</dd>
          <dt>勤務地：</dt><dd>{job.location || '―'}</dd>
          <dt>仕事内容：</dt><dd>{job.description || '―'}</dd>
        </dl>
        <p>
          <Link href={`/jobs/${job.prefecture}/${job.jobType}/1`}>
            ← 一覧に戻る
          </Link>
        </p>
      </div>
    </>
  )
}
