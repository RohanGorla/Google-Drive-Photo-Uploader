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
  
  const [tracking, setTracking] = useState(5);
  const location = useLocation();
  const navigate = useNavigate();
  const folderRef = useRef();

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
        <section
          className="Gallery_Folders"
          onScroll={() => {
            const { offsetTop } = folderRef.current;
            const elementRect = folderRef.current.getBoundingClientRect();
            console.log(elementRect);
            if (elementRect.y < 100) {
              setTracking(6);
            }
          }}
        >
          {allFoldersData?.map((folder, index) => {
            return (
              <div
                ref={index == tracking ? folderRef : null}
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
