<template>
	<div class="d-flex flex-column min-vh-100 bg-light">
		<!-- Navbar -->
		<nav
			class="navbar navbar-expand-lg navbar-dark bg-dark px-3 py-2 border-bottom border-secondary"
		>
			<div class="container-fluid">
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
								class="nav-link"
								>Home</NuxtLink
							>
						</li>
						<li class="nav-item">
							<NuxtLink
								to="/search"
								class="nav-link active"
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

		<!-- Main Finder Container -->
		<div class="container-fluid flex-grow-1 p-0">
			<div class="row g-0 search-container">
				<!-- Left Sidebar (Filters, Search Params, List) -->
				<div
					class="col-12 col-md-5 col-lg-4 d-flex flex-column results-sidebar p-3"
				>
					<!-- Search Inputs Card -->
					<div
						class="card shadow-sm border border-secondary border-opacity-10 mb-3 rounded-3"
					>
						<div class="card-body p-3">
							<h6
								class="card-title fw-bold mb-3 d-flex align-items-center text-primary"
							>
								<span class="material-symbols-outlined me-1"
									>search</span
								>
								Search Parameters
							</h6>

							<!-- Address/Place Input -->
							<div class="position-relative mb-3">
								<label
									class="form-label small fw-semibold text-secondary"
									>Destination Address</label
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
										placeholder="Enter station, place or address..."
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

								<!-- Autocomplete Dropdown -->
								<div
									v-if="
										showGeocodeDropdown
										&& geocodeResults.length > 0
									"
									class="position-absolute w-100 bg-body shadow rounded-3 border mt-1 overflow-hidden"
									style="
										z-index: 1050;
										max-height: 250px;
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
												font-size: 0.75rem;
												overflow: hidden;
												text-overflow: ellipsis;
												white-space: nowrap;
											"
										>
											{{ res.display_name }}
										</div>
									</div>
								</div>

								<!-- Geocoding Loading / Empty state -->
								<div
									v-if="geocodeLoading"
									class="position-absolute end-0 top-50 translate-middle-y me-5 mt-2 spinner-border spinner-border-sm text-primary"
									role="status"
								></div>
							</div>

							<!-- Duration Selector (TextBox / Slider combo) -->
							<div class="mb-3">
								<div
									class="d-flex justify-content-between align-items-center mb-1"
								>
									<label
										class="form-label small fw-semibold text-secondary mb-0"
										>Stay Duration</label
									>
									<div class="d-flex align-items-center">
										<input
											v-model="durationHours"
											type="number"
											class="form-control form-control-sm text-center fw-bold me-1"
											style="width: 50px"
											min="0"
											max="48"
											@change="onDurationHoursChange"
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
											@change="onDurationMinutesChange"
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
										style="font-size: 0.75rem"
										@click="applyPreset(preset.value)"
									>
										{{ preset.label }}
									</button>
								</div>
							</div>
						</div>
					</div>

					<!-- Parking Lots List Header -->
					<div
						class="d-flex justify-content-between align-items-center mb-2 px-1"
					>
						<span
							class="fw-bold text-secondary uppercase"
							style="font-size: 0.75rem; letter-spacing: 0.5px"
						>
							PARKING NEARBY ({{ parkingLocations.length }})
						</span>
						<span
							v-if="loading"
							class="spinner-border spinner-border-sm text-primary"
						></span>
					</div>

					<!-- Empty State -->
					<div
						v-if="!loading && parkingLocations.length === 0"
						class="text-center py-5 my-3 text-secondary"
					>
						<span
							class="material-symbols-outlined"
							style="font-size: 3rem"
							>info</span
						>
						<p class="mt-2 mb-0">
							No parking lots found near this location.
						</p>
						<p class="small text-muted">
							Try moving the map or searching a different area.
						</p>
					</div>

					<!-- Parking Spots Scroll List -->
					<div class="flex-grow-1 overflow-y-auto pe-1">
						<div
							v-for="lot in parkingLocations"
							:key="lot.id"
							class="card parking-card mb-3 shadow-sm"
							:class="{ selected: selectedLotId === lot.id }"
							@click="selectLot(lot)"
						>
							<div class="card-body p-3">
								<div class="row g-2">
									<!-- Thumbnail Photo -->
									<div class="col-4">
										<img
											:src="
												lot.photoUrl
												|| 'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=300&q=80'
											"
											class="parking-img-thumb"
											alt="Parking spot thumbnail"
										/>
									</div>

									<!-- Quick Info -->
									<div
										class="col-8 d-flex flex-column justify-content-between"
									>
										<div>
											<div
												class="d-flex justify-content-between align-items-start"
											>
												<h6
													class="card-title fw-bold text-truncate mb-0"
													:title="lot.name"
												>
													{{ lot.name }}
												</h6>
												<!-- Badges -->
												<span
													v-if="
														cheapestIds.includes(
															lot.id,
														)
														&& closestIds.includes(
															lot.id,
														)
													"
													class="badge badge-both text-xs px-2 py-0.5 rounded-pill"
													style="font-size: 0.65rem"
												>
													Cheapest & Closest
												</span>
												<span
													v-else-if="
														cheapestIds.includes(
															lot.id,
														)
													"
													class="badge badge-cheapest text-xs px-2 py-0.5 rounded-pill"
													style="font-size: 0.65rem"
												>
													Cheapest
												</span>
												<span
													v-else-if="
														closestIds.includes(
															lot.id,
														)
													"
													class="badge badge-closest text-xs px-2 py-0.5 rounded-pill"
													style="font-size: 0.65rem"
												>
													Closest
												</span>
											</div>
											<p
												class="text-muted small mb-1 text-truncate"
												:title="lot.address"
											>
												<span
													class="material-symbols-outlined align-middle me-1"
													style="font-size: 0.95rem"
													>location_on</span
												>
												{{ lot.address }}
											</p>

											<!-- Distance and Price calculation summary -->
											<div
												class="d-flex gap-3 align-items-center mt-1"
											>
												<span
													class="small fw-semibold text-secondary d-flex align-items-center"
												>
													<span
														class="material-symbols-outlined align-middle me-1"
														style="
															font-size: 1rem;
															color: #ff6b6b;
														"
														>navigation</span
													>
													{{
														(
															lot.distance
															!== undefined
														) ?
															formatDistance(
																lot.distance,
															)
														:	'Calculating...'
													}}
												</span>

												<span
													class="fw-bold text-success d-flex align-items-center"
												>
													<span
														class="material-symbols-outlined align-middle me-1"
														style="
															font-size: 1.1rem;
															font-variation-settings: 'FILL'
																1;
														"
														>payments</span
													>
													{{
														getDynamicCostLabel(lot)
													}}
												</span>
											</div>
										</div>

										<!-- Payment methods shorthand preview icons -->
										<div
											class="d-flex gap-1 flex-wrap mt-2"
										>
											<span
												v-for="pKey in lot.paymentMethods"
												:key="pKey"
												class="badge bg-light border text-dark text-xs d-inline-flex align-items-center py-0.5 px-1.5"
												style="font-size: 0.65rem"
												:title="getPaymentName(pKey)"
											>
												<span
													class="material-symbols-outlined me-1"
													style="font-size: 0.85rem"
													>{{
														getPaymentIcon(pKey)
													}}</span
												>
												{{ getPaymentName(pKey) }}
											</span>
										</div>
									</div>
								</div>

								<!-- Expanded details (when selected) -->
								<div
									v-if="selectedLotId === lot.id"
									class="mt-3 pt-3 border-top"
									@click.stop
								>
									<div class="row g-2">
										<div class="col-12">
											<h6
												class="fw-bold small text-secondary mb-2"
											>
												Detailed Rates (by Rack Section)
											</h6>
											<div
												v-for="rate in lot.rates"
												:key="rate.id"
												class="p-2 border rounded bg-light mb-2"
											>
												<div
													class="d-flex justify-content-between align-items-center"
												>
													<strong class="small">{{
														rate.name
													}}</strong>
													<span
														class="text-success fw-bold text-sm"
														>{{
															formatRateCost(
																rate,
																lot.country,
															)
														}}</span
													>
												</div>
												<div
													class="text-muted"
													style="font-size: 0.75rem"
												>
													<template
														v-if="
															rate.freePeriodMinutes
															> 0
														"
													>
														<span
															class="text-success fw-semibold"
														>
															{{
																formatFreePeriod(
																	rate.freePeriodMinutes,
																)
															}}
															Free
														</span>
														•
													</template>
													{{
														formatChargeStepsDesc(
															rate,
															lot.country,
														)
													}}
												</div>
											</div>
										</div>

										<div class="col-6">
											<span
												class="fw-semibold text-secondary"
												style="font-size: 0.75rem"
												>HOURS</span
											>
											<div class="small fw-bold">
												{{ lot.hoursOfOperation }}
											</div>
										</div>
										<div class="col-6">
											<span
												class="fw-semibold text-secondary"
												style="font-size: 0.75rem"
												>LAST UPDATED</span
											>
											<div class="small text-muted">
												{{
													formatDate(lot.lastUpdated)
												}}
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Right Map Panel -->
				<div class="col-12 col-md-7 col-lg-8 map-pane">
					<MapClient
						:center="mapCenter"
						:zoom="mapZoom"
						:pins="mapPins"
						:destination="searchDestination"
						@map-clicked="onMapClicked"
						@pin-clicked="onPinClicked"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { COUNTRY_CONFIGS, PAYMENT_METHODS } from '#shared/types/parking';
	import type { ParkingLocation, PricingRate } from '#shared/types/parking';
	import {
		calculateParkingFee,
		formatCurrency,
		formatDistance,
	} from '#shared/utils/pricing';
	import { useRoute, useRouter } from 'vue-router';

	const route = useRoute();
	const router = useRouter();
	const colorMode = useColorMode();

	// Search State variables
	const addressInput = ref('');
	const sliderValue = ref(180); // Default stay duration: 3h (180 mins)
	const durationHours = ref(3);
	const durationMinutes = ref(0);

	// Coordinates
	// Default to Ikebukuro station: [35.7289, 139.7104]
	const mapCenter = ref<[number, number]>([35.7289, 139.7104]);
	const mapZoom = ref(15);
	const searchDestination = ref<[number, number] | null>([35.7289, 139.7104]);

	// Geocoding States
	const geocodeResults = ref<any[]>([]);
	const geocodeLoading = ref(false);
	const showGeocodeDropdown = ref(false);
	let geocodeTimeout: any = null;

	// Parking List states
	const parkingLocations = ref<ParkingLocation[]>([]);
	const loading = ref(false);
	const selectedLotId = ref<string | null>(null);

	// Duration Presets
	const durationPresets = [
		{ label: '1 Hour', value: 60 },
		{ label: '2 Hours', value: 120 },
		{ label: '3 Hours', value: 180 },
		{ label: '6 Hours', value: 360 },
		{ label: '12 Hours', value: 720 },
		{ label: '24 Hours', value: 1440 },
	];

	// Toggle Nuxt Color mode
	const toggleColorMode = () => {
		colorMode.preference =
			colorMode.preference === 'dark' ? 'light' : 'dark';
	};

	// Initial Mount: Parse URL params
	onMounted(async () => {
		const query = route.query;

		if (query.q) {
			addressInput.value = query.q as string;
		}

		let initialLat = 35.7289;
		let initialLng = 139.7104;

		if (query.lat && query.lng) {
			initialLat = parseFloat(query.lat as string);
			initialLng = parseFloat(query.lng as string);
			mapCenter.value = [initialLat, initialLng];
			searchDestination.value = [initialLat, initialLng];
		}

		if (query.duration) {
			const mins = parseInt(query.duration as string);
			if (!isNaN(mins)) {
				sliderValue.value = mins;
				durationHours.value = Math.floor(mins / 60);
				durationMinutes.value = mins % 60;
			}
		}

		await fetchParkingSpots(initialLat, initialLng);
	});

	// Watch URL query changes (keeps search page synced)
	watch(
		() => route.query,
		async (newQuery) => {
			if (newQuery.lat && newQuery.lng) {
				const lat = parseFloat(newQuery.lat as string);
				const lng = parseFloat(newQuery.lng as string);
				mapCenter.value = [lat, lng];
				searchDestination.value = [lat, lng];

				if (newQuery.q) {
					addressInput.value = newQuery.q as string;
				}

				if (newQuery.duration) {
					const mins = parseInt(newQuery.duration as string);
					if (!isNaN(mins)) {
						sliderValue.value = mins;
						durationHours.value = Math.floor(mins / 60);
						durationMinutes.value = mins % 60;
					}
				}

				await fetchParkingSpots(lat, lng);
			}
		},
	);

	// Fetch Parking Lots from Server API
	const fetchParkingSpots = async (lat: number, lng: number) => {
		loading.value = true;
		try {
			const response = await $fetch<ParkingLocation[]>(
				`/api/parking?lat=${lat}&lng=${lng}`,
			);
			parkingLocations.value = response;
		} catch (e) {
			console.error('Failed to load parking lots', e);
		} finally {
			loading.value = false;
		}
	};

	// Pricing Helpers
	const getCheapestRate = (lot: ParkingLocation, minutes: number): number => {
		if (!lot.rates || lot.rates.length === 0) {
			return 0;
		}

		const fees = lot.rates.map((rate) =>
			calculateParkingFee(rate, minutes),
		);
		return Math.min(...fees);
	};

	const getCountrySymbol = (countryName: string): string => {
		const cfg = COUNTRY_CONFIGS[countryName] || COUNTRY_CONFIGS['Japan'];
		return cfg.currencySymbol;
	};

	// Dynamic list filtering for Recommendations (Cheapest & Closest)
	// Find cheapest IDs (can be multiple matching)
	const cheapestIds = computed(() => {
		if (parkingLocations.value.length === 0) {
			return [];
		}

		let minCost = Infinity;
		const costs = parkingLocations.value.map((lot) => {
			const cost = getCheapestRate(lot, sliderValue.value);
			if (cost < minCost) {
				minCost = cost;
			}
			return { id: lot.id, cost };
		});

		return costs.filter((c) => c.cost === minCost).map((c) => c.id);
	});

	// Find closest IDs (can be multiple matching within a minor threshold, say 50m, or just the absolute minimum)
	const closestIds = computed(() => {
		if (parkingLocations.value.length === 0) {
			return [];
		}

		const sorted = [...parkingLocations.value].sort(
			(a, b) => (a.distance ?? 0) - (b.distance ?? 0),
		);
		const minDistance = sorted[0].distance;
		if (minDistance === undefined) {
			return [];
		}

		// Return IDs within 20 meters of the absolute minimum distance to handle near ties
		return sorted
			.filter(
				(lot) =>
					lot.distance !== undefined
					&& lot.distance - minDistance <= 0.02,
			)
			.map((lot) => lot.id);
	});

	// Cost description text generators
	const getDynamicCostLabel = (lot: ParkingLocation): string => {
		const minCost = getCheapestRate(lot, sliderValue.value);

		if (minCost === 0) {
			return 'Free';
		}
		return formatCurrency(minCost, lot.country);
	};

	const formatRateCost = (rate: PricingRate, country: string): string => {
		const cost = calculateParkingFee(rate, sliderValue.value);
		if (cost === 0) {
			return 'Free';
		}
		return formatCurrency(cost, country);
	};

	const formatFreePeriod = (minutes: number): string => {
		if (minutes < 60) {
			return `${minutes} mins`;
		}
		const hrs = minutes / 60;
		return `${hrs} ${hrs === 1 ? 'hour' : 'hours'}`;
	};

	const formatChargeStepsDesc = (
		rate: PricingRate,
		countryName: string,
	): string => {
		return rate.chargeSteps
			.map((step) => {
				const hrs = step.durationMinutes / 60;
				const durationLabel =
					hrs >= 1 ? `${hrs}h` : `${step.durationMinutes}m`;
				const rateStr = formatCurrency(step.rate, countryName);

				if (step.isRecurring) {
					return `${rateStr}/${durationLabel} after`;
				} else {
					return `${rateStr} first ${durationLabel}`;
				}
			})
			.join(', ');
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
				// Nominatim search API. Restrict or center around Japan / user location if preferred
				const queryUrl = `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(addressInput.value)}`;
				const response = await $fetch<any[]>(queryUrl);
				geocodeResults.value = response;
				showGeocodeDropdown.value = true;
			} catch (e) {
				console.error('Nominatim geocode failed', e);
			} finally {
				geocodeLoading.value = false;
			}
		}, 400); // 400ms debounce
	};

	const selectAddress = (res: any) => {
		const lat = parseFloat(res.lat);
		const lng = parseFloat(res.lon);

		addressInput.value = res.display_name;
		showGeocodeDropdown.value = false;
		geocodeResults.value = [];

		// Set coordinates and center map
		mapCenter.value = [lat, lng];
		searchDestination.value = [lat, lng];

		// Update query parameters in route URL
		router.push({
			query: {
				q: res.display_name,
				lat: lat.toString(),
				lng: lng.toString(),
				duration: sliderValue.value.toString(),
			},
		});
	};

	const clearAddressSearch = () => {
		addressInput.value = '';
		geocodeResults.value = [];
		showGeocodeDropdown.value = false;
	};

	// Map click event updates query and moves center
	const onMapClicked = async (coords: { lat: number; lng: number }) => {
		// Center on click and set destination pin
		mapCenter.value = [coords.lat, coords.lng];
		searchDestination.value = [coords.lat, coords.lng];

		// Custom address tag representing the pin dropping
		addressInput.value = `Dropped Pin (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`;

		router.push({
			query: {
				q: addressInput.value,
				lat: coords.lat.toString(),
				lng: coords.lng.toString(),
				duration: sliderValue.value.toString(),
			},
		});
	};

	// Select spot from list
	const selectLot = (lot: ParkingLocation) => {
		selectedLotId.value = selectedLotId.value === lot.id ? null : lot.id;
		if (selectedLotId.value) {
			mapCenter.value = [lot.latitude, lot.longitude];
			mapZoom.value = 16;
		}
	};

	// Map Pin Selection callback
	const onPinClicked = (pinId: string) => {
		const lot = parkingLocations.value.find((l) => l.id === pinId);
		if (lot) {
			selectedLotId.value = lot.id;
			// Scroll sidebar element to view card
			setTimeout(() => {
				const cardEl = document.querySelector(`.parking-card.selected`);
				if (cardEl) {
					cardEl.scrollIntoView({
						behavior: 'smooth',
						block: 'nearest',
					});
				}
			}, 100);
		}
	};

	// Duration adjustment events
	const onSliderInput = () => {
		durationHours.value = Math.floor(sliderValue.value / 60);
		durationMinutes.value = sliderValue.value % 60;
		updateUrlDuration();
	};

	const onDurationHoursChange = () => {
		sanitizeDurationInputs();
		sliderValue.value = durationHours.value * 60 + durationMinutes.value;
		updateUrlDuration();
	};

	const onDurationMinutesChange = () => {
		sanitizeDurationInputs();
		sliderValue.value = durationHours.value * 60 + durationMinutes.value;
		updateUrlDuration();
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
		updateUrlDuration();
	};

	const updateUrlDuration = () => {
		// Soft route push
		router.push({
			query: {
				...route.query,
				duration: sliderValue.value.toString(),
			},
		});
	};

	// Payment Method display lookup functions
	const getPaymentDef = (key: string) => {
		return PAYMENT_METHODS[key] || { key, name: key, icon: 'help' };
	};

	const getPaymentName = (key: string): string => {
		return getPaymentDef(key).name;
	};

	const getPaymentIcon = (key: string): string => {
		return getPaymentDef(key).icon;
	};

	// Date Formatter
	const formatDate = (isoString: string): string => {
		if (!isoString) {
			return 'Unknown';
		}
		try {
			const d = new Date(isoString);
			return d.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			});
		} catch (e) {
			return 'Unknown';
		}
	};

	// Map markers computed property
	const mapPins = computed(() => {
		return parkingLocations.value.map((lot) => {
			const isCheapest = cheapestIds.value.includes(lot.id);
			return {
				id: lot.id,
				name: lot.name,
				latitude: lot.latitude,
				longitude: lot.longitude,
				address: lot.address,
				priceLabel: getDynamicCostLabel(lot),
				isCheapest,
			};
		});
	});
</script>

<style lang="scss" scoped>
	.hover-bg-light:hover {
		background-color: var(--bs-light);
		cursor: pointer;
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
