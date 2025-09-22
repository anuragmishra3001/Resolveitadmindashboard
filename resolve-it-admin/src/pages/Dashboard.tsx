import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { useSocket } from '@/contexts/SocketContext'

const stats = [
  {
    name: 'Total Users',
    value: '2,345',
    change: '+12%',
    changeType: 'positive',
    icon: Users,
  },
  {
    name: 'Revenue',
    value: '$45,231',
    change: '+8.2%',
    changeType: 'positive',
    icon: DollarSign,
  },
  {
    name: 'Active Sessions',
    value: '1,234',
    change: '-2.1%',
    changeType: 'negative',
    icon: Activity,
  },
  {
    name: 'Growth Rate',
    value: '23.5%',
    change: '+4.3%',
    changeType: 'positive',
    icon: TrendingUp,
  },
]

const recentActivity = [
  { id: 1, user: 'John Doe', action: 'Created new account', time: '2 minutes ago' },
  { id: 2, user: 'Jane Smith', action: 'Updated profile', time: '5 minutes ago' },
  { id: 3, user: 'Mike Johnson', action: 'Completed payment', time: '10 minutes ago' },
  { id: 4, user: 'Sarah Wilson', action: 'Submitted support ticket', time: '15 minutes ago' },
]

export function Dashboard() {
  const { stats: realtimeStats, isConnected } = useSocket()

  // Use real-time stats if available, fallback to static data
  const displayStats = [
    {
      name: 'Total Reports',
      value: realtimeStats.total.toString() || '0',
      change: '+12%',
      changeType: 'positive',
      icon: Activity,
    },
    {
      name: 'Open Reports',
      value: realtimeStats.byStatus?.open?.toString() || '0',
      change: '+8.2%',
      changeType: 'positive',
      icon: TrendingUp,
    },
    {
      name: 'In Progress',
      value: realtimeStats.byStatus?.['in-progress']?.toString() || '0',
      change: '-2.1%',
      changeType: 'negative',
      icon: Activity,
    },
    {
      name: 'Resolved',
      value: realtimeStats.byStatus?.resolved?.toString() || '0',
      change: '+4.3%',
      changeType: 'positive',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Welcome back! Here's what's happening with your platform.
          {isConnected && <span className="ml-2 text-green-600">● Live updates enabled</span>}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {displayStats.map((stat) => (
          <div key={stat.name} className="card p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">{stat.name}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className="flex items-center flex-shrink-0 ml-2">
                <stat.icon className="h-6 w-6 sm:h-8 sm:w-8 text-primary-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'positive' ? (
                <ArrowUpRight className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-xs sm:text-sm font-medium ml-1 ${
                stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-xs sm:text-sm text-gray-500 ml-1 hidden sm:inline">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3 sm:space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.user} {activity.action}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2 sm:space-y-3">
            <button className="w-full btn btn-primary text-left text-sm sm:text-base">
              Add New User
            </button>
            <button className="w-full btn btn-secondary text-left text-sm sm:text-base">
              Generate Report
            </button>
            <button className="w-full btn btn-secondary text-left text-sm sm:text-base">
              View Analytics
            </button>
            <button className="w-full btn btn-secondary text-left text-sm sm:text-base">
              System Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
