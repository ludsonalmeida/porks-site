const KEY = 'porks_breweries'

export const DEFAULT_BREWERIES = [
  { id: 1, name: 'Biomma', logo: 'https://assets.untappd.com/site/brewery_logos/brewery-483650_3f93a.jpeg' },
  { id: 2, name: 'Colombina', logo: 'https://cdn.awsli.com.br/1577/1577274/logo/dc92f2836b.png' },
  { id: 3, name: 'Cruls', logo: 'https://static.wixstatic.com/media/50d772_2a9b16e063cd4fe2b538f6d795466d84~mv2.png' },
  { id: 4, name: 'Biela Bier', logo: 'https://porks.nyc3.cdn.digitaloceanspaces.com/pessoas/logo-biela.png' },
  { id: 5, name: 'Puhls Beer', logo: '' },
]

export function getBreweries() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch (_) {}
  return DEFAULT_BREWERIES
}

export function saveBreweries(items) {
  localStorage.setItem(KEY, JSON.stringify(items))
}
