<template>
	<div class="d-flex flex-column min-vh-100 hero-section">
		<AppNavbar
			container-class="container"
			:shadow="true"
		/>

		<!-- Hero Content -->
		<div class="container flex-grow-1 d-flex align-items-center py-12">
			<div
				class="row w-100 align-items-center justify-content-center g-12"
			>
				<!-- Text details -->
				<div class="col-12 lg:col-6 text-center lg:text-start">
					<span
						class="badge badge-subtle theme-primary px-5 py-3 rounded-pill fw-semibold mb-5"
					>
						🚴 Sustainable City Commuting
					</span>
					<h1
						class="hero-title fs-4xl fw-black tracking-tight mb-5"
						style="font-weight: 850; line-height: 1.1"
					>
						Find the Perfect <br />
						<span class="fg-primary">Bicycle Parking</span>
					</h1>
					<p
						class="fs-lg fg-secondary mb-7"
						style="max-width: 500px"
					>
						Locate bicycle racks nearby, calculate parking rates
						dynamically based on your stay duration, and compare
						payment methods across multiple countries.
					</p>

					<!-- Feature Bullets (Visible on Large Screens) -->
					<div class="d-none lg:d-flex flex-column gap-5">
						<div class="d-flex align-items-center">
							<div
								class="bg-primary bg-10 fg-primary rounded-circle p-3 d-inline-flex me-5"
							>
								<span class="material-symbols-outlined"
									>payments</span
								>
							</div>
							<div>
								<strong class="d-block small"
									>Dynamic Cost Estimator</strong
								>
								<span class="fg-secondary small"
									>Input your stay duration to see live rate
									updates.</span
								>
							</div>
						</div>
						<div class="d-flex align-items-center">
							<div
								class="bg-success bg-10 fg-success rounded-circle p-3 d-inline-flex me-5"
							>
								<span class="material-symbols-outlined"
									>map</span
								>
							</div>
							<div>
								<strong class="d-block small"
									>Interactive MapLibre Map</strong
								>
								<span class="fg-secondary small"
									>Drop custom destination pins anywhere to
									search.</span
								>
							</div>
						</div>
						<div class="d-flex align-items-center">
							<div
								class="bg-warning bg-10 fg-warning rounded-circle p-3 d-inline-flex me-5"
							>
								<span class="material-symbols-outlined"
									>credit_card</span
								>
							</div>
							<div>
								<strong class="d-block small"
									>Multi-Currency & Payments</strong
								>
								<span class="fg-secondary small"
									>Lookup cash, credit, or local contactless
									options.</span
								>
							</div>
						</div>
					</div>
				</div>

				<!-- Glassmorphism Search Console Card -->
				<div class="col-12 md:col-10 lg:col-6 xl:col-5">
					<div
						class="card glass-card border border-white border-10 p-3 shadow-lg"
					>
						<div class="card-body p-7">
							<h4 class="card-title fw-bold text-center mb-7">
								Start Your Search
							</h4>

							<LocationSearchInput
								v-model="addressInput"
								class="mb-5"
								label="1. Where are you heading?"
								placeholder="Enter station, address, or city..."
								:results="geocodeResults"
								:loading="geocodeLoading"
								:show-dropdown="showGeocodeDropdown"
								:max-dropdown-height="200"
								@input="onAddressInput"
								@focus="showGeocodeDropdown = true"
								@escape="showGeocodeDropdown = false"
								@clear="clearAddressSearch"
								@select="selectAddress"
							/>

							<DurationSelector
								v-model:slider-value="sliderValue"
								v-model:hours="durationHours"
								v-model:minutes="durationMinutes"
								class="mb-7"
								label="2. Stay duration (optional)"
								:presets="durationPresets"
								font-size="0.72rem"
								@slider-input="onSliderInput"
								@hours-change="onHoursChange"
								@minutes-change="onMinutesChange"
								@preset="applyPreset"
							/>

							<!-- Submit CTA -->
							<button
								type="button"
								class="btn btn-subtle theme-primary btn-lg w-100 py-5 rounded-5 d-flex align-items-center justify-content-center shadow"
								:disabled="!canSearch"
								@click="triggerSearch"
							>
								<span class="material-symbols-outlined me-3"
									>search</span
								>
								<span>Search Nearby Parking</span>
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Footer -->
		<footer
			class="bg-black fg-secondary py-7 text-center mt-auto border-top border-secondary border-10"
			data-bs-theme="dark"
		>
			<div class="container">
				<p class="mb-1 small">
					CyclePark Bike Locator Web Application.
				</p>
				<p
					class="mb-0 fg-secondary"
					style="font-size: 0.75rem"
				>
					Powered by Nuxt, Bootstrap & OpenMapTiles
				</p>
			</div>
		</footer>
	</div>
