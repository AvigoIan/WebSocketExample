import React, { useEffect, useState } from "react";

const App: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>("");
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Create a WebSocket connection
    const ws = new WebSocket("ws://localhost:3000");

    // Handle WebSocket connection open
    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    // Handle incoming messages
    ws.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    // Handle WebSocket connection close
    ws.onclose = (event) => {
      console.log(
        "WebSocket connection closed. Code: ",
        event.code,
        "Reason: ",
        event.reason
      );
    };

    // Handle WebSocket errors
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    // Set the WebSocket in state for later use
    setSocket(ws);

    // Cleanup on component unmount
    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(input);
      setInput(""); // Clear the input field
    } else {
      console.warn("WebSocket is not open");
    }
  };

  return (
    <div>
      <h1>WebSocket Chat</h1>
      <div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message"
        />
        <button onClick={sendMessage} disabled={!input.trim()}>
          Send
        </button>
      </div>
      <div>
        <h2>Messages:</h2>
        <ul>
          {messages.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default App;
