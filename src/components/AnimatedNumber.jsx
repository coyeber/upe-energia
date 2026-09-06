import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value, formatter = v => Math.round(v).toLocaleString('pt-BR'), duration = 650 }) {
  const numeric = Number(value)
  const [display, setDisplay] = useState(Number.isFinite(numeric) ? numeric : null)
  const prev = useRef(Number.isFinite(numeric) ? numeric : 0)

  useEffect(() => {
    if (!Number.isFinite(numeric)) { setDisplay(null); return }
    const start = performance.now()
    const from = prev.current
    const diff = numeric - from
    let raf
    const tick = now => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(from + diff * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else prev.current = numeric
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [numeric, duration])

  return <>{display == null ? '—' : formatter(display)}</>
}
