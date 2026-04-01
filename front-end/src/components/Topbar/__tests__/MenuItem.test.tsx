import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { MenuItem } from "../MenuItem";
import { Route } from "../types";

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock("../Topbar.styles", () => ({
  useTopbarStyles: () => ({
    classes: {
      link: "link",
      linkLabel: "linkLabel",
      menuItemLink: "menuItemLink",
    },
  }),
}));

describe("le composant MenuItem", () => {
  describe("route de type string", () => {
    it("affiche le label sous forme de lien", () => {
      render(<MenuItem label="Découvrir" route="/discover" />);

      expect(screen.getByRole("link", { name: "Découvrir" })).toHaveAttribute("href", "/discover");
    });
  });

  describe("route de type tableau (menu déroulant)", () => {
    const subRoutes: Route["route"] = [
      { label: "Connexion", link: "/signin", requiredAuth: false },
      { label: "Profil", link: "/profil", requiredAuth: true },
    ];

    it("affiche le label du menu parent", () => {
      render(<MenuItem label="Utilisateur" route={subRoutes} />);

      expect(screen.getByText("Utilisateur")).toBeInTheDocument();
    });

    it("rend les sous-routes comme liens", async () => {
      render(<MenuItem label="Utilisateur" route={subRoutes} />);

      // Hover to open the menu
      await userEvent.hover(screen.getByText("Utilisateur"));

      expect(screen.getByRole("link", { name: "Connexion" })).toHaveAttribute("href", "/signin");
      expect(screen.getByRole("link", { name: "Profil" })).toHaveAttribute("href", "/profil");
    });

    it("affiche un Switch pour une sous-route avec onClick", async () => {
      const onToggle = vi.fn();
      const routesWithToggle: Route["route"] = [
        { label: "Profil", link: "/profil", requiredAuth: true },
        {
          label: "Mode debug",
          link: "#debug-toggle",
          requiredAuth: true,
          onClick: onToggle,
          checked: false,
          separator: true,
        },
      ];

      render(<MenuItem label="Utilisateur" route={routesWithToggle} />);

      await userEvent.hover(screen.getByText("Utilisateur"));

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByText("Mode debug")).toBeInTheDocument();
    });

    it("le Switch reflète la valeur checked", async () => {
      const routesWithToggle: Route["route"] = [
        {
          label: "Mode debug",
          link: "#debug-toggle",
          requiredAuth: true,
          onClick: vi.fn(),
          checked: true,
        },
      ];

      render(<MenuItem label="Utilisateur" route={routesWithToggle} />);

      await userEvent.hover(screen.getByText("Utilisateur"));

      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("appelle onClick lors du changement du Switch", async () => {
      const onToggle = vi.fn();
      const routesWithToggle: Route["route"] = [
        {
          label: "Mode debug",
          link: "#debug-toggle",
          requiredAuth: true,
          onClick: onToggle,
          checked: false,
        },
      ];

      render(<MenuItem label="Utilisateur" route={routesWithToggle} />);

      await userEvent.hover(screen.getByText("Utilisateur"));
      await userEvent.click(screen.getByRole("checkbox"));

      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("affiche un séparateur avant une sous-route avec separator = true", async () => {
      const routesWithSeparator: Route["route"] = [
        { label: "Profil", link: "/profil" },
        { label: "Mode debug", link: "#debug-toggle", separator: true, onClick: vi.fn(), checked: false },
      ];

      render(<MenuItem label="Utilisateur" route={routesWithSeparator} />);

      await userEvent.hover(screen.getByText("Utilisateur"));

      expect(document.querySelector(".mantine-Menu-divider")).toBeInTheDocument();
    });
  });
});
