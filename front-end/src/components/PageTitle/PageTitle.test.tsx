import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { PageTitle } from "./PageTitle";

const getTitle = () => screen.getByRole("heading", { name: /Title/i });
const getButton = () => screen.queryByRole("button");
const getLink = () => screen.queryByRole("link");

describe("le composant PageTitle", () => {
  it("affiche uniquement le titre si prevPath n'est pas défini", () => {
    render(<PageTitle title="Title" />);

    expect(getTitle()).toBeInTheDocument();
    expect(getButton()).not.toBeInTheDocument();
    expect(getLink()).not.toBeInTheDocument();
  });

  it("affiche le texte du titre correctement", () => {
    render(<PageTitle title="Mon activité" />);

    expect(screen.getByRole("heading", { name: "Mon activité" })).toBeInTheDocument();
  });

  describe("prevPath est une string", () => {
    it("affiche le titre, un bouton et un lien", () => {
      render(<PageTitle title="Title" prevPath="/" />);

      expect(getTitle()).toBeInTheDocument();
      expect(getButton()).toBeInTheDocument();
      expect(getLink()).toBeInTheDocument();
    });

    it("le lien pointe vers le bon href", () => {
      render(<PageTitle title="Title" prevPath="/activities" />);

      expect(getLink()).toHaveAttribute("href", "/activities");
    });
  });

  describe("prevPath est une fonction", () => {
    it("affiche le titre et un bouton, sans lien", async () => {
      const goBack = vi.fn();
      render(<PageTitle title="Title" prevPath={goBack} />);

      expect(getTitle()).toBeInTheDocument();
      expect(getLink()).not.toBeInTheDocument();
      expect(getButton()).toBeInTheDocument();
    });

    it("appelle la fonction au clic", async () => {
      const goBack = vi.fn();
      render(<PageTitle title="Title" prevPath={goBack} />);

      userEvent.click(getButton()!);

      await waitFor(() => expect(goBack).toHaveBeenCalledTimes(1));
    });

    it("n'appelle pas la fonction avant le clic", () => {
      const goBack = vi.fn();
      render(<PageTitle title="Title" prevPath={goBack} />);

      expect(goBack).not.toHaveBeenCalled();
    });
  });
});
