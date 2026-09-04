import logo from "/favicon.svg";
// import "./App.css";
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

  const [cardSearchName, setCardSearchName] = useState("");
  const [findedUser, setFindedUser] = useState([]);
  const [isSearch, setIsSearch] = useState(false);
  async function searchCard() {
    if (cardSearchName.trim() === "") return alert("Введите ФИО");
    const name = cardSearchName.toLowerCase();
    const response = await fetch(
      "http://localhost:5174/api/database/users/getuser",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      },
    );
    const data = await response.json();
    console.log(data);
    if (response.ok) {
      setFindedUser(data);
    }else{
      alert('Пользователь не найден')
      setFindedUser([]);
    }
  }

  const handleCreate = async () => {
    const data = { name };
    if (name.trim() === "") return;
    await write(data);
    setName("");
  };
  return (
    <div className="bg-zinc-800 min-h-screen min-w-full">
      <div className="p-4 text-slate-200 selection:text-indigo-300">
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
        <header className="min-w-fit flex items-center justify-between gap-2 bg-zinc-900 py-4 px-6 md:px-8 rounded-2xl">
          <img className="w-18 h-18" src={logo} alt="logo" />

          <nav className="flex flex-row items-center justify-center gap-2">
            <a
              href="/"
              className="font-normal text-zinc-500 text-xl hover:text-indigo-500 transition-colors duration-150"
            >
              Войти
            </a>
          </nav>
        </header>

        <main className="flex flex-col items-center justify-between gap-8 py-8">
          <section className="bg-zinc-900 p-4 rounded-2xl min-w-full">
            <div className="flex flex-col gap-4 justify-center items-center">
              <div className="flex flex-row gap-2 justify-center items-center w-full">
                <input
                  placeholder="UID"
                  value={uid}
                  disabled={true}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full border border-indigo-300/80 rounded-2xl p-4 font-medium"
                />
                <button
                  disabled={isReading}
                  onClick={startScaning}
                  className="py-4 px-4 rounded-xl bg-indigo-500 font-extrabold hover:bg-indigo-700 hover:text-slate-300"
                >
                  {isReading ? "Подождите.." : "NFC"}
                </button>
                <button
                  disabled={isReading}
                  onClick={startQr}
                  className="py-4 px-4 rounded-xl border border-indigo-500 bg-indigo-500/30 font-bold hover:bg-indigo-500/60 hover:text-slate-100"
                >
                  QR
                </button>
              </div>

              <input
                placeholder="сумма пополнения или оплаты"
                type="number"
                min={0}
                value={sum === 0 ? "" : sum}
                onChange={(e) => setSum(Number(e.target.value))}
                className="w-full border border-indigo-300/80 rounded-2xl p-4 font-medium focus:border-2 focus:border-indigo-400"
              />

              <div className="flex flex-row gap-8 justify-center items-center w-full">
                <button
                  onClick={() => pay(sum)}
                  className="py-4 px-4 rounded-xl bg-indigo-500 font-extrabold w-full hover:bg-indigo-700 hover:text-slate-300"
                >
                  Оплатить
                </button>
                <button
                  onClick={() => deposit(sum)}
                  className="py-4 px-4 rounded-xl border border-indigo-500 bg-indigo-500/30 font-bold w-full hover:bg-indigo-500/60 hover:text-slate-100"
                >
                  Пополнить
                </button>
              </div>
            </div>
          </section>
          <section className="bg-zinc-900 p-4 rounded-2xl min-w-full">
            <div className="flex flex-col gap-4 justify-center items-center">
              <input
                placeholder="ФИО владельца"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border border-indigo-300/80 rounded-2xl p-4 font-medium focus:border-2 focus:border-indigo-400"
              />
              <button
                onClick={handleCreate}
                disabled={isReading}
                className="py-4 px-4 rounded-xl bg-indigo-500 font-extrabold w-full hover:bg-indigo-700 hover:text-slate-300"
              >
                {" "}
                {isReading ? "Записываем.." : "Создать новую карту"}
              </button>
            </div>
          </section>

          <section className="bg-zinc-900 p-4 rounded-2xl min-w-full">
            <div className="flex flex-col gap-4 justify-center items-center">
              <input
                placeholder="Введите ФИО владельца"
                value={cardSearchName}
                onChange={(e) => setCardSearchName(e.target.value)}
                className="w-full border border-indigo-300/80 rounded-2xl p-4 font-medium focus:border-2 focus:border-indigo-400"
              />
              <button
                onClick={searchCard}
                disabled={isReading}
                className="py-4 px-4 rounded-xl bg-indigo-500 font-extrabold w-full hover:bg-indigo-700 hover:text-slate-300 mb-4"
              >
                {" "}
                {isReading ? "Ищем.." : "Найти карту"}
              </button>
            </div>
            <div className="flex flex-col gap-4 justify-center items-center">
              {findedUser.map((user) => (
                <div
                  key={user.uid}
                  className="bg-zinc-800 p-2 rounded-2xl w-full flex flex-col gap-2 "
                >
                  <span className="font-bold text-zinc-200 text-xl">
                    UID: {user.uid}
                  </span>
                  <span className="font-medium text-zinc-200 text-xl">
                    Имя: {user.name}
                  </span>
                  <span className="font-medium text-zinc-200 text-xl">
                    Баланс: {user.balance}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900 p-4 rounded-2xl min-w-full">
            <button
              className="py-4 px-4 rounded-xl border border-indigo-500 bg-indigo-500/30 font-bold w-full hover:bg-indigo-500/60 hover:text-slate-100 mb-8"
              onClick={logsExport}
            >
              Экспортировать в excel
            </button>
            <div className="flex flex-col gap-4 justify-center items-center">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-zinc-800 p-2 rounded-2xl w-full flex flex-col gap-2 "
                >
                  <span className="font-bold text-zinc-200 text-xl">
                    UID: {log.uid}
                  </span>
                  <span className="font-medium text-zinc-200 text-xl">
                    Operation value {log.sum}
                  </span>
                  <span className="font-normal text-zinc-500 text-xl">
                    Operation type {log.type}
                  </span>
                  <span className="font-light text-zinc-500 text-xl">
                    Date and time {log.date}:{log.time}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
