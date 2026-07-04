import type { ReactNode } from 'react'
import { cx, signedPct } from '../lib/format'
import { confidenceColor, severityColor, statusPill } from '../lib/colors'
import type { Severity } from '../types'

// --- Page header ----------------------------------------------------------

export function PageHeader({
  title,
  description,
  stories,
}: {
  title: string
  description: string
  stories?: string
}) {
  return (
    <div className="px-6 pt-5 pb-3">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
          <p className="text-sm text-gray-500 mt-0.5 max-w-2xl">{description}</p>
        </div>
        {stories && (
          <span className="shrink-0 text-[11px] font-medium text-brand bg-brand-light rounded-full px-3 py-1">
            {stories}
          </span>
        )}
      </div>
    </div>
  )
}

// --- Card ------------------------------------------------------------------

export function Card({
  title,
  subtitle,
  right,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode
  subtitle?: ReactNode
  right?: ReactNode
  children: ReactNode
  className?: string
  bodyClassName?: string
}) {
  return (
    <section className={cx('bg-white rounded-xl border border-gray-200 shadow-sm', className)}>
      {(title || right) && (
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <div>
            {title && <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>}
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {right}
        </header>
      )}
      <div className={cx('p-4', bodyClassName)}>{children}</div>
    </section>
  )
}

// --- Stat card -------------------------------------------------------------

export function StatCard({
  label,
  value,
  unit,
  delta,
}: {
  label: string
  value: string
  unit?: string
  delta?: number
}) {
  const positive = (delta ?? 0) >= 0
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-gray-800">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      {delta !== undefined && (
        <div className={cx('mt-1 text-xs font-medium', positive ? 'text-green-600' : 'text-red-600')}>
          {signedPct(delta)} <span className="text-gray-400 font-normal">vs prev.</span>
        </div>
      )}
    </div>
  )
}

// --- AI badge --------------------------------------------------------------

export function AIBadge({ label = 'AI', title }: { label?: string; title?: string }) {
  return (
    <span
      title={title ?? 'Simulated AI output'}
      className="inline-flex items-center gap-1 rounded-full bg-violet-100 text-violet-700 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide"
    >
      <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
      {label}
    </span>
  )
}

// --- Confidence chip -------------------------------------------------------

export function ConfidenceChip({ value }: { value: number }) {
  const color = confidenceColor(value)
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color, backgroundColor: color + '1A' }}
    >
      {Math.round(value * 100)}% conf.
    </span>
  )
}

// --- Status pill -----------------------------------------------------------

export function StatusPill({ status, label }: { status: string; label?: string }) {
  const cls = statusPill[status] ?? 'bg-gray-100 text-gray-600'
  return (
    <span className={cx('inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize', cls)}>
      {label ?? status.replace(/-/g, ' ')}
    </span>
  )
}

// --- Severity tag ----------------------------------------------------------

export function SeverityTag({ severity }: { severity: Severity }) {
  const color = severityColor[severity]
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize"
      style={{ color, backgroundColor: color + '1A' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {severity}
    </span>
  )
}

// --- Button ----------------------------------------------------------------

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  type?: 'button' | 'submit'
  disabled?: boolean
}) {
  const base = 'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50'
  const sizes = { sm: 'text-xs px-2.5 py-1.5', md: 'text-sm px-3.5 py-2' }
  const variants = {
    primary: 'bg-brand text-white hover:bg-brand-dark',
    secondary: 'bg-brand-light text-brand hover:bg-green-200',
    ghost: 'text-gray-600 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cx(base, sizes[size], variants[variant])}>
      {children}
    </button>
  )
}

// --- Modal -----------------------------------------------------------------

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: ReactNode
  children: ReactNode
  footer?: ReactNode
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[2000] grid place-items-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        <header className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </header>
        <div className="p-5 overflow-y-auto scroll-thin text-sm text-gray-700">{children}</div>
        {footer && <footer className="flex justify-end gap-2 px-5 py-3 border-t border-gray-100">{footer}</footer>}
      </div>
    </div>
  )
}

// --- Simple horizontal score bar ------------------------------------------

export function ScoreBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full" style={{ width: `${value}%`, backgroundColor: color ?? '#2e7d32' }} />
    </div>
  )
}
