// useExcelDownloader.ts
import { useCallback, useState } from 'react';
import { Workbook } from 'exceljs';        
import { saveAs } from "file-saver";
const DEFAULT_FILE_NAME = "export.xlsx"
const DEFAULT_SHEET_NAME = "Sheet 1"
//https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
const XLSX_MIME_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
const useExcelDownloader = (fileName?: string, sheetName?: string, rowsToBold?: number[]) => {
    const [loading, setLoading] = useState(false)
    const downloadExcel = useCallback(async (headers: string[], rows: unknown[][]) => {
        setLoading(true)
        const workbook = new Workbook();
        const worksheet = workbook.addWorksheet(sheetName ?? DEFAULT_SHEET_NAME);

        worksheet.columns = headers.map(header => ({header, key: header}));
        rows.forEach(row => {
            worksheet.addRow(row);
        });

        if(rowsToBold){
            rowsToBold.forEach(rowIndex => worksheet.getRow(rowIndex+1).eachCell(c => c.style = {font: {bold: true}}))
        }else{
            //make only header row bold
            worksheet.getRow(1).eachCell(c => c.style = {font: {bold: true}})
        }
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: XLSX_MIME_TYPE });
        saveAs(blob,fileName ?? DEFAULT_FILE_NAME)
        setLoading(false)
    }, [fileName, sheetName,rowsToBold]);

    return { downloadExcel, loading };
};

export default useExcelDownloader;
