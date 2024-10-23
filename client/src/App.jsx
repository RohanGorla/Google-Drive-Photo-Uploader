import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { IoMdCloudDone } from "react-icons/io";
import { FaDatabase, FaImages, FaImage } from "react-icons/fa";
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
  const [requestUpload, setRequestUpload] = useState(false);
  const [startUpload, setStartUpload] = useState(false);
  const [showUploadMessage, setShowUploadMessage] = useState(false);
  const [startTransition, setStartTransition] = useState(false);
  const [showUploadAnimation, setShowUploadAnimation] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [percent, setPercent] = useState(0);

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
        setStartTransition(true);
        setTimeout(async () => {
          setTimeout(() => {
            setShowUploadMessage(true);
          }, 1000);
          setStartUpload(true);
          setShowUploadAnimation(true);
          let count = 0;
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
            const percentage = Math.round((count / files.length) * 100);
            setPercent(percentage);
          }
          console.log("all images uploaded");
          setShowUploadAnimation(false);
          setFiles([]);
          setUserName("");
          setTimeout(() => {
            setUploadComplete(true);
            setShowUploadMessage(false);
          }, 300);
          setTimeout(() => {
            sessionStorage.removeItem("upload");
            setStartUpload(false);
            setRequestUpload(false);
          }, 2000);
          setTimeout(() => {
            setStartTransition(false);
          }, 2500);
        }, 800);
      } else {
        console.log(`${folderCreationResponse.data.error}`);
        sessionStorage.removeItem("upload");
        setRequestUpload(false);
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
      setRequestUpload(false);
    }
  }

  useEffect(() => {
    const upload = sessionStorage.getItem("upload");
    if (upload) {
      handleSubmit();
    }
  }, [requestUpload]);

  useEffect(() => {
    getAllFolders();
  }, []);

  return (
    <>
      {/* Home Page Navbar */}
      <nav className="Navbar">
        <div
          className={
            startTransition
              ? "Navbar--Tint"
              : "Navbar--Tint Navbar--Tint--Inactive"
          }
        ></div>
        <div
          className={
            startUpload ? "UploadBar" : "UploadBar UploadBar--Inactive"
          }
        >
          <div
            className={
              showUploadAnimation
                ? "Upload_Animation"
                : "Upload_Animation Upload_Animation--Inactive"
            }
          >
            <div className="Upload_Animation--Tint"></div>
            <FaImage
              className="Upload_Animation--Icons--Image"
              color="black"
              size={25}
            />
            <div className="Upload_Animation--Icons">
              <div className="Upload_Animation--Icons--Tint"></div>
              <FaImages
                className="Upload_Animation--Icons--Images"
                color="black"
                size={28}
              />
            </div>
            <div className="Upload_Animation--Percentage">
              <span>{percent}%</span>
            </div>
            <div className="Upload_Animation--Icons">
              <div className="Upload_Animation--Icons--Tint"></div>
              <FaDatabase
                className="Upload_Animation--Icons--Database"
                color="black"
                size={25}
              />
            </div>
          </div>
          <div
            className={
              uploadComplete
                ? "Upload_Message"
                : "Upload_Message Upload_Message--Inactive"
            }
          >
            <IoMdCloudDone className="Upload_Message--Icon" size={25} />
            <p className="Upload_Message--Text">Images upload complete!</p>
          </div>
        </div>
        <span
          className={
            startTransition
              ? "Navbar_Names Navbar_Names--Bride_Inactive"
              : "Navbar_Names"
          }
        >
          Alekhya
        </span>
        <img
          src={`data:image/jpeg;base64,${data.rings}`}
          className={
            startTransition
              ? "Navbar_Rings_Image Navbar_Rings_Image--Inactive"
              : "Navbar_Rings_Image"
          }
        ></img>
        <span
          className={
            startTransition
              ? "Navbar_Names Navbar_Names--Groom_Inactive"
              : "Navbar_Names"
          }
        >
          Dinesh
        </span>
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
          requestUpload,
          setRequestUpload,
          showUploadMessage,
          setShowUploadMessage,
        }}
      />
    </>
  );
}

export default App;
