import { useRef, useEffect } from 'react'
import styles from './ChatRedesign.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
  onSend: (content: string) => void
  disabled?: boolean
}

export default function ChatInputRedesign({ value, onChange, onSend, disabled }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (value.trim() && !disabled) {
      onSend(value.trim())
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
    }
  }, [value])

  return (
    <div className={styles.inputContainer}>
      <form onSubmit={handleSubmit} className={styles.inputWrapper}>
        <div className={styles.textareaWrapper}>
          <textarea
            ref={textareaRef}
            className={styles.textarea}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Напишите ваше сообщение..."
            disabled={disabled}
            rows={1}
          />
        </div>
        <button
          type="submit"
          className={styles.sendButton}
          disabled={!value.trim() || disabled}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M2 21L23 12L2 3V10L17 12L2 14V21Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </form>
    </div>
  )
}
