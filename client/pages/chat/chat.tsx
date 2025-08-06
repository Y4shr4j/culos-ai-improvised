import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CharacterSidebar from "../../components/chat/character-sidebar";
import ChatArea from "../../components/chat/chat-area";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../src/contexts/AuthContext"; 

// Define Character type locally since shared/api has ES module issues
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
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

export default function ChatPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [characterSessions, setCharacterSessions] = useState<
    Record<string, string>
  >({});

  const handleLogout = () => {
    logout();
  };

  const { data: characters, isLoading } = useQuery<Character[]>({
    queryKey: ["/api/chat/characters"],
  });

  // Fetch existing sessions for all characters
  const { data: sessions } = useQuery<{ id: string; characterId: string }[]>({
    queryKey: ["/api/chat/sessions"],
  });

  // Update character sessions when sessions data is available
  useEffect(() => {
    if (sessions) {
      const sessionMap: Record<string, string> = {};
      sessions.forEach(session => {
        sessionMap[session.characterId] = session.id;
      });
      setCharacterSessions(prev => ({ ...prev, ...sessionMap }));
    }
  }, [sessions]);

  const clearChatMutation = useMutation({
    mutationFn: (sessionId: string) =>
      apiRequest("DELETE", `/api/chat/sessions/${sessionId}/messages`),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: [`/api/chat/sessions/${sessionId}/messages`],
      });
      toast({
        title: "Chat Cleared",
        description: "Your chat history has been cleared.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear chat history.",
        variant: "destructive",
      });
    },
  });

  // Set default character when characters load
  if (characters && characters.length > 0 && !selectedCharacter) {
    setSelectedCharacter(characters[0]);
  }

  // Get current session ID for selected character
  const currentSessionId = selectedCharacter
    ? characterSessions[selectedCharacter.id] || null
    : null;

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#2A2A2A] text-[#FCEDBC] font-norwester flex flex-col overflow-hidden" style={{ margin: 0, padding: 0 }}>
      <Navbar user={user} tokens={user?.tokens || 0} onLogout={handleLogout} />
      <div className="flex flex-1 min-h-0">
        <CharacterSidebar
          characters={characters || []}
          selectedCharacter={selectedCharacter}
          characterSessions={characterSessions}
          onCharacterSelect={(character) => {
            setSelectedCharacter(character);
          }}
          onClearChat={() => {
            if (selectedCharacter && characterSessions[selectedCharacter.id]) {
              clearChatMutation.mutate(characterSessions[selectedCharacter.id]);
            }
          }}
        />
        <ChatArea
          selectedCharacter={selectedCharacter}
          sessionId={currentSessionId}
          onSessionCreated={(sessionId) => {
            if (selectedCharacter) {
              setCharacterSessions((prev) => ({
                ...prev,
                [selectedCharacter.id]: sessionId,
              }));
            }
          }}
        />
        {/* Right Sidebar for Character Profile */}
        <div className="w-80 bg-[#2A2A2A] p-4 flex-shrink-0">
          {selectedCharacter && (
            <div className="flex flex-col items-center text-center h-full">
              <img
                src={selectedCharacter.avatar}
                alt={selectedCharacter.name}
                className="w-full h-56 object-cover"
              />
              <h2 className="text-2xl font-norwester mt-3 text-[#FCEDBC]">{selectedCharacter.name}</h2>
              <p className="text-sm text-[#FCEDBC]/70 mt-2 text-center font-norwester">{selectedCharacter.description}</p>
              <button className="mt-4 bg-[#FCEDBC] text-[#2A2A2A] font-norwester py-2 px-4 rounded-[25px] text-sm hover:bg-[#F8C679] transition-colors">
                Generate Image
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
