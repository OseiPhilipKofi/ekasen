import React from 'react';

export const FacebookIcon = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V11c0-1.105.895-2 2-2 0 0 1.5-1.5 1.5-1.5s0-1.5-1.5-1.5c-1.5 0-1.5 1.5-1.5 1.5v1h0z" />
  </svg>
);

export const TwitterIcon = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 00-8.658-4.965C0 3.379 0 0 0 0s4.5-8.79 10-8.79 10 5.2 10 8.79z" />
  </svg>
);

export const InstagramIcon = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37C16 10.5.11 9.63 10 9.63s-6 .77-6 1.64c0 .87 6 1.64 6 1.64s6-.77 6-1.64z"></path>
    <circle cx="12" cy="12" r="3"></circle>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export const LinkedinIcon = ({ size = 24, ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 6.477 4.477 10 10 10s5.523-3.523 8-3.523 8 3.523 8 3.523 0-5.2-5.2-5.2-5.2 5.2-5.2 5.2z" />
  </svg>
);
