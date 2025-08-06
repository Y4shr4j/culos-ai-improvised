import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

export interface UploadedFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  // Remove explicit credentials to use AWS CLI credentials
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET || 'culosai-content';
const UPLOAD_FOLDER = process.env.AWS_S3_UPLOAD_FOLDER || 'ChatImage';

export const uploadToS3 = async (file: UploadedFile, folder: string = UPLOAD_FOLDER): Promise<string> => {
  const fileExtension = file.originalname.split('.').pop();
  // Use the provided folder or default to ChatImage
  const folderName = folder === 'videos' ? 'ChatVideo' : folder === 'images' ? 'ChatImage' : folder;
  const key = `${folderName}/${uuidv4()}.${fileExtension}`;

  console.log('>>> DEBUG S3 UPLOAD <<<');
  console.log('Bucket:', BUCKET_NAME);
  console.log('Key:', key);
  console.log('Region:', process.env.AWS_REGION);
  console.log('Access Key ID:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 10) + '...');
  console.log('Secret Key:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
  console.log('UPLOAD_FOLDER env var:', process.env.AWS_S3_UPLOAD_FOLDER);
  console.log('UPLOAD_FOLDER used:', UPLOAD_FOLDER);
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
  });

  try {
  await s3Client.send(command);
    console.log('>>> S3 UPLOAD SUCCESS <<<');
    // Return the full S3 URL instead of just the key
    const fullUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-2'}.amazonaws.com/${key}`;
    console.log('Full URL:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.log('>>> S3 UPLOAD ERROR <<<');
    console.error('Error details:', error);
    throw error;
  }
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  try {
    if (!key) return;

    // Extract the key from full URL if needed
    let s3Key = key;
    if (key.startsWith('http')) {
      const url = new URL(key);
      s3Key = url.pathname.substring(1); // Remove leading slash
    }

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    throw error;
  }
};

export const getSignedUrlForImage = async (key: string, expiresIn: number = 3600): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
};

export const streamToBuffer = (stream: Readable): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
};