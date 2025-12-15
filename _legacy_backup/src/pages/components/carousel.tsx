import { Helmet } from 'react-helmet-async';

import CarouselView from 'src/sections/examples/carousel-view';

// ----------------------------------------------------------------------

export default function CarouselPage() {
  return (
    <>
      <Helmet>
        <title> Extra: Carousel</title>
      </Helmet>

      <CarouselView />
    </>
  );
}
