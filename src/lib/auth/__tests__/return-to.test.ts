import {
  buildLoginHref,
  DEFAULT_RETURN_PATH,
  getSafeReturnPath,
  isSafeRelativePath,
} from "../return-to";

describe("isSafeRelativePath", () => {
  test("accepts root and relative paths", () => {
    expect(isSafeRelativePath("/")).toBe(true);
    expect(isSafeRelativePath("/discover")).toBe(true);
    expect(isSafeRelativePath("/property/abc")).toBe(true);
  });

  test("accepts query strings and hashes", () => {
    expect(isSafeRelativePath("/bookings/new?propertyId=abc")).toBe(true);
    expect(isSafeRelativePath("/search?city=delhi")).toBe(true);
  });

  test("rejects external and protocol-relative URLs", () => {
    expect(isSafeRelativePath("https://evil.example")).toBe(false);
    expect(isSafeRelativePath("//evil.example")).toBe(false);
  });

  test("rejects backslashes and control characters", () => {
    expect(isSafeRelativePath("/\\evil.example")).toBe(false);
    expect(isSafeRelativePath("/path\r\n")).toBe(false);
  });

  test("rejects non-strings and empty values", () => {
    expect(isSafeRelativePath(undefined)).toBe(false);
    expect(isSafeRelativePath(null)).toBe(false);
    expect(isSafeRelativePath("")).toBe(false);
    expect(isSafeRelativePath("discover")).toBe(false);
  });
});

describe("getSafeReturnPath", () => {
  test("returns the path when valid", () => {
    expect(getSafeReturnPath("/yourBookings")).toBe("/yourBookings");
    expect(getSafeReturnPath("/bookings/new?propertyId=x")).toBe(
      "/bookings/new?propertyId=x",
    );
  });

  test("falls back to discover for invalid input", () => {
    expect(getSafeReturnPath("https://evil.example")).toBe(
      DEFAULT_RETURN_PATH,
    );
    expect(getSafeReturnPath(undefined)).toBe(DEFAULT_RETURN_PATH);
    expect(getSafeReturnPath("")).toBe(DEFAULT_RETURN_PATH);
  });
});

describe("buildLoginHref", () => {
  test("builds an encoded login href", () => {
    expect(buildLoginHref("/discover")).toBe("/login?returnTo=%2Fdiscover");
    expect(buildLoginHref("/bookings/new?propertyId=x")).toBe(
      "/login?returnTo=%2Fbookings%2Fnew%3FpropertyId%3Dx",
    );
  });

  test("falls back to discover for unsafe input", () => {
    expect(buildLoginHref("https://evil.example")).toBe(
      `/login?returnTo=${encodeURIComponent(DEFAULT_RETURN_PATH)}`,
    );
  });
});
