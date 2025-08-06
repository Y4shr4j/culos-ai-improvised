import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import CharacterSidebar from "../../components/chat/character-sidebar";
import ChatArea from "../../components/chat/chat-area";
import Navbar from "../../components/Navbar";
import { useAuth } from "../../src/contexts/AuthContext"; 
import { useNavigate } from "react-router-dom";
import { api } from "../../src/utils/api";
import { useToast } from "../../hooks/use-toast";

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

export default function ChatPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );
  const [characterSessions, setCharacterSessions] = useState<
    Record<string, string>
  >({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const handleLogout = () => {
    logout();
  };

  // Only fetch data if user is authenticated
  const { data: characters, isLoading } = useQuery<Character[]>({
    queryKey: ["/chat/characters"],
    queryFn: async () => {
      const response = await api.get("/chat/characters");
      return response.data;
    },
    enabled: !!user, // Only run query if user is authenticated
  });

  // Fetch existing sessions for all characters (user-specific)
  const { data: sessions } = useQuery<{ id: string; characterId: string }[]>({
    queryKey: ["/chat/sessions"],
    queryFn: async () => {
      const response = await api.get("/chat/sessions");
      return response.data;
    },
    enabled: !!user, // Only run query if user is authenticated
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
    mutationFn: async (sessionId: string) => {
      const response = await api.delete(`/chat/sessions/${sessionId}/messages`);
      return response.data;
    },
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({
        queryKey: [`/chat/sessions/${sessionId}/messages`],
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

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#2A2A2A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCEDBC]"></div>
      </div>
    );
  }

  // Show loading while fetching data
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#2A2A2A]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCEDBC]"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return null;
  }

  return (
    <div className="h-screen bg-[#2A2A2A] text-[#FCEDBC] font-norwester flex flex-col overflow-hidden" style={{ margin: 0, padding: 0 }}>
      <Navbar user={user} tokens={user?.tokens || 0} onLogout={handleLogout} />
      <div className="flex flex-1 min-h-0">
        {/* Mobile Menu Overlay */}
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" style={{ display: 'none' }}></div>
        
        {/* Character Sidebar - Mobile Responsive */}
        <div className="w-full sm:w-80 lg:w-96 bg-[#2A2A2A] border-r border-[#FCEDBC]/20 flex-shrink-0 z-50">
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
        </div>

        {/* Chat Area - Responsive */}
        <div className="flex-1 flex flex-col min-w-0">
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
        </div>

        {/* Right Sidebar for Character Profile - Hidden on mobile */}
        <div className="hidden lg:block w-80 bg-[#2A2A2A] p-4 flex-shrink-0">
          {selectedCharacter && (
            <div className="flex flex-col items-center text-center h-full">
              <img
                src={selectedCharacter.avatar}
                alt={selectedCharacter.name}
                className="w-full h-56 object-cover rounded-t-[20px] rounded-b-none border-none"
              />
              <div className="p-4 w-full">
                <h2 className="text-2xl font-norwester mt-3 text-[#FCEDBC] mb-2">{selectedCharacter.name}</h2>
                <p className="text-sm text-[#FCEDBC]/70 text-center font-norwester leading-relaxed">{selectedCharacter.description}</p>
                <button className="mt-4 w-full bg-[#FCEDBC] text-[#2A2A2A] font-norwester py-2 px-4 rounded-[25px] text-sm hover:bg-[#F8C679] transition-colors">
                  Generate Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
