import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import data from "./assets/Rings.js";
import axios from "axios";
import "./App.css";

function App() {
  const [allFoldersData, setAllFoldersData] = useState([]);

  async function getAllFolders() {
    const getFilesResponse = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/getallfolders`
    );
    console.log(getFilesResponse.data.data);
    setAllFoldersData(getFilesResponse.data.data);
  }

  useEffect(() => {
    getAllFolders();
  }, []);

  return (
    <>
      {/* Home Page Navbar */}
      <nav className="Navbar">
        <span className="Navbar_Names">Alekhya</span>
        <img
          src={`data:image/jpeg;base64,${data.rings}`}
          className="Navbar_Rings_Image"
        ></img>
        <span className="Navbar_Names">Dinesh</span>
      </nav>
      <Outlet
        context={{
          allFoldersData,
          setAllFoldersData,
        }}
      />
    </>
  );
}

export default App;
