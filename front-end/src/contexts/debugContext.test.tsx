import { render, screen, act, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { DebugProvider, useDebugMode } from "./debugContext";

vi.mock("@/hooks", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@apollo/client", () => ({
  useMutation: vi.fn(),
}));

vi.mock("@/graphql/mutations/me/setDebugMode", () => ({
  default: "SetDebugModeMutation",
}));

import { useAuth } from "@/hooks";
import { useMutation } from "@apollo/client";

const mockUseAuth = useAuth as ReturnType<typeof vi.fn>;
const mockUseMutation = useMutation as ReturnType<typeof vi.fn>;

const mockSetDebugMode = vi.fn().mockResolvedValue({});

function DebugConsumer() {
  const { isDebugMode, toggleDebugMode } = useDebugMode();
  return (
    <div>
      <span data-testid="mode">{isDebugMode ? "on" : "off"}</span>
      <button onClick={toggleDebugMode}>toggle</button>
    </div>
  );
}

function renderWithProvider(ui: React.ReactNode) {
  return render(<DebugProvider>{ui}</DebugProvider>);
}

describe("DebugProvider", () => {
  beforeEach(() => {
    mockUseMutation.mockReturnValue([mockSetDebugMode, {}]);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("démarre avec le mode debug désactivé", () => {
    mockUseAuth.mockReturnValue({ user: null });

    renderWithProvider(<DebugConsumer />);

    expect(screen.getByTestId("mode").textContent).toBe("off");
  });

  it("initialise isDebugMode depuis user.debugModeEnabled pour un admin", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "admin", debugModeEnabled: true },
    });

    renderWithProvider(<DebugConsumer />);

    expect(screen.getByTestId("mode").textContent).toBe("on");
  });

  it("n'initialise pas isDebugMode pour un user non-admin", () => {
    mockUseAuth.mockReturnValue({
      user: { id: "2", role: "user", debugModeEnabled: true },
    });

    renderWithProvider(<DebugConsumer />);

    expect(screen.getByTestId("mode").textContent).toBe("off");
  });

  it("n'initialise pas isDebugMode si user est null", () => {
    mockUseAuth.mockReturnValue({ user: null });

    renderWithProvider(<DebugConsumer />);

    expect(screen.getByTestId("mode").textContent).toBe("off");
  });

  it("toggleDebugMode ne fait rien si le user n'est pas admin", async () => {
    mockUseAuth.mockReturnValue({ user: { id: "2", role: "user", debugModeEnabled: false } });

    renderWithProvider(<DebugConsumer />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByTestId("mode").textContent).toBe("off");
    expect(mockSetDebugMode).not.toHaveBeenCalled();
  });

  it("toggleDebugMode ne fait rien si user est null", async () => {
    mockUseAuth.mockReturnValue({ user: null });

    renderWithProvider(<DebugConsumer />);

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByTestId("mode").textContent).toBe("off");
    expect(mockSetDebugMode).not.toHaveBeenCalled();
  });

  it("toggleDebugMode active le mode debug pour un admin et appelle la mutation", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "admin", debugModeEnabled: false },
    });

    renderWithProvider(<DebugConsumer />);

    expect(screen.getByTestId("mode").textContent).toBe("off");

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByTestId("mode").textContent).toBe("on");
    expect(mockSetDebugMode).toHaveBeenCalledWith({ variables: { enabled: true } });
  });

  it("toggleDebugMode désactive le mode debug pour un admin et appelle la mutation", async () => {
    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "admin", debugModeEnabled: true },
    });

    renderWithProvider(<DebugConsumer />);

    expect(screen.getByTestId("mode").textContent).toBe("on");

    await userEvent.click(screen.getByRole("button"));

    expect(screen.getByTestId("mode").textContent).toBe("off");
    expect(mockSetDebugMode).toHaveBeenCalledWith({ variables: { enabled: false } });
  });

  it("met à jour isDebugMode lorsque l'identité du user change", async () => {
    const { rerender } = renderWithProvider(<DebugConsumer />);

    mockUseAuth.mockReturnValue({
      user: { id: "1", role: "admin", debugModeEnabled: true },
    });

    rerender(
      <DebugProvider>
        <DebugConsumer />
      </DebugProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("mode").textContent).toBe("on")
    );
  });
});

describe("useDebugMode hors contexte", () => {
  it("retourne les valeurs par défaut du contexte", () => {
    function Bare() {
      const { isDebugMode } = useDebugMode();
      return <span>{isDebugMode ? "on" : "off"}</span>;
    }
    render(<Bare />);
    expect(screen.getByText("off")).toBeInTheDocument();
  });
});
