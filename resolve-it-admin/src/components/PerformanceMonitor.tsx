import { useEffect, useState } from 'react'
import { useWebVitals, useMemoryMonitor } from '@/hooks/usePerformance'

interface PerformanceMonitorProps {
  enabled?: boolean
  showInUI?: boolean
}

export function PerformanceMonitor({ enabled = true, showInUI = false }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState({
    lcp: 0,
    fid: 0,
    cls: 0,
    memory: {
      used: 0,
      total: 0,
      limit: 0
    }
  })

  // Monitor Web Vitals
  useWebVitals()

  // Monitor Memory Usage
  useMemoryMonitor(enabled)

  useEffect(() => {
    if (!enabled) return

    // Monitor Core Web Vitals
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      
      entries.forEach((entry) => {
        if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, lcp: entry.startTime }))
        } else if (entry.entryType === 'first-input') {
          const fid = (entry as any).processingStart - entry.startTime
          setMetrics(prev => ({ ...prev, fid }))
        } else if (entry.entryType === 'layout-shift') {
          if (!(entry as any).hadRecentInput) {
            setMetrics(prev => ({ ...prev, cls: prev.cls + (entry as any).value }))
          }
        }
      })
    })

    try {
      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
    } catch (error) {
      console.warn('Performance Observer not supported:', error)
    }

    // Monitor memory usage
    const updateMemoryMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        setMetrics(prev => ({
          ...prev,
          memory: {
            used: memory.usedJSHeapSize,
            total: memory.totalJSHeapSize,
            limit: memory.jsHeapSizeLimit
          }
        }))
      }
    }

    const memoryInterval = setInterval(updateMemoryMetrics, 5000)
    updateMemoryMetrics()

    return () => {
      observer.disconnect()
      clearInterval(memoryInterval)
    }
  }, [enabled])

  if (!showInUI || !enabled) {
    return null
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getMetricColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.poor) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="fixed bottom-4 left-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-xs">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Metrics</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">LCP:</span>
          <span className={getMetricColor(metrics.lcp, { good: 2500, poor: 4000 })}>
            {metrics.lcp.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">FID:</span>
          <span className={getMetricColor(metrics.fid, { good: 100, poor: 300 })}>
            {metrics.fid.toFixed(0)}ms
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">CLS:</span>
          <span className={getMetricColor(metrics.cls, { good: 0.1, poor: 0.25 })}>
            {metrics.cls.toFixed(3)}
          </span>
        </div>
        
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Memory:</span>
            <span className="text-gray-900">
              {formatBytes(metrics.memory.used)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
