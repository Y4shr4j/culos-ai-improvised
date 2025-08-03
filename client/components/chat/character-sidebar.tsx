import { Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";

// Define Character type locally since shared/schema has ES module issues
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

interface Message {
  _id?: string;
  id: string;
  sessionId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
}

interface CharacterSidebarProps {
  characters: Character[];
  selectedCharacter: Character | null;
  characterSessions: Record<string, string>;
  onCharacterSelect: (character: Character) => void;
  onClearChat: () => void;
}

// Component to display character with last message
function CharacterItem({ 
  character, 
  isSelected, 
  onSelect,
  sessionId
}: { 
  character: Character; 
  isSelected: boolean; 
  onSelect: () => void;
  sessionId?: string;
}) {
  // Fetch the last message for this character's session
  const { data: lastMessage } = useQuery<Message[]>({
    queryKey: sessionId ? [`/api/chat/sessions/${sessionId}/messages`] : null,
    enabled: !!sessionId,
  });

  const lastMessageText = lastMessage && lastMessage.length > 0 
    ? lastMessage[lastMessage.length - 1].content 
    : "Start a conversation...";

  return (
    <div
      onClick={onSelect}
      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected ? "bg-gray-700" : "hover:bg-gray-800"
      }`}
    >
      <div className="flex items-center space-x-3">
        <img
          src={character.avatar}
          alt={character.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white">{character.name}</h3>
          <p className="text-sm text-gray-400 truncate">{lastMessageText}</p>
        </div>
      </div>
    </div>
  );
}

export default function CharacterSidebar({
  characters,
  selectedCharacter,
  characterSessions,
  onCharacterSelect,
  onClearChat,
}: CharacterSidebarProps) {
  return (
    <div className="w-80 bg-gray-900 border-r border-gray-700 flex flex-col flex-shrink-0">
      {/* Sidebar Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-semibold text-white">CHAT</h1>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for profile..."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* Character List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {characters.map((character) => (
          <CharacterItem
            key={character.id}
            character={character}
            isSelected={selectedCharacter?.id === character.id}
            onSelect={() => onCharacterSelect(character)}
            sessionId={characterSessions[character.id]}
          />
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-700">
        <Button
          onClick={onClearChat}
          variant="outline"
          className="w-full bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Chat History
        </Button>
      </div>
    </div>
  );
}