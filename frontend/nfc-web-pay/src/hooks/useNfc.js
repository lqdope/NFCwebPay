import { useRef, useState, useEffect } from "react";
export function useNfc(addLog) {
  const [uid, setUid] = useState("");
  const [cardData, setCardData] = useState(null);
  const readingLock = useRef(false);
  const [isReading, setIsReading] = useState(false);

  const [isScan, setIsScan] = useState(false);

  const ndef = useRef(null);

  useEffect(() => {
    // Проверка поддержки WebNFC
    if (!("NDEFReader" in window)) {
      alert(
        "Ошибка: Web NFC не поддерживается. Используйте Chrome на Android и HTTPS.",
      );
      return;
    }
    ndef.current = new NDEFReader();
    ndef.current.onreading = async ({ message, serialNumber }) => {
      if (readingLock.current) return;
      setIsReading(true);
      readingLock.current = true;
      let cardObject = null;

      try {
        setUid(serialNumber);
        for (const record of message.records) {
          if (record.recordType !== "text") continue;
          const decoder = new TextDecoder();

          const textData = decoder.decode(record.data);
          try {
            cardObject = JSON.parse(textData);
            setCardData(cardObject);
          } catch {
            console.log("Not JSON");
            return;
          }

          console.log(
            `UID: ${serialNumber} \n Balance: ${cardObject.balance}  \n Name: ${cardObject.name}`,
          );
          addLog("read", serialNumber, cardObject.balance);
        }
      } catch (e) {
        console.log("ошибка в карте", e);
      } finally {
        setIsReading(false);
        readingLock.current = false;
      }
    };
    return () => {
      setIsReading(false);
      readingLock.current = false;
    };
  }, []);
  const handleScan = (result) => {
    if (result?.[0]?.rawValue || result?.rawValue) {
      const text = result?.[0]?.rawValue || result?.rawValue;
      setUid(text);
      setIsScan(false);
    }
  };
  function closeQr() {
    setIsScan(false);
  }
  function startQr() {
    setIsScan(true);
  }
  async function ReadingCard() {
    if (readingLock.current) return;
    setIsReading(true);
    readingLock.current = true;
    setUid("");
    try {
      await ndef.current.scan();
    } catch (e) {
      console.log("Ошибка при старте сканирования");
      setIsReading(false);
      readingLock.current = false;
    }
  }
  async function createCard(cardObj) {
    setIsReading(true);
    try {
      if (!uid) return alert("Сначала отсканируйте карту");
      const data = { uid: uid, name: cardObj.name };
      const response = await fetch(
        "http://localhost:5174/api/database/users/addnew",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        },
      );
      const resResult = await response.json();
      if (resResult.result.ok) {
        await ndef.current.write(JSON.stringify(cardObj));
        addLog("create", uid);
      }
    } catch (e) {
      console.log("error on card write", e);
    } finally {
      setIsReading(false);
      readingLock.current = false;
    }
  }
  async function paySend(sum) {
    if (sum <= 0) return alert("сумма не может быть отрицательной");
    try {
      const response = await fetch(
        `http://localhost:5174/api/database/users/user/pay`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sum: sum,
            uid: uid,
          }),
        },
      );
      const result = await response.json();
      alert(JSON.stringify(result.message));
      if (response.ok) {
        return addLog("pay", uid, sum);
      }
    } catch {
      console.log("Ошибка при оплате");
    }
  }
  async function depositSend(sum) {
    if (sum <= 0) return alert("сумма не может быть отрицательной");
    try {
      const response = await fetch(
        `http://localhost:5174/api/database/users/user/deposit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sum: sum,
            uid: uid,
          }),
        },
      );
      const result = await response.json();
      alert(JSON.stringify(result.message));
      if (response.ok) {
        return addLog("deposit", uid, sum);
      }
    } catch {
      console.log("ошибка при депозите");
    }
  }
  return {
    uid,
    isReading,
    cardData,
    isScan,
    startScaning: ReadingCard,
    write: createCard,
    pay: paySend,
    deposit: depositSend,
    handleScan,
    close: closeQr,
    startQr,
  };
}
