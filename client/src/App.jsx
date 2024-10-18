import { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);
  const [userName, setUserName] = useState("");

  async function handleSubmit() {
    for (const file of files) {
      let compressedFile;
      if (file.size / (1024 * 1024) > 4) {
        const options = {
          maxSizeMB: 4,
          useWebWorker: true,
        };
        compressedFile = await imageCompression(file, options);
      } else {
        compressedFile = file;
      }
      console.log(compressedFile.size / (1024 * 1024), "MB");
      let formData = new FormData();
      formData.append("files", compressedFile);
      formData.append("userName", userName);
      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
    }
  }

  return (
    <>
      <div className="Input-Files">
        <input
          type="file"
          accept="image/*"
          name="files"
          multiple
          onChange={(e) => {
            setFiles(e.target.files);
          }}
        ></input>
      </div>
      <div className="User-Name">
        <input
          type="text"
          onChange={(e) => {
            setUserName(e.target.value);
          }}
        ></input>
      </div>
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}

export default App;
