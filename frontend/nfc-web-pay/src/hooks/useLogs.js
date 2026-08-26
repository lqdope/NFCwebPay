import { useCallback, useState } from "react";
import * as XLSX from 'xlsx';
import {saveAs} from 'file-saver'
export function useLogs() {
  const [logs, setLogs] = useState([]);
  const addLog = useCallback((operationType, uid, sum) => {
    const now = new Date();
    const newLog = {
      uid,
      type: operationType,
      sum,
      date: now.toLocaleDateString("ru-RU"),
      time: now.toLocaleTimeString("ru-RU"),
      id: crypto.randomUUID(),
    };
    setLogs((prev) => [...prev, newLog]);
  }, []);
  const logsExport = useCallback(() => {
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(logs);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs');
    const exelBuffer = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
    const fileData = new Blob([exelBuffer], {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'});
    saveAs(fileData, 'logs_export.xlsx')
  }, [logs]);
  return {
    logs,
    addLog,
    logsExport,
  };
}
