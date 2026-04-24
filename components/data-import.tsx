"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileSpreadsheet, ClipboardPaste, CheckCircle, AlertCircle, RefreshCw } from "lucide-react"
import * as XLSX from "xlsx"

interface DataImportProps {
  onDataImported: (type: "tracking" | "mold", data: string) => void
  currentTrackingCount: number
  currentMoldCount: number
}

export function DataImport({ onDataImported, currentTrackingCount, currentMoldCount }: DataImportProps) {
  const [trackingFile, setTrackingFile] = useState<File | null>(null)
  const [moldText, setMoldText] = useState("")
  const [importing, setImporting] = useState(false)
  const [trackingStatus, setTrackingStatus] = useState<"idle" | "success" | "error">("idle")
  const [moldStatus, setMoldStatus] = useState<"idle" | "success" | "error">("idle")
  const [trackingMessage, setTrackingMessage] = useState("")
  const [moldMessage, setMoldMessage] = useState("")

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setTrackingFile(file)
      setTrackingStatus("idle")
      setTrackingMessage("")
    }
  }, [])

  const handleTrackingUpload = useCallback(async () => {
    if (!trackingFile) return

    setImporting(true)
    setTrackingStatus("idle")

    try {
      const arrayBuffer = await trackingFile.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: "array" })
      
      // Get the first sheet or "Tracking List" sheet
      const sheetName = workbook.SheetNames.find(name => 
        name.toLowerCase().includes("tracking") || name.toLowerCase().includes("list")
      ) || workbook.SheetNames[0]
      
      const worksheet = workbook.Sheets[sheetName]
      const csvData = XLSX.utils.sheet_to_csv(worksheet)
      
      // Count rows
      const rows = csvData.split("\n").filter(row => row.trim()).length - 1
      
      onDataImported("tracking", csvData)
      setTrackingStatus("success")
      setTrackingMessage(`Imported ${rows} records from "${sheetName}"`)
    } catch (error) {
      setTrackingStatus("error")
      setTrackingMessage(`Error: ${error instanceof Error ? error.message : "Failed to parse file"}`)
    } finally {
      setImporting(false)
    }
  }, [trackingFile, onDataImported])

  const handleMoldPaste = useCallback(() => {
    if (!moldText.trim()) return

    setImporting(true)
    setMoldStatus("idle")

    try {
      // Parse the pasted text - expecting tab or comma separated values
      const lines = moldText.trim().split("\n").filter(line => line.trim())
      
      if (lines.length < 2) {
        throw new Error("Not enough data. Please include header row and at least one data row.")
      }

      // Count machines (unique Machine column)
      const machines = new Set<string>()
      lines.slice(1).forEach(line => {
        const cols = line.split(/\t|,/)
        if (cols[0]) machines.add(cols[0].trim())
      })

      onDataImported("mold", moldText)
      setMoldStatus("success")
      setMoldMessage(`Imported ${lines.length - 1} mold records from ${machines.size} machines`)
    } catch (error) {
      setMoldStatus("error")
      setMoldMessage(`Error: ${error instanceof Error ? error.message : "Failed to parse data"}`)
    } finally {
      setImporting(false)
    }
  }, [moldText, onDataImported])

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText()
      setMoldText(text)
    } catch {
      setMoldMessage("Could not access clipboard. Please paste manually.")
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Tracking List Data</CardTitle>
            </div>
            <CardDescription>Current: {currentTrackingCount} records</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {trackingStatus === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
              {trackingStatus === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
              <span className="text-sm text-muted-foreground">
                {trackingStatus === "idle" ? "Ready to import" : trackingMessage}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ClipboardPaste className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Realtimemold Data</CardTitle>
            </div>
            <CardDescription>Current: {currentMoldCount} machines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {moldStatus === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
              {moldStatus === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
              <span className="text-sm text-muted-foreground">
                {moldStatus === "idle" ? "Ready to import" : moldMessage}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tracking" className="gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            Upload Tracking List
          </TabsTrigger>
          <TabsTrigger value="mold" className="gap-2">
            <ClipboardPaste className="h-4 w-4" />
            Paste Realtimemold Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tracking" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Tracking List from SharePoint</CardTitle>
              <CardDescription>
                Export your SharePoint Tracking List as Excel (.xlsx) or CSV file and upload here
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="tracking-file"
                />
                <label htmlFor="tracking-file" className="cursor-pointer">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">
                    {trackingFile ? trackingFile.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports: .xlsx, .xls, .csv
                  </p>
                </label>
              </div>

              {trackingFile && (
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{trackingFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(trackingFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button onClick={handleTrackingUpload} disabled={importing}>
                    {importing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Data
                      </>
                    )}
                  </Button>
                </div>
              )}

              {trackingStatus !== "idle" && (
                <Alert variant={trackingStatus === "success" ? "default" : "destructive"}>
                  <AlertDescription>{trackingMessage}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">Expected columns:</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• PO Number, Brand, Style, Model</li>
                  <li>• Size runs (size quantities)</li>
                  <li>• Lamination Out, Cutting Out, Molding In dates/quantities</li>
                  <li>• Molding Time / Routing information</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mold" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Import Realtimemold Data</CardTitle>
              <CardDescription>
                Copy data from realtimemolds-molding.vercel.app and paste below
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePasteFromClipboard}>
                  <ClipboardPaste className="h-4 w-4 mr-2" />
                  Paste from Clipboard
                </Button>
              </div>

              <Textarea
                placeholder="Paste realtimemold data here...&#10;&#10;Example format:&#10;Machine	Machine %	Operations Load %	Max Mold	Mold ID	Model Size	Quantity	Status	Note Running %&#10;M.01	83	12 CV-394 L2 1.1#	1	OK	250h 41m..."
                value={moldText}
                onChange={(e) => {
                  setMoldText(e.target.value)
                  setMoldStatus("idle")
                }}
                className="min-h-[300px] font-mono text-xs"
              />

              <div className="flex justify-between items-center">
                <p className="text-xs text-muted-foreground">
                  {moldText ? `${moldText.split("\n").length} lines pasted` : "No data pasted yet"}
                </p>
                <Button onClick={handleMoldPaste} disabled={importing || !moldText.trim()}>
                  {importing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Import Mold Data
                    </>
                  )}
                </Button>
              </div>

              {moldStatus !== "idle" && (
                <Alert variant={moldStatus === "success" ? "default" : "destructive"}>
                  <AlertDescription>{moldMessage}</AlertDescription>
                </Alert>
              )}

              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium text-sm mb-2">How to export from Realtimemold:</h4>
                <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Open realtimemolds-molding.vercel.app</li>
                  <li>Select all data in the table (Ctrl+A)</li>
                  <li>Copy (Ctrl+C)</li>
                  <li>Paste here (Ctrl+V) or use the button above</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
