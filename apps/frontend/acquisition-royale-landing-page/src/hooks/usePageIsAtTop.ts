import { useEffect, useState } from 'react'

const usePageIsAtTop = (): boolean => {
  const [isPageAtTop, setIsPageAtTop] = useState(true)
  useEffect(() => {
    const handleScroll = (): void => {
      if (window.pageYOffset > 5) {
        setIsPageAtTop(false)
      } else {
        setIsPageAtTop(true)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return (): void => window.removeEventListener('scroll', handleScroll)
  }, [])
  return isPageAtTop
}

export default usePageIsAtTop
