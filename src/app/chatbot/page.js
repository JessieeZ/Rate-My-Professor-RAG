'use client';

import Image from "next/image"
import { Box, Button, Stack, TextField, CircularProgress, Typography, AppBar, Toolbar, Container } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { styled } from '@mui/system';
import logo from '/public/images/icon_white.png'


const StyledButton = styled(Button)({
  borderRadius: '20px',
  textTransform: 'none',
  padding: '10px 20px',
});

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    setLoading(true);
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value || new Uint8Array(), { stream: true });
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1];
          const otherMessages = messages.slice(0, messages.length - 1);
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ];
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <>
      <Box sx={{background: 'linear-gradient(to right, #000000, #808080)'}}
      >
      <Toolbar sx={{ padding: '30px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <Image src={logo} alt="ProInsight Logo" width={125} height={125} />
        <div>
          <StyledButton color="inherit" href="/" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
            Home
          </StyledButton>
          <StyledButton color="inherit" href="/review" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
            Review
          </StyledButton>
          <StyledButton color="inherit" href="/search" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
            Search
          </StyledButton>
        </div>
      </Toolbar>
      <Box
        width="100vw"
        height="calc(100vh - 64px)"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="'linear-gradient(to right, #000000, #808080)'"
        pt={2}
      >
        <Typography variant="h5" component="h2" gutterBottom className="glowing-text" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FFFFFF', fontSize: '3rem', textAlign: 'center' }}>
          ProInsight AI
        </Typography>
        <Stack
          direction="column"
          width="100%"
          maxWidth="600px"
          height="80%"
          borderRadius={2}
          border="1px solid #ddd"
          boxShadow={3}
          p={2}
          spacing={2}
          bgcolor="background.paper"
        >
          <Stack
            direction="column"
            spacing={1}
            flexGrow={1}
            overflow="auto"
            p={1}
          >
            {messages.map((message, index) => (
              <Box
                key={index}
                display="flex"
                justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                mb={1}
              >
                <Box
                  bgcolor={message.role === 'assistant' ? '#353535' : '#5c5c5c'}
                  color="text.primary"
                  borderRadius={2}
                  p={2}
                  maxWidth="80%"
                  boxShadow={1}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: 'Cormorant Garamond, serif',
                      fontSize: '1rem',
                      color: '#FFFFFF'
                    }}
                  >
                    {message.content}
                  </Typography>
                </Box>
              </Box>
            ))}
            {loading && (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <CircularProgress />
              </Box>
            )}
            <div ref={endOfMessagesRef} /> {/* Auto-scroll reference */}
          </Stack>

          <Stack direction="row" spacing={1} p={1}>
            <TextField
              label="Type your message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage();
              }}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiInputBase-root': {
                  borderRadius: 2,
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              InputLabelProps={{
                sx: {
                  fontFamily: 'Cormorant Garamond, serif',
                },
              }}
            />
            <Button
              variant="contained"
              onClick={sendMessage}
              disabled={loading || message.trim() === ''}
              sx={{
                fontFamily: 'Cormorant Garamond, serif',
                height: '100%',
                borderRadius: 2,
                ':hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Send
            </Button>
          </Stack>
        </Stack>
      </Box>
      </Box>
    </>
  );
}
