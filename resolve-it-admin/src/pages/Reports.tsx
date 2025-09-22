import { useState, useMemo, useCallback } from 'react'
import { 
  FileText, 
  Filter, 
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  RotateCcw,
  Check,
  Loader2
} from 'lucide-react'
import { useSocket } from '@/contexts/SocketContext'
import { useDebouncedSearch } from '@/hooks/useDebounce'
import { ReportCard } from '@/components/ReportCard'

const civicReports = [
  {
    id: 'CR-2024-001',
    title: 'Pothole on Main Street',
    category: 'Road Maintenance',
    location: '123 Main Street, Downtown',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=100&fit=crop',
    timestamp: '2024-01-15T10:30:00Z',
    status: 'Open',
    priority: 'High',
    reporter: 'John Smith',
    description: 'Large pothole causing traffic issues and potential vehicle damage.'
  },
  {
    id: 'CR-2024-002',
    title: 'Broken Street Light',
    category: 'Public Works',
    location: '456 Oak Avenue, Midtown',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=150&h=100&fit=crop',
    timestamp: '2024-01-14T18:45:00Z',
    status: 'In Progress',
    priority: 'Medium',
    reporter: 'Sarah Johnson',
    description: 'Street light has been out for 3 days, creating safety concerns.'
  },
  {
    id: 'CR-2024-003',
    title: 'Garbage Collection Missed',
    category: 'Sanitation',
    location: '789 Pine Street, Westside',
    image: 'https://images.unsplash.com/photo-1581578731548-c6a0c3f2fcc0?w=150&h=100&fit=crop',
    timestamp: '2024-01-14T08:15:00Z',
    status: 'Resolved',
    priority: 'Low',
    reporter: 'Mike Chen',
    description: 'Garbage was not collected on scheduled pickup day.'
  },
  {
    id: 'CR-2024-004',
    title: 'Damaged Sidewalk',
    category: 'Road Maintenance',
    location: '321 Elm Street, Eastside',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=150&h=100&fit=crop',
    timestamp: '2024-01-13T14:20:00Z',
    status: 'Open',
    priority: 'Medium',
    reporter: 'Emily Davis',
    description: 'Cracked and uneven sidewalk poses tripping hazard.'
  },
  {
    id: 'CR-2024-005',
    title: 'Noise Complaint - Construction',
    category: 'Others',
    location: '654 Maple Drive, Northside',
    image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=150&h=100&fit=crop',
    timestamp: '2024-01-13T07:30:00Z',
    status: 'Under Review',
    priority: 'Medium',
    reporter: 'David Wilson',
    description: 'Construction work starting before permitted hours.'
  },
  {
    id: 'CR-2024-006',
    title: 'Traffic Signal Malfunction',
    category: 'Public Works',
    location: '987 Cedar Lane, Southside',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=150&h=100&fit=crop',
    timestamp: '2024-01-12T16:45:00Z',
    status: 'In Progress',
    priority: 'High',
    reporter: 'Lisa Brown',
    description: 'Traffic light stuck on red, causing traffic backup.'
  },
  {
    id: 'CR-2024-007',
    title: 'Graffiti on Public Building',
    category: 'Others',
    location: '147 Birch Street, Central',
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=150&h=100&fit=crop',
    timestamp: '2024-01-12T11:15:00Z',
    status: 'Open',
    priority: 'Low',
    reporter: 'Tom Anderson',
    description: 'Graffiti found on the side of the public library.'
  },
  {
    id: 'CR-2024-008',
    title: 'Water Leak in Street',
    category: 'Water Supply',
    location: '258 Spruce Avenue, Riverside',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=150&h=100&fit=crop',
    timestamp: '2024-01-11T09:30:00Z',
    status: 'Resolved',
    priority: 'High',
    reporter: 'Maria Garcia',
    description: 'Water leaking from underground pipe, pooling on street.'
  }
]

const categories = [
  { name: 'Sanitation', count: 1, color: 'bg-yellow-100 text-yellow-600' },
  { name: 'Public Works', count: 2, color: 'bg-indigo-100 text-indigo-600' },
  { name: 'Road Maintenance', count: 2, color: 'bg-blue-100 text-blue-600' },
  { name: 'Water Supply', count: 1, color: 'bg-cyan-100 text-cyan-600' },
  { name: 'Others', count: 2, color: 'bg-gray-100 text-gray-600' },
]

