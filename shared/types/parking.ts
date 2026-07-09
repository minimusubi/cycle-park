export interface ChargeStep {
	durationMinutes: number; // Duration of the charge block
	rate: number; // Fee for this duration block
	isRecurring: boolean; // Whether this charge repeats every durationMinutes thereafter
}

export interface PricingRate {
	id: string; // Unique identifier (e.g., "top-rack", "bottom-rack")
	name: string; // Display name of the rack/section (e.g., "Top Rack", "Bottom Rack")
	freePeriodMinutes: number; // Initial free parking duration (0 if none)
	chargeSteps: ChargeStep[]; // Array of sequential charging rules
}

export interface ParkingLocation {
	id: string;
	name: string;
	latitude: number;
	longitude: number;
	address: string;
	country: string; // e.g., "Japan", "United States", "United Kingdom"
	hoursOfOperation: string; // e.g., "24 Hours" or "08:00 - 22:00"
	paymentMethods: string[]; // Shorthand keys: e.g., ["cash", "ic", "paypay"]
	rates: PricingRate[]; // Pricing sections (e.g. bottom rack vs top rack)
	photoUrl?: string; // Base64 encoded image string or placeholder URL
	lastUpdated: string; // ISO string
}

export interface PaymentMethodDef {
	key: string;
	name: string;
	icon: string; // Material Symbols icon key
}

export const PAYMENT_METHODS: Record<string, PaymentMethodDef> = {
	cash: { key: 'cash', name: 'Cash', icon: 'payments' },
	credit: { key: 'credit', name: 'Credit Card', icon: 'credit_card' },
	ic: { key: 'ic', name: 'IC Card (Suica/Pasmo/etc.)', icon: 'contactless' },
	paypay: { key: 'paypay', name: 'PayPay', icon: 'qr_code' },
	linepay: { key: 'linepay', name: 'LINE Pay', icon: 'qr_code_2' },
	applepay: { key: 'applepay', name: 'Apple Pay', icon: 'contactless' },
	googlepay: { key: 'googlepay', name: 'Google Pay', icon: 'contactless' },
};

export interface CountryConfig {
	name: string;
	currencySymbol: string;
	currencyCode: string;
	/** Maximum decimal places to show when the amount has a fractional part.
	 *  Whole-number amounts always show 0 decimals regardless of this value. */
	maxDecimals: number;
	supportedPaymentMethods: string[]; // List of shorthand keys referring to PAYMENT_METHODS
}

export const COUNTRY_CONFIGS: Record<string, CountryConfig> = {
	Japan: {
		name: 'Japan',
		currencySymbol: '¥',
		currencyCode: 'JPY',
		maxDecimals: 0,
		supportedPaymentMethods: ['cash', 'credit', 'ic', 'paypay', 'linepay'],
	},
	'United States': {
		name: 'United States',
		currencySymbol: '$',
		currencyCode: 'USD',
		maxDecimals: 2,
		supportedPaymentMethods: ['cash', 'credit', 'applepay', 'googlepay'],
	},
	'United Kingdom': {
		name: 'United Kingdom',
		currencySymbol: '£',
		currencyCode: 'GBP',
		maxDecimals: 2,
		supportedPaymentMethods: ['cash', 'credit', 'applepay', 'googlepay'],
	},
};
