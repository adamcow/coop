import { useEffect, useRef, useState } from 'react'
import type { Database } from '../types/supabase'
import { supabase } from '../supabaseClient'

type Coop = Database['public']['Tables']['coops']['Row']
type ChickenInsert = Database['public']['Tables']['chickens']['Insert']

interface BirdFormProps {
  open: boolean
  onClose: () => void
  onSubmitted: () => void
  defaultCoopId?: string | null
}

const SEX_OPTIONS = ['', 'hen', 'rooster']
const STATUS_OPTIONS = ['', 'active', 'broody', 'molting', 'rehomed', 'deceased']

const EMPTY_FORM = {
  name: '',
  breed: '',
  sex: '',
  status: '',
  hatch_date: '',
  features: '',
  coop_id: '',
}

export default function BirdForm({ open, onClose, onSubmitted, defaultCoopId }: BirdFormProps) {
  const [coops, setCoops] = useState<Coop[]>([])
  const [form, setForm] = useState(EMPTY_FORM)
  const [photo, setPhoto] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const fetchCoops = async () => {
      const { data } = await supabase.from('coops').select('*').order('name')
      setCoops(data ?? [])
    }
    fetchCoops()
  }, [open])

  useEffect(() => {
    if (open) {
      setForm({ ...EMPTY_FORM, coop_id: defaultCoopId ?? '' })
      setPhoto(null)
      setPhotoPreview(null)
      setError(null)
    }
  }, [open, defaultCoopId])

  useEffect(() => {
    if (!photo) {
      setPhotoPreview(null)
      return
    }
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

  if (!open) return null

  const handleField = (field: keyof typeof EMPTY_FORM, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setPhoto(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!form.name.trim()) {
      setError('Name is required.')
      return
    }

    setSubmitting(true)

    let photoUrl: string | null = null

    if (photo) {
      const ext = photo.name.split('.').pop() ?? 'jpg'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('chicken_photos')
        .upload(fileName, photo)

      if (uploadError) {
        setError(`Photo upload failed: ${uploadError.message}`)
        setSubmitting(false)
        return
      }

      const { data: publicUrlData } = supabase.storage
        .from('chicken_photos')
        .getPublicUrl(fileName)
      photoUrl = publicUrlData.publicUrl
    }

    const insert: ChickenInsert = {
      name: form.name.trim(),
      breed: form.breed.trim() || null,
      sex: form.sex || null,
      status: form.status || null,
      hatch_date: form.hatch_date || null,
      features: form.features.trim() || null,
      coop_id: form.coop_id || null,
      photo_url: photoUrl,
    }

    const { error: insertError } = await supabase.from('chickens').insert(insert)

    if (insertError) {
      setError(insertError.message)
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    onSubmitted()
  }

  return (
    <div className="bird-form-overlay" onClick={onClose}>
      <div
        className="bird-form-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bird-form-title"
      >
        <div className="bird-form-header">
          <h2 id="bird-form-title">Add a Chicken</h2>
          <button
            type="button"
            className="bird-form-close"
            onClick={onClose}
            aria-label="Close form"
          >
            &times;
          </button>
        </div>

        <form className="bird-form" onSubmit={handleSubmit}>
          <label className="bird-field">
            <span className="bird-label">Name <span className="required">*</span></span>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleField('name', e.target.value)}
              required
              autoFocus
            />
          </label>

          <div className="bird-field-row">
            <label className="bird-field">
              <span className="bird-label">Breed</span>
              <input
                type="text"
                value={form.breed}
                onChange={(e) => handleField('breed', e.target.value)}
              />
            </label>

            <label className="bird-field">
              <span className="bird-label">Sex</span>
              <select
                value={form.sex}
                onChange={(e) => handleField('sex', e.target.value)}
              >
                {SEX_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === '' ? '—' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="bird-field-row">
            <label className="bird-field">
              <span className="bird-label">Status</span>
              <select
                value={form.status}
                onChange={(e) => handleField('status', e.target.value)}
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt === '' ? '—' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                  </option>
                ))}
              </select>
            </label>

            <label className="bird-field">
              <span className="bird-label">Hatch Date</span>
              <input
                type="date"
                value={form.hatch_date}
                onChange={(e) => handleField('hatch_date', e.target.value)}
              />
            </label>
          </div>

          <label className="bird-field">
            <span className="bird-label">Coop</span>
            <select
              value={form.coop_id}
              onChange={(e) => handleField('coop_id', e.target.value)}
            >
              <option value="">—</option>
              {coops.map((coop) => (
                <option key={coop.id} value={coop.id}>
                  {coop.name}
                </option>
              ))}
            </select>
          </label>

          <label className="bird-field">
            <span className="bird-label">Features</span>
            <textarea
              value={form.features}
              onChange={(e) => handleField('features', e.target.value)}
              rows={3}
              placeholder="Identifying marks, colors, personality…"
            />
          </label>

          <label className="bird-field">
            <span className="bird-label">Photo</span>
            <div className="bird-photo-input">
              <button
                type="button"
                className="bird-photo-button"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose photo
              </button>
              <span className="bird-photo-filename">
                {photo ? photo.name : 'No file selected'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                hidden
              />
            </div>
            {photoPreview && (
              <div className="bird-photo-preview">
                <img src={photoPreview} alt="Preview" />
              </div>
            )}
          </label>

          {error && <p className="bird-error">{error}</p>}

          <div className="bird-form-actions">
            <button type="button" className="auth-button ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="auth-button" disabled={submitting}>
              {submitting ? 'Saving…' : 'Add chicken'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
