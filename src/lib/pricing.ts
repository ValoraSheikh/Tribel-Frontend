export interface BookingPriceBreakdown {
  nights: number;
  months: number;
  rateType: "NIGHTLY" | "MONTHLY";
  nightlyRate: number;
  monthlyRate: number;
  total: number;
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

// Mirrors the server-side pricing in booking-state.service.ts. The backend
// remains authoritative — this exists so the booking flow can preview the
// same breakdown before submitting.
export function computeBookingPrice(
  pricePerBed: number,
  startDate: Date,
  endDate: Date,
): BookingPriceBreakdown {
  const msPerNight = 24 * 60 * 60 * 1000;
  const nights = Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / msPerNight),
  );

  const monthlyRate = round2(pricePerBed);
  const nightlyRate = round2(pricePerBed / 30);

  // Full months at the monthly rate, leftover nights at the nightly rate.
  // Ceiling the remainder into a whole month made 31 nights bill as two months —
  // a doubling cliff at every 30-day boundary.
  const months = Math.floor(nights / 30);
  const remainderNights = nights - months * 30;

  return {
    nights,
    months,
    rateType: months > 0 ? "MONTHLY" : "NIGHTLY",
    nightlyRate,
    monthlyRate,
    total: round2(months * monthlyRate + remainderNights * nightlyRate),
  };
}
