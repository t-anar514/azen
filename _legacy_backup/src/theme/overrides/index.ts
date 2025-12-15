import merge from 'lodash.merge';

import { Theme } from '@mui/material/styles';

import { fab } from './components/fab';
import { card } from './components/card';
import { chip } from './components/chip';
import { list } from './components/list';
import { tabs } from './components/tabs';
import { menu } from './components/menu';
import { table } from './components/table';
import { alert } from './components/alert';
import { badge } from './components/badge';
import { paper } from './components/paper';
import { drawer } from './components/drawer';
import { rating } from './components/rating';
import { appBar } from './components/appbar';
import { dialog } from './components/dialog';
import { slider } from './components/slider';
import { select } from './components/select';
import { avatar } from './components/avatar';
import { button } from './components/button';
import { switchs } from './components/switch';
import { stepper } from './components/stepper';
import { popover } from './components/popover';
import { defaultProps } from './default-props';
import { tooltip } from './components/tooltip';
import { svgIcon } from './components/svg-icon';
import { timeline } from './components/timeline';
import { checkbox } from './components/checkbox';
import { backdrop } from './components/backdrop';
import { progress } from './components/progress';
import { skeleton } from './components/skeleton';
import { radio } from './components/radio-button';
import { dataGrid } from './components/data-grid';
import { treeView } from './components/tree-view';
import { textField } from './components/textfield';
import { accordion } from './components/accordion';
import { typography } from './components/typography';
import { pagination } from './components/pagination';
import { datePicker } from './components/date-picker';
import { breadcrumbs } from './components/breadcrumbs';
import { cssBaseline } from './components/css-baseline';
import { buttonGroup } from './components/button-group';
import { autocomplete } from './components/autocomplete';
import { toggleButton } from './components/toggle-button';
import { loadingButton } from './components/loading-button';

// ----------------------------------------------------------------------

export function componentsOverrides(theme: Theme) {
  const components = merge(
    fab(theme),
    tabs(theme),
    chip(theme),
    card(theme),
    menu(theme),
    list(theme),
    badge(theme),
    table(theme),
    paper(theme),
    alert(theme),
    radio(theme),
    select(theme),
    button(theme),
    rating(theme),
    dialog(theme),
    appBar(theme),
    avatar(theme),
    slider(theme),
    drawer(theme),
    switchs(theme),
    stepper(theme),
    tooltip(theme),
    popover(theme),
    svgIcon(theme),
    checkbox(theme),
    dataGrid(theme),
    skeleton(theme),
    timeline(theme),
    treeView(theme),
    backdrop(theme),
    progress(theme),
    textField(theme),
    accordion(theme),
    typography(theme),
    pagination(theme),
    datePicker(theme),
    buttonGroup(theme),
    breadcrumbs(theme),
    cssBaseline(theme),
    autocomplete(theme),
    toggleButton(theme),
    loadingButton(theme),
    defaultProps(theme)
  );

  return components;
}
