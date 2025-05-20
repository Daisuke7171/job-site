import Head from 'next/head'
import Link from 'next/link'
import { fetchJobs } from '../../../../../lib/fetchJobs'

export async function getStaticPaths() {
  const all = await fetchJobs()
  const paths = all.map(j => ({
    params: {
      prefecture: encodeURIComponent(j.prefecture),
      jobType:    encodeURIComponent(j.jobType),
      id:         String(j.id),
    }
  }))
  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const all = await fetchJobs()
  const job = all.find(
    j => String(j.id) === params.id &&
         encodeURIComponent(j.prefecture) === params.prefecture &&
         encodeURIComponent(j.jobType) === params.jobType
  )
  if (!job) return { notFound: true }

  return { props: { job } }
}

export default function JobDetailPage({ job }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title":       job.title,
    "description": job.description,
    "datePosted":  job.datePosted,
    "validThrough": job.validThrough,
    "employmentType": job.employmentType || "FULL_TIME",
    "hiringOrganization": {
      "@type": "Organization",
      "name": job.company
    },

"jobLocation": {
  "@type": "Place",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": job.location || '',
    "addressLocality": job.location ? job.location.split(/[都道府県]/)[0] || job.location : '',
    "addressRegion": "JP"
  }
},

    "baseSalary": {
      "@type": "MonetaryAmount",
      "currency": "JPY",
      "value": {
        "@type": "QuantitativeValue",
        "minValue": job.minSalary,
        "maxValue": job.maxSalary,
        "unitText": job.isAnnual ? "YEAR" : "HOUR"
      }
    },
    "workHours": job.workHours,
    "jobBenefits": job.benefits || [],
    "occupationalCategory": job.category
  }

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </Head>
      <main>
        <h1>
          {decodeURIComponent(job.prefecture)} ／ {decodeURIComponent(job.jobType)} 「{job.title}」
        </h1>
      <dl>
  <dt>会社名：</dt><dd>{job.company}</dd>
  <dt>勤務地：</dt><dd>{job.location}</dd>
  <dt>雇用形態：</dt><dd>{job.employmentType}</dd>
  <dt>給与：</dt><dd>{job.minSalary}〜{job.maxSalary} {job.currency}</dd>
  <dt>仕事内容：</dt><dd dangerouslySetInnerHTML={{ __html: job.description.replace(/\n/g, '<br>') }} />
  <dt>勤務時間：</dt><dd>{job.workHours}</dd>
  <dt>休暇・休日：</dt><dd>{job.holidays}</dd>
  <dt>福利厚生：</dt><dd><ul>{(job.benefits||[]).map((b,i)=><li key={i}>{b}</li>)}</ul></dd>
</dl>
        <p>
          <Link
            href={`/jobs/${encodeURIComponent(job.prefecture)}/${encodeURIComponent(job.jobType)}/1`}
          >
            ← 一覧へ戻る
          </Link>
        </p>
      </main>
    </>
  )
}
