import { paths } from 'src/routes/paths';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

export const navConfig = [
  {
    title: 'Planner',
    path: paths.zen.root,
    icon: <Iconify icon="carbon:calendar" />,
  },
  {
    title: 'Map',
    path: paths.zen.map,
    icon: <Iconify icon="carbon:map" />,
  },
  {
    title: 'Discover',
    path: paths.zen.discover,
    icon: <Iconify icon="carbon:compass" />,
  },
  {
    title: 'Speak',
    path: paths.zen.speak,
    icon: <Iconify icon="carbon:microphone" />,
  },
  {
    title: 'Pocket',
    path: paths.zen.pocket,
    icon: <Iconify icon="carbon:wallet" />,
  },
];
