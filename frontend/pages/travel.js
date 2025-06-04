import { useState, useEffect } from "react";
import Head from "next/head";
import { Typography, Container } from "@mui/material";
import axios from "axios";
import ChatBox from "../components/ChatBox";

const baseURL = "http://localhost:4000";

export default function TravelPage() {
  const [promptDetails, setPromptDetails] = useState(null);

  useEffect(() => {
    fetchPrompt();
  }, []);

  const fetchPrompt = async () => {
    try {
      const res = await axios.get(`${baseURL}/prompts/prompt?prompt_name=ai_travel_agent.json`);
      setPromptDetails(res.data.prompt.Version[1]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container sx={{ py: 4 }}>
      <Head>
        <title>Your AI Travel Agent</title>
      </Head>

      <Typography variant="h3" gutterBottom textAlign="center">
        Your AI Travel Agent!
      </Typography>

      {promptDetails && (
        <ChatBox
          aiDefinition={promptDetails["AI Definition"]}
          aiInitialMessage={promptDetails["AI Initial Message"]}
        />
      )}
    </Container>
  );
}