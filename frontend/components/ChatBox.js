import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Avatar,
  CircularProgress,
  Divider,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AssistantIcon from "@mui/icons-material/Assistant";
import ReactMarkdown from "react-markdown";
import axios from "axios";

const baseURL = "http://localhost:4000";

export default function ChatBox({ aiDefinition, aiInitialMessage }) {
  const [chatHistory, setChatHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    const initialMessages = [
      { role: "system", content: aiDefinition },
      { role: "assistant", content: aiInitialMessage },
    ];
    setChatHistory(initialMessages);
  }, [aiDefinition, aiInitialMessage]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [chatHistory]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = { role: "user", content: message };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${baseURL}/chat`, { message: newHistory }, {
        headers: { "Content-Type": "application/json" }
      });
      setChatHistory(response.data.message);
    } catch (err) {
      setError("Failed to fetch AI response.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (msg, idx) => {
    if (msg.role === "system") return null;
    const isUser = msg.role === "user";

    return (
      <Box key={idx} sx={{ mb: 2 }}>
        <Box display="flex" gap={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: isUser ? "primary.main" : "secondary.main" }}>
            {isUser ? <AccountCircleIcon /> : <AssistantIcon />}
          </Avatar>
          <Box sx={{ bgcolor: isUser ? "#e3f2fd" : "#f3e5f5", p: 2, borderRadius: 2, maxWidth: "80%" }}>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {msg.role === "assistant" ? <ReactMarkdown>{msg.content}</ReactMarkdown> : msg.content}
            </Typography>
          </Box>
        </Box>
        <Divider sx={{ my: 1 }} />
      </Box>
    );
  };

  return (
    <Box display="flex" flexDirection="column" height="80vh" width="100%" maxWidth="900px" mx="auto">
      <Paper sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
        {chatHistory.map(renderMessage)}
        {loading && (
          <Box display="flex" justifyContent="center" mt={2}>
            <CircularProgress />
          </Box>
        )}
        <div ref={chatEndRef} />
      </Paper>
      <Box display="flex" gap={2} mt={2}>
        <TextField
          fullWidth
          placeholder="Type your message..."
          variant="outlined"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <Button variant="contained" onClick={handleSendMessage} disabled={loading || !message.trim()}>
          Send
        </Button>
      </Box>
      {error && (
        <Typography color="error" mt={2}>
          {error}
        </Typography>
      )}
    </Box>
  );
}