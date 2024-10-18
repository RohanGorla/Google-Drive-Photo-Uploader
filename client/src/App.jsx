import { useState } from "react";
import axios from "axios";
import imageCompression from "browser-image-compression";
import "./App.css";

function App() {
  const [files, setFiles] = useState([]);

  async function handleSubmit() {
    for (const file of files) {
      const options = {
        maxSizeMB: 4,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      console.log(compressedFile.size);
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
