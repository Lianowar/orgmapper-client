import styles from './ChatRedesign.module.css'

export default function TypingIndicatorRedesign() {
  return (
    <div className={styles.typingWrapper}>
      <div className={styles.typingBubble}>
        <div className={styles.typingDots}>
          <div className={styles.typingDot} />
          <div className={styles.typingDot} />
          <div className={styles.typingDot} />
        </div>
      </div>
    </div>
  )
}
