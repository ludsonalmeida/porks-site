const TRACKER = 'https://musica.sobradinhoporks.com.br/tracker/wa'

/**
 * Returns a tracker URL that:
 * 1. Passes through UTMs already in the page URL (e.g. from Google Ads)
 * 2. Falls back to utm_source=site + utm_content=<section> for organic site visitors
 */
export function waLink(section = 'site') {
  const search = typeof window !== 'undefined' ? window.location.search : ''
  const params = new URLSearchParams(search)

  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
  const hasUtms = utmKeys.some(k => params.has(k))

  if (!hasUtms) {
    params.set('utm_source', 'site')
    params.set('utm_medium', 'organic')
    params.set('utm_content', section)
  }

  return `${TRACKER}?${params.toString()}`
}
