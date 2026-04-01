import { render, screen } from "@testing-library/react";
import { Grid } from "@mantine/core";
import { vi } from "vitest";
import { Activity } from "./Activity";
import { ActivityFragment } from "@/graphql/generated/types";

vi.mock("@/hooks", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/contexts", () => ({
  useDebugMode: vi.fn(),
}));

// next/link renders an <a> in tests
vi.mock("next/link", () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode; [key: string]: unknown }) => (
    <a href={href} {...rest}>{children}</a>
  ),
}));

vi.mock("@/utils", () => ({
  useGlobalStyles: () => ({ classes: { ellipsis: "ellipsis", link: "link" } }),
}));

import { useAuth } from "@/hooks";
import { useDebugMode } from "@/contexts";

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseDebugMode = useDebugMode as ReturnType<typeof vi.fn>;

const renderActivity = (activity: ActivityFragment) =>
  render(<Grid><Activity activity={activity} /></Grid>);

const baseActivity: ActivityFragment = {
  __typename: "Activity",
  id: "act-1",
  name: "Surf à Biarritz",
  city: "Biarritz",
  description: "Une activité de surf sympa",
  price: 50,
  createdAt: "2024-01-15T10:30:00.000Z",
  owner: { __typename: "User", firstName: "Jean", lastName: "Dupont" },
};

const adminUser = {
  id: "user-1",
  firstName: "Admin",
  lastName: "User",
  email: "admin@test.fr",
  role: "admin",
};

const regularUser = {
  id: "user-2",
  firstName: "Regular",
  lastName: "User",
  email: "user@test.fr",
  role: "user",
};

describe("le composant Activity", () => {
  it("affiche le nom, la ville, le prix et la description de l'activité", () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseDebugMode.mockReturnValue({ isDebugMode: false });

    renderActivity(baseActivity);

    expect(screen.getByText("Surf à Biarritz")).toBeInTheDocument();
    expect(screen.getByText("Biarritz")).toBeInTheDocument();
    expect(screen.getByText("50€/j")).toBeInTheDocument();
    expect(screen.getByText("Une activité de surf sympa")).toBeInTheDocument();
  });

  it("n'affiche pas la date de création par défaut (mode debug désactivé)", () => {
    mockUseAuth.mockReturnValue({ user: adminUser });
    mockUseDebugMode.mockReturnValue({ isDebugMode: false });

    renderActivity(baseActivity);

    expect(screen.queryByTestId("debug-created-at")).not.toBeInTheDocument();
  });

  it("n'affiche pas la date de création si le mode debug est actif mais l'utilisateur n'est pas admin", () => {
    mockUseAuth.mockReturnValue({ user: regularUser });
    mockUseDebugMode.mockReturnValue({ isDebugMode: true });

    renderActivity(baseActivity);

    expect(screen.queryByTestId("debug-created-at")).not.toBeInTheDocument();
  });

  it("n'affiche pas la date de création si aucun utilisateur n'est connecté, même en mode debug", () => {
    mockUseAuth.mockReturnValue({ user: null });
    mockUseDebugMode.mockReturnValue({ isDebugMode: true });

    renderActivity(baseActivity);

    expect(screen.queryByTestId("debug-created-at")).not.toBeInTheDocument();
  });

  it("affiche la date de création si le mode debug est actif et l'utilisateur est admin", () => {
    mockUseAuth.mockReturnValue({ user: adminUser });
    mockUseDebugMode.mockReturnValue({ isDebugMode: true });

    renderActivity(baseActivity);

    expect(screen.getByTestId("debug-created-at")).toBeInTheDocument();
    expect(screen.getByTestId("debug-created-at").textContent).toContain("Créé le :");
  });

  it("n'affiche pas la date de création si createdAt est absent, même en mode debug admin", () => {
    mockUseAuth.mockReturnValue({ user: adminUser });
    mockUseDebugMode.mockReturnValue({ isDebugMode: true });

    const activityWithoutDate: ActivityFragment = { ...baseActivity, createdAt: null };

    renderActivity(activityWithoutDate);

    expect(screen.queryByTestId("debug-created-at")).not.toBeInTheDocument();
  });
});
