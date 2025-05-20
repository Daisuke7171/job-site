/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的出力を有効にする（Vercelでの問題解決に役立つ）
  output: 'export',
  
  // 静的出力時に必要な設定
  images: {
    unoptimized: true,
  },
  
  // トレイリングスラッシュの設定
  trailingSlash: true
}

module.exports = nextConfig