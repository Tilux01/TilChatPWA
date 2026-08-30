import React, { useState } from 'react';
import axios from 'axios';

const WitChat = () => {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');

  const handleSend = async () => {
    try {
      const result = await axios.get(
        `https://api.wit.ai/message`,
        {
          params: { q: message },
          headers: { 
            'Authorization': `Bearer 1316979436522049`,
            'Content-Type': 'application/json'
          }
        }
      );
      setResponse(JSON.stringify(result.data, null, 2));
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
      />
      <button onClick={handleSend}>Send</button>
      <pre>{response}</pre>
    </div>
  );
};

export default WitChat;