</template>

<script lang="ts" setup>
	import type { GeocodeResult } from '#shared/types/geocode';

	const router = useRouter();

	// Input states
	const addressInput = ref('');
	const sliderValue = ref(180); // Default 3 hours
	const durationHours = ref(3);
	const durationMinutes = ref(0);

	// Coordinates (Set default coordinates for search, center around Ikebukuro Station: 35.7289, 139.7104)
	const searchLat = ref(35.7289);
	const searchLng = ref(139.7104);

	// Geocode dropdown states
	const geocodeResults = ref<GeocodeResult[]>([]);
	const geocodeLoading = ref(false);
	const showGeocodeDropdown = ref(false);
	let geocodeTimeout: ReturnType<typeof setTimeout> | null = null;

	const durationPresets = [
		{ label: '1 Hour', value: 60 },
		{ label: '2 Hours', value: 120 },
		{ label: '3 Hours', value: 180 },
		{ label: '6 Hours', value: 360 },
		{ label: '12 Hours', value: 720 },
		{ label: '24 Hours', value: 1440 },
	];

	const canSearch = computed(() => addressInput.value.trim().length > 0);

	// Geocoding Autocomplete via Nominatim
	const onAddressInput = () => {
		if (geocodeTimeout) {
			clearTimeout(geocodeTimeout);
		}

		if (!addressInput.value || addressInput.value.trim().length < 3) {
			geocodeResults.value = [];
			return;
		}

		geocodeTimeout = setTimeout(async () => {
			geocodeLoading.value = true;
			try {
				const response = await $fetch<GeocodeResult[]>('/api/geocode', {
					query: { q: addressInput.value },
				});
				geocodeResults.value = response;
				showGeocodeDropdown.value = true;
			} catch (e) {
				console.error('Nominatim geocode failed', e);
			} finally {
				geocodeLoading.value = false;
			}
		}, 400);
	};

	const selectAddress = (res: GeocodeResult) => {
		const lat = parseFloat(res.lat);
		const lng = parseFloat(res.lon);

		addressInput.value = res.display_name;
		searchLat.value = lat;
		searchLng.value = lng;
		showGeocodeDropdown.value = false;
		geocodeResults.value = [];
	};

	const clearAddressSearch = () => {
		addressInput.value = '';
		geocodeResults.value = [];
		showGeocodeDropdown.value = false;
		searchLat.value = 35.7289;
		searchLng.value = 139.7104;
	};

	// Sync duration slider and hour/min inputs
	const onSliderInput = () => {
		durationHours.value = Math.floor(sliderValue.value / 60);
		durationMinutes.value = sliderValue.value % 60;
	};

	const onHoursChange = () => {
		sanitizeDurationInputs();
		sliderValue.value = durationHours.value * 60 + durationMinutes.value;
	};

	const onMinutesChange = () => {
		sanitizeDurationInputs();
		sliderValue.value = durationHours.value * 60 + durationMinutes.value;
	};

	const sanitizeDurationInputs = () => {
		if (durationHours.value === null || durationHours.value < 0) {
			durationHours.value = 0;
		}
		if (durationHours.value > 48) {
			durationHours.value = 48;
		}
		if (durationMinutes.value === null || durationMinutes.value < 0) {
			durationMinutes.value = 0;
		}
		if (durationMinutes.value > 59) {
			durationMinutes.value = 59;
		}
	};

	const applyPreset = (minutes: number) => {
		sliderValue.value = minutes;
		durationHours.value = Math.floor(minutes / 60);
		durationMinutes.value = minutes % 60;
	};

	// Redirect to Search Page with URL query params
	const triggerSearch = () => {
		if (!canSearch.value) {
			return;
		}

		const queryParams: Record<string, string> = {
			lat: searchLat.value.toString(),
			lng: searchLng.value.toString(),
			duration: sliderValue.value.toString(),
		};

		queryParams.q = addressInput.value.trim();

		router.push({
			path: '/search',
			query: queryParams,
		});
	};
</script>

<style lang="scss" scoped>
	.hero-title {
		background: linear-gradient(
			135deg,
			var(--bs-fg-body) 30%,
			color-mix(in oklch, var(--bs-fg-body) 60%, transparent) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.btn-xs {
		padding: 0.15rem 0.5rem;
		font-size: 0.72rem;
		line-height: 1.2;
	}
</style>
