import { catalog, menuGroups, type CatalogEntry } from './catalog'

function fold(value: string) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function visible(entry: CatalogEntry, features: readonly string[]) {
  if (entry.action === 'route' && !entry.route) return false
  if (entry.slug && !features.includes(entry.slug)) return false
  return true
}

function matches(entry: CatalogEntry, query: string) {
  if (!query) return true
  const haystack = [entry.name, entry.group, ...entry.synonyms].map(fold).join(' ')
  return haystack.includes(fold(query))
}

export function filterCatalog(features: readonly string[], query: string) {
  const allowed = catalog.filter((entry) => visible(entry, features) && matches(entry, query.trim()))
  return menuGroups
    .map((group) => ({ group, items: allowed.filter((entry) => entry.group === group) }))
    .filter((section) => section.items.length > 0)
}
