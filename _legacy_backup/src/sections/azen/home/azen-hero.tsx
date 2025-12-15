import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { bgGradient } from 'src/theme/css';
import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export default function AzenHero() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.grey[900], 0.8),
          imgUrl: '/assets/images/home/hero_bg.jpg', // Placeholder image
        }),
        height: '100vh',
        color: 'common.white',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container>
        <Stack
          spacing={3}
          sx={{
            textAlign: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h1" sx={{ color: 'common.white' }}>
            Innovate. Integrate. <br />
            <Box component="span" sx={{ color: 'primary.main' }}>
              Azen.
            </Box>
          </Typography>

          <Typography variant="h4" sx={{ color: 'grey.500', maxWidth: 600 }}>
             From A to Zen. Comprehensive industry solutions that bring order to chaos.
          </Typography>

          <Button
            component={RouterLink}
            href="/services"
            size="large"
            variant="contained"
            color="primary"
          >
            Start Your Journey
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
