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
    '/essentials/[id]': '/essentials/[id]',
    '/experiences': '/experiences',
    '/experiences/[id]': '/experiences/[id]',
    '/guides': '/guides',
    '/hacks': '/hacks',
    '/hacks/[id]': '/hacks/[id]',
    '/learn': '/learn',
    '/planner': '/planner',
    '/privacy': '/privacy',
    '/login': '/login',
    '/signup': '/signup',
    '/account': '/account',
    '/admin': '/admin',
    '/admin/cities': '/admin/cities',
    '/admin/cities/new': '/admin/cities/new',
    '/admin/cities/[id]/edit': '/admin/cities/[id]/edit',
    '/admin/hacks': '/admin/hacks',
    '/admin/hacks/new': '/admin/hacks/new',
    '/admin/hacks/[id]/edit': '/admin/hacks/[id]/edit',
    '/admin/guides': '/admin/guides',
    '/admin/guides/new': '/admin/guides/new',
    '/admin/guides/[id]/edit': '/admin/guides/[id]/edit',
    '/admin/learn': '/admin/learn',
    '/admin/learn/new': '/admin/learn/new',
    '/admin/learn/[id]/edit': '/admin/learn/[id]/edit',
    '/admin/users': '/admin/users',
  }
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
