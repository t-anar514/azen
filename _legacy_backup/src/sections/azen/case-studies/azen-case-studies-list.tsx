import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const CASE_STUDIES = [
  {
    id: 1,
    client: 'Global Finance Corp',
    category: 'FinTech',
    problem: 'Legacy systems caused a 40% efficiency loss and data silos.',
    solution: 'Implemented a unified cloud infrastructure and automated workflows (Phase M).',
    result: 'Efficiency increased by 65%. Operating costs reduced by 20%.',
    icon: 'carbon:finance',
    color: 'primary',
  },
  {
    id: 2,
    client: 'EcoHealth',
    category: 'Healthcare',
    problem: 'Patient data was scattered across 5 different incompatible platforms.',
    solution: 'Designed a central data lake and secure API gateway (Phase A & M).',
    result: 'Data retrieval time cut by 90%. 100% HIPAA compliance verified.',
    icon: 'carbon:wikis',
    color: 'success',
  },
  {
    id: 3,
    client: 'LogistiX',
    category: 'Supply Chain',
    problem: 'Manual inventory tracking led to frequent stockouts and delays.',
    solution: 'Deployed IoT sensors and an AI-driven prediction model (Phase Z).',
    result: 'Stockouts reduced by 85%. ROI achieved in 6 months.',
    icon: 'carbon:delivery',
    color: 'warning',
  },
];

export default function AzenCaseStudiesList() {
  return (
    <Container sx={{ py: { xs: 10, md: 15 } }}>
      <Stack spacing={3} sx={{ textAlign: 'center', mb: { xs: 5, md: 10 } }}>
        <Typography variant="h2">Proven Results</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Real problems. Real solutions. Real numbers.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 4,
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            md: 'repeat(3, 1fr)',
          },
        }}
      >
        {CASE_STUDIES.map((study) => (
          <StudyCard key={study.id} study={study} />
        ))}
      </Box>
    </Container>
  );
}

// ----------------------------------------------------------------------

function StudyCard({ study }: { study: any }) {
  const theme = useTheme();

  return (
    <Card
      sx={{
        p: 4,
        height: 1,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: theme.customShadows.z24,
        bgcolor: 'background.paper',
        borderRadius: 2,
        transition: theme.transitions.create(['transform', 'box-shadow']),
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: theme.customShadows.z24,
        },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
         <Box
           sx={{
             width: 56,
             height: 56,
             borderRadius: '50%',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             bgcolor: alpha((theme.palette as any)[study.color].main, 0.1),
             color: (theme.palette as any)[study.color].main,
           }}
         >
           <Iconify icon={study.icon} width={32} />
         </Box>
         <Typography variant="overline" sx={{ color: 'text.disabled' }}>
            {study.category}
         </Typography>
      </Stack>

      <Typography variant="h5" sx={{ mb: 1 }}>
        {study.client}
      </Typography>

      <Divider sx={{ my: 3, borderStyle: 'dashed' }} />

      <Stack spacing={2} sx={{ flexGrow: 1 }}>
        <Box>
            <Typography variant="subtitle2" sx={{ color: 'error.main', mb: 0.5 }}>Problem</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{study.problem}</Typography>
        </Box>
        <Box>
            <Typography variant="subtitle2" sx={{ color: 'info.main', mb: 0.5 }}>Azen Solution</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>{study.solution}</Typography>
        </Box>
        <Box>
            <Typography variant="subtitle2" sx={{ color: 'success.main', mb: 0.5 }}>Result</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{study.result}</Typography>
        </Box>
      </Stack>
    </Card>
  );
}
