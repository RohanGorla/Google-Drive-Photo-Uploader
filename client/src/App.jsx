import { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);

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
    }
  }

  return (
    <>
      <input
        type="file"
        accept="image/*"
        name="images"
        multiple
        onChange={(e) => {
          setFiles(e.target.files);
        }}
      ></input>
      <button onClick={handleSubmit}>Submit</button>
    </>
  );
}

export default App;
