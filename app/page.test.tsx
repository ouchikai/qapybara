import { render, screen } from "@testing-library/react";
import Home from "./page";

describe("Home", () => {
  it("renders new app heading", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { name: "New App" }),
    ).toBeInTheDocument();
  });
});
