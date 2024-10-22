import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../Styles/ImagePage.css";

function ImagePage() {
  const [folderFiles, setFolderFiles] = useState([]);
  const [proxyUrl, setProxyUrl] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const trackerLimit = 4;
  const [tracker, setTracker] = useState(-1);
  const folderId = useParams().id;
  const maxLoad = 10;
  const imageRef = useRef();

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
            `https://drive.google.com/uc?export=view&id=${imagesData[i].id}`
          );
        }
      } else {
        setTracker((prev) => {
          const newTracker = prev + trackerLimit;
          return newTracker;
        });
        for (let i = 0; i < maxLoad; i++) {
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

  function updateTracker() {
    if (proxyUrl.length !== folderFiles.length) {
      if (tracker + trackerLimit < folderFiles.length) {
        setTracker((prev) => {
          const newTracker = prev + maxLoad;
          return newTracker;
        });
      }
    }
  }

  useEffect(() => {
    getInitialImages(folderId);
  }, []);

  return (
    <div className="ImagePage">
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
              key={index}
              ref={index == tracker ? imageRef : null}
              className="ImagePage_Images--Image_Container"
            >
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
      </div>
    </div>
  );
}

export default ImagePage;
