import { useMemo, useState } from 'react'
import styles from './Calendar.module.css'
import type { Person } from '../models'

type Props = { people: Person[] }

function parseMonthDay(dateStr: string) {
  const parts = dateStr.split('-').map(Number)
  return { month: parts[1], day: parts[2] }
}

function buildMonthMatrix(year: number, monthZeroBased: number) {
  const first = new Date(year, monthZeroBased, 1)
  const start = new Date(first)
  start.setDate(first.getDate() - first.getDay()) // start from Sunday

  const weeks: Date[][] = []
  for (let w = 0; w < 6; w++) {
    const days: Date[] = []
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start)
      dt.setDate(start.getDate() + w * 7 + d)
      days.push(dt)
    }
    weeks.push(days)
  }
  return weeks
}

export default function Calendar({ people }: Props){
  const today = new Date()
  const [view, setView] = useState({ year: today.getFullYear(), month: today.getMonth() })

  const weeks = useMemo(()=> buildMonthMatrix(view.year, view.month), [view])

  function prevMonth(){
    setView(v => {
      const m = v.month - 1
      return m < 0 ? { year: v.year - 1, month: 11 } : { year: v.year, month: m }
    })
  }
  function nextMonth(){
    setView(v => {
      const m = v.month + 1
      return m > 11 ? { year: v.year + 1, month: 0 } : { year: v.year, month: m }
    })
  }

  const peopleByMonthDay = useMemo(()=>{
    const map = new Map<string, Person[]>()
    for(const p of people){
      if(!p.birthDate) continue
      const { month, day } = parseMonthDay(p.birthDate)
      const key = `${month}-${day}`
      const arr = map.get(key) || []
      arr.push(p)
      map.set(key, arr)
    }
    return map
  }, [people])

  const monthName = new Date(view.year, view.month, 1).toLocaleString(undefined,{month:'long'})

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <div>
          <button onClick={prevMonth}>◀</button>
          <button onClick={nextMonth} style={{marginLeft:8}}>▶</button>
        </div>
        <h3>{monthName} {view.year}</h3>
      </div>

      <div className={styles.weekdays}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=> <div key={d}>{d}</div>)}
      </div>

      <div className={styles.grid}>
        {weeks.map(week => week.map(day => {
          const inMonth = day.getMonth() === view.month
          const key = `${day.getMonth()+1}-${day.getDate()}`
          const birthdays = peopleByMonthDay.get(key) || []
          return (
            <div key={day.toISOString()} className={styles.cell + (inMonth ? '' : ' ' + styles.otherMonth)}>
              <div className={styles.cellHeader}>
                <span className={styles.dateNumber}>{day.getDate()}</span>
                {birthdays.length > 0 && <span className={styles.birthdayBadge}>{birthdays.length} 🎂</span>}
              </div>
              <div>
                {birthdays.slice(0,3).map(p => (
                  <span key={p.id} className={styles.personLine}>{p.name}</span>
                ))}
                {birthdays.length > 3 && <div style={{fontSize:12,marginTop:6}}>and {birthdays.length - 3} more</div>}
              </div>
            </div>
          )
        }))}
      </div>
    </div>
  )
}
