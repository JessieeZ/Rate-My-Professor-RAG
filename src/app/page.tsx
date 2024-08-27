'use client'

import Image from "next/image"
import Head from 'next/head';
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs"
import { Container, AppBar, Toolbar, Typography, Button, Box, Grid} from "@mui/material"
import { styled } from '@mui/system';
import logo from '/public/images/icon_white.png'
import RobotStudy from '/public/images/main.png'
import React, { useEffect, useState } from 'react';

interface TypingEffectProps {
  text: string;
}

const TypingEffect: React.FC<TypingEffectProps> = ({ text }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayText(text.substring(0, index + 1));
      index += 1;
      if (index === text.length) {
        clearInterval(interval);
      }
    }, 100); 

    return () => clearInterval(interval);
  }, [text]);

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
                <StyledButton color="inherit" href="/chatbot" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Chat
                </StyledButton>
                <StyledButton color="inherit" href="/review" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Review
                </StyledButton>
                <StyledButton color="inherit" href="/search" style={{ color:'#FFFFFF', fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem' }}>
                  Search
                </StyledButton>
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
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Image src={RobotStudy} alt="Study Image" width={650} height={475} />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </div>
      </Container>
    </BackgroundBox>
  )
}
