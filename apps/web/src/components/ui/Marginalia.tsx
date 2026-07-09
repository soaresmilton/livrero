interface MarginaliaProps {
  children: React.ReactNode
}

export function Marginalia({ children }: MarginaliaProps) {
  return (
    <span
      className="italic font-serif text-sm"
      style={{ color: 'var(--color-on-surface-variant)' }}
    >
      {children}
    </span>
  )
}
