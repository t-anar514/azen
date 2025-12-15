import { Helmet } from 'react-helmet-async';

import AzenAboutTeam from '../about/azen-about-team';
import AzenAboutStory from '../about/azen-about-story';

// ----------------------------------------------------------------------

export default function AzenAboutView() {
  return (
    <>
      <Helmet>
        <title> Azen | About Us </title>
      </Helmet>

      <AzenAboutStory />
      <AzenAboutTeam />
    </>
  );
}
