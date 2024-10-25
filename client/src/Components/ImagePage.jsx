import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MdDownload, MdOutlineSwipe } from "react-icons/md";
import { IoMdArrowRoundBack } from "react-icons/io";
import axios from "axios";
import "../Styles/ImagePage.css";

function ImagePage() {
  const [folderName, setFolderName] = useState("");
  const [folderFiles, setFolderFiles] = useState([]);
  const [proxyUrl, setProxyUrl] = useState([]);
  const [showAllAnimations, setShowAllAnimations] = useState(true);
  const [showNotice, setShowNotice] = useState(false);
  const [showNoticeButton, setShowNoticeButton] = useState(false);
  const [showNoticeBackground, setShowNoticeBackground] = useState(false);
  const [showFolderAnimation, setShowFolderAnimation] = useState(false);
  const [showSwipeAnimation, setShowSwipeAnimation] = useState(false);
  const [showActualImages, setShowActualImages] = useState(false);
  const trackerLimit = 5;
  const [tracker, setTracker] = useState(-1);
  const folderId = useParams().id;
  const maxLoad = 10;
  const imageRef = useRef(null);
  const navigate = useNavigate();

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
    getInitialImages(folderId);
    const currentFolderName = sessionStorage.getItem("currentFolderName");
    setFolderName(currentFolderName);
    setTimeout(() => {
      setShowNoticeBackground(true);
      setTimeout(() => {
        setShowNotice(true);
        setTimeout(() => {
          setShowNoticeButton(true);
        }, 2500);
      }, 800);
    }, 1000);
  }, []);

  return (
    <div className="ImagePage">
      <div
        className={
          showActualImages
            ? "ImagePage_Back_Button"
            : "ImagePage_Back_Button--Inactive"
        }
        onClick={() => {
          navigate("/gallery");
        }}
      >
        <IoMdArrowRoundBack size={25} color="white" />
      </div>
      <div
        className={
          showAllAnimations
            ? "ImagePage_Loading_Animations_Container"
            : "ImagePage_Loading_Animations_Container--Inactive"
        }
      >
        <div className="ImagePage_Loading_Animations">
          {/* Loading Message Animation */}
          <div
            className={
              showNoticeBackground
                ? "ImagePage_Loading_Animation--Message"
                : "ImagePage_Loading_Animation--Message ImagePage_Loading_Animation--Message--Inactive"
            }
          >
            <div
              className={
                showNotice
                  ? "ImagePage_Loading_Animation--Message--Container"
                  : "ImagePage_Loading_Animation--Message--Container ImagePage_Loading_Animation--Message--Container--Inactive"
              }
            >
              <div className="ImagePage_Loading_Animation--Message--Tint"></div>
              <p className="ImagePage_Loading_Animation--Message--Header">
                Notice
              </p>
              <p className="ImagePage_Loading_Animation--Message--Text">
                The images uploaded on our site are high-definition to provide
                the best viewing experience. Please ensure you have a stable
                internet connection for faster loading. Please be patient if the
                images take a bit longer to appear. Thank you!
              </p>
              <div
                className={
                  showNoticeButton
                    ? "ImagePage_Loading_Animation--Message--Button"
                    : "ImagePage_Loading_Animation--Message--Button ImagePage_Loading_Animation--Message--Button--Invisible"
                }
                onClick={() => {
                  setShowNotice(false);
                  setShowFolderAnimation(true);
                  setTimeout(() => {
                    setShowSwipeAnimation(true);
                    setTimeout(() => {
                      setShowActualImages(true);
                      setShowAllAnimations(false);
                    }, 4000);
                  }, 6500);
                  setTimeout(() => {
                    setShowNoticeBackground(false);
                  }, 600);
                }}
              >
                <div className="ImagePage_Loading_Animation--Message--Button--Tint"></div>
                <span className="ImagePage_Loading_Animation--Message--Button--Text">
                  OK
                </span>
              </div>
            </div>
          </div>
          {/* Folder Name Animation */}
          <div
            className={
              showFolderAnimation
                ? "ImagePage_Loading_Animation--Folder_Name"
                : "ImagePage_Loading_Animation--Folder_Name ImagePage_Loading_Animation--Folder_Name--Inactive"
            }
          >
            <div className="ImagePage_Loading_Animation--Folder_Name--Container">
              <p className="ImagePage_Loading_Animation--Folder_Name--Main_Text_1">
                Cherish the memories
              </p>
              <p className="ImagePage_Loading_Animation--Folder_Name--Sub_Text">
                shared by
              </p>
              <p className="ImagePage_Loading_Animation--Folder_Name--Main_Text_2">
                {folderName}
              </p>
            </div>
          </div>
          {/* Swipe Animation */}
          <div
            className={
              showSwipeAnimation
                ? "ImagePage_Loading_Animation--Swipe_Main"
                : "ImagePage_Loading_Animation--Swipe_Main ImagePage_Loading_Animation--Swipe_Main--Inactive"
            }
          >
            <div className="ImagePage_Loading_Animation--Swipe_Container">
              <p className="ImagePage_Loading_Animation--Swipe--Text">
                To scroll through images
              </p>
              <div
                className={
                  showSwipeAnimation
                    ? "ImagePage_Loading_Animation--Swipe--Icon"
                    : "ImagePage_Loading_Animation--Swipe--Icon ImagePage_Loading_Animation--Swipe--Icon--Inactive"
                }
              >
                <MdOutlineSwipe size={50} />
              </div>
              <p className="ImagePage_Loading_Animation--Swipe--Text">
                Swipe left or right
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className={
          showActualImages ? "ImagePage_Images" : "ImagePage_Images--Inactive"
        }
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
                <div className="ImagePage_Images--Number">
                  <span>
                    {index + 1} / {folderFiles.length}
                  </span>
                </div>
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
