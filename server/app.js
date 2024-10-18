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

async function uploadToDrive(file, userName) {
  const { buffer } = file;
  const fileName = `${userName}-${Date.now()}`;
  function bufferToStream(buffer) {
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    return readable;
  }
  const metadata = {
    name: fileName,
    parents: [process.env.ID],
  };

  const media = {
    mimeType: file.mimetype,
    body: bufferToStream(buffer),
  };

  try {
    const response = await drive.files.create({
      resource: metadata,
      media,
      fields: "*",
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading ${userName}:`, error.message);
    throw error;
  }
}

app.get("/", (req, res) => {
  res.json("listening");
});

app.post("/upload", upload.single("files"), async (req, res) => {
  try {
    const file = req.file;
    const { userName } = req.body;
    console.log("File -> ", file);
    console.log("User Name -> ", userName);

    const fileData = await uploadToDrive(file, userName);

    res.send({
      access: true,
      successMsg: "File uploaded successfully",
      data: fileData,
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
