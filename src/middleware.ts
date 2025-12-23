import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match all pathnames for internationalized routing, 
  // but ignore non-page requests like API, static files and images
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
