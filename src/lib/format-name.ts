const SMALL_WORDS = new Set(['de', 'da', 'do', 'das', 'dos', 'e'])

export function titleCase(value: string) {
  return value
    .trim()
    .toLocaleLowerCase('pt-BR')
    .split(/\s+/)
    .filter(Boolean)
    .map((word, index) => {
      if (index > 0 && SMALL_WORDS.has(word)) return word
      return word.charAt(0).toLocaleUpperCase('pt-BR') + word.slice(1)
    })
    .join(' ')
}

export function firstName(value: string) {
  const [first] = value.trim().split(/\s+/)
  return first ? titleCase(first) : ''
}
