import { S3Client, ListBucketsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

async function testS3Access() {
  console.log('=== Testing AWS S3 Access ===');
  console.log('AWS_REGION:', process.env.AWS_REGION || 'NOT SET');
  console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET || 'NOT SET');
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');

  const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-2',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  try {
    console.log('\nTesting S3 client...');
    const command = new ListBucketsCommand({});
    const response = await s3Client.send(command);
    console.log('✅ S3 access successful!');
    console.log('Available buckets:', response.Buckets?.map(b => b.Name) || []);
    
    // Test specific bucket access
    if (process.env.AWS_S3_BUCKET) {
      console.log(`\nTesting access to bucket: ${process.env.AWS_S3_BUCKET}`);
      const listCommand = new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET,
        MaxKeys: 1
      });
      await s3Client.send(listCommand);
      console.log('✅ Bucket access successful!');
    }
  } catch (error) {
    console.error('❌ S3 access failed:');
    console.error('Error:', error.message);
    console.error('Code:', error.Code);
    console.error('Status:', error.$metadata?.httpStatusCode);
  }
}

testS3Access(); 