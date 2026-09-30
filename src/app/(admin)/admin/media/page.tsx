'use client'

import { useState, useEffect } from 'react'
import {
  Upload,
  Search,
  Grid,
  List,
  Folder,
  Image as ImageIcon,
  File,
  Trash2,
  Download,
  MoreVertical,
  Plus,
  X,
  Check,
} from 'lucide-react'

interface MediaFile {
  id: string
  filename: string
  url: string
  thumbnailUrl: string
  type: 'image' | 'video' | 'document'
  mimeType: string
  size: number
  width?: number
  height?: number
  folder: string
  alt: string
  createdAt: string
}

interface Folder {
  name: string
  count: number
}

export default function AdminMediaPage() {
  const [files, setFiles] = useState<MediaFile[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set())
  const [showUploadModal, setShowUploadModal] = useState(false)

  useEffect(() => {
    fetchMedia()
  }, [selectedFolder, search])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedFolder) params.set('folder', selectedFolder)
      if (search) params.set('search', search)

      const res = await fetch(`/api/v1/admin/media?${params}`)
      const data = await res.json()
      if (data.success) {
        setFiles(data.data.items || [])
        setFolders(data.data.folders || [])
      }
    } catch (err) {
      console.error('Failed to fetch media')
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const toggleFileSelection = (id: string) => {
    const newSelected = new Set(selectedFiles)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedFiles(newSelected)
  }

  const deleteSelected = async () => {
    if (!confirm(`Delete ${selectedFiles.size} selected files?`)) return
    
    // In production, call delete API
    setSelectedFiles(new Set())
    fetchMedia()
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-gray-600">Manage images, videos, and documents</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
        >
          <Upload className="w-4 h-4" />
          Upload Files
        </button>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Sidebar - Folders */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4">Folders</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                    selectedFolder === null ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Folder className="w-4 h-4" />
                    All Files
                  </span>
                </button>
              </li>
              {folders.map((folder) => (
                <li key={folder.name}>
                  <button
                    onClick={() => setSelectedFolder(folder.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition ${
                      selectedFolder === folder.name ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      {folder.name}
                    </span>
                    <span className="text-xs text-gray-500">{folder.count}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button className="w-full mt-4 flex items-center justify-center gap-2 px-3 py-2 border-2 border-dashed rounded-lg text-gray-500 hover:border-pink-500 hover:text-pink-500 transition">
              <Plus className="w-4 h-4" />
              New Folder
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4">
          {/* Toolbar */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div className="flex items-center gap-2">
                {selectedFiles.size > 0 && (
                  <button
                    onClick={deleteSelected}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedFiles.size})
                  </button>
                )}
                <div className="flex border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setView('grid')}
                    className={`p-2 ${view === 'grid' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setView('list')}
                    className={`p-2 ${view === 'list' ? 'bg-pink-100 text-pink-600' : 'hover:bg-gray-100'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Files */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500" />
            </div>
          ) : files.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No files found</h2>
              <p className="text-gray-600 mb-4">Upload some files to get started</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              >
                Upload Files
              </button>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  onClick={() => toggleFileSelection(file.id)}
                  className={`relative group bg-white rounded-lg shadow overflow-hidden cursor-pointer transition ${
                    selectedFiles.has(file.id) ? 'ring-2 ring-pink-500' : ''
                  }`}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {file.type === 'image' ? (
                      <img
                        src={file.thumbnailUrl || file.url}
                        alt={file.alt || file.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <File className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    {selectedFiles.has(file.id) && (
                      <div className="absolute inset-0 bg-pink-500/20 flex items-center justify-center">
                        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                          <Check className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-sm truncate">{file.filename}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="w-8 px-4 py-3"></th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Folder</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold">Size</th>
                    <th className="text-left px-4 py-3 text-sm font-semibold">Date</th>
                    <th className="w-20"></th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedFiles.has(file.id)}
                          onChange={() => toggleFileSelection(file.id)}
                          className="w-4 h-4 text-pink-600 rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded overflow-hidden">
                            {file.type === 'image' ? (
                              <img
                                src={file.thumbnailUrl || file.url}
                                alt={file.filename}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <File className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{file.filename}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{file.folder}</td>
                      <td className="px-4 py-3 text-sm text-right">{formatFileSize(file.size)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Upload Files</h2>
              <button onClick={() => setShowUploadModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Drag and drop files here</p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
                  Browse Files
                </button>
                <p className="mt-4 text-xs text-gray-500">
                  Supported: JPG, PNG, GIF, PDF, DOC (max 10MB each)
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
