/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ← この行が非常に重要です！
  // もし画像を使っていて、Next.jsのImageコンポーネントを最適化なしで使いたい場合
  // images: {
  //   unoptimized: true,
  // },
  // 他の設定があれば、それはそのままにします
}

module.exports = nextConfig