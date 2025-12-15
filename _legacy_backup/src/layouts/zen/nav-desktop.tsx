import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

import { RouterLink } from 'src/routes/components';

import { navConfig } from './config-navigation';

// ----------------------------------------------------------------------

export default function NavDesktop() {
  return (
    <Stack direction="row" spacing={3}>
      {navConfig.map((item: any) => (
        <Link key={item.title} component={RouterLink} href={item.path} variant="subtitle2">
          {item.title}
        </Link>
      ))}
    </Stack>
  );
}
