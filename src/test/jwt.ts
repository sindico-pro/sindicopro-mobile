export function tokenWithExpiration(exp: number) {
  const encoded = globalThis
    .btoa(JSON.stringify({ exp }))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
  return `header.${encoded}.sig`
}
