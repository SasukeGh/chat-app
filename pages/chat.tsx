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
  const [userHandle, setUserHandle] = useState<string | null>(null);
  const [handleInput, setHandleInput] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user);
    };

    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchHandle = async () => {
        const { data, error } = await supabase
          .from('users')
          .select('username')
          .eq('id', user.id)
          .single();

        if (data) {
          setUserHandle(data.username);
        } else if (error) {
          console.error('Error fetching handle:', error.message);
        }
      };

      fetchHandle();
    }
  }, [user]);

  const submitHandle = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase
      .from('users')
      .insert([{ id: user.id, username: handleInput }]);

    if (error) {
      console.error('Failed to save handle:', error.message);
    } else {
      setUserHandle(handleInput);
    }
  };

  useEffect(() => {
    if (!user || !userHandle) return;

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

    // Set up real-time subscription
    const subscription = supabase
      .from('messages')
      .on('INSERT', (payload: any) => {
        setMessages((prevMessages) => [...prevMessages, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeSubscription(subscription);
    };
  }, [user, userHandle]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (messageInput.trim() === '') return;

    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          sender_id: user.id,
          receiver_id: 'receiver-id', // Replace with actual receiver's ID
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

      {user && !userHandle && (
        <form onSubmit={submitHandle} className="handle-form">
          <input
            type="text"
            value={handleInput}
            onChange={(e) => setHandleInput(e.target.value)}
            placeholder="Choose a handle"
            className="input"
          />
          <button type="submit" className="submit-btn">
            Set Handle
          </button>
        </form>
      )}

      <div className="messages">
        {messages.map((msg: any) => (
          <div key={msg.id} className="message">
            <p><strong>{msg.sender_id}</strong>: {msg.message}</p>
            <p>{new Date(msg.created_at).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {userHandle && (
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
