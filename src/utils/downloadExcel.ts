import { Workbook } from 'exceljs';

const downloadExcel =async (headers: string[], rows: unknown[][]) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');

    worksheet.columns = headers.map(header => ({header, key: header}));
    rows.forEach(row => {
        worksheet.addRow(row);
    });
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);

    // Release the object URL
    window.URL.revokeObjectURL(url);
}

export default downloadExcel