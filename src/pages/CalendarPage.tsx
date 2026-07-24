import { useEffect, useState } from 'react'
import Calendar from '../components/Calendar'
import { getAllPeople } from '../lib/db'
import type { Person } from '../models'

export default function CalendarPage(){
  const [people, setPeople] = useState<Person[]>([])
  useEffect(()=>{ load() }, [])
  async function load(){ setPeople(await getAllPeople()) }

  return (
    <div>
      <h2>Calendar</h2>
      <Calendar people={people} />
    </div>
  )
}
