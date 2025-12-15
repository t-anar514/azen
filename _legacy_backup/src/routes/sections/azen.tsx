import { lazy } from 'react';

// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/sections/azen/view/azen-home-view'));
const AboutPage = lazy(() => import('src/sections/azen/view/azen-about-view'));
const ServicesPage = lazy(() => import('src/sections/azen/view/azen-services-view'));
const CaseStudiesPage = lazy(() => import('src/sections/azen/view/azen-case-studies-view'));
const ContactPage = lazy(() => import('src/sections/azen/view/azen-contact-view'));

// ----------------------------------------------------------------------

export const azenRoutes = [
  { element: <HomePage />, index: true },
  { path: 'about', element: <AboutPage /> },
  { path: 'services', element: <ServicesPage /> },
  { path: 'case-studies', element: <CaseStudiesPage /> },
  { path: 'contact', element: <ContactPage /> },
];
