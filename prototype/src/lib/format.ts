/** Conditional className join helper. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ')
}

const PHP_PER_USD = 56

export function formatUsd(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n)
}

export function formatPhp(usd: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    maximumFractionDigits: 0,
  }).format(usd * PHP_PER_USD)
}

export function formatHa(n: number): string {
  return `${n.toLocaleString('en-US', { maximumFractionDigits: 1 })} ha`
}

export function formatPct(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`
}

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function signedPct(n: number): string {
  const s = n > 0 ? '+' : ''
  return `${s}${n.toFixed(1)}%`
}
