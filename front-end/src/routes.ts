import { IconLogin, IconLogout, IconUser, IconUserCircle, IconUserPlus } from "@tabler/icons-react";
import { Route } from "./components/Topbar";

export const routes: Route[] = [
  { label: "Découvrez des activités", route: "/discover" },
  { label: "Explorer", route: "/explorer" },
  { label: "Mes activités", route: "/my-activities", requiredAuth: true },
  {
    label: "Utilisateur",
    icon: IconUserCircle,
    route: [
      { label: "Connection", link: "/signin", requiredAuth: false, icon: IconLogin, separator: true },
      { label: "Inscription", link: "/signup", requiredAuth: false, icon: IconUserPlus, separator: true },
      { label: "Profil", link: "/profil", requiredAuth: true, icon: IconUser, separator: true },
      { label: "Déconnection", link: "/logout", requiredAuth: true, icon: IconLogout, separator: true },
    ],
  },
];
