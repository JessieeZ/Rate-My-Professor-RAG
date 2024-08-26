'use client'

import { Box, Button, Stack, TextField, CircularProgress, Typography, AppBar, Toolbar } from '@mui/material'
import { useState } from 'react'
import { PineconeClient } from '@pinecone-database/pinecone';


export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm the Rate My Professor support assistant. How can I help you today?`,
    },
  ])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [link, setLink] = useState('')
  const [linkLoading, setLinkLoading] = useState(false)
  const [linkStatus, setLinkStatus] = useState('')
  

  const sendMessage = async () => {
    if (message.trim() === '') return;

    setLoading(true)
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([...messages, { role: 'user', content: message }]),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let result = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value || new Uint8Array(), { stream: true })
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1]
          const otherMessages = messages.slice(0, messages.length - 1)
          return [
            ...otherMessages,
            { ...lastMessage, content: lastMessage.content + text },
          ]
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
      setMessage('')
    }
  }

  /*
  const submitLink = async () => {
    if (link.trim() === '') return;

    setLinkLoading(true);
    setLinkStatus('');

    try {
      const response = await fetch('/api/submitURL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: 'https://www.ratemyprofessors.com/ShowRatings.jsp?tid=1234567' }),

      });

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        setLinkStatus(data.message || 'Link submitted successfully!');
      } else {
        const text = await response.text();
        console.error('Unexpected response type:', contentType, text);
        setLinkStatus('Unexpected response format.');
      }
    } catch (error) {
      console.error('Error submitting link:', error);
      setLinkStatus('Error submitting link.');
    } finally {
      setLinkLoading(false);
      setLink('');
    }
  };*/
  

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#B2C3D3' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ textAlign: 'center', flexGrow: 1, fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem' }}>
            Rate My Professor 
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        width="100vw"
        height="calc(100vh - 64px)" 
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        bgcolor="background.default"
        pt={2}
      >
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
                  bgcolor={message.role === 'assistant' ? '#B2C3D3' : '#ebeff4'}
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
                      fontSize: '1rem' 
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
          </Stack>

          <Stack direction="row" spacing={1} p={1}>
            <TextField
              label="Type your message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') sendMessage()
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
                  fontFamily: 'Cormorant Garamond, serif'
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
          
          {/* Section for Link Submission */}
          {/*
          <Stack direction="column" spacing={2} p={2}>
            <TextField
              label="Submit Professor Link"
              fullWidth
              value={link}
              onChange={(e) => setLink(e.target.value)}
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              onClick={submitLink}
              disabled={linkLoading || link.trim() === ''}
            >
              Submit Link
            </Button>
            {linkLoading && <CircularProgress />}
            {linkStatus && <Typography variant="body2">{linkStatus}</Typography>}
          </Stack>
          */}
        </Stack>
      </Box>
    </>
  )
}
