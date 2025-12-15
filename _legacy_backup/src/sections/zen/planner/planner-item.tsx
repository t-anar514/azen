import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  item: {
    id: string;
    title: string;
    time: string;
    type: string;
    icon: string;
    color: string;
  };
};

export default function PlannerItem({ item }: Props) {
  const theme = useTheme();

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isBuffer = item.type === 'buffer';

  return (
    <Box ref={setNodeRef} style={style} {...attributes} {...listeners} sx={{ mb: 2 }}>
      {isBuffer ? (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          sx={{
            py: 1,
            px: 2,
            borderRadius: 1,
            bgcolor: alpha(theme.palette.warning.main, 0.08),
            color: 'warning.dark',
            border: `1px dashed ${alpha(theme.palette.warning.main, 0.24)}`,
          }}
        >
          <Iconify icon="carbon:time" width={16} sx={{ mr: 1 }} />
          <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
            Buffer Time (Auto-Added)
          </Typography>
        </Stack>
      ) : (
        <Card
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            boxShadow: theme.customShadows.z1,
            '&:hover': {
              boxShadow: theme.customShadows.z4,
            },
          }}
        >
          <Box
            sx={{
              mr: 2,
              width: 40,
              height: 40,
              display: 'flex',
              borderRadius: 1,
              alignItems: 'center',
              justifyContent: 'center',
              color: 'common.white',
              bgcolor: item.color === 'primary' ? theme.palette.primary.main : theme.palette.secondary.main,
            }}
          >
            <Iconify icon={item.icon} width={24} />
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle2">{item.title}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {item.time}
            </Typography>
          </Box>

          <IconButton size="small">
            <Iconify icon="carbon:overflow-menu-vertical" />
          </IconButton>
        </Card>
      )}
    </Box>
  );
}
