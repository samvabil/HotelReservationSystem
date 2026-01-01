import { Box, Typography, Button, Container, Card, Grid, CardMedia, CardContent } from "@mui/material";
// FIX 1: Import the new Grid2 component
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Box>
      {/* --- HERO SECTION --- */}
      <Box
        sx={{
          height: "80vh",
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url("https://20251117-ey-project2-group4-assets.s3.us-east-1.amazonaws.com/homepage/main.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          px: 2,
        }}
      >
        <Typography variant="h1" color="secondary" sx={{ mb: 2, textShadow: "0px 0px 20px #00e5ff" }}>
          LEVEL UP YOUR STAY
        </Typography>
        <Typography variant="h5" color="text.primary" sx={{ mb: 4, maxWidth: "800px" }}>
          The world's premier hotel designed exclusively for gamers. 
          High-end PCs in every room. Gigabit fiber internet. 
          No lag. Just luxury.
        </Typography>
        <Button 
            variant="contained" 
            size="large" 
            color="primary"
            onClick={() => navigate('/book')}
            sx={{ fontSize: "1.2rem", px: 5, py: 1.5 }}
        >
          Book Your Battlestation
        </Button>
      </Box>

      {/* --- MARKETING / FEATURES --- */}
      <Container sx={{ py: 8 }} maxWidth={false}>
        <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ mb: 6 }}>
          WHY STAY WITH US?
        </Typography>
        
        {/* FIX 2: Use the new Grid syntax */}
        <Grid container spacing={4}>
          {/* Feature 1 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #333' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  bgcolor: 'grey.800',
                  backgroundImage: 'url(https://20251117-ey-project2-group4-assets.s3.us-east-1.amazonaws.com/homepage/pc.png)' 
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" color="secondary">
                  RTX 5090 Equipped
                </Typography>
                <Typography>
                  Every "Boss Level" suite comes with top-tier hardware. Play any game on Ultra settings without dropping a frame.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 2 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #333' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  bgcolor: 'grey.800',
                   backgroundImage: 'url(https://20251117-ey-project2-group4-assets.s3.us-east-1.amazonaws.com/homepage/retro.png)'
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" color="secondary">
                  Retro Console Cave
                </Typography>
                <Typography>
                  Feeling nostalgic? Our retro rooms feature CRTs and original consoles from the NES to the GameCube.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Feature 3 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #333' }}>
              <CardMedia
                component="div"
                sx={{
                  pt: '56.25%',
                  bgcolor: 'grey.800',
                   backgroundImage: 'url(https://20251117-ey-project2-group4-assets.s3.us-east-1.amazonaws.com/homepage/fast.png)'
                }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2" color="secondary">
                  Gigabit Fiber
                </Typography>
                <Typography>
                  Don't let lag kill your streak. We provide dedicated fiber lines to every room with sub-5ms ping.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}