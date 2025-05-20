import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ padding: 20, fontFamily: 'sans-serif' }}>
      <h1>ようこそ Job Site!</h1>
      <p>Next.js が動いています 🎉</p>
      <ul>
        <li><Link href="/jobs">求人一覧へ</Link></li>
        <li><Link href="/companies/list">会社一覧へ</Link></li>
      </ul>
    </div>
  )
}