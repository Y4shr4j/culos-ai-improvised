const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://rohitra4j:PhksnPNoPXYvNNhI@cluster0.y4tnegc.mongodb.net/culosAI?retryWrites=true&w=majority');

// Image Schema (simplified)
const imageSchema = new mongoose.Schema({
  url: String,
  title: String,
  // ... other fields
});

const ImageModel = mongoose.model('Image', imageSchema);

async function fixImageUrls() {
  try {
    console.log('Starting to fix image URLs...');
    
    // Get all images
    const images = await ImageModel.find({});
    console.log(`Found ${images.length} images to process`);
    
    const bucketName = process.env.AWS_S3_BUCKET || 'culosai-content';
    const region = process.env.AWS_REGION || 'us-east-2';
    
    for (const image of images) {
      // Check if URL is already a full URL
      if (image.url && !image.url.startsWith('http')) {
        // Convert key to full URL
        const fullUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${image.url}`;
        console.log(`Converting: ${image.url} -> ${fullUrl}`);
        
        // Update the image
        await ImageModel.findByIdAndUpdate(image._id, { url: fullUrl });
      } else {
        console.log(`Skipping (already full URL): ${image.url}`);
      }
    }
    
    console.log('Image URL fix completed!');
  } catch (error) {
    console.error('Error fixing image URLs:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixImageUrls(); 