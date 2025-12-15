import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Unstable_Grid2';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const SOLUTIONS = [
  {
    icon: 'carbon:chart-bubble-packed',
    title: 'The Chaos',
    description: 'Disorganized workflows, scattered data, and inefficient processes slowing you down.',
    color: 'error.main',
  },
  {
    icon: 'carbon:arrow-right',
    title: 'The Transformation',
    description: 'We analyze, strategize, and implement tailored solutions to streamline operations.',
    color: 'warning.main',
  },
  {
    icon: 'carbon:idea',
    title: 'The Clarity',
    description: 'Achieve balance and efficiency. A unified system that works for you, from A to Z.',
    color: 'success.main',
  },
];

export default function AzenProblemSolution() {
  const theme = useTheme();

  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.neutral' }}>
      <Container>
        <Stack spacing={3} sx={{ textAlign: 'center', mb: { xs: 5, md: 10 } }}>
          <Typography component="div" variant="overline" sx={{ color: 'text.disabled' }}>
            Why Azen?
          </Typography>

          <Typography variant="h2">From Chaos to Clarity</Typography>
        </Stack>

        <Grid container spacing={3}>
          {SOLUTIONS.map((item) => (
            <Grid key={item.title} xs={12} md={4}>
              <Stack
                alignItems="center"
                sx={{
                  py: 5,
                  px: 3,
                  borderRadius: 2,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  boxShadow: theme.customShadows.z24,
                }}
              >
                <Iconify
                  icon={item.icon}
                  width={64}
                  sx={{ color: item.color, mb: 3 }}
                />

                <Typography variant="h5" sx={{ mb: 2 }}>
                  {item.title}
                </Typography>

                <Typography sx={{ color: 'text.secondary' }}>{item.description}</Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
