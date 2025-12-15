import { Helmet } from 'react-helmet-async';

import AzenCaseStudiesList from '../case-studies/azen-case-studies-list';

// ----------------------------------------------------------------------

export default function AzenCaseStudiesView() {
  return (
    <>
      <Helmet>
        <title> Azen | Case Studies </title>
      </Helmet>

      <AzenCaseStudiesList />
    </>
  );
}
