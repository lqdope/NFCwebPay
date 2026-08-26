import logo from "/favicon.svg";
import "./App.css";
import { useState, useEffect, useRef } from "react";
import { useNfc } from "./hooks/useNfc";
import { useLogs } from "./hooks/useLogs";
import { Scanner } from "@yudiel/react-qr-scanner";

function App() {
  const { logs, logsExport, addLog } = useLogs();

  const {
    uid,
    isReading,
    cardData,
    startScaning,
    write,
    pay,
    deposit,
    isScan,
    handleScan,
    close,
    startQr,
  } = useNfc(addLog);
  const [name, setName] = useState("");
  const [sum, setSum] = useState(0);

  const handleCreate = async () => {
    const data = { name };
    if (name.trim() === "") return;
    await write(data);
    setName("");
  };
  return (
    <div className="app">
      <div className="wrapper">
        {isScan && (
          <div
            style={{
              maxWidth: "400px",
              marginTop: "20px",
              position: "relative",
            }}
          >
            <Scanner
              onScan={handleScan}
              onError={(error) => console.error("Ошибка камеры:", error)}
            />

            {/* Кнопка Отмены / Закрытия */}
            <button
              onClick={close}
              style={{
                marginTop: "10px",
                width: "100%",
                padding: "10px",
                backgroundColor: "#ff4d4f",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Отмена
            </button>
          </div>
        )}
        <header className="header">
          <img className="logo" src={logo} alt="logo" />

          <nav className="nav">
            <a href="/">Главная</a>
            <a href="/promo">Промо</a>
            <a href="/about">О нас</a>
          </nav>
        </header>

        <main className="main">
          <section className="card">
            <div className="stack">
              <div className="row">
                <input
                  placeholder="UID"
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  disabled={true}
                />
                <button disabled={isReading} onClick={startScaning}>
                  {isReading ? "Подождите.." : "NFC"}
                </button>
                <button disabled={isReading} onClick={startQr}>
                  QR
                </button>
              </div>

              <input
                placeholder="сумма пополнения или оплаты"
                type="number"
                min={0}
                value={sum === 0 ? "" : sum}
                onChange={(e) => setSum(Number(e.target.value))}
              />

              <div className="row">
                <button onClick={() => pay(sum)}>Оплатить</button>
                <button onClick={() => deposit(sum)}>Пополнить</button>
              </div>
            </div>
          </section>
          <section className="card">
            <div className="stack">
              <input
                placeholder="ФИО владельца"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <button onClick={handleCreate} disabled={isReading}>
                {" "}
                {isReading ? "Записываем.." : "Создать новую карту"}
              </button>
            </div>
          </section>
          <section className="card">
            <div className="history">
              {logs.map((log) => (
                <div key={log.id} className="history__row history__head">
                  <span>UID: {log.uid}</span>
                  <span>Operation type {log.type}</span>
                  <span>Operation value {log.sum}</span>
                  <span>
                    Date and time {log.date}:{log.time}
                  </span>
                </div>
              ))}
            </div>
            <button onClick={logsExport}>Logs export in console</button>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
