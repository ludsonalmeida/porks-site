import { useEffect } from 'react'

export default function useReveal() {
  useEffect(() => {
    const ob = new IntersectionObserver(
      entries => {
        entries.forEach(x => {
          if (x.isIntersecting) {
            x.target.classList.add('in')
            ob.unobserve(x.target)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -28px 0px' }
    )
    document.querySelectorAll('.rv').forEach(e => ob.observe(e))
    return () => ob.disconnect()
  }, [])
}
