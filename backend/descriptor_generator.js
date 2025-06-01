const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');
const fs = require('fs');
const path = require('path');

// __dirname and __filename are available by default in CommonJS
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_PATH = path.join(__dirname, 'models');

async function loadModels() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH);
}

async function loadImage(imagePath) {
  return await canvas.loadImage(imagePath);
}

async function createDescriptor(imagePath) {
  const img = await loadImage(imagePath);
  const detections = await faceapi
    .detectSingleFace(img)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detections) {
    console.warn(`No face detected in image: ${imagePath}`);
    return null;
  }

  return detections.descriptor;
}

async function generateDescriptors() {
  await loadModels();

  const descriptors = [];
  const imageDir = path.join(__dirname, 'player_images');
  const imageFiles = fs.readdirSync(imageDir);

  for (const file of imageFiles) {
    const imagePath = path.join(imageDir, file);
    const descriptor = await createDescriptor(imagePath);
    if (descriptor) {
      descriptors.push({
        name: path.parse(file).name,
        descriptor: Array.from(descriptor),
      });
      console.log(`Processed: ${file}`);
    }
  }

  fs.writeFileSync(
    path.join(__dirname, 'descriptors.json'),
    JSON.stringify(descriptors, null, 2)
  );

  console.log('Descriptors saved to descriptors.json');
}

generateDescriptors();
