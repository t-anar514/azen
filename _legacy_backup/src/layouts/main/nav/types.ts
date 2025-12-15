import { Theme, SxProps } from '@mui/material/styles';
import { ListItemButtonProps } from '@mui/material/ListItemButton';

// ----------------------------------------------------------------------

export type NavItemBaseProps = {
  title: string;
  path: string;
  icon?: React.ReactElement;
  children?: NavListProps[];
};

export type NavListProps = {
  subheader: string;
  isNew?: boolean;
  cover?: string;
  items: { title: string; path: string }[];
};

export type NavItemProps = ListItemButtonProps & {
  item: NavItemBaseProps;
  active?: boolean;
  open?: boolean;
  subItem?: boolean;
  externalLink?: boolean;
};

export type NavProps = {
  data: NavItemBaseProps[];
  sx?: SxProps<Theme>;
};
