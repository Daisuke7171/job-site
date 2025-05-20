// pages/robots.txt.js
export const config = {
  api: { bodyParser: false }
}
export default function Robots() { return null }
export async function getServerSideProps({ res }) {
  const lines = [
    'User-agent: *',
    'Disallow:',
    'Sitemap: https://job-site-y86.pages.dev/sitemap.xml',
  ]
  res.setHeader('Content-Type', 'text/plain')
  res.write(lines.join('\n'))
  res.end()
  return { props: {} }
}
