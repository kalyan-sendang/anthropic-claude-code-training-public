import { merchantById } from "@/data/merchants"
import { Payment } from "@/data/types"
import { formatMoney } from "./money"

/**
 * CSV export for the payments table.
 *
 * The column set is fixed. Ops has asked for control over it — that is
 * NWP-101 — but today everyone gets every column, including the card
 * last four, whether or not the file is going to a merchant.
 */

export const EXPORT_COLUMNS = [
  "id",
  "created_at",
  "merchant",
  "description",
  "status",
  "method",
  "card_brand",
  "last4",
  "amount",
  "currency",
] as const

export const DEFAULT_EXPORT_COLUMNS = EXPORT_COLUMNS.filter(
  (column) => column !== "last4",
) as readonly ExportColumn[]

export type ExportColumn = (typeof EXPORT_COLUMNS)[number]

export function parseExportColumns(raw: string | null): ExportColumn[] | null {
  if (raw == null) return [...DEFAULT_EXPORT_COLUMNS]

  const parsed = raw
    .split(",")
    .map((column) => column.trim())
    .filter(Boolean)

  if (parsed.length === 0) return []

  const columns: ExportColumn[] = []
  for (const column of parsed) {
    if (!(EXPORT_COLUMNS as readonly string[]).includes(column)) return null
    if (!columns.includes(column as ExportColumn)) columns.push(column as ExportColumn)
  }

  return columns
}

function escapeCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`
  return value
}

function cell(payment: Payment, column: ExportColumn): string {
  switch (column) {
    case "id":
      return payment.id
    case "created_at":
      return payment.createdAt
    case "merchant":
      return merchantById(payment.merchantId)?.name ?? payment.merchantId
    case "description":
      return payment.description
    case "status":
      return payment.status
    case "method":
      return payment.method
    case "card_brand":
      return payment.cardBrand ?? ""
    case "last4":
      return payment.last4 ?? ""
    case "amount":
      return formatMoney(payment.amount, payment.currency)
    case "currency":
      return payment.currency
  }
}

export function toCsv(
  payments: Payment[],
  columns: readonly ExportColumn[] = DEFAULT_EXPORT_COLUMNS,
): string {
  if (columns.length === 0) return ""

  const header = columns.join(",")
  const rows = payments.map((payment) =>
    columns.map((column) => escapeCell(cell(payment, column))).join(","),
  )
  return [header, ...rows].join("\n")
}

export function exportFilename(date = new Date(), scope?: string): string {
  if (!scope) return `payments-${date.toISOString().slice(0, 10)}.csv`
  return `payments-${scope}-${date.toISOString().slice(0, 10)}.csv`
}
