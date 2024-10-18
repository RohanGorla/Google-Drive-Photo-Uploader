import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import { google } from "googleapis";
import dotenv from "dotenv";
import { Readable } from "stream";

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.json("listening");
});

app.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`);
});
