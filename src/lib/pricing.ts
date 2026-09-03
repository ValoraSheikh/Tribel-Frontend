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

  if (nights < 30) {
    return {
      nights,
      months: 0,
      rateType: "NIGHTLY",
      nightlyRate,
      monthlyRate,
      total: round2(nights * nightlyRate),
    };
  }

  const months = Math.ceil(nights / 30);

  return {
    nights,
    months,
    rateType: "MONTHLY",
    nightlyRate,
    monthlyRate,
    total: round2(months * monthlyRate),
  };
}
