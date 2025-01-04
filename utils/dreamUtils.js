export const generateDreamImage = async (description) => {
  try {
    // First, search for images based on the description
    const searchResponse = await fetch(
      `https://lexica.art/api/v1/search?q=${encodeURIComponent(description + " dream surreal ethereal")}`,
      {
        method: 'GET',
      }
    );

    if (!searchResponse.ok) {
      throw new Error('Failed to search for images');
    }

    const searchData = await searchResponse.json();
    
    // Get the first image from the results
    if (searchData.images && searchData.images.length > 0) {
      // Return the high-resolution image URL
      return searchData.images[0].src;
    } else {
      throw new Error('No images found');
    }

  } catch (error) {
    console.error('Error getting dream image:', error);
    // Return a default dream-like image URL if the API fails
    return 'https://source.unsplash.com/random/800x800/?dream,surreal';
  }
}; 