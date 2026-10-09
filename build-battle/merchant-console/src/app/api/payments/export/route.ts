import { filterPayments, parseFilters, sortPayments } from "@/data/queries"
import { store } from "@/data/store"
import { exportFilename, parseExportColumns, toCsv } from "@/lib/csv"
import { NextRequest, NextResponse } from "next/server"

/**
 * Exports the payments table as CSV.
 *
 * Reuses the shared payment query logic for current-filter exports, but accepts
 * an allowlisted column set and an explicit scope from the client.
 */
export function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams
  const filters = parseFilters(params)
  const scope = params.get("scope") === "all" ? "all" : "current"
  const columns = parseExportColumns(params.get("columns"))

  if (columns === null) {
    return NextResponse.json({ message: "Invalid export columns." }, { status: 400 })
  }

  if (columns.length === 0) {
    return NextResponse.json({ message: "Select at least one column to export." }, { status: 400 })
  }

  const rows = sortPayments(
    scope === "all" ? store.payments : filterPayments(filters),
    filters.sort,
    filters.direction,
  )

  const scopeLabel =
    scope === "all"
      ? "all"
      : filters.status && filters.status !== "all"
        ? filters.status
        : "current"

  return new Response(toCsv(rows, columns), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${exportFilename(new Date(), scopeLabel)}"`,
    },
  })
}
