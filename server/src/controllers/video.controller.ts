import { Request, Response } from 'express';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { VideoModel, IVideo } from '../models/video';
import { uploadToS3, deleteFromS3 } from '../utils/s3';
import { UserModel } from '../models/user';

export const uploadVideo = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { originalname, mimetype, buffer, size } = req.file;
    const { title, description, category, tags, isBlurred, blurIntensity, unlockPrice, duration } = req.body;

    // Validate video file type
    if (!mimetype.startsWith('video/')) {
      return res.status(400).json({ message: 'File must be a video' });
    }

    // Upload to S3 with videos folder
    const fileUrl = await uploadToS3({
      originalname,
      mimetype,
      buffer,
      size
    }, 'videos');

    // Create video record
    const video = new VideoModel({
      url: fileUrl,
      title: title || originalname,
      description,
      category,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      isBlurred: isBlurred ? isBlurred === 'true' : true,
      blurIntensity: blurIntensity ? parseInt(blurIntensity) : 80,
      uploadedBy: req.user._id,
      duration: duration ? parseInt(duration) : 0,
      size,
      mimeType: mimetype,
      unlockPrice: unlockPrice ? parseInt(unlockPrice) : 1
    });

    await video.save();
    
    res.status(201).json(video);
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ message: 'Error uploading video' });
  }
};

export const getVideos = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      isBlurred, 
      isActive = true,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter: any = { isActive };
    
    if (category) {
      filter.category = category;
    }
    
    if (isBlurred !== undefined) {
      filter.isBlurred = isBlurred === 'true';
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search as string, 'i')] } }
      ];
    }

    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    const skip = (Number(page) - 1) * Number(limit);
    
    const videos = await VideoModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('uploadedBy', 'name email username')
      .lean();

    const total = await VideoModel.countDocuments(filter);
    
    res.json({
      videos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ message: 'Error fetching videos' });
  }
};

export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const video = await VideoModel
      .findById(id)
      .populate('uploadedBy', 'name email username');
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ message: 'Error fetching video' });
  }
};

export const updateVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates.uploadedBy;
    delete updates.url;
    delete updates.size;
    delete updates.mimeType;
    
    const video = await VideoModel.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ message: 'Error updating video' });
  }
};

export const deleteVideo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const video = await VideoModel.findById(id);
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    // Delete from S3
    try {
      await deleteFromS3(video.url);
      if (video.thumbnailUrl) {
        await deleteFromS3(video.thumbnailUrl);
      }
    } catch (s3Error) {
      console.error('Error deleting from S3:', s3Error);
      // Continue with database deletion even if S3 deletion fails
    }
    
    // Delete from database
    await VideoModel.findByIdAndDelete(id);
    
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({ message: 'Error deleting video' });
  }
};

export const toggleVideoBlur = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isBlurred } = req.body;
    
    const video = await VideoModel.findByIdAndUpdate(
      id,
      { isBlurred },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json(video);
  } catch (error) {
    console.error('Error toggling video blur:', error);
    res.status(500).json({ message: 'Error updating video' });
  }
};

export const incrementVideoViews = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const video = await VideoModel.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }
    
    res.json({ views: video.views });
  } catch (error) {
    console.error('Error incrementing video views:', error);
    res.status(500).json({ message: 'Error updating video views' });
  }
};