export function Reports() {
  const { reports: realtimeReports, stats } = useSocket()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [reports, setReports] = useState(civicReports)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)
  const [newCategory, setNewCategory] = useState('')
  const itemsPerPage = 6


  // Use debounced search for better performance
  const { debouncedSearchTerm, isSearching } = useDebouncedSearch(searchTerm, 300)

  // Use real-time reports if available, fallback to static data
  const displayReports = realtimeReports.length > 0 ? realtimeReports : reports

  // Memoize filtered reports for better performance
  const filteredReports = useMemo(() => {
    return displayReports.filter(report => {
      const matchesSearch = report.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           report.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           report.id.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           report.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                           report.reporter.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    
      const matchesCategory = selectedCategory === 'All' || report.category === selectedCategory
      const matchesStatus = selectedStatus === 'All' || report.status === selectedStatus
      
      // Date range filtering
      let matchesDateRange = true
      if (dateRange.start || dateRange.end) {
        const reportDate = new Date(report.timestamp)
        const startDate = dateRange.start ? new Date(dateRange.start) : null
        const endDate = dateRange.end ? new Date(dateRange.end) : null
        
        if (startDate && endDate) {
          matchesDateRange = reportDate >= startDate && reportDate <= endDate
        } else if (startDate) {
          matchesDateRange = reportDate >= startDate
        } else if (endDate) {
          matchesDateRange = reportDate <= endDate
        }
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesDateRange
    })
  }, [displayReports, debouncedSearchTerm, selectedCategory, selectedStatus, dateRange])

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentReports = filteredReports.slice(startIndex, endIndex)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-100 text-red-800'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800'
      case 'Under Review': return 'bg-blue-100 text-blue-800'
      case 'Resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedCategory('All')
    setSelectedStatus('All')
    setDateRange({ start: '', end: '' })
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || selectedCategory !== 'All' || selectedStatus !== 'All' || dateRange.start || dateRange.end

  const openCategoryModal = (report: any) => {
    setSelectedReport(report)
    setNewCategory(report.category)
    setShowCategoryModal(true)
  }

  const closeCategoryModal = () => {
    setShowCategoryModal(false)
    setSelectedReport(null)
    setNewCategory('')
  }

  const updateReportCategory = () => {
    if (selectedReport && newCategory) {
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === selectedReport.id 
            ? { ...report, category: newCategory }
            : report
        )
      )
      closeCategoryModal()
    }
  }

  const getCategoryColor = useCallback((category: string) => {
    const categoryData = categories.find(cat => cat.name === category)
    return categoryData ? categoryData.color : 'bg-gray-100 text-gray-600'
  }, [])

  const handleViewReport = useCallback((report: any) => {
    console.log('Viewing report:', report.id)
  }, [])

  const handleDownloadReport = useCallback((report: any) => {
    console.log('Downloading report:', report.id)
  }, [])

  const handleEditCategory = useCallback((report: any) => {
    openCategoryModal(report)
  }, [])

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Civic Issue Reports</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor and manage community-reported issues and concerns.</p>
        </div>
        <button className="btn btn-primary flex items-center justify-center sm:justify-start w-full sm:w-auto">
          <FileText className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">New Report</span>
          <span className="sm:hidden">Add Report</span>
        </button>
      </div>

      {/* Category overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
        {categories.map((category) => (
          <div key={category.name} className="card cursor-pointer hover:shadow-md transition-shadow duration-200 p-3 sm:p-4">
            <div className="text-center">
              <div className={`inline-flex p-2 rounded-full ${category.color} mb-2`}>
                <FileText className="h-3 w-3 sm:h-4 sm:w-4" />
              </div>
              <p className="text-sm sm:text-base font-medium text-gray-900">{category.count}</p>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{category.name}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search and filter controls */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 pr-10 text-sm sm:text-base"
              />
              {isSearching && (
                <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                </div>
              )}
              {searchTerm && !isSearching && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn flex items-center justify-center ${showFilters ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Filters</span>
              <span className="sm:hidden">Filter</span>
              {hasActiveFilters && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                  {[searchTerm, selectedCategory !== 'All', selectedStatus !== 'All', dateRange.start, dateRange.end].filter(Boolean).length}
                </span>
              )}
            </button>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="btn btn-secondary flex items-center justify-center"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Reset</span>
                <span className="sm:hidden">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Advanced filters */}
        {showFilters && (
          <div className="card bg-gray-50 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input"
                >
                  <option value="All">All Categories</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Public Works">Public Works</option>
                  <option value="Road Maintenance">Road Maintenance</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Status filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="input"
                >
                  <option value="All">All Status</option>
                  <option value="Open">New/Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              {/* Date range - Start date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="input"
                />
              </div>

              {/* Date range - End date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="input"
                />
              </div>
            </div>

            {/* Quick filter buttons */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700">Quick filters:</span>
                <button
                  onClick={() => {
                    setSelectedStatus('Open')
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors"
                >
                  New Reports
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('In Progress')
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-full hover:bg-yellow-200 transition-colors"
                >
                  In Progress
                </button>
                <button
                  onClick={() => {
                    setSelectedStatus('Resolved')
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors"
                >
                  Resolved
                </button>
                <button
                  onClick={() => {
                    const today = new Date()
                    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
                    setDateRange({
                      start: lastWeek.toISOString().split('T')[0],
                      end: today.toISOString().split('T')[0]
                    })
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors"
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => {
                    const today = new Date()
                    const lastMonth = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
                    setDateRange({
                      start: lastMonth.toISOString().split('T')[0],
                      end: today.toISOString().split('T')[0]
                    })
                    setCurrentPage(1)
                  }}
                  className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                >
                  Last 30 Days
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Active Filters:</span>
              <div className="flex flex-wrap gap-2">
                {searchTerm && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Search: "{searchTerm}"
                    <button
                      onClick={() => setSearchTerm('')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedCategory !== 'All' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {selectedStatus !== 'All' && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Status: {selectedStatus}
                    <button
                      onClick={() => setSelectedStatus('All')}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {dateRange.start && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    From: {new Date(dateRange.start).toLocaleDateString()}
                    <button
                      onClick={() => setDateRange(prev => ({ ...prev, start: '' }))}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {dateRange.end && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    To: {new Date(dateRange.end).toLocaleDateString()}
                    <button
                      onClick={() => setDateRange(prev => ({ ...prev, end: '' }))}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Results summary */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700">
          {filteredReports.length === displayReports.length ? (
            `Showing all ${displayReports.length} reports`
          ) : (
            `Showing ${filteredReports.length} of ${displayReports.length} reports`
          )}
        </div>
        {hasActiveFilters && (
          <div className="text-sm text-gray-500">
            Filters applied
          </div>
        )}
      </div>

      {/* Reports grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {currentReports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onView={handleViewReport}
            onDownload={handleDownloadReport}
            onEditCategory={handleEditCategory}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            getCategoryColor={getCategoryColor}
            formatTimestamp={formatTimestamp}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-gray-700 text-center sm:text-left">
            Showing {startIndex + 1} to {Math.min(endIndex, filteredReports.length)} of {filteredReports.length} reports
          </div>
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Show limited page numbers on mobile */}
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, window.innerWidth < 640 ? 3 : totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 sm:px-3 py-2 rounded-lg text-sm font-medium ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 hover:bg-gray-50 border border-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 3 && window.innerWidth < 640 && (
                <span className="px-2 text-gray-500">...</span>
              )}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 text-gray-500 hover:text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Statistics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Open Reports</span>
              <span className="text-sm font-medium text-red-600">
                {stats.byStatus.open || displayReports.filter(r => r.status === 'open').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">In Progress</span>
              <span className="text-sm font-medium text-yellow-600">
                {stats.byStatus['in-progress'] || displayReports.filter(r => r.status === 'in-progress').length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Resolved</span>
              <span className="text-sm font-medium text-green-600">
                {stats.byStatus.resolved || displayReports.filter(r => r.status === 'resolved').length}
              </span>
            </div>
            <button className="w-full btn btn-secondary text-sm">
              View Analytics
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="text-sm">
              <p className="text-gray-900">New pothole report submitted</p>
              <p className="text-gray-500 text-xs">2 hours ago</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-900">Street light issue resolved</p>
              <p className="text-gray-500 text-xs">1 day ago</p>
            </div>
            <div className="text-sm">
              <p className="text-gray-900">Traffic signal repair completed</p>
              <p className="text-gray-500 text-xs">2 days ago</p>
            </div>
            <button className="w-full btn btn-secondary text-sm">
              View All Activity
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full btn btn-primary text-sm">
              Create New Report
            </button>
            <button className="w-full btn btn-secondary text-sm">
              Export Reports
            </button>
            <button className="w-full btn btn-secondary text-sm">
              Bulk Update Status
            </button>
          </div>
        </div>
      </div>

      {/* Category Assignment Modal */}
      {showCategoryModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Change Report Category</h3>
                <button
                  onClick={closeCategoryModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">{selectedReport.title}</h4>
                  <p className="text-sm text-gray-600">Report ID: {selectedReport.id}</p>
                  <p className="text-sm text-gray-600">Current Category: 
                    <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedReport.category)}`}>
                      {selectedReport.category}
                    </span>
                  </p>
                </div>

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="input"
                >
                  <option value="Sanitation">Sanitation</option>
                  <option value="Public Works">Public Works</option>
                  <option value="Road Maintenance">Road Maintenance</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={closeCategoryModal}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={updateReportCategory}
                  disabled={!newCategory || newCategory === selectedReport.category}
                  className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Update Category
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
