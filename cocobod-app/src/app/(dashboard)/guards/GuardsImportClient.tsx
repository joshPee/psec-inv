'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, Download, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function GuardsImportClient() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file')
      return
    }

    setIsUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('/api/guards/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Import failed')
        return
      }

      setResult(data)
      toast.success(`Successfully imported ${data.importedCount} guards`)
      setFile(null)
    } catch (error) {
      toast.error('An error occurred during import')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `full_name,badge_id,staff_id,contact,team,shift,status
John Doe,GUARD-001,STF-001,0241234567,Alpha Team,DAY,ACTIVE
Jane Smith,GUARD-002,STF-002,0247654321,Bravo Team,NIGHT,ACTIVE`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'guards_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Bulk Import Guards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-2">CSV Format</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
              Your CSV file should include the following columns:
            </p>
            <code className="text-xs bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded block">
              full_name, badge_id, staff_id, contact, team, shift, status
            </code>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              Select CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-slate-500 dark:text-slate-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-teal-50 file:text-teal-700
                dark:file:bg-teal-900/50 dark:file:text-teal-300
                hover:file:bg-teal-100 dark:hover:file:bg-teal-900/70"
            />
          </div>

          {file && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <p className="text-sm text-emerald-900 dark:text-emerald-200">
                Selected: {file.name}
              </p>
            </div>
          )}

          <Button
            onClick={handleImport}
            disabled={!file || isUploading}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {isUploading ? 'Importing...' : 'Import Guards'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-200">
                  {result.importedCount} guards imported successfully
                </p>
                <p className="text-sm text-emerald-700 dark:text-emerald-400">
                  {result.totalRows} total rows processed
                </p>
              </div>
            </div>

            {result.errors && result.errors.length > 0 && (
              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  <p className="font-semibold text-amber-900 dark:text-amber-200">
                    {result.errors.length} errors encountered
                  </p>
                </div>
                <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1">
                  {result.errors.slice(0, 10).map((error: string, index: number) => (
                    <li key={index}>• {error}</li>
                  ))}
                  {result.errors.length > 10 && (
                    <li>... and {result.errors.length - 10} more errors</li>
                  )}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
