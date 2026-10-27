<template>
	<div class="d-flex flex-column min-vh-100 bg-body">
		<AppNavbar />

		<div class="container-fluid flex-grow-1 p-0">
			<div class="row g-0 search-container">
				<div
					class="col-12 md:col-5 lg:col-4 d-flex flex-column results-sidebar p-5"
				>
					<div
						class="card shadow-sm border border-secondary border-10 mb-5 rounded-5"
					>
						<div class="card-body p-5">
							<h6
								class="card-title fw-bold mb-5 d-flex align-items-center fg-primary"
							>
								<span class="material-symbols-outlined me-1">
									search
								</span>
								Search Parameters
							</h6>

							<LocationSearchInput
								v-model="addressInput"
								class="mb-5"
								label="Destination Address"
								placeholder="Enter station, place or address..."
								:results="geocodeResults"
								:loading="geocodeLoading"
								:show-dropdown="showGeocodeDropdown"
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
								class="mb-5"
								label="Stay Duration"
								:presets="durationPresets"
								@slider-input="onSliderInput"
								@hours-change="onDurationHoursChange"
								@minutes-change="onDurationMinutesChange"
								@preset="applyPreset"
							/>
						</div>
					</div>

					<div
						class="d-flex justify-content-between align-items-center mb-3 px-1"
					>
						<span class="fw-bold fg-secondary admin-kicker">
							Parking Nearby ({{
								visibleParkingLocations.length
							}})
						</span>
						<span
							v-if="loading"
							class="spinner-border spinner-border-sm fg-primary"
						></span>
					</div>

					<div
						v-if="!loading && visibleParkingLocations.length === 0"
						class="text-center py-12 my-5 fg-secondary"
					>
						<span
							class="material-symbols-outlined"
							style="font-size: 3rem"
						>
							info
						</span>
						<p class="mt-3 mb-0">
							No parking lots found within 2 km.
						</p>
						<p class="small fg-secondary">
							Try moving the map or searching a different area.
							Farther parking may still appear on the map.
						</p>
					</div>

					<div class="flex-grow-1 overflow-y-auto pe-1">
						<ParkingResultCard
							v-for="lot in visibleParkingLocations"
							:key="lot.id"
							:lot="lot"
							:selected="selectedLotId === lot.id"
							:is-cheapest="cheapestIds.includes(lot.id)"
							:is-closest="closestIds.includes(lot.id)"
							:duration-minutes="sliderValue"
							@select="selectLot(lot)"
						/>
					</div>
				</div>

				<div class="col-12 md:col-7 lg:col-8 map-pane">
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
	import type { GeocodeResult } from '#shared/types/geocode';

	const route = useRoute();
	const router = useRouter();

	const addressInput = ref('');
	const sliderValue = ref(180);
	const durationHours = ref(3);
	const durationMinutes = ref(0);

	const mapCenter = ref<[number, number]>([35.7289, 139.7104]);
	const mapZoom = ref(15);
	const searchDestination = ref<[number, number] | null>([35.7289, 139.7104]);

	const geocodeResults = ref<GeocodeResult[]>([]);
	const geocodeLoading = ref(false);
	const showGeocodeDropdown = ref(false);
	let geocodeTimeout: ReturnType<typeof setTimeout> | null = null;

	const parkingLocations = ref<ParkingLocation[]>([]);
	const loading = ref(false);
	const selectedLotId = ref<string | null>(null);
	let preserveMapViewportForNextQuery = false;
	const MAX_LIST_DISTANCE_KM = 2;

	const durationPresets = [
		{ label: '1 Hour', value: 60 },
		{ label: '2 Hours', value: 120 },
		{ label: '3 Hours', value: 180 },
		{ label: '6 Hours', value: 360 },
		{ label: '12 Hours', value: 720 },
		{ label: '24 Hours', value: 1440 },
	];

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

	watch(
		() => route.query,
		async (newQuery, oldQuery) => {
			if (newQuery.lat && newQuery.lng) {
				const lat = parseFloat(newQuery.lat as string);
				const lng = parseFloat(newQuery.lng as string);
				const destinationChanged =
					!oldQuery
					|| oldQuery.lat !== newQuery.lat
					|| oldQuery.lng !== newQuery.lng;

				if (destinationChanged) {
					if (preserveMapViewportForNextQuery) {
						preserveMapViewportForNextQuery = false;
					} else {
						mapCenter.value = [lat, lng];
					}

					searchDestination.value = [lat, lng];
				}

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

				if (destinationChanged) {
					await fetchParkingSpots(lat, lng);
				}
			}
		},
	);

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

	const getCheapestRate = (lot: ParkingLocation, minutes: number): number => {
		if (!lot.rates || lot.rates.length === 0) {
			return 0;
		}

		const fees = lot.rates.map((rate) =>
			calculateParkingFee(rate, minutes),
		);
		return Math.min(...fees);
	};

	const visibleParkingLocations = computed(() => {
		return parkingLocations.value.filter(
			(lot) =>
				lot.distance === undefined
				|| lot.distance <= MAX_LIST_DISTANCE_KM,
		);
	});

	const cheapestIds = computed(() => {
		if (visibleParkingLocations.value.length === 0) {
			return [];
		}

		let minCost = Infinity;
		const costs = visibleParkingLocations.value.map((lot) => {
			const cost = getCheapestRate(lot, sliderValue.value);
			if (cost < minCost) {
				minCost = cost;
			}
			return { id: lot.id, cost };
		});

		return costs.filter((c) => c.cost === minCost).map((c) => c.id);
	});

	const closestIds = computed(() => {
		if (visibleParkingLocations.value.length === 0) {
			return [];
		}

		const sorted = [...visibleParkingLocations.value].sort(
			(a, b) => (a.distance ?? 0) - (b.distance ?? 0),
		);
		const minDistance = sorted[0].distance;
		if (minDistance === undefined) {
			return [];
		}

		return sorted
			.filter(
				(lot) =>
					lot.distance !== undefined
					&& lot.distance - minDistance <= 0.02,
			)
			.map((lot) => lot.id);
	});

	const getDynamicCostLabel = (lot: ParkingLocation): string => {
		const minCost = getCheapestRate(lot, sliderValue.value);

		if (minCost === 0) {
			return 'Free';
		}
		return formatCurrency(minCost, lot.country);
	};

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
		showGeocodeDropdown.value = false;
		geocodeResults.value = [];

		mapCenter.value = [lat, lng];
		searchDestination.value = [lat, lng];

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

	const onMapClicked = async (coords: { lat: number; lng: number }) => {
		preserveMapViewportForNextQuery = true;
		searchDestination.value = [coords.lat, coords.lng];
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

	const selectLot = (lot: ParkingLocation) => {
		selectedLotId.value = selectedLotId.value === lot.id ? null : lot.id;
		if (selectedLotId.value) {
			mapCenter.value = [lot.latitude, lot.longitude];
			mapZoom.value = 16;
		}
	};

	const onPinClicked = (pinId: string) => {
		const lot = parkingLocations.value.find((l) => l.id === pinId);
		if (lot) {
			selectedLotId.value = lot.id;
			setTimeout(() => {
				const cardEl = document.querySelector(`.parking-card.selected`);
				cardEl?.scrollIntoView({
					behavior: 'smooth',
					block: 'nearest',
				});
			}, 100);
		}
	};

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
		router.push({
			query: {
				...route.query,
				duration: sliderValue.value.toString(),
			},
		});
	};

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
