import { useState, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import axios from 'axios';
import {
  Typography,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Grid,
  Container,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChatBox from '../components/ChatBox';

const baseURL = "http://localhost:4000";

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [currentPromptDetails, setCurrentPromptDetails] = useState(null);

  useEffect(() => {
    getPrompts();
    setPromptDetails('ai_travel_agent.json'); // Default prompt
  }, []);

  const getPrompts = async () => {
    try {
      const response = await axios.get(`${baseURL}/prompts`);
      setPrompts(response.data.prompts);
    } catch (err) {
      console.error(err);
    }
  };

  const setPromptDetails = async (prompt) => {
    try {
      const response = await axios.get(`${baseURL}/prompts/prompt?prompt_name=${prompt}`);
      setCurrentPromptDetails(response.data.prompt);
    } catch (err) {
      console.error(err);
    }
  };

  const DisplayPrompts = () => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center', mb: 4 }}>
      {prompts.map((prompt, idx) => (
        <Button
          key={idx}
          onClick={() => setPromptDetails(prompt)}
          variant='outlined'
        >
          {prompt.replace('.json', '')}
        </Button>
      ))}
    </Box>
  );

  const DisplayPromptAccordion = () => {
    if (!currentPromptDetails?.Version) return null;
    const prompt = currentPromptDetails.Version[1];

    return (
      <Accordion sx={{ width: '100%', maxWidth: '900px', mx: 'auto', mb: 4 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            {prompt.Name}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography sx={{ mb: 2 }}>
            <strong>AI Definition:</strong><br />
            {prompt["AI Definition"]}
          </Typography>
          <Typography>
            <strong>AI Initial Message:</strong><br />
            {prompt["AI Initial Message"]}
          </Typography>
        </AccordionDetails>
      </Accordion>
    );
  };

  const DisplayChat = () => {
    if (!currentPromptDetails?.Version) return null;
    const prompt = currentPromptDetails.Version[1];

    return (
      <ChatBox
        aiDefinition={prompt["AI Definition"]}
        aiInitialMessage={prompt["AI Initial Message"]}
      />
    );
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>AI Chat</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          p: 4,
        }}
      >
        <Container maxWidth="md">
          <Typography variant='h4' align='center' gutterBottom>
            Choose a Prompt
          </Typography>

          <DisplayPrompts />
          <DisplayPromptAccordion />

          <Typography variant="h3" align="center" gutterBottom>
            AI Chat
          </Typography>

          <Box sx={{ mt: 4 }}>
            <DisplayChat />
          </Box>
        </Container>
      </Box>
    </div>
  );
}