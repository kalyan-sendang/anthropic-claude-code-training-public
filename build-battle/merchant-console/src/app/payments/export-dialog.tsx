"use client"

import { Button } from "@/components/Button"
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/Drawer"
import { DEFAULT_EXPORT_COLUMNS, EXPORT_COLUMNS, type ExportColumn } from "@/lib/csv"
import { Download } from "lucide-react"
import { useMemo, useState } from "react"

const formatColumnLabel = (column: ExportColumn) =>
  column
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")

export function ExportDialog({
  query,
  rowCount,
  allCount,
}: {
  query: string
  rowCount: number
  allCount: number
}) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<"current" | "all">("current")
  const [selectedColumns, setSelectedColumns] = useState<ExportColumn[]>(DEFAULT_EXPORT_COLUMNS)

  const downloadHref = useMemo(() => {
    if (selectedColumns.length === 0) return null

    const params = new URLSearchParams(query)
    params.set("scope", scope)
    params.set("columns", selectedColumns.join(","))
    return `/api/payments/export?${params.toString()}`
  }, [query, scope, selectedColumns])

  const count = scope === "current" ? rowCount : allCount

  const toggleColumn = (column: ExportColumn) => {
    setSelectedColumns((current) =>
      current.includes(column)
        ? current.filter((item) => item !== column)
        : [...current, column],
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="secondary" className="w-full gap-2 py-1.5 sm:w-fit">
          <Download
            className="-ml-0.5 size-4 shrink-0 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
          />
          Export
        </Button>
      </DrawerTrigger>

      <DrawerContent aria-label="Export payments" className="sm:max-w-lg">
        <DrawerHeader>
          <div>
            <DrawerTitle>Export payments</DrawerTitle>
            <DrawerDescription>
              Choose the columns and record set for this CSV.
            </DrawerDescription>
          </div>
        </DrawerHeader>

        <DrawerBody className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Scope
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="flex items-center gap-2 rounded-md border border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200">
                <input
                  type="radio"
                  name="export-scope"
                  checked={scope === "current"}
                  onChange={() => setScope("current")}
                />
                Current filter
              </label>
              <label className="flex items-center gap-2 rounded-md border border-gray-200 p-3 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200">
                <input
                  type="radio"
                  name="export-scope"
                  checked={scope === "all"}
                  onChange={() => setScope("all")}
                />
                All payments
              </label>
            </div>
            <p className="text-sm text-gray-500">{count.toLocaleString()} rows selected</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-50">
              Columns
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {EXPORT_COLUMNS.map((column) => (
                <label
                  key={column}
                  className="flex items-center justify-between gap-3 rounded-md border border-gray-200 p-2 text-sm text-gray-700 dark:border-gray-800 dark:text-gray-200"
                >
                  <span>{formatColumnLabel(column)}</span>
                  <input
                    type="checkbox"
                    checked={selectedColumns.includes(column)}
                    onChange={() => toggleColumn(column)}
                    aria-label={`Include ${formatColumnLabel(column)}`}
                  />
                </label>
              ))}
            </div>
          </div>
        </DrawerBody>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DrawerClose>
          <Button
            variant="primary"
            disabled={!downloadHref}
            onClick={() => {
              if (!downloadHref) return
              window.location.href = downloadHref
              setOpen(false)
            }}
          >
            Download
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
