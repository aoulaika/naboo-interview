import { GetUserQuery } from "@/graphql/generated/types";
import { checkRouteAccess, getFilteredRoutes } from "../getFilteredRoutes";
import { Route, SubRoute } from "../types";

interface CheckRouteAccessTest {
  description: string;
  route: Route | SubRoute;
  hasUser: boolean;
  result: boolean;
}

const user: GetUserQuery["getMe"] = {
  id: "user1",
  email: "user1@test.fr",
  firstName: "john",
  lastName: "doe",
};

describe("la fonction checkRouteAccess", () => {
  it.each([
    {
      description:
        "pour une route avec requiredAuth = undefined et user = null => doit retourner true",
      route: { requiredAuth: undefined, label: "route1", route: "/route1" },
      hasUser: false,
      result: true,
    },
    {
      description:
        "pour une route avec requiredAuth = false et user = null => doit retourner true",
      route: { requiredAuth: false, label: "route1", route: "/route1" },
      hasUser: false,
      result: true,
    },
    {
      description:
        "pour une route avec requiredAuth = true et user = null => doit retourner false",
      route: { requiredAuth: true, label: "route1", route: "/route1" },
      hasUser: false,
      result: false,
    },
    {
      description:
        "pour une route avec requiredAuth = false et user != null => doit retourner false",
      route: { requiredAuth: false, label: "route1", route: "/route1" },
      hasUser: true,
      result: false,
    },
    {
      description:
        "pour une route avec requiredAuth = undefined et user != null => doit retourner true",
      route: { requiredAuth: undefined, label: "route1", route: "/route1" },
      hasUser: true,
      result: true,
    },
    {
      description:
        "pour une route avec requiredAuth = true et user != null => doit retourner true",
      route: { requiredAuth: true, label: "route1", route: "/route1" },
      hasUser: true,
      result: true,
    },
  ])("$description", ({ route, hasUser, result }: CheckRouteAccessTest) => {
    expect(checkRouteAccess(route, hasUser ? user : null)).toBe(result);
  });
});

describe("la fonction getFilteredRoutes", () => {
  const routes: Route[] = [
    { label: "Route1", route: "/route1" },
    { label: "Route2", route: "/route2", requiredAuth: true },
    { label: "Route3", route: "/route3", requiredAuth: false },
    {
      label: "Route4",
      route: [
        {
          label: "Route4.1",
          link: "/route4.1",
          requiredAuth: false,
        },
        {
          label: "Route4.2",
          link: "/route4.2",
          requiredAuth: true,
        },
      ],
    },
  ];

  it("doit retourner les bonnes routes si un user est connecté", () => {
    const filteredRoutes = getFilteredRoutes(routes, user);
    expect(filteredRoutes).toEqual([
      { label: "Route1", route: "/route1" },
      { label: "Route2", route: "/route2", requiredAuth: true },
      {
        label: "Route4",
        route: [
          {
            label: "Route4.2",
            link: "/route4.2",
            requiredAuth: true,
          },
        ],
      },
    ]);
  });

  it("doit retourner les bonnes routes si un user n'est pas connecté", () => {
    const filteredRoutes = getFilteredRoutes(routes, null);
    expect(filteredRoutes).toEqual([
      { label: "Route1", route: "/route1" },
      { label: "Route3", route: "/route3", requiredAuth: false },
      {
        label: "Route4",
        route: [
          {
            label: "Route4.1",
            link: "/route4.1",
            requiredAuth: false,
          },
        ],
      },
    ]);
  });

  it("retourne un tableau vide si routes est vide", () => {
    expect(getFilteredRoutes([], user)).toEqual([]);
    expect(getFilteredRoutes([], null)).toEqual([]);
  });

  it("exclut une route parente avec requiredAuth = true si aucun user", () => {
    const protectedOnly: Route[] = [
      { label: "Secret", route: "/secret", requiredAuth: true },
    ];
    expect(getFilteredRoutes(protectedOnly, null)).toHaveLength(0);
  });

  it("exclut une route parente avec requiredAuth = false si user connecté", () => {
    const guestOnly: Route[] = [
      { label: "Login", route: "/login", requiredAuth: false },
    ];
    expect(getFilteredRoutes(guestOnly, user)).toHaveLength(0);
  });

  it("filtre les sous-routes et garde la route parente avec tableau vide si toutes les sous-routes sont exclues", () => {
    const onlyProtectedSub: Route[] = [
      {
        label: "Menu",
        route: [{ label: "Admin", link: "/admin", requiredAuth: true }],
      },
    ];
    // no user: the parent has requiredAuth=undefined (accessible), but sub-route is filtered out
    const result = getFilteredRoutes(onlyProtectedSub, null);
    expect(result).toEqual([{ label: "Menu", route: [] }]);
  });

  it("ne modifie pas les routes sans sous-routes (string route)", () => {
    const simple: Route[] = [
      { label: "Home", route: "/home" },
    ];
    expect(getFilteredRoutes(simple, user)).toEqual(simple);
    expect(getFilteredRoutes(simple, null)).toEqual(simple);
  });
});
