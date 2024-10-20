import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

function App() {
  const navigate = useNavigate();

  const [allFoldersData, setAllFoldersData] = useState([]);

  async function getAllFolders() {
    const getFilesResponse = await axios.get(
      `${import.meta.env.VITE_BASE_URL}/getallfolders`
    );
    console.log(getFilesResponse.data.data);
    setAllFoldersData(getFilesResponse.data.data);
  }

  // useEffect(() => {
  //   getAllFolders();
  //   setTimeout(() => {
  //     navigate("/homepage");
  //   }, 4000);
  // }, []);

  return (
    <>
      <Outlet context={{ allFoldersData, setAllFoldersData }} />
    </>
  );
}

export default App;
