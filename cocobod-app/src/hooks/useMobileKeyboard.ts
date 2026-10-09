'use client'

import { useEffect } from 'react'

/**
 * Hook to handle mobile keyboard viewport changes
 * Prevents keyboard from covering inputs on mobile devices
 */
export function useMobileKeyboard() {
  useEffect(() => {
    const handleViewportResize = () => {
      const viewportHeight = window.innerHeight
      document.documentElement.style.setProperty('--viewport-height', `${viewportHeight}px`)
    }

    // Set initial viewport height
    handleViewportResize()

    // Listen for viewport changes (keyboard open/close)
    window.addEventListener('resize', handleViewportResize)
    window.addEventListener('orientationchange', handleViewportResize)

    // Also listen for visual viewport API if available
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', handleViewportResize)
    }

    return () => {
      window.removeEventListener('resize', handleViewportResize)
      window.removeEventListener('orientationchange', handleViewportResize)
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', handleViewportResize)
      }
    }
  }, [])
}
