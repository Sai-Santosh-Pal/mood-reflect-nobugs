import { Alert } from 'react-native';

const IMGBB_API_KEY = "9d1c67a0ea72097a70e086c48c838c35"; // Replace with your ImgBB API key

export const uploadImageToImgBB = async (uri) => {
  try {
    // Convert image to base64
    const response = await fetch(uri);
    const blob = await response.blob();
    const base64 = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });

    // Create form data
    const formData = new FormData();
    formData.append('image', base64);

    // Upload to ImgBB
    const result = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body: formData,
    });

    const data = await result.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error('Failed to upload image');
    }
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}; 