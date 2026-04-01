import { useDebugMode } from "@/contexts";
import { useAuth } from "@/hooks";
import { IconBug } from "@tabler/icons-react";
import { Burger, Container, Group, Header } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { useMemo } from "react";
import { MenuItem } from "./MenuItem";
import { useTopbarStyles } from "./Topbar.styles";
import { getFilteredRoutes } from "./getFilteredRoutes";
import { Route } from "./types";

interface TopbarProps {
  routes: Route[];
}

export function Topbar({ routes }: TopbarProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const { classes } = useTopbarStyles();
  const { user } = useAuth();
  const { isDebugMode, toggleDebugMode } = useDebugMode();

  const routesWithDebugToggle = useMemo<Route[]>(() => {
    if (user?.role !== "admin") return routes;

    return routes.map((route) => {
      if (!Array.isArray(route.route)) return route;

      const profilIndex = route.route.findIndex((s) => s.link === "/profil");
      if (profilIndex === -1) return route;

      const debugItem = {
        link: "#debug-toggle",
        label: "Mode debug",
        requiredAuth: true as const,
        checked: isDebugMode,
        onClick: toggleDebugMode,
        icon: IconBug,
        separator: true,
      };

      const subRoutes = [...route.route];
      subRoutes.splice(profilIndex + 1, 0, debugItem);
      return { ...route, route: subRoutes };
    });
  }, [routes, user, isDebugMode, toggleDebugMode]);

  const filteredRoutes = useMemo(
    () => getFilteredRoutes(routesWithDebugToggle, user),
    [routesWithDebugToggle, user]
  );

  return (
    <Header height={56} className={classes.header}>
      <Container>
        <div className={classes.inner}>
          <Link href="/" className={classes.mainLink}>
            <h1 className={classes.title} data-testid='header'>Candidator</h1>
          </Link>
          <Group spacing={5} className={classes.links}>
            {filteredRoutes.map((route) => (
              <MenuItem key={route.label} {...route} />
            ))}
          </Group>
          <Burger
            opened={opened}
            onClick={toggle}
            className={classes.burger}
            size="sm"
            color="#fff"
          />
        </div>
      </Container>
    </Header>
  );
}
