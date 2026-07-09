<template>
	<div class="d-flex flex-column min-vh-100 hero-section">
		<!-- Navbar -->
		<nav
			class="navbar navbar-expand-lg navbar-dark bg-dark px-3 py-2 border-bottom border-secondary border-opacity-20 shadow-sm"
		>
			<div class="container">
				<NuxtLink
					to="/"
					class="navbar-brand d-flex align-items-center"
				>
					<span class="material-symbols-outlined logo-icon me-2"
						>directions_bike</span
					>
					<span>CyclePark</span>
				</NuxtLink>
				<button
					class="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNav"
				>
					<span class="navbar-toggler-icon"></span>
				</button>
				<div
					id="navbarNav"
					class="collapse navbar-collapse"
				>
					<ul class="navbar-nav ms-auto align-items-center">
						<li class="nav-item">
							<NuxtLink
								to="/"
								class="nav-link active"
								>Home</NuxtLink
							>
						</li>
						<li class="nav-item">
							<NuxtLink
								to="/search"
								class="nav-link"
								>Find Parking</NuxtLink
							>
						</li>
						<li class="nav-item">
							<NuxtLink
								to="/admin"
								class="nav-link btn btn-outline-primary btn-sm text-white ms-lg-2 px-3 py-1"
							>
								<span
									class="material-symbols-outlined align-middle me-1"
									style="font-size: 1.1rem"
									>admin_panel_settings</span
								>
								Admin Portal
							</NuxtLink>
						</li>
						<li class="nav-item ms-lg-3 mt-2 mt-lg-0">
							<!-- Theme Toggle -->
							<button
								class="btn btn-sm btn-link text-secondary p-1 border-0"
								title="Toggle Theme"
								@click="toggleColorMode"
							>
								<span
									v-if="colorMode.preference === 'dark'"
									class="material-symbols-outlined text-warning"
									>light_mode</span
								>
								<span
									v-else
									class="material-symbols-outlined text-light"
									>dark_mode</span
								>
							</button>
						</li>
					</ul>
				</div>
			</div>
		</nav>

		<!-- Hero Content -->
		<div class="container flex-grow-1 d-flex align-items-center py-5">
			<div
				class="row w-100 align-items-center justify-content-center g-5"
			>
				<!-- Text details -->
				<div class="col-12 col-lg-6 text-center text-lg-start">
					<span
						class="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-20 px-3 py-2 rounded-pill fw-semibold mb-3"
					>
						🚴 Sustainable City Commuting
					</span>
					<h1
						class="display-4 fw-black tracking-tight mb-3"
						style="font-weight: 850; line-height: 1.1"
					>
						Find the Perfect <br />
						<span class="text-primary">Bicycle Parking</span>
					</h1>
					<p
						class="lead text-secondary mb-4"
						style="max-width: 500px"
					>
						Locate bicycle racks nearby, calculate parking rates
						dynamically based on your stay duration, and compare
						payment methods across multiple countries.
					</p>

					<!-- Feature Bullets (Visible on Large Screens) -->
					<div class="d-none d-lg-flex flex-column gap-3">
						<div class="d-flex align-items-center">
							<div
								class="bg-primary bg-opacity-10 text-primary rounded-circle p-2 d-inline-flex me-3"
							>
								<span class="material-symbols-outlined"
									>payments</span
								>
							</div>
							<div>
								<strong class="d-block small"
									>Dynamic Cost Estimator</strong
								>
								<span class="text-muted small"
									>Input your stay duration to see live rate
									updates.</span
								>
							</div>
						</div>
						<div class="d-flex align-items-center">
							<div
								class="bg-success bg-opacity-10 text-success rounded-circle p-2 d-inline-flex me-3"
							>
								<span class="material-symbols-outlined"
									>map</span
								>
							</div>
							<div>
								<strong class="d-block small"
									>Interactive Leaflet Map</strong
								>
								<span class="text-muted small"
									>Drop custom destination pins anywhere to
									search.</span
								>
							</div>
						</div>
						<div class="d-flex align-items-center">
							<div
								class="bg-warning bg-opacity-10 text-warning rounded-circle p-2 d-inline-flex me-3"
							>
								<span class="material-symbols-outlined"
									>credit_card</span
								>
							</div>
							<div>
								<strong class="d-block small"
									>Multi-Currency & Payments</strong
								>
								<span class="text-muted small"
									>Lookup cash, credit, or local contactless
									options.</span
								>
							</div>
						</div>
					</div>
				</div>

				<!-- Glassmorphism Search Console Card -->
				<div class="col-12 col-md-10 col-lg-6 col-xl-5">
					<div
						class="card glass-card border border-light border-opacity-10 p-2 shadow-lg"
					>
						<div class="card-body p-4">
							<h4 class="card-title fw-bold text-center mb-4">
								Start Your Search
							</h4>

							<!-- Address/Location Search -->
							<div class="position-relative mb-3">
								<label
									class="form-label small fw-semibold text-secondary"
									>1. Where are you heading?</label
								>
								<div class="input-group">
									<span
										class="input-group-text bg-light text-secondary border-end-0"
									>
										<span
											class="material-symbols-outlined"
											style="font-size: 1.2rem"
											>location_on</span
										>
									</span>
									<input
										v-model="addressInput"
										type="text"
										class="form-control border-start-0"
										placeholder="Enter station, address, or city..."
										@input="onAddressInput"
										@focus="showGeocodeDropdown = true"
										@keydown.escape="
											showGeocodeDropdown = false
										"
									/>
									<button
										v-if="addressInput"
										class="btn btn-outline-secondary border-start-0"
										@click="clearAddressSearch"
									>
										<span
											class="material-symbols-outlined"
											style="font-size: 1.1rem"
											>close</span
										>
									</button>
								</div>

								<!-- Geocoding Autocomplete Dropdown -->
								<div
									v-if="
										showGeocodeDropdown
										&& geocodeResults.length > 0
									"
									class="position-absolute w-100 bg-body shadow rounded-3 border mt-1 overflow-hidden"
									style="
										z-index: 1050;
										max-height: 200px;
										overflow-y: auto;
									"
								>
									<div
										v-for="res in geocodeResults"
										:key="res.place_id"
										class="p-2 border-bottom hover-bg-light cursor-pointer text-start"
										@click="selectAddress(res)"
									>
										<div
											class="fw-bold small text-truncate"
										>
											{{ res.display_name.split(',')[0] }}
										</div>
										<div
											class="text-secondary"
											style="
												font-size: 0.72rem;
												overflow: hidden;
												text-overflow: ellipsis;
												white-space: nowrap;
											"
										>
											{{ res.display_name }}
										</div>
									</div>
								</div>

								<!-- Geocoding spinner -->
								<div
									v-if="geocodeLoading"
									class="position-absolute end-0 top-50 translate-middle-y me-5 mt-2 spinner-border spinner-border-sm text-primary"
									role="status"
								></div>
							</div>

							<!-- Duration text box / slider combo -->
							<div class="mb-4">
								<div
									class="d-flex justify-content-between align-items-center mb-1"
								>
									<label
										class="form-label small fw-semibold text-secondary mb-0"
										>2. Stay duration (optional)</label
									>
									<div class="d-flex align-items-center">
										<input
											v-model="durationHours"
											type="number"
											class="form-control form-control-sm text-center fw-bold me-1"
											style="width: 50px"
											min="0"
											max="48"
											@change="onHoursChange"
										/>
										<span class="small text-secondary me-2"
											>h</span
										>
										<input
											v-model="durationMinutes"
											type="number"
											class="form-control form-control-sm text-center fw-bold me-1"
											style="width: 50px"
											min="0"
											max="59"
											@change="onMinutesChange"
										/>
										<span class="small text-secondary"
											>m</span
										>
									</div>
								</div>

								<!-- Slider -->
								<input
									v-model="sliderValue"
									type="range"
									class="price-slider"
									min="0"
									max="1440"
									step="15"
									@input="onSliderInput"
								/>

								<!-- Quick Presets -->
								<div
									class="d-flex flex-wrap gap-1 mt-2 justify-content-between"
								>
									<button
										v-for="preset in durationPresets"
										:key="preset.value"
										class="btn btn-xs py-0.5 px-2 border rounded-pill text-nowrap"
										:class="
											sliderValue === preset.value ?
												'btn-primary text-white border-primary'
											:	'btn-light text-dark'
										"
										style="font-size: 0.72rem"
										@click="applyPreset(preset.value)"
									>
										{{ preset.label }}
									</button>
								</div>
							</div>

							<!-- Submit CTA -->
							<button
								class="btn btn-primary btn-lg w-100 py-3 rounded-3 d-flex align-items-center justify-content-center shadow"
								@click="triggerSearch"
							>
								<span class="material-symbols-outlined me-2"
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
			class="bg-dark text-secondary py-4 text-center mt-auto border-top border-secondary border-opacity-10"
		>
			<div class="container">
				<p class="mb-1 small">
					CyclePark Bike Locator Web Application.
				</p>
				<p
					class="mb-0 text-muted"
					style="font-size: 0.75rem"
				>
					Powered by Nuxt, Bootstrap & OpenStreetMap
				</p>
			</div>
		</footer>
	</div>
