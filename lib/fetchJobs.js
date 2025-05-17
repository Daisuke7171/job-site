// lib/fetchJobs.js
export async function fetchJobs() {
  return [
    {
      id: 1,
      prefecture: '東京',
      jobType: '営業',
      title: '営業職 A',
      company: '株式会社ジョリーグッド',      // ← 追加
      location: '東京都中央区日本橋…',       // 他フィールドも必要なら
      description: '…'
    },
    { id: 2, prefecture: '東京', jobType: '営業', title: '営業職 B', company: '株式会社ジョリーグッド' },
    { id: 3, prefecture: '大阪', jobType: '開発', title: '開発エンジニア A', company: '別の会社' },
    { id: 4, prefecture: '大阪', jobType: '開発', title: '開発エンジニア B', company: '別の会社' },
  ]
}
