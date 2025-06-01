import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';
import {footballers} from "./playerMetadata.js";
const port=5000;
const app=express();

app.use(cors({
    origin:"http://localhost:3000"
}))
app.use(express.json());


// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Now this works
const descriptors = JSON.parse(fs.readFileSync(path.join(__dirname, 'descriptors.json')));
function euclideanDist(vec1,vec2){
    let sum=0;
    for(let i=0;i<vec1.length;i++){
        sum+=Math.pow(vec1[i]-vec2[i],2);
    }
    return Math.sqrt(sum);
}
app.post("/match", (req, res) => {
  try {
    const { descriptorArray } = req.body;

    if (!Array.isArray(descriptorArray) || descriptorArray.length !== 128) {
      return res.status(400).json({ error: "Descriptor must be a 128-length array" });
    }

    // Now descriptorArray is an array of floats as you expect
    // Use it directly for comparison

    let bestMatch = null;
    let lowestDistance = Infinity;

    // Suppose you have a 'descriptors' array with known faces, each like:
    // { name: "player1", descriptor: [128 floats] }

    for (const known of descriptors) {
      const dist = euclideanDist(descriptorArray, known.descriptor);
      if (dist < lowestDistance) {
        lowestDistance = dist;
        bestMatch = known;
      }
    }
    console.log("bestmatch",bestMatch);
    const playerDetails=footballers[bestMatch.name];
    console.log("playerDetails",playerDetails);
    const threshold = 0.5;
    if (lowestDistance < threshold) {
      res.json(playerDetails);
    } else{
      res.json([]); 
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});


app.get("/",(req,res)=>{
    console.log("server is running.......");
    res.send("server is running.......");
})

app.listen(port,()=>console.log(`server started at ${port}`));
