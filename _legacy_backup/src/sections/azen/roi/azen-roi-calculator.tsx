import { useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Slider from '@mui/material/Slider';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

// ----------------------------------------------------------------------

export default function AzenROICalculator() {
  const theme = useTheme();
  
  const [hours, setHours] = useState<number>(40);
  const [rate, setRate] = useState<number>(50);

  const efficiencyGain = 0.40; // 40% efficiency
  const hoursSaved = hours * efficiencyGain;
  const moneySaved = hoursSaved * rate * 52; // Annual savings (52 weeks)

  const handleChangeHours = (event: Event, newValue: number | number[]) => {
    setHours(newValue as number);
  };

  const handleChangeRate = (event: Event, newValue: number | number[]) => {
    setRate(newValue as number);
  };

  return (
    <Box sx={{ py: { xs: 10, md: 15 }, bgcolor: 'background.neutral' }}>
      <Container>
        <Stack spacing={3} sx={{ textAlign: 'center', mb: { xs: 5, md: 8 } }}>
           <Typography variant="h2">Calculate Your Clarity</Typography>
           <Typography sx={{ color: 'text.secondary' }}>
             See how much Azen can save you.
           </Typography>
        </Stack>
        
        <Card sx={{ p: 5, maxWidth: 800, mx: 'auto', boxShadow: theme.customShadows.z24 }}>
           <Stack spacing={5}>
              <Stack spacing={2}>
                 <Typography variant="h6" gutterBottom>
                    Weekly Hours Spent on Manual Tasks: <Box component="span" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{hours} hrs</Box>
                 </Typography>
                 <Slider
                   value={hours}
                   min={0}
                   max={168}
                   step={1}
                   onChange={handleChangeHours}
                   valueLabelDisplay="auto"
                 />
              </Stack>

              <Stack spacing={2}>
                 <Typography variant="h6" gutterBottom>
                    Hourly Operational Cost: <Box component="span" sx={{ color: 'primary.main', fontWeight: 'bold' }}>{fCurrency(rate)}</Box>
                 </Typography>
                 <Slider
                   value={rate}
                   min={10}
                   max={500}
                   step={10}
                   onChange={handleChangeRate}
                   valueLabelDisplay="auto"
                 />
              </Stack>

              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={3}
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  p: 3,
                  bgcolor: 'primary.lighter',
                  borderRadius: 2,
                  color: 'primary.darker',
                }}
              >
                  <Stack alignItems="center">
                     <Typography variant="subtitle2">Weekly Hours Saved</Typography>
                     <Typography variant="h3">{Math.round(hoursSaved)} hrs</Typography>
                  </Stack>

                  <Stack alignItems="center">
                     <Typography variant="subtitle2">Estimated Annual Savings</Typography>
                     <Typography variant="h2">{fCurrency(moneySaved)}</Typography>
                  </Stack>
              </Stack>
              
              <Typography variant="caption" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                 *Based on an average 40% efficiency gain observed with Azen solutions.
              </Typography>
           </Stack>
        </Card>
      </Container>
    </Box>
  );
}
