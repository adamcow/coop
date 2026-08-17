import { useEffect, useState } from 'react'
import type { Database } from '../types/supabase'
import { supabase } from '../supabaseClient'

type Coop = Database['public']['Tables']['coops']['Row']

interface CoopSelectorProps {
  activeCoopId: string | null
  onSelectCoop: (coopId: string | null) => void
}

export default function CoopSelector({ activeCoopId, onSelectCoop }: CoopSelectorProps) {
  const [coops, setCoops] = useState<Coop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchCoops = async () => {
    setLoading(true)
    setError(null)
    const { data, error: fetchError } = await supabase
      .from('coops')
      .select('*')
      .order('name')
    if (fetchError) {
      setError(fetchError.message)
    } else {
      setCoops(data ?? [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCoops()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = newName.trim()
    if (!trimmed) return
    setAdding(true)
    setError(null)
    const { data, error: insertError } = await supabase
      .from('coops')
      .insert({ name: trimmed })
      .select('*')
      .single()
    if (insertError) {
      setError(insertError.message)
      setAdding(false)
      return
    }
    if (data) {
      setCoops((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      onSelectCoop(data.id)
    }
    setNewName('')
    setAdding(false)
  }

  return (
    <section className="coop-selector">
      <div className="coop-selector-top">
        <div className="coop-tabs">
          <button
            type="button"
            className={`coop-tab ${activeCoopId === null ? 'active' : ''}`}
            onClick={() => onSelectCoop(null)}
          >
            All Coops
          </button>
          {loading ? (
            <span className="coop-tabs-status">Loading…</span>
          ) : (
            coops.map((coop) => (
              <button
                key={coop.id}
                type="button"
                className={`coop-tab ${activeCoopId === coop.id ? 'active' : ''}`}
                onClick={() => onSelectCoop(coop.id)}
              >
                {coop.name}
              </button>
            ))
          )}
        </div>

        <form className="coop-add" onSubmit={handleAdd}>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New coop name"
            aria-label="New coop name"
          />
          <button type="submit" className="coop-add-button" disabled={adding || !newName.trim()}>
            {adding ? 'Adding…' : 'Add coop'}
          </button>
        </form>
      </div>
      {error && <p className="coop-error">{error}</p>}
    </section>
  )
}
