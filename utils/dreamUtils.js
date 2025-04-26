export const generateDreamImage = async (description) => {
  try {
    // First resort: Free image generation API - no API key required
    try {
      // Using a public free AI image generator
      const prompt = `${description}, dreamlike, surreal, ethereal, dream scene`;
      
      // This is a free image generation endpoint that doesn't require authentication
      const response = await fetch(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`, {
        method: 'GET',
      });

      if (response.ok) {
        return response.url;
      }
      
      throw new Error('Image generation failed');
    } catch (error) {
      console.error('Primary image generation failed:', error);
      // Continue to fallbacks
    }

    // Fallback 1: Try another free image generator
    try {
      const prompt = encodeURIComponent(`${description}, dream, surreal, artistic`);
      // Another public API for generating images
      return `https://picsum.photos/seed/${prompt}/800/800`;
    } catch (error) {
      console.error('Secondary image generation failed:', error);
    }

    // Fallback 2: Try Unsplash with search query
    try {
      const searchQuery = encodeURIComponent(`${description} dream`);
      const unsplashUrl = `https://source.unsplash.com/800x800/?${searchQuery}`;
      
      const response = await fetch(unsplashUrl);
      if (response.ok) {
        return response.url;
      }
    } catch (error) {
      console.error('Unsplash fallback failed:', error);
    }

    throw new Error('All image sources failed');

  } catch (error) {
    console.error('Error getting dream image:', error);
    
    // Final fallback: Curated dream-like images
    const fallbackImages = [
      'https://images.unsplash.com/photo-1566345984367-fa2dacd82291?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1513829596324-4bb2800c5efb?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1536164261511-3a17e671d380?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&h=800&fit=crop',
      'https://images.unsplash.com/photo-1518066000714-58c45f1a2c0a?w=800&h=800&fit=crop'
    ];
    
    // Return a random image from the fallbacks
    return fallbackImages[Math.floor(Math.random() * fallbackImages.length)];
  }
}; 