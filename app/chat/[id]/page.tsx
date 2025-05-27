import ChatInterface from "@/components/chat/chat-interface";

interface ChatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  return <ChatInterface conversationId={id} />;
}
