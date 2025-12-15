import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Timeline, TimelineDot, TimelineItem, TimelineContent, TimelineSeparator, TimelineConnector, TimelineOppositeContent } from '@mui/lab';

import { useResponsive } from 'src/hooks/use-responsive';

// ----------------------------------------------------------------------

const PHASES = [
  {
    key: 'A',
    title: 'Phase A: Strategy',
    description: 'We listen, analyze, and plan. We define the problem and the path to the solution.',
    color: 'primary.main',
  },
  {
    key: 'M',
    title: 'Phase M: Execution',
    description: 'The middle. The messy part. We integrate, build, and deploy with precision.',
    color: 'warning.main',
  },
  {
    key: 'Z',
    title: 'Phase Z: Maintenance',
    description: 'The Zen. Growth, maintenance, and long-term stability. Peace of mind.',
    color: 'success.main',
  },
];

export default function AzenServicesRoadmap() {
  const mdUp = useResponsive('up', 'md');

  return (
    <Container sx={{ py: { xs: 10, md: 15 } }}>
      <Stack spacing={3} sx={{ textAlign: 'center', mb: { xs: 5, md: 10 } }}>
        <Typography variant="h2">The A to Z Process</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          From the first idea to the final polish.
        </Typography>
      </Stack>

      <Timeline position={mdUp ? 'alternate' : 'right'}>
        {PHASES.map((phase, index) => (
          <TimelineItem key={phase.key}>
            <TimelineOppositeContent
              sx={{ m: 'auto 0' }}
              align="right"
              variant="h3"
              color="text.secondary"
            >
              {phase.key}
            </TimelineOppositeContent>

            <TimelineSeparator>
              <TimelineConnector />
              <TimelineDot sx={{ bgcolor: phase.color, p: 2 }}>
                 <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: 'common.white' }} />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>

            <TimelineContent sx={{ py: '12px', px: 2 }}>
              <Typography variant="h5" component="span">
                {phase.title}
              </Typography>
              <Typography sx={{ color: 'text.secondary', mt: 1 }}>{phase.description}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Container>
  );
}
