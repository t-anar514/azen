import { Suspense } from 'react';
import { Outlet, Navigate, useRoutes } from 'react-router-dom';

import MainLayout from 'src/layouts/main';
import { SplashScreen } from 'src/components/loading-screen';

import { zenRoutes } from './zen';
import { authRoutes } from './auth';
import { errorRoutes } from './error';
import { commonRoutes } from './common';
import { componentsRoutes } from './components';

// ----------------------------------------------------------------------



export default function Router() {
  return useRoutes([
    ...zenRoutes,
    {
      element: (
        <MainLayout>
          <Suspense fallback={<SplashScreen />}>
            <Outlet />
          </Suspense>
        </MainLayout>
      ),
      children: [




        ...componentsRoutes,
      ],
    },

    ...authRoutes,

    ...errorRoutes,

    ...commonRoutes,

    { path: '*', element: <Navigate to="/404" replace /> },
  ]);
}
