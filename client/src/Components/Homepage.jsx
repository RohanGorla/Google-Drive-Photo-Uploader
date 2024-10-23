import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { FaHeart, FaImages } from "react-icons/fa";
import { MdUpload, MdPhoto, MdCreateNewFolder } from "react-icons/md";
import imageCompression from "browser-image-compression";
import axios from "axios";
import data from "../assets/Base64images";
import "../Styles/Homepage.css";

function Homepage() {
  const context = useOutletContext();
  const [files, setFiles] = [context.files, context.setFiles];
  const [userName, setUserName] = [context.userName, context.setUserName];
  const [showLoadingPage, setShowLoadingPage] = useState(true);
  const [greetingNote, setGreetingNote] = useState("");
  const [scrollToUploadForm, setScrollToUploadForm] = useState(false);
  const [uploadStatusMessage, setUploadStatusMessage] = [
    context.uploadStatusMessage,
    context.setUploadStatusMessage,
  ];
  const [hasFolder, setHasFolder] = [context.hasFolder, context.setHasFolder];
  const [myFolder, setMyFolder] = [context.myFolder, context.setMyFolder];
  const [showUploadMessage, setShowUploadMessage] = [
    context.showUploadMessage,
    context.setShowUploadMessage,
  ];
  const [userNameError, setUserNameError] = [
    context.userNameError,
    context.setUserNameError,
  ];
  const [filesQuantityError, setFilesQuantityError] = [
    context.filesQuantityError,
    context.setFilesQuantityError,
  ];
  const [requestUpload, setRequestUpload] = [
    context.requestUpload,
    context.setRequestUpload,
  ];
  const uploadRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const message =
    "Thank you for being part of our special day! Your presence means the world to us as we begin this exciting journey together. We hope you enjoyed the celebration as much as we did. Please share your captured moments with us by uploading your photos below!";

  /* Create Folder And Upload Images APIs */

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
      } else {
        console.log(`${folderCreationResponse.data.error}`);
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
    }
  }

  /* Greeting Note Typing Effect */
  useEffect(() => {
    if (greetingNote.length) {
      setTimeout(() => {
        if (greetingNote.length !== message.length) {
          let updatedMessage = greetingNote + message[greetingNote.length];
          setGreetingNote(updatedMessage);
        }
      }, 20);
    }
  }, [greetingNote]);

  useEffect(() => {
    const myFolderName = localStorage.getItem("myFolderName");
    const myFolderId = localStorage.getItem("myFolderId");
    if (myFolderName && myFolderId) {
      setMyFolder({ name: myFolderName, id: myFolderId });
      setHasFolder(true);
    }
    const previousPath = sessionStorage.getItem("prevLoc");
    if (previousPath && previousPath !== location.key) {
      setShowLoadingPage(false);
      setGreetingNote(message);
      setTimeout(() => {
        sessionStorage.setItem("prevLoc", location.key);
      }, 1000);
      const scrollDelay = 500;
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: "smooth" });
      }, scrollDelay);
      setTimeout(() => {
        setScrollToUploadForm(true);
      }, scrollDelay - 50);
    } else {
      setTimeout(() => {
        sessionStorage.setItem("prevLoc", location.key);
        setShowLoadingPage(false);
        setGreetingNote(message[0]);
      }, [8500]);
      const scrollDelay = message.length * 20 + 2000 + 8500;
      setTimeout(() => {
        uploadRef.current?.scrollIntoView({ behavior: "smooth" });
      }, scrollDelay);
      setTimeout(() => {
        setScrollToUploadForm(true);
      }, scrollDelay - 50);
    }
  }, []);

  return (
    <div className="HomePage">
      {/* Loading Animation Page */}
      <div
        className={showLoadingPage ? "LoadingPage" : "LoadingPage--Inactive"}
      >
        <div className="LoadingPage_Names_Container">
          <p className="LoadingPage--BrideName">Alekhya</p>
          <FaHeart className="LoadingPage--Heart" size={100} />
          <p className="LoadingPage--GroomName">Dinesh</p>
        </div>
        <div className="LoadingPage_WelcomeMessage">
          <p>Welcome to our</p>
          <p>Engagement ceremony!</p>
        </div>
      </div>
      {/* Home Page Background Image */}
      <div className="HomePage_Background">
        <div className="HomePage_Background--Tint"></div>
        <img src={`data:image/jpeg;base64,${data.bgImage}`}></img>
      </div>
      {/* Home Page Upload Image Message */}
      <div
        className={
          showUploadMessage
            ? "HomePage_Upload_Message"
            : "HomePage_Upload_Message HomePage_Upload_Message--Inactive"
        }
      >
        <div className="HomePage_Upload_Message--Tint"></div>
        <div className="HomePage_Upload_Message--Card">
          <p className="HomePage_Upload_Message_Card--Message">
            Keep this tab open while we upload your photos. Explore the gallery
            and enjoy moments shared by others in the meantime!
          </p>
          <div
            className="HomePage_Upload_Message_Card--Button"
            onClick={() => {
              setShowUploadMessage(false);
            }}
          >
            <div className="HomePage_Upload_Message_Card--Button--Tint"></div>
            <span>OK</span>
          </div>
        </div>
      </div>
      {/* Home Page Main Container */}
      <div className="HomePage_MainContainer">
        {/* Home Page Greeting Card */}
        <article className="HomePage_Greetings_Container">
          <div className="HomePage_Greetings">
            <div className="HomePage_Greetings--Tint"></div>
            <p className="HomePage_Greetings--Note">{greetingNote}</p>
          </div>
        </article>
        {/* Home Page Image Upload-Form */}
        <section
          className={
            scrollToUploadForm
              ? "HomePage_Upload_Container"
              : "HomePage_Upload_Container--Inactive"
          }
          ref={uploadRef}
        >
          <div className="HomePage_Upload_Container--Tint"></div>
          <p className="HomePage_Upload_Container--Note">
            Share your cherished moments from the event, so we can treasure them
            for years to come!
          </p>
          {/* Folder Name Input */}
          <div
            className={
              hasFolder
                ? "HomePage_Upload_Folder_Name--Inactive"
                : "HomePage_Upload_Folder_Name"
            }
          >
            <label className="HomePage_Upload_Folder_Name--Label">
              Your Name:
            </label>
            <input
              className="HomePage_Upload_Folder_Name--Input"
              type="text"
              placeholder="Enter your name..."
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            ></input>
          </div>
          {/* Folder Name Empty Error Message */}
          <div
            className={
              userNameError
                ? "HomePage_Upload_Folder_Name_Empty"
                : "HomePage_Upload_Folder_Name_Empty--Inactive"
            }
          >
            <div className="HomePage_Upload_Folder_Name_Empty--Tint"></div>
            <p className="HomePage_Upload_Folder_Name_Empty--Note">
              * Your name is required for folder creation!
            </p>
          </div>
          {/* Add New Folder Option */}
          <div
            className={
              hasFolder
                ? "HomePage_Add_New_Folder_Container"
                : "HomePage_Add_New_Folder_Container--Inactive"
            }
          >
            <p className="HomePage_Add_New_Folder--Note">
              Your images will be uploaded to {myFolder.name}
            </p>
            <div
              className="HomePage_Add_New_Folder--Button"
              onClick={() => {
                setHasFolder(false);
                localStorage.removeItem("myFolderName");
                localStorage.removeItem("myFolderId");
              }}
            >
              <div className="HomePage_Add_New_Folder--Button--Tint"></div>
              <MdCreateNewFolder
                className="HomePage_Add_New_Folder--Button--Icon"
                size={22}
              />{" "}
              <span className="HomePage_Add_New_Folder--Button--Text">
                New Folder
              </span>
            </div>
          </div>
          {/* Select And Upload Images Container */}
          <div className="HomePage_Upload_Select_And_Upload_Container">
            <p className="HomePage_Upload_Select_And_Upload--Label">
              Select & Upload your images:
            </p>
            <div className="HomePage_Upload_Select_And_Upload">
              {/* Select Images Button */}
              <div className="HomePage_Upload_Image_Selector">
                <div className="Upload_Button--Tint"></div>
                <label
                  className="HomePage_Upload_Image_Selector--Label"
                  htmlFor="imagesUpload"
                >
                  <MdPhoto size={22} className="Upload_Button--Icons" />{" "}
                  <span>Select</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="imagesUpload"
                  name="files"
                  multiple
                  onChange={(e) => {
                    setFiles(e.target.files);
                    setUploadStatusMessage(`${e.target.files.length} files selected!`);
                  }}
                  style={{ display: "none" }}
                ></input>
              </div>
              {/* Upload Images Button */}
              <div
                className="HomePage_Upload_Submit_Button"
                onClick={() => {
                  const upload = sessionStorage.getItem("upload");
                  if (upload || requestUpload) {
                    console.log("already started");
                    setUploadStatusMessage("Images are already being uploaded...");
                  } else {
                    console.log("Start upload");
                    sessionStorage.setItem("upload", true);
                    setRequestUpload(true);
                    setUploadStatusMessage("Starting upload process...");
                  }
                }}
              >
                <div className="Upload_Button--Tint"></div>
                <MdUpload size={22} className="Upload_Button--Icons" />{" "}
                <span>Upload</span>
              </div>
            </div>
          </div>
          {/* No Images Selected Error */}
          <div
            className={
              filesQuantityError
                ? "HomePage_Upload_Image_Select_Empty"
                : "HomePage_Upload_Image_Select_Empty--Inactive"
            }
          >
            <div className="HomePage_Upload_Image_Select_Empty--Tint"></div>
            <p className="HomePage_Upload_Image_Select_Empty--Note">
              * Please select atleast 1 image!
            </p>
          </div>
          <div
            className={
              uploadStatusMessage.length
                ? "HomePage_Upload_Status_Message_Container"
                : "HomePage_Upload_Status_Message_Container--Inactive"
            }
          >
            <div className="HomePage_Upload_Status_Message_Container--Tint"></div>
            <p className="HomePage_Upload_Status_Message_Container--Message">
              {uploadStatusMessage}
            </p>
          </div>
        </section>
        {/* Home Page Gallery */}
        <section
          className={
            scrollToUploadForm
              ? "HomePage_Gallery_Container"
              : "HomePage_Gallery_Container--Inactive"
          }
        >
          <div className="HomePage_Gallery_Container--Tint"></div>
          <p className="HomePage_Gallery--Note">
            The best moments are those shared. Open the gallery to explore
            photos that hold the joy and excitement of the day!
          </p>
          <div className="HomePage_Gallery_Button_Container">
            {/* <div className="HomePage_Gallery_Button--Background"></div> */}
            <div
              className="HomePage_Gallery_Button"
              onClick={() => {
                navigate("/gallery");
              }}
            >
              <div className="HomePage_Gallery_Button--Tint"></div>
              <FaImages className="HomePage_Gallery_Button--Icon" size={22} />
              <p className="HomePage_Gallery_Button--Text">Gallery</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Homepage;
