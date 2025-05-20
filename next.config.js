/** @type {import('next').NextConfig} */
const nextConfig = {
  // 静的出力の設定を削除
  // output: 'export',
  
  // trailingSlashは残しておく
  trailingSlash: true,
  
  // imagesの設定も必要ない場合は削除
  // images: {
  //   unoptimized: true,
  // }
}

module.exports = nextConfig