import type { DashboardTableRow } from '@/features/dashboard/shared/schemas';

export type ExportCsvColumns = Array<keyof DashboardTableRow>;

export interface ExportCsvPayload {
    columns: ExportCsvColumns;
    rows: DashboardTableRow[];
}

export type WorkerRequest = {
    payload: ExportCsvPayload;
    requestId: string;
    type: 'EXPORT_CSV';
};

export type WorkerResponse =
    | {
          payload: string;
          requestId: string;
          type: 'CSV_RESULT';
      }
    | {
          payload: {
              message: string;
          };
          requestId: string;
          type: 'WORKER_ERROR';
      };
