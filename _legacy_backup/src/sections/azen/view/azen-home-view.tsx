import { Helmet } from 'react-helmet-async';

import AzenHero from '../home/azen-hero';
import AzenTrust from '../home/azen-trust';
import AzenROICalculator from '../roi/azen-roi-calculator';
import AzenProblemSolution from '../home/azen-problem-solution';

// ----------------------------------------------------------------------

export default function AzenHomeView() {
  return (
    <>
      <Helmet>
        <title> Azen | Innovate. Integrate. </title>
      </Helmet>

      <AzenHero />
      <AzenProblemSolution />
      <AzenROICalculator />
      <AzenTrust />
    </>
  );
}
