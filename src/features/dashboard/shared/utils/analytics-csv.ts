import type { DashboardTableRow } from '@/features/dashboard/shared/schemas';
import type { ExportCsvPayload } from '@/types/analytics.types';

function escapeCsvCell(value: DashboardTableRow[keyof DashboardTableRow]): string {
    const normalized = String(value);

    if (/[",\r\n]/.test(normalized)) {
        return `"${normalized.replaceAll('"', '""')}"`;
    }

    return normalized;
}

export function buildCsv({ columns, rows }: ExportCsvPayload): string {
    const headerRow = columns.map(column => escapeCsvCell(column)).join(',');
    const bodyRows = rows.map(row => columns.map(column => escapeCsvCell(row[column])).join(','));

    return [headerRow, ...bodyRows].join('\r\n');
}
