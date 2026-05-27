import { useState, useRef, useCallback } from 'react'
import { parseMRZ } from '../utils/mrzParser'
import { useApp } from '../context/AppContext'

export default function PassportScanner({ onScan }) {
  const { tr } = useApp()
  const [status, setStatus] = useState('idle')
  const [progress, setProgress] = useState(0)
  const [preview, setPreview] = useState(null)
  const [statusText, setStatusText] = useState('')
  const dropRef = useRef()
  const fileInputRef = useRef()

  const processFile = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setStatus('error'); setStatusText('Пожалуйста, загрузите изображение'); return
    }
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target.result)
    reader.readAsDataURL(file)

    setStatus('scanning'); setProgress(0); setStatusText(tr.initOcr)
    try {
      const { createWorker } = await import('tesseract.js')
      const worker = await createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') {
            const pct = Math.round(m.progress * 100)
            setProgress(pct); setStatusText(`${tr.recognizing}: ${pct}%`)
          } else { setStatusText(m.status) }
        }
      })
      await worker.setParameters({ tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<' })
      const { data: { text } } = await worker.recognize(file)
      await worker.terminate()
      const mrzData = parseMRZ(text)
      if (mrzData) {
        setStatus('done'); setStatusText(tr.scanDone); setProgress(100); onScan(mrzData)
      } else {
        setStatus('error'); setStatusText(tr.scanError)
      }
    } catch (err) { setStatus('error'); setStatusText('Ошибка: ' + err.message) }
  }, [onScan, tr])

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setStatus('idle')
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleReset = () => {
    setStatus('idle'); setPreview(null); setProgress(0); setStatusText('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={dropRef}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setStatus('dragging') }}
        onDragLeave={() => { if (status === 'dragging') setStatus('idle') }}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden
          ${status === 'dragging' ? 'drop-active' : 'border-slate-300 dark:border-dark-500 hover:border-brand-500/60'}
          ${preview ? 'min-h-[180px]' : 'min-h-[140px]'}
        `}
        style={{ background: status === 'dragging' ? 'rgba(14,165,233,0.05)' : undefined }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
          onChange={e => e.target.files[0] && processFile(e.target.files[0])} />

        {preview ? (
          <>
            <img src={preview} alt="Паспорт" className="w-full h-full object-contain max-h-[200px] rounded-xl p-2" />
            {status === 'scanning' && (
              <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                <div className="scan-line" />
                <div className="absolute inset-0 bg-brand-900/20" />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 py-8 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-dark-700 border border-slate-200 dark:border-dark-500 flex items-center justify-center text-2xl">
              🛂
            </div>
            <div className="text-center">
              <p className="text-slate-600 dark:text-slate-300 text-sm font-medium">{tr.dragHere}</p>
              <p className="text-slate-400 text-xs mt-1">{tr.orClick}</p>
            </div>
            <div className="flex gap-2">
              {['JPG','PNG','WEBP'].map(f => (
                <span key={f} className="text-xs bg-slate-100 dark:bg-dark-700 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200 dark:border-dark-600">{f}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {status !== 'idle' && (
        <div className="animate-fade-in">
          {status === 'scanning' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                <p className="text-brand-500 text-sm font-medium">{statusText}</p>
              </div>
              <div className="h-1.5 bg-slate-200 dark:bg-dark-700 rounded-full overflow-hidden">
                <div className="h-full progress-shimmer rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          {status === 'done' && (
            <div className="flex items-center gap-2 text-green-600 text-sm font-semibold">
              <span className="text-lg">✅</span> {statusText}
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <span className="text-lg">⚠️</span> {statusText}
            </div>
          )}
        </div>
      )}

      {(preview || status !== 'idle') && (
        <button onClick={handleReset} className="btn-ghost text-sm w-full">
          {tr.reset}
        </button>
      )}
    </div>
  )
}
