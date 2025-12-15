import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Iconify from 'src/components/iconify';

import PlannerTimeline from '../planner-timeline';

// ----------------------------------------------------------------------

export default function PlannerView() {
  return (
    <Container maxWidth="md">
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 5 }}>
        <Typography variant="h4">My Zen Journey</Typography>
        <Button variant="contained" startIcon={<Iconify icon="carbon:add" />} sx={{ bgcolor: 'secondary.main', '&:hover': { bgcolor: 'secondary.dark' } }}>
          New Activity
        </Button>
      </Stack>
      
      <PlannerTimeline />
    </Container>
  );
}
