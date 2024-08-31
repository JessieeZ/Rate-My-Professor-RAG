'use client'

import Image from "next/image";
import Head from 'next/head';
import { Container, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme, Grid } from "@mui/material";
import { styled } from '@mui/system';
import MenuIcon from '@mui/icons-material/Menu'; 
import logo from '/public/images/icon_white.png';
import RobotStudy from '/public/images/main.png';
import React, { useEffect, useState } from 'react';

interface TypingEffectProps {
  text: string;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handleTyping = () => {
      if (!isDeleting) {
        setDisplayText((prev) => prev + text.charAt(index));
        setIndex((prev) => prev + 1);

        if (index === text.length) {
          setTimeout(() => setIsDeleting(true), 1000); 
        }
      } else {
        setDisplayText((prev) => prev.slice(0, -1));

        if (displayText.length === 0) {
          setIsDeleting(false);
          setIndex(0);
        }
      }
    };

    const timeout = setTimeout(handleTyping, isDeleting ? 100 : 100); 
    return () => clearTimeout(timeout);
  }, [index, isDeleting, text, displayText]);

  return (
    <div style={{
      fontSize: '3.5rem', 
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word', 
      textAlign: 'center',
      overflow: 'hidden', 
      maxWidth: '100%', 
      margin: '0 auto', 
    }}>
      {displayText}
    </div>
  );
};

const StyledButton = styled(Button)({
  borderRadius: '20px',
  textTransform: 'none',
  padding: '10px 20px',
});

const BackgroundBox = styled(Box)({
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  background: 'linear-gradient(to right, #000000, #808080)',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

export default function Home() {
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
    <BackgroundBox>
      <Container maxWidth="lg">
        <div id="home">
          <Head>
            <title>ProInsight</title>
            <meta name="description" content="" />
          </Head>

          <Toolbar sx={{ padding: '30px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Image src={logo} alt="ProInsight Logo" width={125} height={125} />
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
                    <MenuItem onClick={handleMenuClose} component="a" href="/chatbot" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }} >Chat</MenuItem>
                    <MenuItem onClick={handleMenuClose} component="a" href="/addProfessor" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>Add Professors</MenuItem>
                    {/*<MenuItem onClick={handleMenuClose} component="a" href="/search" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>Search</MenuItem>*/}
                  </Menu>
                </div>
              )}

              {!isMobile && (
                <div className="desktop-menu">
                  <StyledButton color="inherit" href="/chatbot" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                    Chat
                  </StyledButton>
                  <StyledButton color="inherit" href="/addProfessor" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                    Add Professors
                  </StyledButton>
                  {/*<StyledButton color="inherit" href="/search" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                    Search
                  </StyledButton>*/}
                </div>
              )}
            </div>
          </Toolbar>

          <Box sx={{ my: 0 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h2" component="h1" gutterBottom className="glowing-text" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', textAlign: 'center' }}>
                  <TypingEffect text="Guiding your choices, empowering your voice." />
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FFFFFF', fontSize: '1.5rem', textAlign: 'center' }}>
                  Welcome to ProInsight! ProInsight helps you find and evaluate professor reviews quickly. Just ask about teaching styles, course content, or classroom experiences, and get the info you need to make informed decisions.
                </Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <StyledButton href="/chatbot" variant="outlined" color="primary" sx={{ mt: 2 }} style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1rem', color: "#FFFFFF" }}>
                    Get Started
                  </StyledButton>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                {!isMobile && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Image src={RobotStudy} alt="Study Image" width={650} height={475} />
                  </Box>
                )}
                {isMobile && (
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Image src={RobotStudy} alt="Study Image" width={375} height={375} />
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </div>
      </Container>

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
    </BackgroundBox>
  );
}
