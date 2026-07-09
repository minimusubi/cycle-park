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
								class="nav-link"
								>Find Parking</NuxtLink
							>
						</li>
						<li class="nav-item">
							<NuxtLink
								to="/admin"
								class="nav-link active btn btn-primary btn-sm text-white ms-lg-2 px-3 py-1"
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

		<!-- Admin Body -->
		<div class="container py-4 flex-grow-1">
			<div class="row g-4">
				<!-- Left Column: Add / Edit Form -->
				<div class="col-12 col-xl-7">
					<div class="card shadow border-0 rounded-3 mb-4">
						<div
							class="card-header bg-dark text-white p-3 d-flex justify-content-between align-items-center rounded-top-3"
						>
							<h5 class="mb-0 fw-bold d-flex align-items-center">
								<span class="material-symbols-outlined me-2"
									>edit_note</span
								>
								{{
									isEditing ?
										'Edit Parking Location'
									:	'Add New Parking Location'
								}}
							</h5>
							<button
								v-if="isEditing"
								class="btn btn-sm btn-outline-light"
								@click="resetForm"
							>
								Cancel Edit / Add New
							</button>
						</div>

						<div class="card-body p-4">
							<form @submit.prevent="saveLocation">
								<!-- General details section -->
								<h6
									class="text-primary fw-bold mb-3 border-bottom pb-2"
								>
									1. General Information
								</h6>
								<div class="row g-3 mb-4">
									<div class="col-md-6">
										<label class="form-label small fw-bold"
											>Parking Name</label
										>
										<input
											v-model="form.name"
											type="text"
											class="form-control"
											required
											placeholder="e.g. Ikebukuro Station East Exit Rack"
										/>
									</div>
									<div class="col-md-6">
										<label class="form-label small fw-bold"
											>Country</label
										>
										<select
											v-model="form.country"
											class="form-select"
											@change="onCountryChange"
										>
											<option
												v-for="country in countries"
												:key="country"
												:value="country"
											>
												{{ country }}
											</option>
										</select>
									</div>
									<div class="col-12">
										<label class="form-label small fw-bold"
											>Address</label
										>
										<input
											v-model="form.address"
											type="text"
											class="form-control"
											required
											placeholder="e.g. 1-2-3 Higashiikebukuro, Toshima City, Tokyo"
										/>
									</div>
									<div class="col-md-6">
										<label class="form-label small fw-bold"
											>Hours of Operation</label
										>
										<input
											v-model="form.hoursOfOperation"
											type="text"
											class="form-control"
											placeholder="e.g. 24 Hours, or 08:00 - 23:00"
										/>
									</div>
									<div class="col-md-6">
										<label class="form-label small fw-bold"
											>Photo URL or Base64</label
										>
										<div class="input-group">
											<input
												v-model="form.photoUrl"
												type="text"
												class="form-control"
												placeholder="Image URL or click upload"
											/>
											<label
												class="btn btn-outline-secondary mb-0 d-flex align-items-center"
											>
												<span
													class="material-symbols-outlined"
													style="font-size: 1.1rem"
													>upload</span
												>
												<input
													ref="fileInput"
													type="file"
													class="d-none"
													accept="image/*"
													@change="onPhotoUpload"
												/>
											</label>
										</div>
									</div>
									<!-- Image Preview -->
									<div
										v-if="form.photoUrl"
										class="col-12"
									>
										<label
											class="form-label small text-secondary"
											>Photo Preview</label
										>
										<div
											class="position-relative"
											style="max-width: 250px"
										>
											<img
												:src="form.photoUrl"
												class="parking-img-thumb w-100"
												style="
													height: 140px;
													border-radius: 0.5rem;
												"
											/>
											<button
												type="button"
												class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle p-1 d-flex align-items-center"
												@click="form.photoUrl = ''"
											>
												<span
													class="material-symbols-outlined"
													style="font-size: 1rem"
													>close</span
												>
											</button>
										</div>
									</div>
								</div>

								<!-- Coordinates and Map picker -->
								<h6
									class="text-primary fw-bold mb-3 border-bottom pb-2"
								>
									2. Coordinates & Location Picker
								</h6>
								<div class="row g-3 mb-4">
									<div class="col-md-6">
										<label class="form-label small fw-bold"
											>Latitude</label
										>
										<input
											v-model.number="form.latitude"
											type="number"
											step="any"
											class="form-control"
											required
										/>
									</div>
									<div class="col-md-6">
										<label class="form-label small fw-bold"
											>Longitude</label
										>
										<input
											v-model.number="form.longitude"
											type="number"
											step="any"
											class="form-control"
											required
										/>
									</div>
									<div class="col-12">
										<label
											class="form-label small text-secondary"
											>Map Picker (Click map to autofill
											coordinates)</label
										>
										<div
											class="border rounded overflow-hidden"
											style="height: 250px"
										>
											<MapClient
												:center="adminMapCenter"
												:zoom="14"
												:interactive-mode="true"
												@map-clicked="onAdminMapClicked"
											/>
										</div>
									</div>
								</div>

								<!-- Payment Options -->
								<h6
									class="text-primary fw-bold mb-3 border-bottom pb-2"
								>
									3. Supported Payment Methods
								</h6>
								<div class="mb-4">
									<div class="d-flex flex-wrap gap-3">
										<div
											v-for="method in availablePaymentOptions"
											:key="method.key"
											class="form-check"
										>
											<input
												:id="'pay-' + method.key"
												v-model="form.paymentMethods"
												type="checkbox"
												class="form-check-input"
												:value="method.key"
											/>
											<label
												class="form-check-label small d-flex align-items-center"
												:for="'pay-' + method.key"
											>
												<span
													class="material-symbols-outlined me-1"
													style="font-size: 1rem"
													>{{ method.icon }}</span
												>
												{{ method.name }}
											</label>
										</div>
									</div>
									<div
										v-if="form.paymentMethods.length === 0"
										class="text-danger small mt-2"
									>
										Please check at least one payment
										option.
									</div>
								</div>

								<!-- Rates builder -->
								<h6
									class="text-primary fw-bold mb-3 border-bottom pb-2 d-flex justify-content-between align-items-center"
								>
									<span>4. Rack Sections & Rates</span>
									<button
										type="button"
										class="btn btn-sm btn-outline-primary py-0.5 d-flex align-items-center"
										@click="addNewRateSection"
									>
										<span
											class="material-symbols-outlined me-1"
											style="font-size: 1rem"
											>add_circle</span
										>
										Add Section
									</button>
								</h6>

								<div
									v-if="form.rates.length === 0"
									class="alert alert-warning small"
								>
									At least one rack/section rate structure is
									required. Click "Add Section" above.
								</div>

								<div
									v-for="(rate, rIndex) in form.rates"
									:key="rate.id"
									class="card border border-secondary border-opacity-20 mb-3 bg-light bg-opacity-40 shadow-xs"
								>
									<div
										class="card-header d-flex justify-content-between align-items-center py-2 bg-dark bg-opacity-10"
									>
										<strong class="small text-secondary"
											>Rack Section #{{
												rIndex + 1
											}}</strong
										>
										<button
											type="button"
											class="btn btn-sm btn-link text-danger p-0 d-flex align-items-center border-0 text-decoration-none"
											@click="removeRateSection(rIndex)"
										>
											<span
												class="material-symbols-outlined"
												style="font-size: 1.1rem"
												>delete</span
											>
											Remove
										</button>
									</div>

									<div class="card-body p-3">
										<div class="row g-2 mb-3">
											<div class="col-md-6">
												<label
													class="form-label small fw-bold"
													>Section Name</label
												>
												<input
													v-model="rate.name"
													type="text"
													class="form-control form-control-sm"
													required
													placeholder="e.g. Top Rack, Main Gate"
												/>
											</div>
											<div class="col-md-6">
												<label
													class="form-label small fw-bold"
													>Free Period
													(Minutes)</label
												>
												<input
													v-model.number="
														rate.freePeriodMinutes
													"
													type="number"
													class="form-control form-control-sm"
													min="0"
													required
												/>
											</div>
										</div>

										<!-- Steps Builder -->
										<div class="border-top pt-2">
											<div
												class="d-flex justify-content-between align-items-center mb-2"
											>
												<span
													class="fw-bold text-secondary"
													style="font-size: 0.75rem"
													>Charge Steps Queue</span
												>
												<button
													type="button"
													class="btn btn-xs btn-outline-secondary py-0.5 d-flex align-items-center"
													style="font-size: 0.7rem"
													@click="addNewStep(rIndex)"
												>
													<span
														class="material-symbols-outlined me-1"
														style="
															font-size: 0.9rem;
														"
														>add</span
													>
													Add Step
												</button>
											</div>

											<div
												v-if="
													rate.chargeSteps.length
													=== 0
												"
												class="text-danger small mb-2"
												style="font-size: 0.72rem"
											>
												Requires at least one charge
												step.
											</div>

											<div
												v-for="(
													step, sIndex
												) in rate.chargeSteps"
												:key="sIndex"
												class="row g-2 align-items-center mb-2 p-2 border rounded bg-white bg-opacity-70 shadow-xs"
											>
												<div class="col-auto">
													<span
														class="badge bg-secondary"
														style="
															font-size: 0.7rem;
														"
														>Step
														{{ sIndex + 1 }}</span
													>
												</div>
												<div class="col">
													<label
														class="form-label d-none"
														>Duration (Mins)</label
													>
													<div
														class="input-group input-group-sm"
													>
														<input
															v-model.number="
																step.durationMinutes
															"
															type="number"
															class="form-control text-center"
															min="1"
															required
															placeholder="Mins"
														/>
														<span
															class="input-group-text px-1.5"
															style="
																font-size: 0.7rem;
															"
															>mins</span
														>
													</div>
												</div>
												<div class="col">
													<label
														class="form-label d-none"
														>Rate</label
													>
													<div
														class="input-group input-group-sm"
													>
														<span
															class="input-group-text px-1.5"
															style="
																font-size: 0.7rem;
															"
															>{{
																currentCurrencySymbol
															}}</span
														>
														<input
															v-model.number="
																step.rate
															"
															type="number"
															class="form-control text-center"
															min="0"
															required
															placeholder="Cost"
														/>
													</div>
												</div>
												<div
													class="col-auto d-flex align-items-center"
												>
													<div
														class="form-check mb-0"
													>
														<input
															:id="
																'rec-'
																+ rIndex
																+ '-'
																+ sIndex
															"
															v-model="
																step.isRecurring
															"
															type="checkbox"
															class="form-check-input"
														/>
														<label
															class="form-check-label text-nowrap"
															:for="
																'rec-'
																+ rIndex
																+ '-'
																+ sIndex
															"
															style="
																font-size: 0.75rem;
															"
															>Recurring</label
														>
													</div>
												</div>
												<div class="col-auto">
													<button
														type="button"
														class="btn btn-sm btn-link text-danger p-0 border-0"
														@click="
															removeStep(
																rIndex,
																sIndex,
															)
														"
													>
														<span
															class="material-symbols-outlined"
															style="
																font-size: 1.1rem;
															"
															>remove_circle_outline</span
														>
													</button>
												</div>
											</div>

											<!-- Cost Preview Card for validation -->
											<div
												class="bg-light border rounded p-2 mt-2"
											>
												<span
													class="fw-bold text-secondary text-uppercase d-block mb-1"
													style="
														font-size: 0.65rem;
														letter-spacing: 0.5px;
													"
													>Live Price Simulation
													Preview</span
												>
												<div
													class="d-flex justify-content-between text-center small text-nowrap gap-1"
												>
													<div
														class="border rounded p-1 flex-fill bg-white"
													>
														<div
															class="text-muted"
															style="
																font-size: 0.65rem;
															"
														>
															1 Hour
														</div>
														<strong
															class="text-success"
															>{{
																formatSimPrice(
																	rate,
																	60,
																)
															}}</strong
														>
													</div>
													<div
														class="border rounded p-1 flex-fill bg-white"
													>
														<div
															class="text-muted"
															style="
																font-size: 0.65rem;
															"
														>
															3 Hours
														</div>
														<strong
															class="text-success"
															>{{
																formatSimPrice(
																	rate,
																	180,
																)
															}}</strong
														>
													</div>
													<div
														class="border rounded p-1 flex-fill bg-white"
													>
														<div
															class="text-muted"
															style="
																font-size: 0.65rem;
															"
														>
															8 Hours
														</div>
														<strong
															class="text-success"
															>{{
																formatSimPrice(
																	rate,
																	480,
																)
															}}</strong
														>
													</div>
													<div
														class="border rounded p-1 flex-fill bg-white"
													>
														<div
															class="text-muted"
															style="
																font-size: 0.65rem;
															"
														>
															24 Hours
														</div>
														<strong
															class="text-success"
															>{{
																formatSimPrice(
																	rate,
																	1440,
																)
															}}</strong
														>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>

								<!-- Submit Button -->
								<div class="mt-4 pt-3 border-top d-flex gap-2">
									<button
										type="submit"
										class="btn btn-primary px-4 py-2"
										:disabled="
											submitting
											|| form.rates.length === 0
										"
									>
										<span
											v-if="submitting"
											class="spinner-border spinner-border-sm me-1"
										></span>
										<span
											v-else
											class="material-symbols-outlined me-1"
											style="font-size: 1.1rem"
											>save</span
										>
										{{
											isEditing ? 'Save Changes' : (
												'Create Location'
											)
										}}
									</button>
									<button
										type="button"
										class="btn btn-outline-secondary px-4 py-2"
										@click="resetForm"
									>
										Reset Form
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>

				<!-- Right Column: List of Current Locations -->
				<div class="col-12 col-xl-5">
					<div class="card shadow border-0 rounded-3">
						<div
							class="card-header bg-dark text-white p-3 rounded-top-3"
						>
							<h5 class="mb-0 fw-bold d-flex align-items-center">
								<span class="material-symbols-outlined me-2"
									>list_alt</span
								>
								Bicycle Parking Lots ({{
									locationsList.length
								}})
							</h5>
						</div>

						<div
							class="card-body p-3 overflow-y-auto"
							style="max-height: 800px"
						>
							<div
								v-if="loadingList"
								class="text-center py-5"
							>
								<div
									class="spinner-border text-primary"
									role="status"
								></div>
								<p class="mt-2 text-secondary mb-0">
									Loading parking list...
								</p>
							</div>

							<div
								v-else-if="locationsList.length === 0"
								class="text-center py-5 text-secondary"
							>
								<span
									class="material-symbols-outlined"
									style="font-size: 3rem"
									>info</span
								>
								<p class="mt-2">No parking lots added yet.</p>
							</div>

							<div v-else>
								<div
									v-for="loc in locationsList"
									:key="loc.id"
									class="border rounded-3 p-3 mb-3 bg-white hover-shadow transition"
									:class="{
										'border-primary bg-primary bg-opacity-5':
											form.id === loc.id,
									}"
								>
									<div
										class="d-flex justify-content-between align-items-start mb-2"
									>
										<div>
											<h6 class="fw-bold mb-0 text-dark">
												{{ loc.name }}
											</h6>
											<span
												class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-20 px-2 py-0.5 rounded-pill mt-1"
												style="font-size: 0.65rem"
											>
												📍 {{ loc.country }}
											</span>
										</div>
										<div class="d-flex gap-1">
											<button
												class="btn btn-sm btn-outline-primary d-flex align-items-center p-1.5"
												title="Edit"
												@click="editLocation(loc)"
											>
												<span
													class="material-symbols-outlined"
													style="font-size: 0.95rem"
													>edit</span
												>
											</button>
											<button
												class="btn btn-sm btn-outline-danger d-flex align-items-center p-1.5"
												title="Delete"
												@click="confirmDelete(loc)"
											>
												<span
													class="material-symbols-outlined"
													style="font-size: 0.95rem"
													>delete</span
												>
											</button>
										</div>
									</div>

									<p class="text-muted small mb-2">
										{{ loc.address }}
									</p>
									<div
										class="d-flex justify-content-between text-muted small"
										style="font-size: 0.72rem"
									>
										<span
											>Hrs:
											{{ loc.hoursOfOperation }}</span
										>
										<span
											>Updated:
											{{
												new Date(
													loc.lastUpdated,
												).toLocaleDateString()
											}}</span
										>
									</div>

									<!-- Mini display of rack names -->
									<div class="mt-2 pt-2 border-top">
										<span
											class="fw-bold text-secondary uppercase d-block mb-1"
											style="
												font-size: 0.62rem;
												letter-spacing: 0.5px;
											"
											>Rack Sub-options & Cost
											structures</span
										>
										<div class="d-flex flex-wrap gap-1">
											<span
												v-for="rate in loc.rates"
												:key="rate.id"
												class="badge bg-light border text-dark text-xs py-1 px-1.5"
												style="font-size: 0.65rem"
											>
												{{ rate.name }} ({{
													rate.freePeriodMinutes
												}}m free)
											</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import { COUNTRY_CONFIGS, PAYMENT_METHODS } from '#shared/types/parking';
	import type { ParkingLocation, PricingRate } from '#shared/types/parking';
	import { calculateParkingFee, formatCurrency } from '#shared/utils/pricing';

	const colorMode = useColorMode();

	const toggleColorMode = () => {
		colorMode.preference =
			colorMode.preference === 'dark' ? 'light' : 'dark';
	};

	// Form States
	const isEditing = ref(false);
	const submitting = ref(false);
	const fileInput = ref<HTMLInputElement | null>(null);

	const countries = ['Japan', 'United States', 'United Kingdom'];

	// Map Center for admin coordinates picking: Default to Ikebukuro Station
	const adminMapCenter = ref<[number, number]>([35.7289, 139.7104]);

	// Initial empty form template
	const getEmptyForm = (): Partial<ParkingLocation> => ({
		id: '',
		name: '',
		address: '',
		latitude: 35.7289,
		longitude: 139.7104,
		country: 'Japan',
		hoursOfOperation: '24 Hours',
		paymentMethods: ['cash', 'ic'],
		rates: [
			{
				id: 'rack-1',
				name: 'Main Rack',
				freePeriodMinutes: 120, // 2 hours free
				chargeSteps: [
					{ durationMinutes: 360, rate: 100, isRecurring: false },
					{ durationMinutes: 120, rate: 100, isRecurring: true },
				],
			},
		],
		photoUrl: '',
	});

	const form = ref<any>(getEmptyForm());

	// Database list
	const locationsList = ref<ParkingLocation[]>([]);
	const loadingList = ref(false);

	// Mounted: Load parking
	onMounted(async () => {
		await fetchLocations();
	});

	const fetchLocations = async () => {
		loadingList.value = true;
		try {
			const res = await $fetch<ParkingLocation[]>('/api/parking');
			locationsList.value = res;
		} catch (e) {
			console.error('Failed to load locations list', e);
		} finally {
			loadingList.value = false;
		}
	};

	// Dynamic selections based on chosen country
	const currentCurrencySymbol = computed(() => {
		const cfg =
			COUNTRY_CONFIGS[form.value.country] || COUNTRY_CONFIGS['Japan'];
		return cfg.currencySymbol;
	});

	const availablePaymentOptions = computed(() => {
		const cfg =
			COUNTRY_CONFIGS[form.value.country] || COUNTRY_CONFIGS['Japan'];
		return cfg.supportedPaymentMethods.map((key) => PAYMENT_METHODS[key]);
	});

	// Update default payment checkbox list when country changes
	const onCountryChange = () => {
		const cfg =
			COUNTRY_CONFIGS[form.value.country] || COUNTRY_CONFIGS['Japan'];
		form.value.paymentMethods = [...cfg.supportedPaymentMethods];

		// Set default coordinates if adding new
		if (!isEditing.value) {
			if (form.value.country === 'Japan') {
				form.value.latitude = 35.7289;
				form.value.longitude = 139.7104; // Ikebukuro Station
				adminMapCenter.value = [35.7289, 139.7104];
			} else if (form.value.country === 'United States') {
				form.value.latitude = 37.7844;
				form.value.longitude = -122.408; // Powell St BART
				adminMapCenter.value = [37.7844, -122.408];
			} else if (form.value.country === 'United Kingdom') {
				form.value.latitude = 51.5074;
				form.value.longitude = -0.1278; // London Charing Cross
				adminMapCenter.value = [51.5074, -0.1278];
			}
		}
	};

	// Map click event sets form inputs
	const onAdminMapClicked = (coords: { lat: number; lng: number }) => {
		form.value.latitude = parseFloat(coords.lat.toFixed(6));
		form.value.longitude = parseFloat(coords.lng.toFixed(6));
	};

	// Read image upload file and convert to base64 Data URL
	const onPhotoUpload = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files[0]) {
			const file = target.files[0];

			// Check file size, warning if it exceeds 1.5MB to prevent bloated JSON DB files
			if (file.size > 1500000) {
				alert(
					'WARNING: File size exceeds 1.5MB. Please upload a smaller thumbnail image.',
				);
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				form.value.photoUrl = e.target?.result as string;
			};
			reader.readAsDataURL(file);
		}
	};

	// Add/Remove Section Rates in form array
	const addNewRateSection = () => {
		form.value.rates.push({
			id: `rack-${Date.now()}`,
			name: 'New Section',
			freePeriodMinutes: 0,
			chargeSteps: [
				{ durationMinutes: 60, rate: 100, isRecurring: true },
			],
		});
	};

	const removeRateSection = (index: number) => {
		form.value.rates.splice(index, 1);
	};

	// Add/Remove Steps in form array
	const addNewStep = (rateIndex: number) => {
		form.value.rates[rateIndex].chargeSteps.push({
			durationMinutes: 60,
			rate: 100,
			isRecurring: false,
		});
	};

	const removeStep = (rateIndex: number, stepIndex: number) => {
		form.value.rates[rateIndex].chargeSteps.splice(stepIndex, 1);
	};

	// Save form handler (calls server API)
	const saveLocation = async () => {
		if (form.value.paymentMethods.length === 0) {
			alert('Please choose at least one supported payment option.');
			return;
		}

		if (form.value.rates.length === 0) {
			alert('Please configure at least one rate section.');
			return;
		}

		// Validate steps
		for (const rate of form.value.rates) {
			if (rate.chargeSteps.length === 0) {
				alert(
					`Section "${rate.name}" requires at least one charge step.`,
				);
				return;
			}
		}

		submitting.value = true;
		try {
			await $fetch('/api/parking', {
				method: 'POST',
				body: form.value,
			});

			resetForm();
			await fetchLocations();
			alert('Bicycle Parking Lot successfully saved!');
		} catch (e: any) {
			alert(`Failed to save: ${e.statusMessage || e.message}`);
		} finally {
			submitting.value = false;
		}
	};

	// Edit action fills form
	const editLocation = (loc: ParkingLocation) => {
		isEditing.value = true;
		// Deep clone to avoid mutating standard list items
		form.value = JSON.parse(JSON.stringify(loc));

		// Set map center to existing pin
		adminMapCenter.value = [loc.latitude, loc.longitude];
	};

	// Delete action
	const confirmDelete = async (loc: ParkingLocation) => {
		const ok = confirm(`Are you sure you want to delete "${loc.name}"?`);
		if (!ok) {
			return;
		}

		try {
			await $fetch(`/api/parking?id=${loc.id}`, {
				method: 'DELETE',
			});
			if (form.value.id === loc.id) {
				resetForm();
			}
			await fetchLocations();
		} catch (e: any) {
			alert(`Failed to delete: ${e.statusMessage || e.message}`);
		}
	};

	// Form Reset helper
	const resetForm = () => {
		isEditing.value = false;
		form.value = getEmptyForm();
		adminMapCenter.value = [35.7289, 139.7104];
		if (fileInput.value) {
			fileInput.value.value = '';
		}
	};

	// Pricing Simulator helpers
	const formatSimPrice = (rate: PricingRate, minutes: number): string => {
		const cost = calculateParkingFee(rate, minutes);
		if (cost === 0) {
			return 'Free';
		}
		return formatCurrency(cost, form.value.country);
	};
</script>

<style lang="scss" scoped>
	.hover-shadow {
		transition:
			box-shadow 0.2s ease,
			border-color 0.2s ease;
	}

	.hover-shadow:hover {
		box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
		border-color: rgba(var(--bs-primary-rgb), 0.25) !important;
	}

	.btn-xs {
		padding: 0.15rem 0.4rem;
		font-size: 0.7rem;
		border-radius: 4px;
	}

	.shadow-xs {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
	}

	.form-check-input {
		cursor: pointer;
	}

	.form-check-label {
		cursor: pointer;
	}
</style>
