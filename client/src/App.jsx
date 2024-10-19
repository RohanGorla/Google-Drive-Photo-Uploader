import { useEffect, useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [userName, setUserName] = useState("");
  const [allFoldersData, setAllFoldersData] = useState([]);
  const [folderFiles, setFolderFiles] = useState([]);

  async function handleSubmit() {
    const folderCreationResponse = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/createfolder`,
      {
        folderName: userName,
      }
    );
    console.log(folderCreationResponse);
    if (folderCreationResponse.data.access) {
      let count = 1;
      const folderId = folderCreationResponse.data.data.id;
      console.log(folderId);
      for (const file of files) {
        let compressedFile;
        if (file.size / (1024 * 1024) > 4) {
          const options = {
            maxSizeMB: 4,
            useWebWorker: true,
          };
          compressedFile = await imageCompression(file, options);
        } else {
          compressedFile = file;
        }
        console.log(
          `Folder ${count} out of ${files.length} -> `,
          compressedFile.size / (1024 * 1024),
          "MB"
        );
        let formData = new FormData();
        formData.append("files", compressedFile);
        formData.append("userName", userName);
        formData.append("folderId", folderId);
        const fileUploadResponse = await axios.post(
          `${import.meta.env.VITE_BASE_URL}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log(fileUploadResponse);
        count += 1;
      }
    } else {
      console.log(`${folderCreationResponse.data.error}`);
    }
  }

  async function getAllFiles() {
    const getFilesResponse = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/getallfolders`
    );
    console.log(getFilesResponse.data.data);
    setAllFoldersData(getFilesResponse.data.data);
  }

  useEffect(() => {
    getAllFiles();
  }, []);

  return (
    <div className="Main">
      <header className="Header">
        <h1>Engagement Ceremony</h1>
      </header>
      <section className="Input_Form">
        <div className="Files_Input">
          <input
            type="file"
            accept="image/*"
            name="files"
            multiple
            onChange={(e) => {
              setFiles(e.target.files);
            }}
          ></input>
        </div>
        <div className="Name_Input">
          <input
            type="text"
            onChange={(e) => {
              setUserName(e.target.value);
            }}
          ></input>
        </div>
        <button onClick={handleSubmit} className="Submit_Button">
          Submit
        </button>
      </section>
      <section className="Folders">
        <p>Pick a folde from below</p>
        {allFoldersData?.map((folder, index) => {
          return (
            <div key={index} className="Folders--Folder">
              <p className="Folder_Name">{folder.name}</p>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default App;
