
import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Image from 'src/components/image';
import Iconify from 'src/components/iconify';
import { _socials, _members } from 'src/_mock';
import { varHover, varTranHover } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function AzenAboutTeam() {
  return (
    <Container sx={{ py: { xs: 10, md: 15 } }}>
      <Stack spacing={3} sx={{ textAlign: 'center', mb: { xs: 5, md: 10 } }}>
        <Typography variant="h2">Our Team</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Meet the minds behind the balance.
        </Typography>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
        }}
      >
        {_members.slice(0, 3).map((member) => (
          <TeamMember key={member.id} member={member} />
        ))}
      </Box>
    </Container>
  );
}

// ----------------------------------------------------------------------

type MemberProps = {
  member: {
    id: string;
    name: string;
    role: string;
    photo: string;
  };
};

function TeamMember({ member }: MemberProps) {
  const theme = useTheme();

  return (
    <Card
      component={m.div}
      whileHover="hover"
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <Image alt={member.name} src={member.photo} ratio="3/4" />

        <Stack
          component={m.div}
          variants={varHover(1.05)}
          transition={varTranHover()}
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            opacity: 0,
            position: 'absolute',
            bgcolor: alpha(theme.palette.grey[900], 0.64),
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 2,
            textAlign: 'center',
            transition: theme.transitions.create('opacity'),
            '&:hover': { opacity: 1 },
          }}
        >
          <Stack spacing={1} sx={{ color: 'common.white' }}>
            <Typography variant="h6">Superpower</Typography>
            <Typography variant="body2">
              &quot;Bringing calm to the storm.&quot;
            </Typography>
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                {_socials.map((social) => (
                    <IconButton key={social.value} sx={{ color: 'common.white' }}>
                        <Iconify icon={social.icon} />
                    </IconButton>
                ))}
            </Stack>
          </Stack>
        </Stack>
      </Box>

      <Stack spacing={0.5} sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6">{member.name}</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {member.role}
        </Typography>
      </Stack>
    </Card>
  );
}
