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

/* Multer Storage Configuration */

const storage = multer.memoryStorage();
const upload = multer({ storage });

/* Google Auth */

const auth = new google.auth.JWT(process.env.CE, null, process.env.PK, [
  "https://www.googleapis.com/auth/drive.file",
]);

const drive = google.drive({ version: "v3", auth: auth });

/* Basic Get API */

app.get("/", (req, res) => {
  res.json("listening");
});

/* Get All Folders API */

app.get("/getallfolders", async (req, res) => {
  try {
    let filesArray = [];
    let nextPageToken = null;
    const query = `'${process.env.ID}' in parents`;
    console.log("Fetch starts!");
    do {
      const response = await drive.files.list({
        q: query,
        pageToken: nextPageToken,
        fields: "nextPageToken, files(*)",
      });
      nextPageToken = response.data.nextPageToken;
      filesArray = filesArray.concat(response.data.files);
    } while (nextPageToken);
    console.log("Fetch ends!");

    res.send({
      access: true,
      successMsg: "Successfully fetched all files!",
      data: filesArray,
    });
  } catch (error) {
    console.log(error);
    res.send({
      access: false,
      errorMsg: "Files could not be fetched!",
      error: error,
    });
  }
});

/* Create Folder API */

app.post("/createfolder", async (req, res) => {
  /* Create Folder Function */

  async function createFolder(folderName) {
    try {
      const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      };

      fileMetadata.parents = [process.env.ID];

      const response = await drive.files.create({
        resource: fileMetadata,
        fields: "id, name",
      });

      console.log("File created successfully!");
      return response.data;
    } catch (error) {
      console.error("Error creating folder:", error.message);
    }
  }

  /* Handling Request Parameters -> [Folder Name] */

  try {
    const folderName = req.body.folderName;
    const folderCreationResponse = await createFolder(folderName);
    res.send({
      access: true,
      successMsg: "Folder creation successful!",
      data: folderCreationResponse,
    });
  } catch (error) {
    console.log(error);
    res.send({
      access: false,
      errorMsg: "Folder creation failed!",
      error: error,
    });
  }
});

/* Upload File To Google Drive API */

app.post("/upload", upload.single("files"), async (req, res) => {
  /* Upload To Drive Function */

  async function uploadToDrive(file, userName, folderId) {
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
      parents: [folderId],
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

  /* Handling  Files -> [Images] And Request Parameters -> [Username & Folder Id] */

  try {
    const file = req.file;
    const { userName, folderId } = req.body;
    console.log("File -> ", file);
    console.log("User Name -> ", userName);
    console.log("Folder Id -> ", folderId);

    const fileData = await uploadToDrive(file, userName, folderId);

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
