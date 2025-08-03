import { Request, Response } from 'express';
import { CharacterModel } from '../models/character';

// Get all characters with pagination and filtering
export const getAllCharacters = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const search = req.query.search as string;
    
    const skip = (page - 1) * limit;
    let query: any = {};
    
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { personality: { $regex: search, $options: 'i' } }
      ];
    }
    
    const characters = await CharacterModel.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await CharacterModel.countDocuments(query);
    
    res.json({
      characters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all characters error:', error);
    res.status(500).json({ message: 'Error fetching characters' });
  }
};

// Get character by ID
export const getCharacterById = async (req: Request, res: Response) => {
  try {
    const character = await CharacterModel.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    res.json({ character });
  } catch (error) {
    console.error('Get character by ID error:', error);
    res.status(500).json({ message: 'Error fetching character' });
  }
};

// Create new character
export const createCharacter = async (req: Request, res: Response) => {
  try {
    const { name, description, personality, image, category, tags } = req.body;
    
    const character = await CharacterModel.create({
      name,
      description,
      personality,
      image,
      category,
      tags: tags || [],
      createdBy: req.user?._id
    });
    
    res.status(201).json({ 
      message: 'Character created successfully', 
      character 
    });
  } catch (error) {
    console.error('Create character error:', error);
    res.status(500).json({ message: 'Error creating character' });
  }
};

// Update character
export const updateCharacter = async (req: Request, res: Response) => {
  try {
    const { name, description, personality, image, category, tags, isActive } = req.body;
    
    const character = await CharacterModel.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    if (name) character.name = name;
    if (description) character.description = description;
    if (personality) character.personality = personality;
    if (image) character.image = image;
    if (category) character.category = category;
    if (tags) character.tags = tags;
    if (typeof isActive === 'boolean') character.isActive = isActive;
    
    await character.save();
    
    res.json({ 
      message: 'Character updated successfully', 
      character 
    });
  } catch (error) {
    console.error('Update character error:', error);
    res.status(500).json({ message: 'Error updating character' });
  }
};

// Delete character
export const deleteCharacter = async (req: Request, res: Response) => {
  try {
    const character = await CharacterModel.findById(req.params.id);
    if (!character) {
      return res.status(404).json({ message: 'Character not found' });
    }
    
    await CharacterModel.findByIdAndDelete(req.params.id);
    
    res.json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error('Delete character error:', error);
    res.status(500).json({ message: 'Error deleting character' });
  }
};

// Generate AI character
export const generateAICharacter = async (req: Request, res: Response) => {
  try {
    const { prompt, category } = req.body;
    
    // This would integrate with an AI service like OpenAI
    // For now, we'll create a placeholder character
    const character = await CharacterModel.create({
      name: `AI Generated Character`,
      description: `AI generated character based on prompt: ${prompt}`,
      personality: `AI generated personality based on prompt: ${prompt}`,
      image: `https://via.placeholder.com/300x400?text=AI+Character`,
      category: category || 'AI Generated',
      tags: ['ai-generated', 'character'],
      createdBy: req.user?._id
    });
    
    res.status(201).json({ 
      message: 'AI character generated successfully', 
      character 
    });
  } catch (error) {
    console.error('Generate AI character error:', error);
    res.status(500).json({ message: 'Error generating AI character' });
  }
}; 