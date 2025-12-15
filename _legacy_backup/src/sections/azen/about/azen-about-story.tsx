import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export default function AzenAboutStory() {
  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.neutral' }}>
      <Container>
        <Grid container spacing={3} alignItems="center" justifyContent="space-between">
          <Grid xs={12} md={6}>
             {/* Placeholder for an image or illustration */}
             <Box
                component="img"
                alt="Azen Balance"
                src="/assets/images/about/story_visual.jpg" 
                sx={{ width: 1, borderRadius: 2 }}
             />
          </Grid>

          <Grid xs={12} md={5}>
            <Stack spacing={3}>
              <Typography variant="h2">The Azen Story</Typography>

              <Typography sx={{ color: 'text.secondary' }}>
                Azen represents the full spectrum—from <strong>A to Z</strong>. It stands for comprehensive solutions that leave no stone unturned.
              </Typography>

              <Typography sx={{ color: 'text.secondary' }}>
                But it’s more than just coverage. The name is rooted in the concept of <strong>Balance</strong> (<em>Azen</em>). finding the equilibrium between innovation and stability, chaos and clarity.
              </Typography>

              <Typography sx={{ color: 'text.secondary' }}>
                We listen. We analyze. We bring order. That is the Azen way.
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
