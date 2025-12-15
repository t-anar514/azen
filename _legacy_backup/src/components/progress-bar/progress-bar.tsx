import NProgress from 'nprogress';
import { useMemo, useEffect } from 'react';

//
import StyledProgressBar from './styles';

// ----------------------------------------------------------------------

export default function ProgressBar() {
  NProgress.configure({ showSpinner: false });

  useMemo(() => {
    NProgress.start();
  }, []);

  useEffect(() => {
    NProgress.done();
  }, []);

  return <StyledProgressBar />;
}
