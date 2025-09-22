import { X, Bell, CheckCircle, AlertCircle, Info, RotateCcw } from 'lucide-react'
import { useSocket } from '../contexts/SocketContext'

interface NotificationToastProps {
  notification: {
    id: string
    type: 'new-report' | 'status-updated' | 'reassigned' | 'info'
    title: string
    message: string
    timestamp: Date
    reportId?: string
    department?: string
  }
  onRemove: (id: string) => void
}

export function NotificationToast({ notification, onRemove }: NotificationToastProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'new-report':
        return <Bell className="h-5 w-5 text-blue-600" />
      case 'status-updated':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'reassigned':
        return <RotateCcw className="h-5 w-5 text-orange-600" />
      case 'info':
        return <Info className="h-5 w-5 text-gray-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getBgColor = () => {
    switch (notification.type) {
      case 'new-report':
        return 'bg-blue-50 border-blue-200'
      case 'status-updated':
        return 'bg-green-50 border-green-200'
      case 'reassigned':
        return 'bg-orange-50 border-orange-200'
      case 'info':
        return 'bg-gray-50 border-gray-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const seconds = Math.floor(diff / 1000)
    
    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className={`w-full border rounded-lg shadow-lg p-3 sm:p-4 ${getBgColor()} animate-in slide-in-from-right-full duration-300`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-2 sm:ml-3 flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {notification.title}
          </h4>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 line-clamp-2">
            {notification.message}
          </p>
          {notification.reportId && (
            <p className="text-xs text-gray-500 mt-1 font-mono truncate">
              ID: {notification.reportId}
            </p>
          )}
          <p className="text-xs text-gray-400 mt-1">
            {formatTime(notification.timestamp)}
          </p>
        </div>
        <div className="ml-2 sm:ml-4 flex-shrink-0">
          <button
            onClick={() => onRemove(notification.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X className="h-3 w-3 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function NotificationContainer() {
  const { notifications, removeNotification } = useSocket()

  return (
    <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50 space-y-2 max-w-sm w-full sm:max-w-none">
      {/* Notifications */}
      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
}