</template>

<script lang="ts" setup>
	import { useRouter } from 'vue-router';

	const router = useRouter();
	const colorMode = useColorMode();

	// Input states
	const addressInput = ref('');
	const sliderValue = ref(180); // Default 3 hours
	const durationHours = ref(3);
	const durationMinutes = ref(0);

	// Coordinates (Set default coordinates for search, center around Ikebukuro Station: 35.7289, 139.7104)
	const searchLat = ref(35.7289);
	const searchLng = ref(139.7104);

	// Geocode dropdown states
	const geocodeResults = ref<any[]>([]);
	const geocodeLoading = ref(false);
	const showGeocodeDropdown = ref(false);
	let geocodeTimeout: any = null;

	const durationPresets = [
		{ label: '1 Hour', value: 60 },
		{ label: '2 Hours', value: 120 },
		{ label: '3 Hours', value: 180 },
		{ label: '6 Hours', value: 360 },
		{ label: '12 Hours', value: 720 },
		{ label: '24 Hours', value: 1440 },
	];

	const toggleColorMode = () => {
		colorMode.preference =
			colorMode.preference === 'dark' ? 'light' : 'dark';
	};

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
				const queryUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(addressInput.value)}`;
				const response = await $fetch<any[]>(queryUrl);
				geocodeResults.value = response;
				showGeocodeDropdown.value = true;
			} catch (e) {
				console.error('Nominatim geocode failed', e);
			} finally {
				geocodeLoading.value = false;
			}
		}, 400);
	};

	const selectAddress = (res: any) => {
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
		const queryParams: Record<string, string> = {
			lat: searchLat.value.toString(),
			lng: searchLng.value.toString(),
			duration: sliderValue.value.toString(),
		};

		if (addressInput.value) {
			queryParams.q = addressInput.value;
		} else {
			// If empty address, default to Ikebukuro Station
			queryParams.q = 'Ikebukuro Station, Tokyo, Japan';
			queryParams.lat = '35.7289';
			queryParams.lng = '139.7104';
		}

		router.push({
			path: '/search',
			query: queryParams,
		});
	};
</script>

<style lang="scss" scoped>
	.display-4 {
		background: linear-gradient(
			135deg,
			var(--bs-emphasis-color) 30%,
			rgba(var(--bs-emphasis-color-rgb), 0.6) 100%
		);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.hover-bg-light:hover {
		background-color: var(--bs-light);
	}

	.btn-xs {
		padding: 0.15rem 0.5rem;
		font-size: 0.72rem;
		line-height: 1.2;
	}

	.hover-bg-light {
		transition: background-color 0.15s ease;
	}
</style>
