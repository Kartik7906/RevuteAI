import React, { useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'font-awesome/css/font-awesome.min.css';
import 'alertifyjs/build/css/alertify.min.css';

const Task1 = () => {

  useEffect(() => {
    const loadScripts = () => {
      // Load MediaPipe FaceMesh
      const faceMeshScript = document.createElement("script");
      faceMeshScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js";
      faceMeshScript.async = true;
      document.body.appendChild(faceMeshScript);

      // Load Camera Utilities
      const cameraUtilsScript = document.createElement("script");
      cameraUtilsScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
      cameraUtilsScript.async = true;
      document.body.appendChild(cameraUtilsScript);

      return () => {
        document.body.removeChild(faceMeshScript);
        document.body.removeChild(cameraUtilsScript);
      };
    };

    loadScripts();
  }, []);

  return (
    <iframe
      src="/IntroPage.html"
      style={{ width: "100%", height: "100vh", border: "none" }}
      title="Project2"
    ></iframe>
  );
};

export default Task1;
