import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'

export default function PassportForm({ data, onChange }) {
  const { tr } = useApp()

  const FIELDS = [
    { id: 'surname',  label: tr.surname,  placeholder: 'IVANOV',    icon: '👤' },
    { id: 'names',    label: tr.names,    placeholder: 'IVAN',      icon: '✏️' },
    { id: 'docNum',   label: tr.docNum,   placeholder: 'AA1234567', icon: '🪪' },
    { id: 'country',  label: tr.country,  placeholder: 'KGZ',       icon: '🌍' },
    { id: 'dob',      label: tr.dob,      placeholder: '900101',    icon: '🎂' },
    { id: 'expiry',   label: tr.expiry,   placeholder: '290101',    icon: '📅' },
    { id: 'sex',      label: tr.sex,      placeholder: 'M / F',     icon: '⚥' },
  ]

  const [form, setForm] = useState({
    surname: '', names: '', docNum: '',
    country: '', dob: '', expiry: '', sex: ''
  })

  useEffect(() => {
    if (data) setForm(prev => ({ ...prev, ...data }))
  }, [data])

  const handleChange = (id, val) => {
    const updated = { ...form, [id]: val }
    setForm(updated)
    onChange?.(updated)
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {FIELDS.map(f => (
        <div key={f.id} className="group">
          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
            <span>{f.icon}</span>
            {f.label}
          </label>
          <input
            className="input-dark group-hover:border-dark-400"
            placeholder={f.placeholder}
            value={form[f.id]}
            onChange={e => handleChange(f.id, e.target.value)}
          />
        </div>
      ))}
    </div>
  )
}
