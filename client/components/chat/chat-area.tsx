import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../src/utils/api";
import { useToast } from "../../hooks/use-toast";
import MessageList from "./message-list";
import MessageInput from "./message-input";
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

interface ChatSession {
  _id?: string;
  id: string;
  characterId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createSessionMutation = useMutation({
    mutationFn: async (characterId: string): Promise<ChatSession> => {
      const response = await api.post("/chat/sessions", { characterId });
      return response.data;
    },
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      onSessionCreated(session.id);
      queryClient.invalidateQueries({ queryKey: ["/chat/sessions"] });
      toast({
        title: "Chat session created",
        description: `Started chatting with ${selectedCharacter?.name}`,
      });
    },
    onError: (error: any) => {
      console.error("Error creating session:", error);
      toast({
        title: "Error",
        description: "Failed to create chat session",
        variant: "destructive",
      });
    },
  });

  const handleStartChat = () => {
    if (selectedCharacter) {
      createSessionMutation.mutate(selectedCharacter.id);
    }
  };

  if (!selectedCharacter) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#171717]">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-[#FCEDBC]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#FCEDBC]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-[#FCEDBC] font-norwester text-lg sm:text-xl mb-2">Select a Character</h3>
          <p className="text-[#FCEDBC]/60 text-sm sm:text-base">Choose a character from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#171717] min-h-0">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#FCEDBC]/20 bg-[#2A2A2A]">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src={selectedCharacter.avatar}
            alt={selectedCharacter.name}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover"
          />
          <div>
            <h2 className="text-[#FCEDBC] font-norwester text-lg sm:text-xl font-semibold">
              {selectedCharacter.name}
            </h2>
            <p className="text-[#FCEDBC]/60 text-xs sm:text-sm">
              {selectedCharacter.description}
            </p>
          </div>
        </div>
        
        {/* Mobile Character Profile Button */}
        <motion.button
          className="lg:hidden p-2 bg-[#FCEDBC]/10 rounded-lg text-[#FCEDBC] hover:bg-[#FCEDBC]/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="View character profile"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </motion.button>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col min-h-0">
        {currentSessionId ? (
          <>
            <MessageList sessionId={currentSessionId} character={selectedCharacter} />
            <MessageInput sessionId={currentSessionId} character={selectedCharacter} />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <div className="w-20 h-20 bg-[#FCEDBC]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <img
                  src={selectedCharacter.avatar}
                  alt={selectedCharacter.name}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              </div>
              <h3 className="text-[#FCEDBC] font-norwester text-xl sm:text-2xl mb-3">
                Start chatting with {selectedCharacter.name}
              </h3>
              <p className="text-[#FCEDBC]/60 text-sm sm:text-base mb-6 leading-relaxed">
                {selectedCharacter.personality}
              </p>
              <motion.button
                onClick={handleStartChat}
                disabled={createSessionMutation.isPending}
                className="bg-[#FCEDBC] text-[#2A2A2A] font-norwester py-3 px-6 rounded-[25px] text-sm sm:text-base hover:bg-[#F8C679] transition-colors disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px] flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {createSessionMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#2A2A2A]"></div>
                    Starting chat...
                  </div>
                ) : (
                  "Start Chat"
                )}
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}