import { Helmet } from 'react-helmet-async';

import AzenServicesRoadmap from '../services/azen-services-roadmap';

// ----------------------------------------------------------------------

export default function AzenServicesView() {
  return (
    <>
      <Helmet>
        <title> Azen | Services </title>
      </Helmet>

      <AzenServicesRoadmap />
    </>
  );
}
