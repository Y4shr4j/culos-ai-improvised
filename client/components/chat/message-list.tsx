import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/utils/api";
import { motion } from 'framer-motion';
import React from "react"; // Added missing import

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
  userId: string;
}

interface MessageListProps {
  sessionId: string;
  character: Character;
}

export default function MessageList({ sessionId, character }: MessageListProps) {
  const { data: messages, isLoading, refetch } = useQuery<Message[]>({
    queryKey: [`/chat/sessions/${sessionId}/messages`],
    queryFn: async () => {
      const response = await api.get(`/chat/sessions/${sessionId}/messages`);
      return response.data;
    },
    refetchInterval: 2000,
    staleTime: 0, // Always consider data stale to ensure fresh data
    gcTime: 0, // Don't cache this data
  });

  // Refetch when session changes
  React.useEffect(() => {
    if (sessionId) {
      refetch();
    }
  }, [sessionId, refetch]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCEDBC] mx-auto mb-4"></div>
          <p className="text-[#FCEDBC]/60 text-sm">Loading messages...</p>
        </div>
      </div>
    );
  }

  if (!messages || messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-[#FCEDBC]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#FCEDBC]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-[#FCEDBC] font-norwester text-lg mb-2">Start the conversation</h3>
          <p className="text-[#FCEDBC]/60 text-sm">Send a message to begin chatting with {character.name}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const isFirstInGroup = index === 0 || messages[index - 1].role !== message.role;
        const isLastInGroup = index === messages.length - 1 || messages[index + 1].role !== message.role;

        return (
          <motion.div
            key={message.id}
            className={`flex ${isUser ? "justify-end" : "justify-start"}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className={`flex items-end gap-2 sm:gap-3 max-w-[80%] sm:max-w-[70%] lg:max-w-[60%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
              {/* Avatar - Only show for assistant messages and first in group */}
              {!isUser && isFirstInGroup && (
                <div className="flex-shrink-0">
                  <img
                    src={character.avatar}
                    alt={character.name}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg object-cover"
                  />
                </div>
              )}
              
              {/* Spacer for user messages to align avatars */}
              {isUser && isFirstInGroup && (
                <div className="w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0"></div>
              )}

              {/* Message Bubble */}
              <div
                className={`px-4 py-3 rounded-2xl ${
                  isUser
                    ? "bg-[#FCEDBC] text-[#2A2A2A] rounded-br-md"
                    : "bg-[#2A2A2A] text-[#FCEDBC] rounded-bl-md border border-[#FCEDBC]/20"
                }`}
              >
                <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                
                {/* Timestamp */}
                <div className={`text-xs mt-2 ${isUser ? "text-[#2A2A2A]/60" : "text-[#FCEDBC]/40"}`}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}