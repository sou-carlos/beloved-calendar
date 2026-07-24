import { useState } from 'react'
import styles from './PersonCard.module.css'
import type { Person, Gift } from '../models'
import { upsertPerson } from '../lib/db'
import { v4 as uuidv4 } from 'uuid'

type Props = { person: Person, onUpdated?: () => void, onDelete?: () => void }

export default function PersonCard({ person, onUpdated, onDelete }: Props){
  const [addingTitle, setAddingTitle] = useState('')
  const [addingNotes, setAddingNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  async function addGift(){
    if(!addingTitle.trim()) return
    setProcessing(true)
    const gift: Gift = { id: uuidv4(), title: addingTitle.trim(), notes: addingNotes.trim() || undefined }
    const p: Person = { ...person, gifts: [...(person.gifts||[]), gift] }
    await upsertPerson(p)
    setAddingTitle('')
    setAddingNotes('')
    setProcessing(false)
    onUpdated && onUpdated()
  }

  async function removeGift(giftId: string){
    setProcessing(true)
    const p: Person = { ...person, gifts: (person.gifts||[]).filter(g => g.id !== giftId) }
    await upsertPerson(p)
    setProcessing(false)
    onUpdated && onUpdated()
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div>
          <div className={styles.name}>{person.name}</div>
          <div className={styles.small}>{person.birthDate}</div>
        </div>
        <div>
          {onDelete && <button className="removeBtn" onClick={onDelete}>Delete</button>}
        </div>
      </div>

      <div className={styles.gifts}>
        <h4>Gifts</h4>
        {(person.gifts||[]).length === 0 && <div className={styles.small}>No gifts yet</div>}
        {(person.gifts||[]).map(g => (
          <div key={g.id} className={styles.giftItem}>
            <div className={styles.giftTitle}>{g.title}{g.notes ? ` — ${g.notes}` : ''}</div>
            <div>
              <button className={styles.removeBtn} onClick={() => removeGift(g.id)} disabled={processing}>Remove</button>
            </div>
          </div>
        ))}

        <div className={styles.addGift}>
          <input className={styles.input} placeholder="Gift title" value={addingTitle} onChange={e=>setAddingTitle(e.target.value)} />
          <input className={styles.input} placeholder="Notes (optional)" value={addingNotes} onChange={e=>setAddingNotes(e.target.value)} />
          <button className={styles.button} onClick={addGift} disabled={processing}>Add</button>
        </div>
      </div>
    </div>
  )
}
