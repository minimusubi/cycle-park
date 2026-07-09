import type { PricingRate } from '../types/parking';
import { COUNTRY_CONFIGS } from '../types/parking';

/**
 * Calculates the parking fee for a given pricing rate and duration in minutes.
 */
export function calculateParkingFee(
	rate: PricingRate,
	durationMinutes: number,
): number {
	if (durationMinutes <= 0) {
		return 0;
	}

	// If stay is within the free period, it's free.
	if (durationMinutes <= rate.freePeriodMinutes) {
		return 0;
	}

	let remainingMinutes = durationMinutes - rate.freePeriodMinutes;
	let totalFee = 0;

	for (const step of rate.chargeSteps) {
		if (remainingMinutes <= 0) {
			break;
		}

		if (!step.isRecurring) {
			// Flat fee for this duration step
			totalFee += step.rate;
			remainingMinutes -= step.durationMinutes;
		} else {
			// Recurring fee block (lasts until the remaining time is exhausted)
			const blocks = Math.ceil(remainingMinutes / step.durationMinutes);
			totalFee += blocks * step.rate;
			remainingMinutes = 0; // Exits the loop
		}
	}

	return totalFee;
}

/**
 * Calculates the Haversine distance between two coordinates in kilometers.
 */
export function getHaversineDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371; // Radius of the Earth in km
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;

	const a =
		Math.sin(dLat / 2) * Math.sin(dLat / 2)
		+ Math.cos((lat1 * Math.PI) / 180)
			* Math.cos((lat2 * Math.PI) / 180)
			* Math.sin(dLon / 2)
			* Math.sin(dLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c; // Distance in km
}

/**
 * Formats a distance in kilometers to a readable string.
 * Under 1km shows in meters (e.g. "350m").
 * 1km and above shows in kilometers (e.g. "1.2km").
 */
export function formatDistance(distanceKm: number): string {
	if (distanceKm < 1) {
		return `${Math.round(distanceKm * 1000)}m`;
	}
	return `${distanceKm.toFixed(1)}km`;
}

/**
 * Formats a currency amount dynamically based on country configuration.
 * - Whole-number amounts always display with 0 decimals.
 * - Fractional amounts are formatted using toFixed(cfg.maxDecimals).
 * - e.g. JPY (maxDecimals: 0) -> always "¥100", never "¥100.5"
 * - e.g. USD (maxDecimals: 2) -> "$16" for whole, "$16.50" for fractional
 */
export function formatCurrency(amount: number, countryName: string): string {
	const cfg = COUNTRY_CONFIGS[countryName] || COUNTRY_CONFIGS['Japan'];
	const symbol = cfg.currencySymbol;

	if (Number.isInteger(amount) || cfg.maxDecimals === 0) {
		return `${symbol}${Math.round(amount).toLocaleString()}`;
	}

	return `${symbol}${amount.toFixed(cfg.maxDecimals)}`;
}
