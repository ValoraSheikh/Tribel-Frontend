import { fireEvent, render, screen } from "@testing-library/react";
import { BookingLoginDialog } from "../booking-login-dialog";

describe("BookingLoginDialog", () => {
  test("shows the title, description, and actions", () => {
    render(
      <BookingLoginDialog
        open
        onOpenChange={() => {}}
        returnTo="/property/abc"
      />,
    );

    expect(screen.getByText("Log in to request this bunk")).toBeInTheDocument();
    expect(
      screen.getByText("Your dates and room choice come next."),
    ).toBeInTheDocument();
    expect(screen.getByText("Log in to continue")).toBeInTheDocument();
    expect(screen.getByText("Keep browsing")).toBeInTheDocument();
  });

  test("login link carries the encoded return path", () => {
    render(
      <BookingLoginDialog
        open
        onOpenChange={() => {}}
        returnTo="/property/abc"
      />,
    );

    const loginLink = screen.getByRole("link", {
      name: "Log in to continue",
    });
    expect(loginLink).toHaveAttribute(
      "href",
      "/login?returnTo=%2Fproperty%2Fabc",
    );
  });

  test("Keep browsing closes the dialog", () => {
    const onOpenChange = jest.fn();
    render(
      <BookingLoginDialog
        open
        onOpenChange={onOpenChange}
        returnTo="/property/abc"
      />,
    );

    fireEvent.click(screen.getByText("Keep browsing"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
