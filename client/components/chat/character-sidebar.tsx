import { useState } from "react";
import { Search, Trash2 } from "lucide-react";
import { motion } from 'framer-motion';

interface Character {
  _id?: string;
  id: string;
  name: string;
  personality: string;
  traits: string[];
  description: string;
  avatar: string;
  systemPrompt: string;
}

interface CharacterSidebarProps {
  characters: Character[];
  selectedCharacter: Character | null;
  characterSessions: Record<string, string>;
  onCharacterSelect: (character: Character) => void;
  onClearChat: () => void;
}

export default function CharacterSidebar({
  characters,
  selectedCharacter,
  characterSessions,
  onCharacterSelect,
  onClearChat,
}: CharacterSidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCharacters = characters.filter((character) =>
    character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    character.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-[#2A2A2A] border-r border-[#FCEDBC]/20">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-[#FCEDBC]/20">
        <h2 className="text-culosai-cream font-norwester text-lg sm:text-xl mb-4">Characters</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-culosai-gold/60 w-4 h-4" />
          <input
            type="text"
            placeholder="Search characters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 bg-[#171717] border border-[#FCEDBC]/20 rounded-lg text-[#FCEDBC] placeholder-[#FCEDBC]/50 font-norwester text-sm sm:text-base focus:outline-none focus:border-[#FCEDBC]/40"
          />
        </div>
      </div>

      {/* Character List */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          {filteredCharacters.map((character) => {
            const isSelected = selectedCharacter?.id === character.id;
            const hasSession = characterSessions[character.id];
            
            return (
              <motion.div
                key={character.id}
                className={`relative p-3 sm:p-4 rounded-lg cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? "bg-[#FCEDBC]/10 border border-[#FCEDBC]/30"
                    : "bg-[#171717] hover:bg-[#171717]/80 border border-transparent"
                }`}
                onClick={() => onCharacterSelect(character)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Character Avatar */}
                  <div className="flex-shrink-0">
                    <img
                      src={character.avatar}
                      alt={character.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover"
                    />
                  </div>

                  {/* Character Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-culosai-cream font-norwester text-sm sm:text-base font-semibold truncate">
                        {character.name}
                      </h3>
                      {hasSession && (
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                      )}
                    </div>
                    <p className="text-culosai-gold/70 text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {character.description}
                    </p>
                    
                    {/* Traits */}
                    {character.traits && character.traits.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {character.traits.slice(0, 2).map((trait, index) => (
                          <span
                            key={index}
                            className="bg-culosai-accent-gold/20 text-culosai-accent-gold text-xs px-2 py-1 rounded-full"
                          >
                            {trait}
                          </span>
                        ))}
                        {character.traits.length > 2 && (
                          <span className="text-culosai-gold/60 text-xs">
                            +{character.traits.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clear Chat Button - Only show for selected character with session */}
                {isSelected && hasSession && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      onClearChat();
                    }}
                    className="absolute top-2 right-2 p-1 text-culosai-gold/60 hover:text-red-400 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    title="Clear chat history"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCharacters.length === 0 && (
          <div className="text-center py-8">
            <p className="text-culosai-gold/60 text-sm sm:text-base">
              {searchTerm ? "No characters found" : "No characters available"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}