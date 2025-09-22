import { TrendingUp, Users, Eye, MousePointer } from 'lucide-react'

const analyticsData = [
  { name: 'Jan', users: 4000, pageViews: 2400, clicks: 2400 },
  { name: 'Feb', users: 3000, pageViews: 1398, clicks: 2210 },
  { name: 'Mar', users: 2000, pageViews: 9800, clicks: 2290 },
  { name: 'Apr', users: 2780, pageViews: 3908, clicks: 2000 },
  { name: 'May', users: 1890, pageViews: 4800, clicks: 2181 },
  { name: 'Jun', users: 2390, pageViews: 3800, clicks: 2500 },
]

const metrics = [
  {
    name: 'Total Users',
    value: '12,345',
    change: '+12%',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    name: 'Page Views',
    value: '45,678',
    change: '+8.2%',
    icon: Eye,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    name: 'Click Rate',
    value: '23.5%',
    change: '+4.3%',
    icon: MousePointer,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    name: 'Growth Rate',
    value: '18.2%',
    change: '+2.1%',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
]

export function Analytics() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your platform performance and user engagement.</p>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric) => (
          <div key={metric.name} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                <p className="text-sm text-green-600">{metric.change} from last month</p>
              </div>
              <div className={`p-3 rounded-full ${metric.bgColor}`}>
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">User Growth</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Users</span>
            </div>
          </div>
          <div className="h-64 flex items-end space-x-2">
            {analyticsData.map((data) => (
              <div key={data.name} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-blue-500 rounded-t"
                  style={{ height: `${(data.users / 5000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{data.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Page Views Chart */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Page Views</h3>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Views</span>
            </div>
          </div>
          <div className="h-64 flex items-end space-x-2">
            {analyticsData.map((data) => (
              <div key={data.name} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full bg-green-500 rounded-t"
                  style={{ height: `${(data.pageViews / 10000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{data.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Pages */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Pages</h3>
        <div className="space-y-4">
          {[
            { page: '/dashboard', views: 1234, change: '+12%' },
            { page: '/users', views: 987, change: '+8%' },
            { page: '/analytics', views: 756, change: '+15%' },
            { page: '/settings', views: 543, change: '-2%' },
          ].map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{item.page}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{item.views} views</span>
                <span className={`text-sm font-medium ${
                  item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.change}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
