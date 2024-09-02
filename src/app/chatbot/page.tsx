'use client';

import Image from "next/image";
import { Box, Button, Stack, TextField, CircularProgress, Typography, Toolbar, IconButton, Menu, MenuItem, useMediaQuery, useTheme } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { styled } from '@mui/system';
import logo from '/public/images/icon_white.png';
import MenuIcon from '@mui/icons-material/Menu'; 
import Link from 'next/link';
import "./page.css"

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

  const endOfMessagesRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (message.trim() === '') return;

    setLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
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

      if (!response.body) throw new Error('Response body is null');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        result += decoder.decode(value, { stream: true });
        setMessages((prevMessages) => {
          const lastMessage = prevMessages[prevMessages.length - 1];
          const otherMessages = prevMessages.slice(0, -1);
          return [
            ...otherMessages,
            { ...lastMessage, content: result },
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

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Box 
        sx={{
          width: '100vw',
          background: 'linear-gradient(to right, #000000, #808080)',
          margin: 0, 
          padding: 0,
          overflowX: 'hidden', // Ensure no horizontal scrolling
        }}>
        <Toolbar sx={{ padding: '30px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <Link href="/" passHref>
            <Image src={logo} alt="ProInsight Logo" width={125} height={125} />
          </Link>
          <div>
            {isMobile && (
              <div className="mobile-menu">
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  aria-controls="mobile-menu"
                  aria-haspopup="true"
                  onClick={handleMenuOpen}
                >
                  <MenuIcon sx={{color: '#FFFFFF'}}/>
                </IconButton>
                <Menu
                  id="mobile-menu"
                  anchorEl={anchorEl}
                  keepMounted
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  sx={{
                    '& .MuiMenu-paper': {
                      backgroundColor: '#444444', 
                    },
                  }}
                >
                  <MenuItem onClick={handleMenuClose} component="a" href="/" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }} >Home</MenuItem>
                  <MenuItem onClick={handleMenuClose} component="a" href="/addProfessor" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>Add Professor</MenuItem>
                  {/*<MenuItem onClick={handleMenuClose} component="a" href="/search" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>Search</MenuItem>*/}
                </Menu>
              </div>
            )}
            
            {!isMobile && (
              <div className="desktop-menu">
                <StyledButton color="inherit" href="/" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Home
                </StyledButton>
                <StyledButton color="inherit" href="/addProfessor" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Add Professor
                </StyledButton>
                {/*<StyledButton color="inherit" href="/search" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Search
                </StyledButton>*/}
              </div>
            )}
          </div>
        </Toolbar>
        <div className="rowApp">
        <Box
          height="calc(100vh - 64px)"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          sx={{
            background: 'linear-gradient(to right, #000000, #808080)',
          }}
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
            fontFamily="Montserrat', sans-serif"
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
              <div ref={endOfMessagesRef} /> 
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
        <div className="filterBox">
        <div className="filterContainer">
          <div className="filterBox-title">
            <h1>Advanced Search</h1>
            <hr />
          </div>
          <div className="advancedSearch">
            <div style={{ marginBottom: 20 }} className="searchName">
              <label htmlFor="pName">Professor Name: </label>
              <select name="pName" id="pName">
              <option value="">Pick Professor</option>
              <option value="Alice Smith">Alice Smith</option>
              <option value="Emma Lore">Emma Lore</option>
              <option value="Emily Johnson">Emily Johnson</option>
              <option value="Jacob Williams">Jacob Williams</option>
                <option value="John Doe">John Doe</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }} className="searchClass">
              <label htmlFor="cName">Class: </label>
              <select name="cName" id="cName">
                <option value="">Pick Class</option>
                <option value="Algorithms">Algorithms</option>
                <option value="Calculus">Calculus</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Linear Algebra">Linear Algebra</option>
                <option value="Quantum Mechanics">Quantum Mechanics</option>
              </select>
            </div>

            <div className="searchRating">
              <label>Rating: </label>
              <div className="ratingContainer">
                <input type="radio" id="rating5" name="rating" value="5" />
                <label htmlFor="rating5">
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                </label>
              </div>
              <div className="ratingContainer">
                <input type="radio" id="rating4" name="rating" value="4" />
                <label htmlFor="rating4">
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9734;</span>
                </label>
              </div>

              <div className="ratingContainer">
                <input type="radio" id="rating3" name="rating" value="3" />
                <label htmlFor="rating3">
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9734;</span>
                  <span>&#9734;</span>
                </label>
              </div>
              <div className="ratingContainer">
                <input type="radio" id="rating2" name="rating" value="2" />
                <label htmlFor="rating2">
                  <span>&#9733;</span>
                  <span>&#9733;</span>
                  <span>&#9734;</span>
                  <span>&#9734;</span>
                  <span>&#9734;</span>
                </label>
              </div>

              <div className="ratingContainer">
                <input type="radio" id="rating1" name="rating" value="1" />
                <label htmlFor="rating1">
                  <span>&#9733;</span>
                  <span>&#9734;</span>
                  <span>&#9734;</span>
                  <span>&#9734;</span>
                  <span>&#9734;</span>
                </label>
              </div>
            </div>

            {/* <div className="applyButton">
              <button>Apply</button>
            </div> */}
          </div>
        </div>
      </div>
        </div>
      </Box>
      <style jsx>{`
        .desktop-menu {
          display: flex;
        }
        .mobile-menu {
          display: none;
        }
        @media (max-width: 768px) {
          .desktop-menu {
            display: none;
          }
          .mobile-menu {
            display: flex;
            align-items: center;
          }
        }
      `}</style>
    </>
  );
}
