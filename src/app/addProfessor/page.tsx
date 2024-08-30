"use client";

import {
  Box,
  Button,
  Container,
  styled,
  TextField,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import Navbar from "../navbar";

const BackgroundBox = styled(Box)({
  backgroundSize: "cover",
  backgroundPosition: "center",
  background: "linear-gradient(to right, #000000, #808080)",
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

export default function Home() {
  const [website, setWebsite] = useState("");
  const getReviews = async () => {
    await fetch(`http://localhost:3000/api/scrape`, {
      method: "POST",
      body: JSON.stringify({ website: website }),
    });
    setWebsite("");
  };

  return (
    <BackgroundBox>
      <Navbar></Navbar>
      <Box
        sx={{
          flexGrow: "1",
          minWidth: "100%",
          minHeight: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "500px",
            height: "100px",
          }}
        >
          <TextField
            label="Website to Scrape"
            fullWidth
            value={website}
            variant="filled"
            onChange={(e) => {
              setWebsite(e.target.value);
            }}
            sx={{ border: "1px solid white", color: "White", bgcolor: "white" }}
          ></TextField>
          <Button
            sx={{ backgroundColor: "white" }}
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
