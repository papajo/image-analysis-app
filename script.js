async function analyzeImage(file) {
  const reader = new FileReader();

  reader.onload = async (e) => {
    const imageData = e.target.result;
    const resultDiv = document.getElementById('result');
    const progressDiv = document.getElementById('progress');

    resultDiv.innerHTML = '';
    //progressDiv.innerHTML = 'Analyzing image...'; // Remove this line

    // Create the spinner element
    const spinner = document.createElement('div');
    spinner.id = 'spinner'; // Give it an ID so CSS can style it
    progressDiv.appendChild(spinner);  // Add the spinner to the progress div


    try {
      const response = await fetch('http://localhost:3000/analyze', { // Adjust URL if needed
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ base64: imageData.split(',')[1] })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      //progressDiv.innerHTML = ''; // Remove this line
      progressDiv.removeChild(spinner); // Remove the spinner
      displayResults(data);
    } catch (error) {
      console.error('Error analyzing image:', error);
      //progressDiv.innerHTML = ''; // Remove this line
      if (progressDiv.contains(spinner)) {
          progressDiv.removeChild(spinner); // Remove the spinner (if it exists)
      }
      resultDiv.innerHTML = 'Failed to analyze image.';
    }
  };

  reader.onerror = () => {
    console.error("Error reading file:", reader.error);
    const resultDiv = document.getElementById('result');
    const progressDiv = document.getElementById('progress');
    //progressDiv.innerHTML = ''; // Remove this line
     if (progressDiv.contains(spinner)) {
          progressDiv.removeChild(spinner); // Remove the spinner (if it exists)
      }
    resultDiv.innerHTML = 'Failed to read the image file.';
  };

  reader.readAsDataURL(file);
}

function displayResults(data) {
  const resultDiv = document.getElementById('result');
  resultDiv.innerHTML = '';

  if (data && data.outputs && data.outputs.length > 0 && data.outputs[0].data && data.outputs[0].data.concepts) {
    const concepts = data.outputs[0].data.concepts;
    const description = concepts.map((concept) => concept.name).join(', ');
    resultDiv.innerHTML += `<p><strong>Description:</strong> ${description}</p>`;
    // Add more logic here to rate the image, suggest improvements, and display comparable images
  } else {
    resultDiv.innerHTML = '<p>No results found.</p>';
    console.warn("No concepts returned from Clarifai API.");
  }
}

document.getElementById('imageInput').addEventListener('change', function(event) {
  const file = event.target.files[0];
  if (file) {
    analyzeImage(file);
  }
});