import { useEffect, useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [userName, setUserName] = useState("");
  const [allFoldersData, setAllFoldersData] = useState([]);
  const [currentFolder, setCurrentFolder] = useState("");
  const [folderFiles, setFolderFiles] = useState([]);
  const [proxyUrl, setProxyUrl] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);

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
            maxSizeMB: 1,
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

  async function getAllFolders() {
    const getFilesResponse = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/getallfolders`
    );
    console.log(getFilesResponse.data.data);
    setAllFoldersData(getFilesResponse.data.data);
  }

  async function getFolderFiles(id) {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getfolderfiles`,
      {
        folderId: id,
      }
    );
    if (response.data.access) {
      const imagesData = response.data.data;
      setFolderFiles(imagesData);
      if (imagesData.length <= 5) {
        for (let i = 0; i < imagesData.length; i++) {
          await getProxyUrl(
            `https://drive.google.com/uc?export=view&id=${imagesData[i].id}`
          );
        }
      } else {
        for (let i = 0; i < 5; i++) {
          await getProxyUrl(
            `https://drive.google.com/uc?export=view&id=${imagesData[i].id}`
          );
        }
      }
    } else {
      console.log(response.data.error);
    }
  }

  async function getProxyUrl(url) {
    const response = await axios.get(
      `${
        import.meta.env.VITE_BASE_URL
      }/proxy-image?imageUrl=${encodeURIComponent(url)}`,
      {
        responseType: "blob",
      }
    );

    const imageUrl = URL.createObjectURL(response.data);
    setProxyUrl((prev) => {
      return [...prev, imageUrl];
    });
  }

  async function getNextImages(currentImageIndex) {
    const totalImagesCount = folderFiles.length;
    const maxLoad = 5;
    if (currentImageIndex + maxLoad < totalImagesCount - 1) {
      for (
        let i = currentImageIndex + 1;
        i < currentImageIndex + maxLoad + 1;
        i++
      ) {
        await getProxyUrl(
          `https://drive.google.com/uc?export=view&id=${folderFiles[i].id}`
        );
      }
    } else if (currentImageIndex + maxLoad >= totalImagesCount - 1) {
      for (let i = currentImageIndex + 1; i < totalImagesCount; i++) {
        await getProxyUrl(
          `https://drive.google.com/uc?export=view&id=${folderFiles[i].id}`
        );
      }
    }
  }

  useEffect(() => {
    if (currentImage == proxyUrl.length - 1) {
      getNextImages(currentImage);
    }
  }, [currentImage]);

  useEffect(() => {
    getAllFolders();
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
            <div key={index}>
              <div
                className="Folders--Folder"
                onClick={() => {
                  getFolderFiles(folder.id);
                  setCurrentFolder(folder.id);
                  setProxyUrl([]);
                }}
              >
                <p className="Folder_Name">{folder.name}</p>
              </div>
            </div>
          );
        })}
      </section>
      <section className="Folder_Images">
        {proxyUrl.map((image, index) => {
          return (
            <div key={index} className="Folder_Images--Image">
              <img
                src={image}
                loading="lazy"
                onClick={() => {
                  setCurrentImage(index);
                }}
              ></img>
            </div>
          );
        })}
      </section>
    </div>
  );
}

export default App;
