import { MutableRefObject, useEffect } from 'react'

type Event = MouseEvent | TouchEvent
export const useOnClickOutside = (
  ref: MutableRefObject<HTMLElement | null>,
  handler: (event: Event) => unknown
): void => {
  useEffect(() => {
    const listener = (event: Event): void => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }
    document.addEventListener('mousedown', listener)
    document.addEventListener('touchstart', listener)
    return (): void => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [ref, handler])
}
