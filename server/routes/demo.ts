import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

export function handleDemo(req: Request, res: Response) {
  res.json({ message: "Demo route is working!" });
}

app.get("/", (req, res) => {
  res.send("API is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
