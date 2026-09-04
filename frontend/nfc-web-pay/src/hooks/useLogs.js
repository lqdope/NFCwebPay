import { useCallback, useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
export function useLogs() {
  const [logs, setLogs] = useState([]);
  const addLog = useCallback((operationType, uid, sum) => {
    try {
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
    } catch {
      console.log('Ошибка при добавлении лога')
    }
  }, []);
  const logsExport = useCallback(() => {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(logs);
      XLSX.utils.book_append_sheet(workbook, worksheet, "Logs");
      const exelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });
      const fileData = new Blob([exelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(fileData, "logs_export.xlsx");
    } catch {
      console.log("Ошибка при экспорте логов");
    }
  }, [logs]);
  return {
    logs,
    addLog,
    logsExport,
  };
}
