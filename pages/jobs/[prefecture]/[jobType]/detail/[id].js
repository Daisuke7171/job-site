import Head from 'next/head'
import Link from 'next/link'
import { fetchJobs } from '../../../../../lib/fetchJobs'

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
      j.prefecture === params.prefecture &&
      j.jobType    === params.jobType &&
      String(j.id) === params.id
  )
  if (!job) {
    return { notFound: true }
  }
  return { props: { job } }
}

export default function JobDetailPage({ job }) {
  // JSON-LD 用のオブジェクトを組み立て
  const ldJson = {
    "@context":       "https://schema.org/",
    "@type":          "JobPosting",
    "title":          job.title,
    "description":    job.description || job.title,
    "datePosted":     job.datePosted || new Date().toISOString().slice(0,10),
    "validThrough":   job.validThrough || (() => {
                        const d = new Date()
                        d.setMonth(d.getMonth()+1)
                        return d.toISOString().slice(0,10)
                      })(),
    "hiringOrganization": {
      "@type": "Organization",
      "name":  job.company || '―'
    },
    "jobLocation": {
      "@type": "Place",
      "address": {
        "@type":         "PostalAddress",
        "addressLocality": job.location || '―'
      }
    },
    // フルタイム・パートタイムなどが渡せるなら入れる
    "employmentType": job.employmentType || "FULL_TIME"
  }

  return (
    <>
      <Head>
        <title>{job.prefecture}／{job.jobType} 「{job.title}」</title>
        <script
          type="application/ld+json"
          // dangerouslySetInnerHTML で JSON-LD を注入
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }}
        />
      </Head>

      <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
        <h1>
          {job.prefecture} ／ {job.jobType} 「{job.title}」
        </h1>
        <dl>
          <dt>会社名：</dt>
          <dd>{job.company || '―'}</dd>
          <dt>勤務地：</dt>
          <dd>{job.location || '―'}</dd>
          <dt>仕事内容：</dt>
          <dd>{job.description || '―'}</dd>
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
