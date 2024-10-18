import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import { google } from "googleapis";
import dotenv from "dotenv";
import { Readable } from "stream";
dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage });

const auth = new google.auth.JWT(process.env.CE, null, process.env.PK, [
  "https://www.googleapis.com/auth/drive.file",
]);

const drive = google.drive({ version: "v3", auth: auth });

app.get("/", (req, res) => {
  res.json("listening");
});

app.post("/upload", upload.single("images"), async (req, res) => {
  try {
    console.log(req.files);
    const file = req.files[0];
    console.log(file);

    res.send({
      access: true,
      successMsg: "File uploaded successfully"
    });
  } catch (error) {
    res.send({
      access: false,
      errorMsg: "File upload failed",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`listening at http://localhost:${PORT}`);
});
