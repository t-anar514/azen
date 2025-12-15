import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';

import { useResponsive } from 'src/hooks/use-responsive';

import Header from './header';
import NavMobile from './nav-mobile';

// ----------------------------------------------------------------------

type Props = {
  children: React.ReactNode;
};

export default function ZenLayout({ children }: Props) {

  const mdUp = useResponsive('up', 'md');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1 }}>
      <Header />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, md: 10 },
          pb: { xs: 10, md: 0 }, // Space for bottom nav on mobile
          minHeight: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>

      {!mdUp && <NavMobile />}
    </Box>
  );
}
