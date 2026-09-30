'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Package,
  Users,
  DollarSign,
  ShoppingCart,
} from 'lucide-react'

interface ReportData {
  summary: {
    totalRevenue: number
    totalOrders: number
    totalCustomers: number
    totalProducts: number
    avgOrderValue: number
    revenueChange: number
    ordersChange: number
    customersChange: number
  }
  salesByDay: { date: string; revenue: number; orders: number }[]
  topProducts: { id: string; name: string; sales: number; revenue: number }[]
  topCategories: { id: string; name: string; sales: number; revenue: number }[]
  ordersByStatus: { status: string; count: number }[]
  customersByCity: { city: string; count: number }[]
}

export default function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [reportType, setReportType] = useState('sales')
  const [dateRange, setDateRange] = useState('30d')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [data, setData] = useState<ReportData | null>(null)

  useEffect(() => {
    fetchReports()
  }, [reportType, dateRange, startDate, endDate])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        type: reportType,
        dateRange,
      })
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const res = await fetch(`/api/v1/admin/reports?${params}`)
      const result = await res.json()
      if (result.success) {
        setData(result.data)
      }
    } catch (err) {
      console.error('Failed to fetch reports')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = () => {
    // Generate CSV
    let csv = ''
    
    if (reportType === 'sales' && data?.salesByDay) {
      csv = 'Date,Revenue,Orders\n'
      data.salesByDay.forEach((row) => {
        csv += `${row.date},${row.revenue},${row.orders}\n`
      })
    } else if (reportType === 'products' && data?.topProducts) {
      csv = 'Product,Sales,Revenue\n'
      data.topProducts.forEach((row) => {
        csv += `"${row.name}",${row.sales},${row.revenue}\n`
      })
    }

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600">View business performance metrics</p>
        </div>
        <button
          onClick={exportReport}
          className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50 transition"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
            >
              <option value="sales">Sales Report</option>
              <option value="products">Products Report</option>
              <option value="customers">Customers Report</option>
              <option value="inventory">Inventory Report</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last 1 year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          {dateRange === 'custom' && (
            <>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded-lg px-4 py-2"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data?.summary?.totalRevenue || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
              {data?.summary?.revenueChange !== undefined && (
                <div className="mt-2 flex items-center text-sm">
                  {data.summary.revenueChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      data.summary.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {Math.abs(data.summary.revenueChange)}%
                  </span>
                  <span className="text-gray-500 ml-1">vs last period</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{data?.summary?.totalOrders || 0}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              {data?.summary?.ordersChange !== undefined && (
                <div className="mt-2 flex items-center text-sm">
                  {data.summary.ordersChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      data.summary.ordersChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {Math.abs(data.summary.ordersChange)}%
                  </span>
                  <span className="text-gray-500 ml-1">vs last period</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Customers</p>
                  <p className="text-2xl font-bold">{data?.summary?.totalCustomers || 0}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              {data?.summary?.customersChange !== undefined && (
                <div className="mt-2 flex items-center text-sm">
                  {data.summary.customersChange >= 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span
                    className={
                      data.summary.customersChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    {Math.abs(data.summary.customersChange)}%
                  </span>
                  <span className="text-gray-500 ml-1">vs last period</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Avg Order Value</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(data?.summary?.avgOrderValue || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Sales Chart Placeholder */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Sales Trend</h3>
              {data?.salesByDay && data.salesByDay.length > 0 ? (
                <div className="space-y-2">
                  {data.salesByDay.slice(0, 10).map((day) => (
                    <div key={day.date} className="flex items-center gap-4">
                      <span className="text-sm text-gray-600 w-24">{day.date}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-pink-500 h-full rounded-full"
                          style={{
                            width: `${(day.revenue / (data.summary?.totalRevenue || 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium w-24 text-right">
                        {formatCurrency(day.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No sales data available
                </div>
              )}
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Top Products</h3>
              {data?.topProducts && data.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {data.topProducts.slice(0, 5).map((product, index) => (
                    <div key={product.id} className="flex items-center gap-4">
                      <span className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center text-sm font-semibold text-pink-600">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">
                          {product.sales} sold • {formatCurrency(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-500">
                  No product data available
                </div>
              )}
            </div>

            {/* Orders by Status */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Orders by Status</h3>
              {data?.ordersByStatus && data.ordersByStatus.length > 0 ? (
                <div className="space-y-3">
                  {data.ordersByStatus.map((item) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <span className="text-gray-600">{item.status}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-500">
                  No order data available
                </div>
              )}
            </div>

            {/* Top Categories */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Top Categories</h3>
              {data?.topCategories && data.topCategories.length > 0 ? (
                <div className="space-y-4">
                  {data.topCategories.slice(0, 5).map((category) => (
                    <div key={category.id} className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-gray-500">
                          {category.sales} sales
                        </p>
                      </div>
                      <span className="font-semibold">
                        {formatCurrency(category.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-500">
                  No category data available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
