const axios = require("axios");
const fs = require("fs");

exports.getPredictionFromModel = async (imagePath) => {
  const imageData = fs.readFileSync(imagePath);

  const response = await axios.post(
    "http://localhost:5000/predict",
    imageData,
    {
      headers: {
        "Content-Type": "application/octet-stream",
      },
    }
  );

  return response.data;
};
