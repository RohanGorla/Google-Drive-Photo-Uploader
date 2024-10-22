import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { MdDownload } from "react-icons/md";
import axios from "axios";
import "../Styles/ImagePage.css";

function ImagePage() {
  const [folderFiles, setFolderFiles] = useState([]);
  const [proxyUrl, setProxyUrl] = useState([]);
  const trackerLimit = 5;
  const [tracker, setTracker] = useState(-1);
  const folderId = useParams().id;
  const maxLoad = 10;
  const imageRef = useRef(null);
  const scrollRef = useRef(null);

  async function getInitialImages(id) {
    const response = await axios.post(
      `${import.meta.env.VITE_BASE_URL}/getfolderfiles`,
      {
        folderId: id,
      }
    );
    if (response.data.access) {
      const imagesData = response.data.data;
      setFolderFiles(imagesData);
      if (imagesData.length <= maxLoad) {
        for (let i = 0; i < imagesData.length; i++) {
          getProxyUrl(
            `https://drive.google.com/uc?export=view&id=${imagesData[i].id}`,
            imagesData[i]
          );
        }
      } else {
        setTracker((prev) => {
          const newTracker = prev + trackerLimit;
          return newTracker;
        });
        for (let i = 0; i < maxLoad; i++) {
          getProxyUrl(
            `https://drive.google.com/uc?export=view&id=${imagesData[i].id}`,
            imagesData[i]
          );
        }
      }
    } else {
      console.log(response.data.error);
    }
  }

  async function getProxyUrl(url, imageData) {
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
        const data = { url: imageUrl, imageData };
        setProxyUrl((prev) => {
          return [...prev, data];
        });
      } else {
        getNewProxyUrl(url);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getNewProxyUrl(url, imageData) {
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
        const data = { url: imageUrl, imageData };
        setProxyUrl((prev) => {
          return [...prev, data];
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async function getNextImages(currentImageIndex) {
    const totalImagesCount = folderFiles.length;
    if (currentImageIndex + maxLoad < totalImagesCount - 1) {
      for (
        let i = currentImageIndex + 1;
        i < currentImageIndex + maxLoad + 1;
        i++
      ) {
        getProxyUrl(
          `https://drive.google.com/uc?export=view&id=${folderFiles[i].id}`,
          folderFiles[i]
        );
      }
    } else if (currentImageIndex + maxLoad >= totalImagesCount - 1) {
      for (let i = currentImageIndex + 1; i < totalImagesCount; i++) {
        getProxyUrl(
          `https://drive.google.com/uc?export=view&id=${folderFiles[i].id}`,
          folderFiles[i]
        );
      }
    }
  }

  function updateTracker() {
    if (proxyUrl.length !== folderFiles.length) {
      if (tracker + trackerLimit < folderFiles.length) {
        console.log("change");
        setTracker((prev) => {
          const newTracker = prev + maxLoad;
          return newTracker;
        });
      }
    }
  }

  function downloadImage(url, name) {
    const downloadButton = document.createElement("a");
    downloadButton.href = url;
    downloadButton.download = name;
    document.body.appendChild(downloadButton);

    downloadButton.click();

    document.body.removeChild(downloadButton);
  }

  useEffect(() => {
    // getInitialImages(folderId);
  }, []);

  return (
    <div
      className="ImagePage"
      onClick={() => {
        getInitialImages(folderId);
      }}
    >
      <div
        className="ImagePage_Images"
        onScroll={() => {
          if (imageRef.current) {
            const imageRect = imageRef.current.getBoundingClientRect();
            if (imageRect.x < 50) {
              updateTracker();
              getNextImages(proxyUrl.length - 1);
            }
          }
        }}
      >
        {proxyUrl.map((image, index) => {
          return (
            <div
              className="ImagePage_Images--Image_Container"
              key={index}
              ref={(e) => {
                if (index == tracker) {
                  imageRef.current = e;
                }
              }}
            >
              <div className="ImagePage_Images--Buttons">
                <div
                  className="Image_Buttons_Download"
                  onClick={() => {
                    downloadImage(
                      image.imageData.webContentLink,
                      image.imageData.name
                    );
                  }}
                >
                  <MdDownload
                    className="Image_Buttons_Download--Icon"
                    size={22}
                  />
                  <span className="Image_Buttons_Download--Text">Download</span>
                </div>
              </div>
              <div className="ImagePage_Images--Image">
                <img src={image.url} loading="lazy"></img>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ImagePage;
