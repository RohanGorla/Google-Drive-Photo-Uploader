import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { FaImages } from "react-icons/fa";
import imageCompression from "browser-image-compression";
import axios from "axios";
import data from "./Base64images";
import "../Styles/Homepage.css";

function Homepage() {
  const [files, setFiles] = useState([]);
  const [userName, setUserName] = useState("");
  const [showLoadingPage, setShowLoadingPage] = useState(true);

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

  useEffect(() => {
    setTimeout(() => {
      setShowLoadingPage(false);
    }, [8500]);
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
      </div>
    </div>
  );
}

export default Homepage;
