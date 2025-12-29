import { GridFSBucket } from 'mongodb';
import { Readable } from 'stream';
import connectDB from './connection.js';

let bucket;

const getBucket = async () => {
  if (!bucket) {
    const db = await connectDB();
    bucket = new GridFSBucket(db, {
      bucketName: 'uploads'
    });
  }
  return bucket;
};

// Upload file to GridFS
export const uploadToGridFS = async (fileBuffer, filename, metadata = {}) => {
  const bucket = await getBucket();
  
  return new Promise((resolve, reject) => {
    const uploadStream = bucket.openUploadStream(filename, {
      metadata: {
        ...metadata,
        uploadedAt: new Date()
      }
    });
    
    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    
    readable.pipe(uploadStream)
      .on('error', reject)
      .on('finish', () => {
        resolve({
          fileId: uploadStream.id,
          filename: uploadStream.filename,
          metadata: uploadStream.options.metadata
        });
      });
  });
};

// Download file from GridFS
export const downloadFromGridFS = async (fileId) => {
  const bucket = await getBucket();
  
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(fileId);
    const chunks = [];
    
    downloadStream.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    downloadStream.on('error', (err) => {
      if (err.message.includes('FileNotFound')) {
        reject(new Error('File not found in GridFS'));
      } else {
        reject(err);
      }
    });
    
    downloadStream.on('end', () => {
      const buffer = Buffer.concat(chunks);
      resolve(buffer);
    });
  });
};

// Get file info from GridFS
export const getFileInfo = async (fileId) => {
  const bucket = await getBucket();
  const files = await bucket.find({ _id: fileId }).toArray();
  return files[0] || null;
};

// Delete file from GridFS
export const deleteFromGridFS = async (fileId) => {
  const bucket = await getBucket();
  await bucket.delete(fileId);
};

// Stream file directly to response
export const streamFileFromGridFS = async (fileId, res) => {
  const bucket = await getBucket();
  
  return new Promise((resolve, reject) => {
    const downloadStream = bucket.openDownloadStream(fileId);
    
    downloadStream.on('error', (err) => {
      reject(err);
    });
    
    downloadStream.on('end', () => {
      resolve();
    });
    
    downloadStream.pipe(res);
  });
};

// Check if file exists
export const fileExistsInGridFS = async (fileId) => {
  try {
    const fileInfo = await getFileInfo(fileId);
    return !!fileInfo;
  } catch (err) {
    return false;
  }
};

export default {
  uploadToGridFS,
  downloadFromGridFS,
  getFileInfo,
  deleteFromGridFS,
  streamFileFromGridFS,
  fileExistsInGridFS
};
