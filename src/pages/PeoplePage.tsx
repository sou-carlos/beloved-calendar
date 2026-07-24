import React, { useEffect, useState } from 'react'
import { getAllPeople, deletePerson } from '../lib/db'
import type { Person } from '../models'
import PersonForm from './PersonForm'

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([])
  const [editing, setEditing] = useState<Person | null>(null)

  useEffect(() => { load() }, [])
  async function load(){ setPeople(await getAllPeople()) }

  async function onDelete(id: string){ await deletePerson(id); await load() }

  return (
    <div>
      <h2>People</h2>
      <PersonForm onSaved={() => { setEditing(null); load() }} person={editing} />
      <div>
        {people.map(p => (
          <div key={p.id} style={{marginBottom:12}}>
            <PersonCard person={p} onUpdated={() => load()} onDelete={() => onDelete(p.id)} />
            <div style={{marginTop:4}}>
              <button onClick={() => setEditing(p)}>Edit person</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
