'use client'
 
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h3>Something went wrong!</h3>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
