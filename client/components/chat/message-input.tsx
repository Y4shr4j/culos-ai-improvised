import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { api } from "../../src/utils/api";
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

interface Message {
  _id?: string;
  id: string;
  sessionId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: string;
  userId: string;
}

interface ChatSession {
  _id?: string;
  id: string;
  characterId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatResponse {
  message: Message;
  session: ChatSession;
}

interface MessageInputProps {
  sessionId: string;
  character: Character;
}

export default function MessageInput({ sessionId, character }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string): Promise<ChatResponse> => {
      const response = await api.post(`/chat/sessions/${sessionId}/messages`, { content });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/chat/sessions/${sessionId}/messages`] });
      setMessage("");
    },
    onError: (error: any) => {
      console.error("Error sending message:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(message.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="p-4 sm:p-6 border-t border-[#FCEDBC]/20 bg-[#2A2A2A]">
      <form onSubmit={handleSubmit} className="flex gap-3 sm:gap-4">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${character.name}...`}
            className="w-full p-3 sm:p-4 bg-[#171717] border border-[#FCEDBC]/20 rounded-lg text-[#FCEDBC] placeholder-[#FCEDBC]/50 font-norwester text-sm sm:text-base resize-none focus:outline-none focus:border-[#FCEDBC]/40 min-h-[44px] max-h-32"
            rows={1}
            disabled={sendMessageMutation.isPending}
          />
        </div>
        <motion.button
          type="submit"
          disabled={!message.trim() || sendMessageMutation.isPending}
          className="bg-[#FCEDBC] text-[#2A2A2A] p-3 sm:p-4 rounded-lg hover:bg-[#F8C679] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px] min-h-[44px]"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {sendMessageMutation.isPending ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#2A2A2A]"></div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </motion.button>
      </form>
    </div>
  );
}