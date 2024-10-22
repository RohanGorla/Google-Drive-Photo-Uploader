import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import "./index.css";

import App from "./App.jsx";
import Homepage from "./Components/Homepage.jsx";
import Gallery from "./Components/Gallery.jsx";
import Folder from "./Components/Folder.jsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<App />}>
        <Route path="" element={<Homepage />} />
        <Route path="gallery">
          <Route path="" element={<Gallery />} />
          <Route path="folder/:id" element={<Folder />} />
        </Route>
      </Route>
    </>
  )
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
