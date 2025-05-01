import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_CHATURL as string, // Supabase URL
  process.env.NEXT_PUBLIC_SUPABASE_ANON_CHATKEY as string // Supabase anon key
);

const ChatPage = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [user, setUser] = useState<any>(null); // Assume this is coming from your sign-in logic

  useEffect(() => {
    const getUser = async () => {
      // Fetch the current user details
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Function to fetch chat messages
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('id, message, sender_id, receiver_id, created_at')
        .eq('sender_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else {
        setMessages(data);
      }
    };

    fetchMessages();

    // Real-time subscription to listen for new messages
    const subscription = supabase
      .from('messages')
      .on('INSERT', (payload: any) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (messageInput.trim() === '') return;

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          receiver_id: 'receiver-id', // Replace this with the actual receiver's user ID
          message: messageInput,
        },
      ]);

    if (error) {
      console.error('Error sending message:', error);
    } else {
      setMessages((prevMessages) => [...prevMessages, data[0]]);
      setMessageInput('');
    }
  };

  return (
    <div className="chat-container">
      <h1 className="text-xl font-bold">Chat</h1>
      <div className="messages">
        {messages.map((msg: any) => (
          <div key={msg.id} className="message">
            <p><strong>{msg.sender_id}</strong>: {msg.message}</p>
            <p>{new Date(msg.created_at).toLocaleString()}</p>
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
