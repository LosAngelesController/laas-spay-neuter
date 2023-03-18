import { render, screen } from "@testing-library/react";

import Home from "@/pages/index";

describe("renders correctly", () => {
  it("renders the heading", () => {
    render(<Home />);

    const heading = screen.getByText(/311 Homeless Encampment Requests/i);

    expect(heading).toBeInTheDocument();
  });
});
