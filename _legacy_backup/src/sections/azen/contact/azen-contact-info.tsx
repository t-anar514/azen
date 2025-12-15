import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { _socials } from 'src/_mock';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function AzenContactInfo() {
  return (
    <Stack spacing={3} alignItems={{ xs: 'center', md: 'flex-start' }} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
      <Typography variant="h3">Get in Touch</Typography>
      <Typography sx={{ color: 'text.secondary' }}>
        Ready to bring balance to your business?
      </Typography>

      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
           <Iconify icon="carbon:location" width={24} color="primary.main" />
           <Typography variant="body2">100 Zen Way, Innovation City, NY 10001</Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
           <Iconify icon="carbon:email" width={24} color="primary.main" />
           <Link variant="body2" href="mailto:hello@azen.com" color="inherit">
             hello@azen.com
           </Link>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
           <Iconify icon="carbon:phone" width={24} color="primary.main" />
           <Typography variant="body2">+1 (555) 123-4567</Typography>
        </Stack>
      </Stack>

      <Stack spacing={1}>
        <Typography variant="overline">Follow Us</Typography>
        <Stack direction="row" spacing={1}>
          {_socials.map((social) => (
            <IconButton key={social.value} color="inherit">
              <Iconify icon={social.icon} />
            </IconButton>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
}
