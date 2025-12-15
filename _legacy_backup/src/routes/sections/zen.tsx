import { lazy, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

import ZenLayout from 'src/layouts/zen';
import { SplashScreen } from 'src/components/loading-screen';

// ----------------------------------------------------------------------

const PlannerView = lazy(() => import('src/sections/zen/planner/view/planner-view'));
const MapView = lazy(() => import('src/sections/zen/map/view/map-view'));
const DiscoverView = lazy(() => import('src/sections/zen/discover/view/discover-view'));
const ListenSpeakView = lazy(() => import('src/sections/zen/speak/view/speak-view'));
const PocketView = lazy(() => import('src/sections/zen/pocket/view/pocket-view'));

// ----------------------------------------------------------------------

export const zenRoutes = [
  {
    path: '/',
    element: (
      <ZenLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </ZenLayout>
    ),
    children: [
      { element: <PlannerView />, index: true },
      { path: 'map', element: <MapView /> },
      { path: 'discover', element: <DiscoverView /> },
      { path: 'speak', element: <ListenSpeakView /> },
      { path: 'pocket', element: <PocketView /> },
    ],
  },
];
