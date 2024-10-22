import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import imageCompression from "browser-image-compression";
import data from "./assets/Rings.js";
import axios from "axios";
import "./App.css";

function App() {
  const [allFoldersData, setAllFoldersData] = useState([]);
  const [files, setFiles] = useState([]);
  const [userName, setUserName] = useState("");
  const [userNameError, setUserNameError] = useState(false);
  const [filesQuantityError, setFilesQuantityError] = useState(false);
  const [startUpload, setStartUpload] = useState(false);

  async function getAllFolders() {
    const getFilesResponse = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/getallfolders`
    );
    console.log(getFilesResponse.data.data);
    setAllFoldersData(getFilesResponse.data.data);
  }

  async function handleSubmit() {
    if (userName.length && files.length) {
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
        console.log("all images uploaded");
        sessionStorage.removeItem("upload");
        setStartUpload(false);
        setFiles([]);
        setUserName("");
      } else {
        console.log(`${folderCreationResponse.data.error}`);
        sessionStorage.removeItem("upload");
        setStartUpload(false);
        setFiles([]);
        setUserName("");
      }
      setUserNameError(false);
      setFilesQuantityError(false);
    } else {
      if (userName.length == 0) {
        setUserNameError(true);
      } else {
        setUserNameError(false);
      }
      if (files.length == 0) {
        setFilesQuantityError(true);
      } else {
        setFilesQuantityError(false);
      }
      sessionStorage.removeItem("upload");
      setStartUpload(false);
    }
  }

  useEffect(() => {
    const upload = sessionStorage.getItem("upload");
    if (upload) {
      handleSubmit();
    }
  }, [startUpload]);

  useEffect(() => {
    getAllFolders();
  }, []);

  return (
    <>
      {/* Home Page Navbar */}
      <nav className="Navbar">
        <span className="Navbar_Names">Alekhya</span>
        <img
          src={`data:image/jpeg;base64,${data.rings}`}
          className="Navbar_Rings_Image"
        ></img>
        <span className="Navbar_Names">Dinesh</span>
      </nav>
      <Outlet
        context={{
          allFoldersData,
          setAllFoldersData,
          files,
          setFiles,
          userName,
          setUserName,
          userNameError,
          setUserNameError,
          filesQuantityError,
          setFilesQuantityError,
          startUpload,
          setStartUpload,
        }}
      />
    </>
  );
}

export default App;
