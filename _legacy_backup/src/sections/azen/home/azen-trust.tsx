
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import SvgColor from 'src/components/svg-color';

// ----------------------------------------------------------------------

const BRANDS = [
  'airbnb',
  'dropbox',
  'facebook',
  'google',
  'heroku',
  'lenovo',
  'microsoft',
  'netflix',
  'slack',
  'spotify',
  'tripadvisor',
  'vimeo',
];

export default function AzenTrust() {
  return (
    <Container sx={{ py: { xs: 10, md: 15 } }}>
      <Typography variant="h3" sx={{ textAlign: 'center', mb: 8 }}>
        Trusted by Industry Leaders
      </Typography>

      <Stack
        direction="row"
        flexWrap="wrap"
        justifyContent="center"
        sx={{
          '& > *': {
            mx: { xs: 2.5, md: 4, lg: 5 },
            my: { xs: 2.5, md: 4 },
            opacity: 0.4,
            transition: 'opacity 0.4s ease-in-out',
            '&:hover': {
              opacity: 1,
            },
          },
        }}
      >
        {BRANDS.map((brand) => (
          <SvgColor
            key={brand}
            src={`/assets/icons/brands/ic_brand_${brand}.svg`}
            sx={{ width: 106, height: 32, color: 'text.primary' }}
          />
        ))}
      </Stack>
    </Container>
  );
}
