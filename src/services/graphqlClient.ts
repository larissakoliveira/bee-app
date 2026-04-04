import { GraphQLClient } from 'graphql-request';

const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessTokenGet = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN_DELIVERY_API;

if (!spaceId || !accessTokenGet) {
  throw new Error('Missing Contentful space ID or access token');
}

const endpoint = `https://graphql.contentful.com/content/v1/spaces/${spaceId}`;

/** Prioritize the GraphQL request so product data (and thus LCP image URL) resolves sooner on supported browsers. */
function fetchWithHighPriority(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  return fetch(input, {
    ...init,
    priority: 'high',
  } as RequestInit & { priority?: 'high' });
}

const client = new GraphQLClient(endpoint, {
  headers: {
    Authorization: `Bearer ${accessTokenGet}`,
  },
  fetch: fetchWithHighPriority,
});

export default client;
