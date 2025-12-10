import { Paper } from '@mantine/core'
import styles from './Chat.module.css'

export default function TypingIndicator() {
  return (
    <Paper className={styles.typing} withBorder radius="md">
      <div className={styles.dot} />
      <div className={styles.dot} />
      <div className={styles.dot} />
    </Paper>
  )
}
