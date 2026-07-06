"use client";

import { memo, useMemo, useRef } from "react";
import {
  createColumnHelper,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { ReportColumn, ReportRow } from "@/features/reports/types";

export interface ReportTableProps {
  columns: ReportColumn[];
  rows: ReportRow[];
}

const ROW_HEIGHT_PX = 40;

function ReportTableImpl({ columns, rows }: ReportTableProps): React.JSX.Element {
  const columnHelper = createColumnHelper<ReportRow>();

  const tableColumns = useMemo(
    () =>
      columns.map((col) =>
        columnHelper.accessor((row) => row[col.key], {
          id: col.key,
          header: col.label,
          cell: (info) => info.getValue() ?? "-",
        }),
      ),
    [columns, columnHelper],
  );

  const table = useReactTable({
    data: rows,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const parentRef = useRef<HTMLDivElement>(null);
  const { rows: tableRows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: 10,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom =
    virtualRows.length > 0 ? totalSize - virtualRows[virtualRows.length - 1].end : 0;

  return (
    <div ref={parentRef} className="h-full w-full overflow-auto rounded-md border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="sticky top-0 bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="border-b border-border px-3 py-2 text-left font-medium text-muted-foreground"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {paddingTop > 0 && (
            <tr>
              <td style={{ height: paddingTop }} colSpan={columns.length} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const row = tableRows[virtualRow.index];
            return (
              <tr key={row.id} className="border-b border-border hover:bg-muted/50">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 text-foreground">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr>
              <td style={{ height: paddingBottom }} colSpan={columns.length} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export const ReportTable = memo(ReportTableImpl);
