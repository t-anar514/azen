import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { useTheme } from '@mui/material/styles';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { bgBlur } from 'src/theme/css';
import Logo from 'src/components/logo';

// ----------------------------------------------------------------------

export default function Header() {
  const theme = useTheme();

  return (
    <AppBar sx={{ boxShadow: 'none', bgcolor: 'transparent', position: 'absolute' }}>
      <Toolbar
        sx={{
          ...bgBlur({ color: theme.palette.common.white }),
        }}
      >
        <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo />
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            Azen
          </Typography>
        </Container>
      </Toolbar>
    </AppBar>
  );
}
