import { useEffect, useState, useRef } from "react";
import { FaHeart } from "react-icons/fa";
import { FaImages } from "react-icons/fa";
import { MdUpload } from "react-icons/md";
import { MdPhoto } from "react-icons/md";
import imageCompression from "browser-image-compression";
import axios from "axios";
import data from "./Base64images";
import "../Styles/Homepage.css";

function Homepage() {
  const [files, setFiles] = useState([]);
  const [userName, setUserName] = useState("");
  const [showLoadingPage, setShowLoadingPage] = useState(true);
  const [greetingNote, setGreetingNote] = useState("");
  const [userNameError, setUserNameError] = useState(false);
  const [filesQuantityError, setFilesQuantityError] = useState(false);
  const uploadRef = useRef(null);
  const message =
    "Thank you for being part of our special day! Your presence means the world to us as we begin this exciting journey together. We hope you enjoyed the celebration as much as we did. Please share your captured moments with us by uploading your photos below!";

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
        if (greetingNote.length === message.length) {
          // setTimeout(() => {
          // setGreetingNote(message);
          // }, 3000);
        } else {
          let updatedMessage = greetingNote + message[greetingNote.length];
          setGreetingNote(updatedMessage);
        }
      }, 20);
    }
  }, [greetingNote]);

  useEffect(() => {
    setTimeout(() => {
      setShowLoadingPage(false);
      setGreetingNote(message[0]);
    }, [8500]);
    const scrollDelay = message.length * 20 + 1000 + 8500;
    setTimeout(() => {
      uploadRef.current?.scrollIntoView({ behavior: "smooth" });
    }, scrollDelay);
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
        <img src={`data:image/jpeg;base64,${data.brideImage}`}></img>
      </div>
      {/* Home Page Navbar */}
      <nav className="HomePage_Navbar">
        {/* <div className="HomePage_Navbar--Tint"></div> */}
        <div className="HomePage_Navbar_ViewGallery_Button">
          <div className="HomePage_Navbar_ViewGallery_Button--Background"></div>
          <FaImages
            className="HomePage_Navbar_ViewGallery_Button--Icon"
            size={20}
          />
          <p className="HomePage_Navbar_ViewGallery_Button--Text">Gallery</p>
        </div>
      </nav>
      {/* Home Page Main Container */}
      <div className="HomePage_MainContainer">
        {/* Home Page Greeting Card */}
        <article className="HomePage_Greetings_Container">
          <div className="HomePage_Greetings">
            <div className="HomePage_Greetings--Tint"></div>
            <p className="HomePage_Greetings--Note">{greetingNote}</p>
          </div>
        </article>
        <section className="HomePage_Upload_Container" ref={uploadRef}>
          <div className="HomePage_Upload_Container--Tint"></div>
          <p className="HomePage_Upload_Container--Note">
            Share your cherished moments from the event, so we can treasure them
            for years to come!
          </p>
          <div className="HomePage_Upload_Folder_Name">
            <label className="HomePage_Upload_Folder_Name--Label">
              Your Name:
            </label>
            <input
              className="HomePage_Upload_Folder_Name--Input"
              type="text"
              placeholder="Enter your name..."
              onChange={(e) => {
                setUserName(e.target.value);
              }}
            ></input>
          </div>
          <p
            className={
              userNameError
                ? "HomePage_Upload_Folder_Name_Empty"
                : "HomePage_Upload_Folder_Name_Empty--Inactive"
            }
          >
            * Your name is required for folder creation!
          </p>
          <div className="HomePage_Upload_Select_And_Upload_Container">
            <p className="HomePage_Upload_Select_And_Upload--Label">
              Select & Upload your images:
            </p>
            <div className="HomePage_Upload_Select_And_Upload">
              <div className="HomePage_Upload_Image_Selector">
                <label
                  className="HomePage_Upload_Image_Selector--Label"
                  htmlFor="imagesUpload"
                >
                  <MdPhoto size={22} /> <span>Select</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  id="imagesUpload"
                  name="files"
                  multiple
                  onChange={(e) => {
                    setFiles(e.target.files);
                  }}
                  style={{ display: "none" }}
                ></input>
              </div>
              <div
                className="HomePage_Upload_Submit_Button"
                onClick={handleSubmit}
                // onClick={() => {
                //   console.log("click");
                // }}
              >
                <MdUpload size={22} /> <span>Upload</span>
              </div>
            </div>
          </div>
          <p
            className={
              filesQuantityError
                ? "HomePage_Upload_Image_Select_Empty"
                : "HomePage_Upload_Image_Select_Empty--Inactive"
            }
          >
            * Please select atleast 1 image!
          </p>
        </section>
      </div>
    </div>
  );
}

export default Homepage;
