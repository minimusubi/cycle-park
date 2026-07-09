import { calculateParkingFee, formatCurrency } from './pricing';
import type { PricingRate } from '../types/parking';

// Mock Lot A
// 2 hours free, next 6 hours 100 yen, 100 yen per 2 hours after
const lotARate: PricingRate = {
	id: 'lot-a',
	name: 'Lot A - Racks',
	freePeriodMinutes: 120, // 2 hours free
	chargeSteps: [
		{ durationMinutes: 360, rate: 100, isRecurring: false }, // next 6 hours (up to 8h total) = 100 yen
		{ durationMinutes: 120, rate: 100, isRecurring: true }, // 100 yen per 2 hours after
	],
};

// Mock Lot B
// 100 yen per 4 hours
const lotBRate: PricingRate = {
	id: 'lot-b',
	name: 'Lot B - Racks',
	freePeriodMinutes: 0,
	chargeSteps: [
		{ durationMinutes: 240, rate: 100, isRecurring: true }, // 100 yen per 4 hours
	],
};

// Mock Lot C
// 100 yen for the first 10 hours, then 100 yen per 5 hours after
const lotCRate: PricingRate = {
	id: 'lot-c',
	name: 'Lot C - First 10h then 5h',
	freePeriodMinutes: 0,
	chargeSteps: [
		{ durationMinutes: 600, rate: 100, isRecurring: false }, // 100 yen for first 10 hours
		{ durationMinutes: 300, rate: 100, isRecurring: true }, // 100 yen per 5 hours after
	],
};

interface TestCase {
	name: string;
	rate: PricingRate;
	durationMinutes: number;
	expectedFee: number;
}

const testCases: TestCase[] = [
	// Lot A cases
	{
		name: 'Lot A - 1 hour (within free period)',
		rate: lotARate,
		durationMinutes: 60,
		expectedFee: 0,
	},
	{
		name: 'Lot A - 2 hours (exact free period limit)',
		rate: lotARate,
		durationMinutes: 120,
		expectedFee: 0,
	},
	{
		name: 'Lot A - 3 hours (inside first 6 hours block)',
		rate: lotARate,
		durationMinutes: 180,
		expectedFee: 100,
	},
	{
		name: 'Lot A - 8 hours (exactly at end of first 6 hours block)',
		rate: lotARate,
		durationMinutes: 480,
		expectedFee: 100,
	},
	{
		name: 'Lot A - 9 hours (goes 1 hour into recurring 2 hour block)',
		rate: lotARate,
		durationMinutes: 540,
		expectedFee: 200,
	},
	{
		name: 'Lot A - 10 hours (exactly at end of first recurring block)',
		rate: lotARate,
		durationMinutes: 600,
		expectedFee: 200,
	},
	{
		name: 'Lot A - 11 hours (goes into second recurring block)',
		rate: lotARate,
		durationMinutes: 660,
		expectedFee: 300,
	},

	// Lot B cases
	{
		name: 'Lot B - 1 hour',
		rate: lotBRate,
		durationMinutes: 60,
		expectedFee: 100,
	},
	{
		name: 'Lot B - 3 hours',
		rate: lotBRate,
		durationMinutes: 180,
		expectedFee: 100,
	},
	{
		name: 'Lot B - 4 hours',
		rate: lotBRate,
		durationMinutes: 240,
		expectedFee: 100,
	},
	{
		name: 'Lot B - 5 hours',
		rate: lotBRate,
		durationMinutes: 300,
		expectedFee: 200,
	},
	{
		name: 'Lot B - 8 hours',
		rate: lotBRate,
		durationMinutes: 480,
		expectedFee: 200,
	},
	{
		name: 'Lot B - 9 hours',
		rate: lotBRate,
		durationMinutes: 540,
		expectedFee: 300,
	},

	// Lot C cases
	{
		name: 'Lot C - 5 hours (inside first 10h block)',
		rate: lotCRate,
		durationMinutes: 300,
		expectedFee: 100,
	},
	{
		name: 'Lot C - 10 hours (exact 10h limit)',
		rate: lotCRate,
		durationMinutes: 600,
		expectedFee: 100,
	},
	{
		name: 'Lot C - 11 hours (1h into next 5h block)',
		rate: lotCRate,
		durationMinutes: 660,
		expectedFee: 200,
	},
	{
		name: 'Lot C - 15 hours (exact end of first recurring 5h block)',
		rate: lotCRate,
		durationMinutes: 900,
		expectedFee: 200,
	},
	{
		name: 'Lot C - 16 hours (into second recurring block)',
		rate: lotCRate,
		durationMinutes: 960,
		expectedFee: 300,
	},
];

let failed = false;
console.log('Running pricing calculation tests...\n');

for (const tc of testCases) {
	const actualFee = calculateParkingFee(tc.rate, tc.durationMinutes);
	if (actualFee === tc.expectedFee) {
		console.log(
			`✅ PASS: ${tc.name} -> expected ${tc.expectedFee}, got ${actualFee}`,
		);
	} else {
		console.error(
			`❌ FAIL: ${tc.name} -> expected ${tc.expectedFee}, got ${actualFee}`,
		);
		failed = true;
	}
}

if (failed) {
	console.error('\nSome tests FAILED.');
	process.exit(1);
}

console.log('\nRunning currency formatting tests...\n');
const formatTestCases = [
	{ amount: 100, country: 'Japan', expected: '¥100' },
	{ amount: 100.5, country: 'Japan', expected: '¥101' }, // maxDecimals: 0 -> rounds to integer
	{ amount: 16, country: 'United States', expected: '$16' }, // whole number, no decimals
	{ amount: 16.5, country: 'United States', expected: '$16.50' }, // maxDecimals: 2 -> toFixed(2)
	{ amount: 16.25, country: 'United States', expected: '$16.25' }, // maxDecimals: 2
	{ amount: 15, country: 'United Kingdom', expected: '£15' }, // whole number, no decimals
	{ amount: 15.5, country: 'United Kingdom', expected: '£15.50' }, // maxDecimals: 2 -> toFixed(2)
];

for (const tc of formatTestCases) {
	const actual = formatCurrency(tc.amount, tc.country);
	if (actual === tc.expected) {
		console.log(
			`✅ PASS: formatCurrency(${tc.amount}, "${tc.country}") -> expected "${tc.expected}", got "${actual}"`,
		);
	} else {
		console.error(
			`❌ FAIL: formatCurrency(${tc.amount}, "${tc.country}") -> expected "${tc.expected}", got "${actual}"`,
		);
		failed = true;
	}
}

if (failed) {
	console.error('\nSome tests FAILED.');
	process.exit(1);
} else {
	console.log('\nAll tests PASSED successfully!');
}
