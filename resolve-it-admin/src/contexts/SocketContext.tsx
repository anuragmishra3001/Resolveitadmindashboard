import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'

interface SocketContextType {
  socket: Socket | null
  isConnected: boolean
  reports: any[]
  stats: {
    total: number
    byStatus: {
      open: number
      'in-progress': number
      'under-review': number
      resolved: number
    }
    byDepartment: Record<string, number>
  }
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  type: 'new-report' | 'status-updated' | 'reassigned' | 'info'
  title: string
  message: string
  timestamp: Date
  reportId?: string
  department?: string
}

const SocketContext = createContext<SocketContextType | undefined>(undefined)

interface SocketProviderProps {
  children: ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [reports, setReports] = useState<any[]>([])
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {
      open: 0,
      'in-progress': 0,
      'under-review': 0,
      resolved: 0
    },
    byDepartment: {} as Record<string, number>
  })
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Development mode - set to true to run without backend
    const isDevelopmentMode = import.meta.env.DEV || true
    
    if (isDevelopmentMode) {
      console.log('🔌 Development mode: Mock WebSocket connection')
      setIsConnected(true)
      return
    }
    
    // Initialize socket connection
    const newSocket = io('http://localhost:3001', {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      console.log('🔌 Connected to WebSocket server')
      setIsConnected(true)
      newSocket.emit('admin:join')
    })

    newSocket.on('disconnect', () => {
      console.log('🔌 Disconnected from WebSocket server')
      setIsConnected(false)
    })

    newSocket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error)
      setIsConnected(false)
    })

    // Listen for new reports
    newSocket.on('report:new', (data) => {
      console.log('📨 New report received:', data)
      setReports(prev => [data.report, ...prev])
      
      addNotification({
        type: 'new-report',
        title: 'New Report Submitted',
        message: `${data.report.title} - Assigned to ${data.department.name}`,
        reportId: data.report.id,
        department: data.department.name
      })
    })

    // Listen for status updates
    newSocket.on('report:status-updated', (data) => {
      console.log('📝 Report status updated:', data)
      setReports(prev => 
        prev.map(report => 
          report.id === data.reportId 
            ? { ...report, status: data.status, updatedAt: data.updatedAt }
            : report
        )
      )
      
      addNotification({
        type: 'status-updated',
        title: 'Report Status Updated',
        message: `Report ${data.reportId} status changed to ${data.status}`,
        reportId: data.reportId
      })
    })

    // Listen for reassignments
    newSocket.on('report:reassigned', (data) => {
      console.log('🔄 Report reassigned:', data)
      setReports(prev => 
        prev.map(report => 
          report.id === data.reportId 
            ? { 
                ...report, 
                assignedDepartment: data.newDepartment.id,
                assignedDepartmentName: data.newDepartment.name,
                updatedAt: data.updatedAt 
              }
            : report
        )
      )
      
      addNotification({
        type: 'reassigned',
        title: 'Report Reassigned',
        message: `Report ${data.reportId} reassigned to ${data.newDepartment.name}`,
        reportId: data.reportId,
        department: data.newDepartment.name
      })
    })

    // Listen for statistics updates
    newSocket.on('reports:stats', (data) => {
      console.log('📊 Statistics updated:', data)
      setStats(data)
    })

    // Listen for recent reports
    newSocket.on('reports:recent', (data) => {
      console.log('📋 Recent reports received:', data)
      setReports(data)
    })

    // Listen for report count
    newSocket.on('reports:count', (data) => {
      console.log('🔢 Report count:', data)
      setStats(prev => ({ ...prev, total: data.total }))
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    }
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]) // Keep only last 10 notifications
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const value: SocketContextType = {
    socket,
    isConnected,
    reports,
    stats,
    notifications,
    addNotification,
    removeNotification
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocket() {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider')
  }
  return context
}
