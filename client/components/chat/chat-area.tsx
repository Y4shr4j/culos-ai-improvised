import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import MessageList from "./message-list";
import MessageInput from "./message-input";
import { apiRequest } from "../../lib/queryClient";
import { useToast } from "../../hooks/use-toast";

// Define types locally since shared/api has ES module issues
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

interface ChatSession {
  _id?: string;
  id: string;
  characterId: string;
  createdAt: Date;
}

interface ChatAreaProps {
  selectedCharacter: Character | null;
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
}

export default function ChatArea({
  selectedCharacter,
  sessionId,
  onSessionCreated,
}: ChatAreaProps) {
  const { toast } = useToast();

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (characterId: string): Promise<ChatSession> => {
      const res = await apiRequest("POST", "/api/chat/sessions", { characterId });
      return res.json();
    },
    onSuccess: (session) => {
      onSessionCreated(session.id);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive",
      });
    },
  });

  // Create session when character changes and no session exists
  useEffect(() => {
    if (selectedCharacter && !sessionId && !createSessionMutation.isPending) {
      createSessionMutation.mutate(selectedCharacter.id);
    }
  }, [selectedCharacter, sessionId]);

  if (!selectedCharacter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-white mb-2">
            Select a Character
          </h2>
          <p className="text-gray-400">Choose an AI character to start chatting</p>
        </div>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-800">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-800">
      {/* Chat Header */}
      <div className="bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img
            src={selectedCharacter.avatar}
            alt={selectedCharacter.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <h2 className="font-semibold text-white text-lg">
            {selectedCharacter.name}
          </h2>
        </div>

        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-700">
          <Menu className="w-6 h-6" />
        </Button>
      </div>

      <MessageList sessionId={sessionId} character={selectedCharacter} />
      <MessageInput sessionId={sessionId} character={selectedCharacter} />
    </div>
  );
}