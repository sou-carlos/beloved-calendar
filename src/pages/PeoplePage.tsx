import React, { useEffect, useState } from 'react'
import { getAllPeople, deletePerson } from '../lib/db'
import { Person } from '../models'
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
      <ul>
        {people.map(p => (
          <li key={p.id} style={{margin:8}}>
            <strong>{p.name}</strong> — {p.birthDate}
            <button onClick={() => setEditing(p)} style={{marginLeft:8}}>Edit</button>
            <button onClick={() => onDelete(p.id)} style={{marginLeft:8}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
