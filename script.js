async function analyzeImage(file) {
    const reader = new FileReader();
  
    reader.onload = async (e) => {
      const imageData = e.target.result;
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = 'Analyzing...';
  
      try {
        const response = await fetch('http://localhost:3000/analyze', {  // **IMPORTANT:  Adjust URL if your server is running elsewhere**
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
        displayResults(data);
      } catch (error) {
        console.error('Error analyzing image:', error);
        resultDiv.innerHTML = 'Failed to analyze image.';
      }
    };
  
    reader.onerror = () => {
      console.error("Error reading file:", reader.error);
      const resultDiv = document.getElementById('result');
      resultDiv.innerHTML = 'Failed to read the image file.';
    };
  
    reader.readAsDataURL(file);
  }
  
  function displayResults(data) {
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = ''; // Clear previous results
  
    if (data && data.outputs && data.outputs.length > 0 && data.outputs[0].data && data.outputs[0].data.concepts) {
      const concepts = data.outputs[0].data.concepts;
      const description = concepts.map((concept) => concept.name).join(', ');
      resultDiv.innerHTML += `<p><strong>Description:</strong> ${description}</p>`;
      // Add more logic here to rate the image, suggest improvements, and display comparable images
    } else {
      resultDiv.innerHTML = '<p>No results found.</p>'; // Handle cases with no concepts
      console.warn("No concepts returned from Clarifai API."); // Log the issue
    }
  }
  
  // Event listener to trigger the analysis when a file is selected
  document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      analyzeImage(file);
    }
  });