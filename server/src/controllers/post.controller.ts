import { Request, Response } from 'express';
import { PostModel } from '../models/post';

// Get all posts with pagination and filtering
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    console.log('Getting all posts with query:', req.query);
    
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const type = req.query.type as string;
    const search = req.query.search as string;
    
    const skip = (page - 1) * limit;
    let query: any = {};
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    console.log('MongoDB query:', query);
    
    const posts = await PostModel.find(query)
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await PostModel.countDocuments(query);
    
    console.log(`Found ${posts.length} posts out of ${total} total`);
    
    res.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all posts error:', error);
    res.status(500).json({ message: 'Error fetching posts' });
  }
};

// Get post by ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const post = await PostModel.findById(req.params.id)
      .populate('author', 'name email');
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    res.json({ post });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({ message: 'Error fetching post' });
  }
};

// Create new post
export const createPost = async (req: Request, res: Response) => {
  try {
    console.log('Creating post with body:', req.body);
    console.log('User ID:', req.user?._id);
    
    const { title, content, type, status, tags, featuredImage } = req.body;
    
    const post = await PostModel.create({
      title,
      content,
      type,
      status,
      tags: tags || [],
      featuredImage,
      author: req.user?._id
    });
    
    console.log('Post created successfully:', post);
    
    res.status(201).json({ 
      message: 'Post created successfully', 
      post 
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Error creating post' });
  }
};

// Update post
export const updatePost = async (req: Request, res: Response) => {
  try {
    const { title, content, type, status, tags, featuredImage, isActive } = req.body;
    
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    if (title) post.title = title;
    if (content) post.content = content;
    if (type) post.type = type;
    if (status) post.status = status;
    if (tags) post.tags = tags;
    if (featuredImage !== undefined) post.featuredImage = featuredImage;
    if (typeof isActive === 'boolean') post.isActive = isActive;
    
    // Set publishedAt if status changes to published
    if (status === 'published' && post.status !== 'published') {
      post.publishedAt = new Date();
    }
    
    await post.save();
    
    res.json({ 
      message: 'Post updated successfully', 
      post 
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({ message: 'Error updating post' });
  }
};

// Delete post
export const deletePost = async (req: Request, res: Response) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    await PostModel.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Error deleting post' });
  }
};

// Publish post
export const publishPost = async (req: Request, res: Response) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.status = 'published';
    post.publishedAt = new Date();
    await post.save();
    
    res.json({ 
      message: 'Post published successfully', 
      post 
    });
  } catch (error) {
    console.error('Publish post error:', error);
    res.status(500).json({ message: 'Error publishing post' });
  }
};

// Archive post
export const archivePost = async (req: Request, res: Response) => {
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    post.status = 'archived';
    await post.save();
    
    res.json({ 
      message: 'Post archived successfully', 
      post 
    });
  } catch (error) {
    console.error('Archive post error:', error);
    res.status(500).json({ message: 'Error archiving post' });
  }
}; 