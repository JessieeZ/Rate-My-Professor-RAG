"use client";

import {
  Box,
  Button,
  Container,
  styled,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import Navbar from "../navbar";
import Link from 'next/link';

const BackgroundBox = styled(Box)({
  backgroundSize: "cover",
  backgroundPosition: "center",
  background: "linear-gradient(to right, #000000, #808080)",
  minHeight: "110vh",
  display: "flex",
  flexDirection: "column",
});

export default function Home() {
  const [website, setWebsite] = useState("");

  const getReviews = async () => {
    try{
      const response = await fetch(`http://localhost:3000/api/scrape`, {
        method: "POST",
        body: JSON.stringify({ website: website }),
      });
      const data = await response.json();
      if (response.ok) {
        alert(data.message); // Show a success message if URL is scraped successfully
      } else {
        alert(`Error: ${data.error}`); // Show an error message if something went wrong
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while scraping the website.');
    }
      setWebsite("");
  };

  return (
    <BackgroundBox>
      <Navbar />
      <Box
        sx={{
          flexGrow: "1",
          minWidth: "100%",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom className="glowing-text" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#FFFFFF', fontSize: '3rem', textAlign: 'center' }}>
          Add a Professor
        </Typography>
        {/* Instruction Box */}
        <Box
          sx={{
            width: "350px",
            mb: 2,
            p: 2,
            backgroundColor: "#444444",
            borderRadius: 2,
            boxShadow: 3,
            color: "white",
            textAlign: "center",
          }}
        >
          <div>
            <Typography 
                variant="h6" 
                component="p" 
                gutterBottom 
                style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem' }} 
            >
                How to add a Professor
            </Typography>
            <Typography 
                variant="body1" 
                component="p" 
                style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.25rem' }} 
            >
                Find the professor that you wish to add on{' '}
                <Link href="https://www.ratemyprofessors.com/" passHref>
                <span style={{ color: '#1976d2', textDecoration: 'none' }}>RateMyProfessors</span>
                </Link>
                {' '}. Enter the URL of the professor in the field below
                and click &quot;Scrape&quot;. The system will process your request and fetch the reviews 
                of the professor from the site. 
            </Typography>
          </div>
        </Box>

        {/* Scrape Input Box */}
        <Box
          sx={{
            width: "350px",
            height: "100px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <TextField
            label="URL to Scrape"
            fullWidth
            value={website}
            variant="filled"
            onChange={(e) => {
              setWebsite(e.target.value);
            }}
            sx={{
              border: "1px solid white",
              color: "white",
              bgcolor: "white",
              mb: 2,
            }}
            InputLabelProps={{
                sx: {
                  fontFamily: 'Cormorant Garamond, serif',
                },
              }}
          />
          <Button
            sx={{ fontFamily: 'Cormorant Garamond, serif', backgroundColor: "white"}}
            variant="outlined"
            onClick={getReviews}
          >
            Scrape
          </Button>
        </Box>
      </Box>
    </BackgroundBox>
  );
}
