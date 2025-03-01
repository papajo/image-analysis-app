const express = require('express');
const bodyParser = require('body-parser');
const { ClarifaiStub, grpc } = require("clarifai-nodejs-grpc");
require('dotenv').config();
const cors = require('cors');  // Import the cors middleware

const app = express();
app.use(cors());  // Enable CORS for all routes
const limitValue = '30mb';
app.use(bodyParser.json({ limit: limitValue }));

// Initialize Clarifai (using API key from environment variables)
const stub = ClarifaiStub.grpc();

const metadata = new grpc.Metadata();
metadata.set("authorization", `Key ${process.env.CLARIFAI_API_KEY}`);



app.post('/analyze', async (req, res) => {
  const { base64 } = req.body;

  if (!base64) {
    return res.status(400).json({ error: 'Missing base64 image data' });
  }


  try {
    stub.PostModelOutputs(
        {
            model_id: "general-image-recognition",
            inputs: [
                {data: {image: {base64: base64}}}
            ]
        },
        metadata,
        (err, response) => {
            if (err) {
                console.log("Error: " + err);
                return res.status(500).json({error: 'Clarifai API error', details: err.message});
            }

            if (response.status.code !== 10000) {
                console.log("Received failed status: " + response.status.description + "\n" + response.status.details);
                return res.status(500).json({error: 'Clarifai API error', details: response.status.description});
            }

            console.log("Predicted concepts, with confidence values:");
            for (const concept of response.outputs[0].data.concepts) {
                console.log(concept.name + ": " + concept.value);
            }
            res.json(response);
        }
    );


  } catch (error) {
    console.error('Error analyzing image:', error);
    res.status(500).json({ error: 'Failed to analyze image.', details: error.message }); // Send JSON error response
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});