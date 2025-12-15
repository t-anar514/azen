import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { alpha, useTheme } from '@mui/material/styles';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { navConfig } from './config-navigation';

// ----------------------------------------------------------------------

export default function NavMobile() {
  const theme = useTheme();
  const pathname = usePathname();

  return (
    <Paper
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1100,
        borderRadius: 0,
        boxShadow: `0 -2px 8px ${alpha(theme.palette.grey[500], 0.16)}`,
      }}
    >
      <Stack direction="row" justifyContent="space-around" sx={{ py: 1.5 }}>
        {navConfig.map((item) => {
          const active = pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path));

          return (
            <Button
              key={item.title}
              component={RouterLink}
              href={item.path}
              size="small"
              sx={{
                flexDirection: 'column',
                color: active ? 'primary.main' : 'text.secondary',
                minWidth: 48,
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  mb: 0.5,
                  '& > span': { width: '100%', height: '100%' },
                }}
              >
                {item.icon}
              </Box>
              <Box sx={{ fontSize: 10, fontWeight: active ? 'bold' : 'normal' }}>{item.title}</Box>
            </Button>
          );
        })}
      </Stack>
    </Paper>
  );
}
