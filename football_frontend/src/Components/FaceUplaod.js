import "./style1.css"
import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';
import axios from 'axios';
import { IoIosFootball } from "react-icons/io";
import { FaCloudDownloadAlt } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";
import { LuLoaderCircle } from "react-icons/lu";
import Card from "./card.js";

const FaceUpload = () => {
  const imageRef = useRef();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [errorLoadingModels, setErrorLoadingModels] = useState(false); 
  useEffect(() => {
    console.log('Attempting to load models...');
    const loadModels = async () => {
      const MODEL_URL = '/models'; 
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        setErrorLoadingModels(false);
        console.log('Models loaded successfully! You can now upload an image.');
      } catch (err) {
        console.error('Error loading models:', err);
        setErrorLoadingModels(true); 
        setModelsLoaded(false); 
      }
    };
    loadModels();
  }, []); 
  const handleImageUpload = async (event) => {
    console.log('handleImageUpload triggered.');
    const file = event.target.files[0];
    if (!file) {
      console.log('No file selected.'); 
      setImageUrl(null);
      setResults([]);
      return;
    }

    console.log('File selected:', file.name); 
    const newImageUrl = URL.createObjectURL(file);
    setImageUrl(newImageUrl);
    setResults([]);
  };
  useEffect(() => {
  const runFaceDetection = async () => {
    if (imageUrl && modelsLoaded && imageRef.current) {
      console.log('Running face detection...');
      setLoading(true);
      try {
        const detections = await faceapi
          .detectAllFaces(
            imageRef.current,
            new faceapi.SsdMobilenetv1Options()
          )
          .withFaceLandmarks()
          .withFaceDescriptors();

        console.log('Number of faces detected:', detections.length);

        if (detections.length === 0) {
          console.log('No faces detected in the image.');
          setResults([]);
          return;
        }

        const matches = await Promise.all(
          detections.map(async ({ descriptor }) => {
            const descriptorArray = Array.from(descriptor);
            const descriptorJson = JSON.stringify(descriptorArray);
            console.log('DescriptorArray:', descriptorArray);

            try {
              const response = await axios.post('http://localhost:5000/match', { descriptorArray });
              return response.data;
            } catch (axiosError) {
              console.error('Error matching face on backend:', axiosError);
              return { name: 'Unknown', error: true };
            }
          })
        );

        setResults(matches);
        console.log('Matching results:', matches);
      } catch (error) {
        console.error('Face detection or matching failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    } else if (!imageUrl && !loading) {
      setResults([]);
    }
    console.log('Current modelsLoaded state:', modelsLoaded);
  };

  runFaceDetection();
}, [imageUrl, modelsLoaded]);

  return (
    <div className="container">
      <div className="heading">
        <div><h1>footBaller.</h1></div>
        <div><h2>inf</h2></div>
        <div><IoIosFootball className="icon1"/></div>
      </div>
      <div className="upload-container">
        <div className="uploader">
            <label for="image-upload" className="upload-label">
                <div className="upload-label-sub">
                    <div>Upload Image</div>
                    <div><FaCloudDownloadAlt/></div>
                </div>
            </label>
            <input type="file" onChange={handleImageUpload} accept="image/*" disabled={!modelsLoaded} id="image-upload"/>
            {imageUrl &&(<img ref={imageRef} src={imageUrl} style={{display:"none"}} />)}
        </div>
        <div className="about">
            <div className="para"><div className="icon2"><IoIosInformationCircleOutline/></div><div><p>Upload a photo related to football players and we will provide info about them</p></div></div>
            <div className="para"><div className="icon2"><IoIosInformationCircleOutline/></div><div><p>Our models will detect the faces in the image and find the best match to provide info to you</p></div></div>
            <div className="para"><div className="icon2"><IoIosInformationCircleOutline/></div><div><p>Our model can find the players who played football in between 1980 to present time</p></div></div>
        </div>
      </div>
      {loading && (
        <div className="loader-overlay">
          <div className="loader-content">
            <LuLoaderCircle className="rotating-icon" size={50} />
            <p>Analysing the image, please wait...</p>
          </div>
        </div>
      )}
      <div className="resultsContainer">
        {results.map((player,index) =>{
          return player&&Object.keys(player).length>0?<Card  key= {index} player={player}/>:null;
        })}
      </div>
    </div>
  );
}

export default FaceUpload;