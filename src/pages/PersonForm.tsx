import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import type { Person } from '../models'
import { upsertPerson } from '../lib/db'
import { v4 as uuidv4 } from 'uuid'

type Props = { person: Person | null, onSaved: () => void }

export default function PersonForm({ person, onSaved }: Props){
  const [name, setName] = useState('')
  const [birthDate, setBirthDate] = useState('')

  useEffect(()=>{
    if(person){ setName(person.name); setBirthDate(person.birthDate) }
    else { setName(''); setBirthDate('') }
  }, [person])

  async function save(e?: FormEvent){
    e?.preventDefault()
    const id = person?.id ?? uuidv4()
    const p: Person = { id, name, birthDate, gifts: person?.gifts ?? [] }
    await upsertPerson(p)
    onSaved()
  }

  return (
    <form onSubmit={save} style={{marginBottom:16}}>
      <input placeholder="Name" value={name} onChange={e=>setName((e.target as HTMLInputElement).value)} required />
      <input type="date" value={birthDate} onChange={e=>setBirthDate((e.target as HTMLInputElement).value)} required />
      <button type="submit">Save</button>
    </form>
  )
}
