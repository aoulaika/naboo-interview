import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { Topbar } from "../Topbar";
import { Route } from "../types";

vi.mock("@/hooks", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/contexts", () => ({
  useDebugMode: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock("../Topbar.styles", () => ({
  useTopbarStyles: () => ({
    classes: {
      header: "",
      inner: "",
      links: "",
      burger: "",
      link: "",
      linkLabel: "",
      mainLink: "",
      title: "",
      menuItemLink: "",
    },
  }),
}));

vi.mock("../getFilteredRoutes", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../getFilteredRoutes")>();
  return actual;
});

import { useAuth } from "@/hooks";
import { useDebugMode } from "@/contexts";

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseDebugMode = useDebugMode as ReturnType<typeof vi.fn>;

const baseRoutes: Route[] = [
  { label: "Découvrir", route: "/discover" },
  {
    label: "Utilisateur",
    route: [
      { label: "Connexion", link: "/signin", requiredAuth: false },
      { label: "Profil", link: "/profil", requiredAuth: true },
      { label: "Déconnexion", link: "/logout", requiredAuth: true },
    ],
  },
];

describe("le composant Topbar", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le titre Candidator", () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseDebugMode.mockReturnValue({ isDebugMode: false, toggleDebugMode: vi.fn() });

    render(<Topbar routes={baseRoutes} />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("header").textContent).toBe("Candidator");
  });

  it("n'injecte pas le menu debug pour un user non-admin", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "user" },
    });
    mockUseDebugMode.mockReturnValue({ isDebugMode: false, toggleDebugMode: vi.fn() });

    render(<Topbar routes={baseRoutes} />);

    expect(screen.queryByText("Mode debug")).not.toBeInTheDocument();
  });

  it("n'injecte pas le menu debug si user est null", () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseDebugMode.mockReturnValue({ isDebugMode: false, toggleDebugMode: vi.fn() });

    render(<Topbar routes={baseRoutes} />);

    expect(screen.queryByText("Mode debug")).not.toBeInTheDocument();
  });

  it("injecte le menu debug pour un admin", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "admin" },
    });
    mockUseDebugMode.mockReturnValue({ isDebugMode: false, toggleDebugMode: vi.fn() });

    const { default: userEvent } = await import("@testing-library/user-event");
    render(<Topbar routes={baseRoutes} />);

    await userEvent.hover(screen.getByText("Utilisateur"));

    expect(screen.getByText("Mode debug")).toBeInTheDocument();
  });

  it("le switch de debug est désactivé quand isDebugMode est false", async () => {
    mockUseAuth.mockReturnValue({ user: { id: "1", role: "admin" } });
    mockUseDebugMode.mockReturnValue({ isDebugMode: false, toggleDebugMode: vi.fn() });

    const { default: userEvent } = await import("@testing-library/user-event");
    render(<Topbar routes={baseRoutes} />);

    await userEvent.hover(screen.getByText("Utilisateur"));

    const switchInput = screen.getByRole("checkbox");
    expect(switchInput).not.toBeChecked();
  });

  it("le switch de debug est activé quand isDebugMode est true", async () => {
    mockUseAuth.mockReturnValue({ user: { id: "1", role: "admin" } });
    mockUseDebugMode.mockReturnValue({ isDebugMode: true, toggleDebugMode: vi.fn() });

    const { default: userEvent } = await import("@testing-library/user-event");
    render(<Topbar routes={baseRoutes} />);

    await userEvent.hover(screen.getByText("Utilisateur"));

    const switchInput = screen.getByRole("checkbox");
    expect(switchInput).toBeChecked();
  });

  it("appelle toggleDebugMode au clic sur le switch", async () => {
    const toggleDebugMode = vi.fn();
    mockUseAuth.mockReturnValue({ user: { id: "1", role: "admin" } });
    mockUseDebugMode.mockReturnValue({ isDebugMode: false, toggleDebugMode });

    const { default: userEvent } = await import("@testing-library/user-event");
    render(<Topbar routes={baseRoutes} />);

    await userEvent.hover(screen.getByText("Utilisateur"));
    await userEvent.click(screen.getByRole("checkbox"));

    expect(toggleDebugMode).toHaveBeenCalledTimes(1);
  });
});
