const express = require("express");
const cors = require("cors");
require("dotenv").config();

const fs = require("fs").promises;
const path = require("path");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  }),
);

const PORT = process.env.PORT || 5174;

const relativePathDB = path.join(__dirname, "DataBase");
const filePathDB = path.join(relativePathDB, "DB.json");

async function initDB() {
  await fs.mkdir(relativePathDB, { recursive: true });
  try {
    await fs.access(filePathDB);
    console.log("Файл БД найден");
  } catch {
    console.log("Файла нет, запускается создание...");
    await fs.writeFile(filePathDB, JSON.stringify([], null, 2), "utf-8");
    console.log("База данных создана");
  }
}

app.get("/backend/health", (req, res) => {
  res.status(200).send("<h1>Backend is work</h1>");
});
app.post("/api/database/users/addnew", async (req, res) => {
  const { uid, name } = req.body;
  try {
    if (name.trim() === "" && uid.trim() === "")
      return res.status(400).json({ result: false });
    const newUser = { uid: uid, name: name, balance: 0 };
    const currentDBraw = await fs.readFile(filePathDB, "utf-8");
    const users = JSON.parse(currentDBraw);
    const resultCheck = users.some((user) => user.uid === uid);
    if (!resultCheck) {
      users.push(newUser);
      await fs.writeFile(filePathDB, JSON.stringify(users, null, 2), "utf-8");
      res.status(200).json({ result: true });
    } else {
      res.status(500).json({ result: false });
    }
  } catch {
    console.log("error add new user");
    res.status(400).json({ result: false });
  }
});
app.post("/api/database/users/user/pay", async (req, res) => {
  const { uid, sum } = req.body;
  const sumPay = Number(sum);
  if (sumPay <= 0) return res.status(400).json({ message: "Sum is not valid" });
  try {
    const data = await fs.readFile(filePathDB, "utf-8");
    const users = JSON.parse(data);
    const user = users.find((u) => u.uid === uid);
    if (!user) {
      console.log("пользователь не найден");
      return res.status(400).json({ message: "user not founded" });
    }
    if (user.balance >= sumPay) {
      user.balance -= sumPay;
      await fs.writeFile(filePathDB, JSON.stringify(users, null, 2), "utf-8");
      res.status(200).json({ message: "Оплата прошла успешно" });
    } else {
      res.status(400).json({ message: "Недостаточно средств" });
    }
  } catch (e) {
    console.log("error with payment: ", e);
    res.status(500).json({ message: "Ошибка" });
  }
});
app.post("/api/database/users/user/deposit", async (req, res) => {
  const { uid, sum } = req.body;
  const sumDep = Number(sum);
  if (sumDep <= 0) return res.status(400).json({ message: "Sum is not valid" });
  try {
    const data = await fs.readFile(filePathDB, "utf-8");
    const users = JSON.parse(data);
    const user = users.find((u) => u.uid === uid);
    if (!user) {
      console.log("пользователь не найден");
      return res.status(400).json({ message: "user not founded" });
    }
    if (user.balance < 0) {
      user.balance = 0;
      await fs.writeFile(filePathDB, JSON.stringify(users, null, 2), "utf-8");
      return res
        .status(500)
        .json({ message: "Плохой баланс попробуйте еще раз" });
    } else {
      user.balance += sumDep;
      await fs.writeFile(filePathDB, JSON.stringify(users, null, 2), "utf-8");
      res.status(200).json({ message: "Пополнение прошло успешно" });
    }
  } catch (e) {
    console.log("error with deposit: ", e);
    res.status(500).json({ message: "Ошибка" });
  }
});
app.post("/api/database/users/getuser", async (req, res) => {
  try {
    const { name } = req.body;
    const rawDataDB = await fs.readFile(filePathDB, "utf-8");
    const users = JSON.parse(rawDataDB);
    const findedUser = users.filter((user) =>
      user.name.toLowerCase().includes(name),
    );
    console.log(findedUser);
    if (findedUser.length === 0)
      return res.status(404).json({ message: "Клиент не найден" });
    res.status(200).json(findedUser);
  } catch {
    return res.status(404).json({ message: "Клиент не найден" });
  }
});
app.listen(PORT, () => {
  initDB();
  console.log(`Server started on ${PORT} port, link: http://localhost:${PORT}`);
});
