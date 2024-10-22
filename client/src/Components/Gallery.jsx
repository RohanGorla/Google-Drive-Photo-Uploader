import { useEffect, useState } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { FaRegFolderOpen } from "react-icons/fa";
import data from "../assets/Gallery";
import axios from "axios";
import "../Styles/Gallery.css";

function Gallery() {
  const context = useOutletContext();
  const [allFoldersData, setAllFoldersData] = [
    context.allFoldersData,
    context.setAllFoldersData,
  ];
  const [currentFolder, setCurrentFolder] = useState("");
  const [folderFiles, setFolderFiles] = useState([]);
  const [proxyUrl, setProxyUrl] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

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
          getProxyUrl(
            `https://drive.google.com/uc?export=view&id=${imagesData[i].id}`
          );
        }
      } else {
        for (let i = 0; i < 5; i++) {
          getProxyUrl(
            `https://drive.google.com/uc?export=view&id=${imagesData[i].id}`
          );
        }
      }
    } else {
      console.log(response.data.error);
    }
  }

  async function getProxyUrl(url) {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/proxy-image?imageUrl=${encodeURIComponent(url)}`,
        {
          responseType: "blob",
        }
      );

      if (
        response.data.size > 0 &&
        response.data.type.split("/")[0] == "image"
      ) {
        const imageUrl = URL.createObjectURL(response.data);
        setProxyUrl((prev) => {
          return [...prev, imageUrl];
        });
      } else {
        getNewProxyUrl(url);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getNewProxyUrl(url) {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BASE_URL
        }/proxy-image?imageUrl=${encodeURIComponent(
          url
        )}&timestamp=${Date.now()}`,
        {
          responseType: "blob",
        }
      );

      if (
        response.data.size > 0 &&
        response.data.type.split("/")[0] == "image"
      ) {
        const imageUrl = URL.createObjectURL(response.data);
        setProxyUrl((prev) => {
          return [...prev, imageUrl];
        });
      }
    } catch (error) {
      console.log(error);
    }
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
        getProxyUrl(
          `https://drive.google.com/uc?export=view&id=${folderFiles[i].id}`
        );
      }
    } else if (currentImageIndex + maxLoad >= totalImagesCount - 1) {
      for (let i = currentImageIndex + 1; i < totalImagesCount; i++) {
        getProxyUrl(
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
    sessionStorage.setItem("prevLoc", location.key);
  }, []);

  return (
    <>
      <div className="Gallery_Main">
        <div className="Gallery_Background">
          <img
            className="Gallery_Background--Image"
            src={`data:image/jpeg;base64,${data.bgImage}`}
          ></img>
        </div>
        <section className="Gallery_Folders">
          {allFoldersData?.map((folder, index) => {
            return (
              <div
                key={index}
                className="Folder_Container"
                onClick={() => {
                  navigate(`folder/${folder.id}`);
                }}
              >
                <div className="Folder--Tint"></div>
                <p className="Folder_Name">{folder.name}</p>
                <div className="Folder_View_Button_Container">
                  <div className="Folder_View_Button">
                    <div className="Folder_View_Button--Tint"></div>
                    <FaRegFolderOpen
                      className="Folder_View_Button--Icon"
                      size={22}
                    />
                    <p className="Folder_View_Button--Text">View</p>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
      {/* <section className="Folder_Images">
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
      </section> */}
    </>
  );
}

export default Gallery;
