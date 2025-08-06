import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "../../lib/queryClient";

// Define types locally since shared/schema has ES module issues
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

interface ChatResponse {
  message: Message;
  session: ChatSession;
}

interface Message {
  _id?: string;
  id: string;
  sessionId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface ChatSession {
  _id?: string;
  id: string;
  characterId: string;
  createdAt: Date;
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
      const res = await apiRequest("POST", `/api/chat/sessions/${sessionId}/messages`, { content });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/chat/sessions/${sessionId}/messages`] });
      setMessage("");
    },
  });

  const handleSendMessage = () => {
    if (message.trim()) {
      sendMessageMutation.mutate(message);
    }
  };

  return (
    <div className="p-6 bg-[#23201A]">
      <p className="text-sm text-[#FCEDBC]/70 mb-2 font-norwester">Suggestion: Hi there! Ever traveled somewhere and just fell in love with it?</p>
      <div className="relative">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a message..."
          className="w-full bg-[#171717] rounded-lg pr-20 py-3 pl-4 text-[#FCEDBC] font-norwester resize-none focus:ring-2 focus:ring-[#FCEDBC] placeholder-[#FCEDBC]/40 border-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="text-[#FCEDBC]/60 hover:text-[#FCEDBC]">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={sendMessageMutation.isPending}
            size="icon"
            className="bg-[#CD8246] text-[#2A2A2A] rounded-full font-norwester hover:bg-[#FCEDBC] hover:text-[#2A2A2A] disabled:bg-[#FCEDBC]/40"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}