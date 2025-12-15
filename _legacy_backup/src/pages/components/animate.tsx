import { Helmet } from 'react-helmet-async';

import AnimateView from 'src/sections/examples/animate-view';

// ----------------------------------------------------------------------

export default function AnimatePage() {
  return (
    <>
      <Helmet>
        <title> Extra: Animate</title>
      </Helmet>

      <AnimateView />
    </>
  );
}
