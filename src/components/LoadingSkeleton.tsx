import { Skeleton, Stack } from '@mantine/core'

interface Props {
  lines?: number
}

export default function LoadingSkeleton({ lines = 3 }: Props) {
  return (
    <Stack>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={20} radius="sm" />
      ))}
    </Stack>
  )
}
