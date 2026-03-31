import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// NEXT_PUBLIC_API_URL  — reachable from the browser (e.g. http://localhost:3000)
// INTERNAL_API_URL     — reachable from the Next.js server process inside Docker
//                        (e.g. http://backend:3000). Falls back to the public URL.
const GRAPHQL_URI =
  typeof window === "undefined"
    ? (process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/graphql"
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000") + "/graphql";

// Browser-side singleton — safe to reuse across renders.
let browserClient: ApolloClient<unknown> | undefined;

function createClient() {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: GRAPHQL_URI, credentials: "include" }),
    ssrMode: typeof window === "undefined",
  });
}

// On the server a fresh client is returned for every call so that
// in-flight requests cannot share cached data across users.
export function getGraphqlClient(): ApolloClient<unknown> {
  if (typeof window === "undefined") return createClient();
  if (!browserClient) browserClient = createClient();
  return browserClient;
}

// Convenience alias used by client-side Apollo Provider.
export const graphqlClient = getGraphqlClient();
