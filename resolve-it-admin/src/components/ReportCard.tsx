import { memo, useCallback } from 'react'
import { 
  FileText, 
  Download, 
  MapPin,
  Clock,
  Eye,
  Edit3
} from 'lucide-react'
import { OptimizedImage } from './OptimizedImage'

interface Report {
  id: string
  title: string
  category: string
  location: string
  image: string
  timestamp: string
  status: string
  priority: string
  reporter: string
  description: string
}

interface ReportCardProps {
  report: Report
  onView: (report: Report) => void
  onDownload: (report: Report) => void
  onEditCategory: (report: Report) => void
  getStatusColor: (status: string) => string
  getPriorityColor: (priority: string) => string
  getCategoryColor: (category: string) => string
  formatTimestamp: (timestamp: string) => string
}

export const ReportCard = memo(function ReportCard({
  report,
  onView,
  onDownload,
  onEditCategory,
  getStatusColor,
  getPriorityColor,
  getCategoryColor,
  formatTimestamp
}: ReportCardProps) {
  const handleView = useCallback(() => {
    onView(report)
  }, [onView, report])

  const handleDownload = useCallback(() => {
    onDownload(report)
  }, [onDownload, report])

  const handleEditCategory = useCallback(() => {
    onEditCategory(report)
  }, [onEditCategory, report])

  return (
    <div className="card hover:shadow-md transition-shadow duration-200 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Image thumbnail */}
        <div className="flex-shrink-0 mx-auto sm:mx-0">
          <OptimizedImage
            src={report.image}
            alt={report.title}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover"
            fallbackClassName="w-16 h-16 sm:w-20 sm:h-20 rounded-lg"
            lazy={true}
          />
        </div>

        {/* Report details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{report.title}</h3>
              <p className="text-xs sm:text-sm text-gray-500 font-mono mt-1">{report.id}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                {report.status}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(report.priority)}`}>
                {report.priority}
              </span>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center min-w-0">
                <FileText className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(report.category)}`}>
                  {report.category}
                </span>
              </div>
              <button
                onClick={handleEditCategory}
                className="text-gray-400 hover:text-primary-600 transition-colors flex-shrink-0 ml-2"
                title="Change category"
              >
                <Edit3 className="h-4 w-4" />
              </button>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate">{report.location}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{formatTimestamp(report.timestamp)}</span>
            </div>
          </div>

          <p className="mt-3 text-sm text-gray-700 line-clamp-2">{report.description}</p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-xs text-gray-500">Reported by {report.reporter}</span>
            <div className="flex items-center gap-3">
              <button 
                onClick={handleView}
                className="text-primary-600 hover:text-primary-900 text-sm font-medium flex items-center"
              >
                <Eye className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">View</span>
              </button>
              <button 
                onClick={handleDownload}
                className="text-gray-400 hover:text-gray-600"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})
