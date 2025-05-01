import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_CHATURL as string,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_CHATKEY as string
);

const ChatPage = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [user, setUser] = useState<any>(null);
  const receiverId = 'receiver-id'; // replace with actual logic later

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };
    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new;
          if (
            msg.sender_id === user.id ||
            msg.receiver_id === user.id
          ) {
            setMessages((prev) => [...prev, msg]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const { data, error } = await supabase.from('messages').insert([
      {
        sender_id: user.id,
        receiver_id: receiverId,
        message: messageInput,
      },
    ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setMessageInput('');
    }
  };

  return (
    <div className="chat-container">
      <h1 className="text-xl font-bold">Chat</h1>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id} className="message">
            <p>
              <strong>{msg.sender_id}</strong>: {msg.message}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(msg.created_at).toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {user && (
        <form onSubmit={sendMessage} className="send-message-form">
          <input
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message"
            className="input"
          />
          <button type="submit" className="send-btn">
            Send
          </button>
        </form>
      )}
    </div>
  );
};

export default ChatPage;
