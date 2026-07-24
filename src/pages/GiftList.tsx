import React from 'react'
import { Gift } from '../models'

type Props = { gifts: Gift[], onChange?: (gifts: Gift[]) => void }

export default function GiftList({ gifts }: Props){
  return (
    <div>
      <h3>Gifts</h3>
      <ul>
        {gifts.map(g => <li key={g.id}>{g.title} {g.notes ? `- ${g.notes}` : ''}</li>)}
      </ul>
    </div>
  )
}
