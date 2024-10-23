import { useEffect, useState, useRef } from "react";
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
  const location = useLocation();
  const navigate = useNavigate();
  const folderRef = useRef();

  useEffect(() => {
    if (folderRef.current) {
      folderRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentFolder]);

  useEffect(() => {
    sessionStorage.setItem("prevLoc", location.key);
    const currentFolderId = sessionStorage.getItem("currentFolder");
    if (currentFolderId) {
      setCurrentFolder(currentFolderId);
    }
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
                ref={folder.id == currentFolder ? folderRef : null}
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
    </>
  );
}

export default Gallery;
