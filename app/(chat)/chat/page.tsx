import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/dal';
import ChatPageClient from './chat-client';

export default async function ChatPage() {
  const session = await verifySession();
  
  if (!session) {
    redirect('/login');
  }
  
  return <ChatPageClient />;
}
