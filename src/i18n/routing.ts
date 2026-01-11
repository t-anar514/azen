import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['mn'],


  // Used when no locale matches
  defaultLocale: 'mn',
  
  localeDetection: false,
  
  localePrefix: 'as-needed',
  
  // The `pathnames` object holds all the custom paths
  // which can be localized.
  pathnames: {
    '/': '/',
    '/about': '/about',
    '/contact': '/contact',
    '/essentials': '/essentials',
    '/experiences': '/experiences',
    '/experiences/[id]': '/experiences/[id]',
    '/guides': '/guides',
    '/hacks': '/hacks',
    '/learn': '/learn',
    '/planner': '/planner',
    '/privacy': '/privacy',
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
