import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import { Readable } from 'stream';

import { PinoLoggerService } from '@/core/logger/logger.service';

export interface ExcelColumnOption {
    header: string;
    key: string;
    width?: number;
    style?: Partial<ExcelJS.Style>;
}

@Injectable()
export class ExcelService {
    constructor(private readonly logger: PinoLoggerService) {}

    /**
     * High performance Excel Buffer generation
     */
    async generateExcelBuffer<T>(sheetName: string, columns: ExcelColumnOption[], data: T[]): Promise<Buffer> {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet(sheetName);

        worksheet.columns = columns.map((col) => ({
            header: col.header,
            key: col.key,
            width: col.width || 20,
            style: col.style,
        }));

        // Format header row with background styling & bold font
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1F4E78' },
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

        // Add rows
        worksheet.addRows(data as any[]);

        const uint8Array = await workbook.xlsx.writeBuffer();
        this.logger.log(`Generated Excel sheet '${sheetName}' with ${data.length} rows`, 'ExcelService');
        return Buffer.from(uint8Array);
    }

    /**
     * High performance Stream-based Excel reading for large file imports
     */
    async parseExcelStream<T = any>(fileBuffer: Buffer): Promise<T[]> {
        const workbook = new ExcelJS.Workbook();
        const stream = Readable.from(fileBuffer);
        await workbook.xlsx.read(stream);

        const worksheet = workbook.worksheets[0];
        if (!worksheet) return [];

        const results: T[] = [];
        const headers: string[] = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) {
                row.eachCell((cell) => {
                    headers.push(String(cell.value || '').trim());
                });
            } else {
                const rowData: any = {};
                row.eachCell((cell, colNumber) => {
                    const headerKey = headers[colNumber - 1];
                    if (headerKey) {
                        rowData[headerKey] = cell.value;
                    }
                });
                results.push(rowData);
            }
        });

        this.logger.log(`Parsed Excel file with ${results.length} records`, 'ExcelService');
        return results;
    }
}
