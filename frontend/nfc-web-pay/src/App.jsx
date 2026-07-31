import logo from "/favicon.svg";
import "./App.css";
import { useState, useEffect, useRef } from "react";
import { useNfc } from "./hooks/useNfc";
import { Scanner } from "@yudiel/react-qr-scanner";
function App() {
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
    startQr
  } = useNfc();
  const [name, setName] = useState("");
  const [sum, setSum] = useState(0);

  const handleCreate = async () => {
    const data = { name };
    if (name.trim() === "") return;
    await write(data);
    setName("");
  };
  const DBsimulation = [
    { uid: "FF25C1A0", balance: 137, name: "Nick" },
    { uid: "FF01C1A0", balance: 114, name: "Oliver" },
    { uid: "AFABC1A0", balance: 6231, name: "Rich" },
    { uid: "ACABC1A0", balance: 31, name: "Gilfoyl" },
  ];
  function clickAnyBtn() {
    console.log(
      `Any Button clicked, states: \n UID: ${uid} \n Sum: ${sum} \n Name: ${name} \n SUMtype: ${typeof sum}`,
    );
  }
  const cancelOperation = () => {
    setIsReading(false);
    readingLock.current = false;
    return;
  };
  // useEffect(() => {
  //   fetch(`http://localhost:5174/api/database/users?uid=FF01C1A0`)
  //     .then((res) => res.json())
  //     .then((data) => console.log(data.uidData))
  //     .catch((e) => console.log("error fetch res", e));
  // }, []);
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
              <div className="history__row history__head">
                <span>UID</span>
                <span>Operation type</span>
                <span>Operation value</span>
                <span>Date and time</span>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
