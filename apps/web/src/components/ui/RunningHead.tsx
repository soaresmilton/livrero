interface RunningHeadProps {
  section: string
  detail?: string
}

export function RunningHead({ section, detail }: RunningHeadProps) {
  return (
    <p
      className="text-[10px] font-semibold tracking-[0.2em] uppercase mb-2 font-sans select-none"
      style={{ color: 'var(--color-on-surface-variant)' }}
    >
      {section}
      {detail && (
        <span className="font-normal opacity-60"> · {detail}</span>
      )}
    </p>
  )
}
