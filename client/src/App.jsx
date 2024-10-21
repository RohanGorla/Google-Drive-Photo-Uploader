import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
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
      <Outlet context={{ allFoldersData, setAllFoldersData }} />
    </>
  );
}

export default App;
