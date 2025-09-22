import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  renderTime: number
  componentName: string
  timestamp: number
}

/**
 * Hook for monitoring component performance
 * @param componentName - Name of the component being monitored
 * @param enabled - Whether to enable monitoring (default: true)
 */
export function usePerformance(componentName: string, enabled: boolean = true) {
  const renderStartTime = useRef<number>(0)
  const renderCount = useRef<number>(0)

  useEffect(() => {
    if (!enabled) return

    renderStartTime.current = performance.now()
    renderCount.current += 1

    return () => {
      const renderTime = performance.now() - renderStartTime.current
      
      // Log performance metrics in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          renderCount: renderCount.current,
          timestamp: new Date().toISOString()
        })
      }

      // Store metrics for analysis
      const metrics: PerformanceMetrics = {
        renderTime,
        componentName,
        timestamp: Date.now()
      }

      // Send to analytics or performance monitoring service
      if (window.gtag) {
        window.gtag('event', 'component_render', {
          component_name: componentName,
          render_time: renderTime,
          render_count: renderCount.current
        })
      }
    }
  })

  return {
    renderCount: renderCount.current,
    startTiming: () => {
      renderStartTime.current = performance.now()
    },
    endTiming: () => {
      return performance.now() - renderStartTime.current
    }
  }
}

/**
 * Hook for measuring function execution time
 * @param fn - Function to measure
 * @param deps - Dependencies array
 */
export function useMeasureTime<T extends (...args: any[]) => any>(
  fn: T,
  deps: React.DependencyList = []
): T {
  const fnRef = useRef(fn)
  fnRef.current = fn

  return useRef((...args: Parameters<T>) => {
    const start = performance.now()
    const result = fnRef.current(...args)
    const end = performance.now()
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] Function execution time: ${(end - start).toFixed(2)}ms`)
    }
    
    return result
  }).current as T
}

/**
 * Hook for monitoring memory usage
 */
export function useMemoryMonitor(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled || !('memory' in performance)) return

    const logMemoryUsage = () => {
      const memory = (performance as any).memory
      if (memory) {
        console.log('[Memory Usage]', {
          used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
          limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
        })
      }
    }

    // Log memory usage every 30 seconds
    const interval = setInterval(logMemoryUsage, 30000)
    
    return () => clearInterval(interval)
  }, [enabled])
}

/**
 * Hook for monitoring Web Vitals
 */
export function useWebVitals() {
  useEffect(() => {
    // Monitor Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          metric_name: 'LCP',
          metric_value: lastEntry.startTime,
          metric_rating: lastEntry.startTime < 2500 ? 'good' : 'poor'
        })
      }
    })

    // Monitor First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (window.gtag) {
          window.gtag('event', 'web_vitals', {
            metric_name: 'FID',
            metric_value: entry.processingStart - entry.startTime,
            metric_rating: entry.processingStart - entry.startTime < 100 ? 'good' : 'poor'
          })
        }
      })
    })

    // Monitor Cumulative Layout Shift (CLS)
    const clsObserver = new PerformanceObserver((list) => {
      let clsValue = 0
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })

      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          metric_name: 'CLS',
          metric_value: clsValue,
          metric_rating: clsValue < 0.1 ? 'good' : 'poor'
        })
      }
    })

    try {
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
      fidObserver.observe({ entryTypes: ['first-input'] })
      clsObserver.observe({ entryTypes: ['layout-shift'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    return () => {
      lcpObserver.disconnect()
      fidObserver.disconnect()
      clsObserver.disconnect()
    }
  }, [])
}
