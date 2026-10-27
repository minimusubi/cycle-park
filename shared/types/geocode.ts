export interface GeocodeResult {
	place_id: string | number;
	display_name: string;
	lat: string;
	lon: string;
	[key: string]: unknown;
}
