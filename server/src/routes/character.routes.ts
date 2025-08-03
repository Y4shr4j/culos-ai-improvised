import express from 'express';
import {
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  generateAICharacter
} from '../controllers/character.controller';
import { isAuthenticated, isAdmin } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(isAuthenticated, isAdmin);

// Character routes
router.get('/', getAllCharacters);
router.get('/:id', getCharacterById);
router.post('/', createCharacter);
router.put('/:id', updateCharacter);
router.delete('/:id', deleteCharacter);

// AI generation route
router.post('/generate', generateAICharacter);

export default router; 