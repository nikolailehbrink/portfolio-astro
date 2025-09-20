// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Astro Blog";
export const SITE_DESCRIPTION = "Welcome to my website!";

export const AI_CHAT_MESSAGE_LIMIT = import.meta.env.PROD ? 10 : 2;
export const SECONDS_TO_CHAT_AGAIN = import.meta.env.PROD
  ? 1000 * 60 * 60 * 24 // 24 hours
  : 1000 * 60; // 1 minute
