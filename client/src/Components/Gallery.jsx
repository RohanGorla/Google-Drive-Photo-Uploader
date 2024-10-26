import { useEffect, useState, useRef } from "react";
import { useOutletContext, useLocation, useNavigate } from "react-router-dom";
import { FaRegFolderOpen, FaHome } from "react-icons/fa";
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
  const location = useLocation();
  const navigate = useNavigate();
  const folderRef = useRef();

  /* Get All Folders Data */

  async function getAllFolders() {
    const getFilesResponse = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/getallfolders`
    );
    console.log(getFilesResponse.data.data);
    setAllFoldersData(getFilesResponse.data.data);
  }

  /* Scroll To Just Opened Folder */

  useEffect(() => {
    if (folderRef.current) {
      folderRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentFolder]);

  /* Set The Current Folder To Just Visited Folder ID */

  useEffect(() => {
    sessionStorage.setItem("prevLoc", location.key);
    getAllFolders();
    const currentFolderId = sessionStorage.getItem("currentFolderId");
    if (currentFolderId) {
      setCurrentFolder(currentFolderId);
    }
  }, []);

  return (
    <>
      <div className="Gallery_Main">
        <FaHome
          size={27}
          className="Gallery_Home--Icon"
          onClick={() => {
            console.log("click");
            navigate("/");
          }}
        />
        <div className="Gallery_Background">
          <img
            className="Gallery_Background--Image"
            src={`data:image/jpeg;base64,${data.bgImage}`}
          ></img>
        </div>
        {allFoldersData.length ? (
          <section className="Gallery_Folders">
            {allFoldersData?.map((folder, index) => {
              return (
                <div
                  ref={folder.id == currentFolder ? folderRef : null}
                  key={index}
                  className="Folder_Container"
                  onClick={() => {
                    sessionStorage.setItem("currentFolderName", folder.name);
                    sessionStorage.setItem("currentFolderId", folder.id);
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
        ) : (
          <section className="Gallery_Folders--Empty">
            <div className="Gallery_Folders--Empty_Message_Container">
              <div className="Gallery_Folders--Empty_Message_Container--Tint"></div>
              <p className="GalleryFolders--Empty_Message">
                There are no folders present yet. Be the first to start the
                collection by uploading your photos and creating a showcase
                everyone will enjoy!
              </p>
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export default Gallery;
