import { useQuery } from "@tanstack/react-query";
import { api } from "../../src/utils/api";

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

interface Message {
  _id?: string;
  id: string;
  sessionId: string;
  userId: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface MessageListProps {
  sessionId: string;
  character: Character;
}

export default function MessageList({ sessionId, character }: MessageListProps) {
  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: [`/chat/sessions/${sessionId}/messages`],
    queryFn: async () => {
      const response = await api.get(`/chat/sessions/${sessionId}/messages`);
      return response.data;
    },
    refetchInterval: 2000, // Poll for new messages
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {messages?.map((message) => (
        <div
          key={message.id}
          className={`flex items-start gap-4 ${message.role === "user" ? "justify-end" : ""}`}>
          {message.role === "assistant" && (
            <img
              src={character.avatar}
              alt={character.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          )}
          <div
            className={`max-w-lg p-4 rounded-xl ${
              message.role === "user"
                ? "bg-yellow-400 text-gray-900"
                : "bg-gray-700 text-white"
            }`}>
            <p>{message.content}</p>
            <span className="text-xs text-gray-400 mt-2 block">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}