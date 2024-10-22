import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";

function Folder() {
  const params = useParams();
  return <div style={{ marginTop: "100px" }}>Folder</div>;
}

export default Folder;
