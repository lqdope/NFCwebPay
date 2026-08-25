import { useCallback, useState } from "react";
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
    console.table(logs);
  }, [logs]);
  return {
    logs,
    addLog,
    logsExport,
  };
}
