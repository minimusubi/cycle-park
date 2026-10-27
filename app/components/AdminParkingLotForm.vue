<template>
	<div class="card shadow border-0 rounded-5">
		<div
			class="card-header bg-black fg-white p-5 d-flex flex-row justify-content-between align-items-center rounded-top-5"
			data-bs-theme="dark"
		>
			<h5 class="mb-0 fw-bold d-flex align-items-center">
				<span class="material-symbols-outlined me-3"> edit_note </span>
				{{
					isEditing ?
						'Edit Parking Location'
					:	'Add New Parking Location'
				}}
			</h5>
			<NuxtLink
				to="/admin"
				class="btn btn-sm btn-outline theme-secondary fg-white border-white"
			>
				Back to list
			</NuxtLink>
		</div>

		<div class="card-body p-7">
			<form @submit.prevent="saveLocation">
				<h6 class="fg-primary fw-bold mb-5 border-bottom pb-3">
					1. General Information
				</h6>
				<div class="row g-5 mb-7">
					<div class="md:col-6">
						<label class="form-label small fw-bold">
							Parking Name
						</label>
						<input
							v-model="form.name"
							type="text"
							class="form-control"
							required
							placeholder="e.g. Ikebukuro Station East Exit Rack"
						/>
					</div>
					<div class="md:col-6">
						<label class="form-label small fw-bold">Country</label>
						<select
							v-model="form.country"
							class="form-control"
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
						<label class="form-label small fw-bold">Address</label>
						<input
							v-model="form.address"
							type="text"
							class="form-control"
							required
							placeholder="e.g. 1-2-3 Higashiikebukuro, Toshima City, Tokyo"
						/>
					</div>
					<div class="md:col-6">
						<label class="form-label small fw-bold">
							Hours of Operation
						</label>
						<input
							v-model="form.hoursOfOperation"
							type="text"
							class="form-control"
							placeholder="e.g. 24 Hours, or 08:00 - 23:00"
						/>
					</div>
					<div class="md:col-6">
						<label class="form-label small fw-bold">
							Photo URL or Base64
						</label>
						<div class="input-group">
							<input
								v-model="form.photoUrl"
								type="text"
								class="form-control"
								placeholder="Image URL or click upload"
							/>
							<label
								class="btn btn-outline theme-secondary mb-0 d-flex align-items-center"
							>
								<span
									class="material-symbols-outlined"
									style="font-size: 1.1rem"
								>
									upload
								</span>
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
					<div
						v-if="form.photoUrl"
						class="col-12"
					>
						<label class="form-label small fg-secondary">
							Photo Preview
						</label>
						<div
							class="position-relative"
							style="max-width: 250px"
						>
							<img
								:src="form.photoUrl"
								class="parking-img-thumb w-100"
								style="height: 140px; border-radius: 0.5rem"
								alt="Parking lot preview"
							/>
							<button
								type="button"
								class="btn btn-solid theme-danger btn-sm position-absolute top-0 end-0 m-1 rounded-circle p-1 d-flex align-items-center"
								@click="form.photoUrl = ''"
							>
								<span
									class="material-symbols-outlined"
									style="font-size: 1rem"
								>
									close
								</span>
							</button>
						</div>
					</div>
					<div class="col-12">
						<label class="form-label small fw-bold">Notes</label>
						<textarea
							v-model="form.notes"
							class="form-control"
							rows="3"
							placeholder="Validation details, access restrictions, temporary closures, or other conditions."
						></textarea>
					</div>
				</div>

				<h6 class="fg-primary fw-bold mb-5 border-bottom pb-3">
					2. Coordinates & Location Picker
				</h6>
				<div class="row g-5 mb-7">
					<div class="md:col-6">
						<label class="form-label small fw-bold">Latitude</label>
						<input
							v-model.number="form.latitude"
							type="number"
							step="any"
							class="form-control"
							required
						/>
					</div>
					<div class="md:col-6">
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
						<label class="form-label small fg-secondary">
							Map Picker (Click map to autofill coordinates)
						</label>
						<div
							class="border rounded overflow-hidden"
							style="height: 250px"
						>
							<MapClient
								:center="adminMapCenter"
								:zoom="14"
								:destination="enteredCoordinates"
								:interactive-mode="true"
								@map-clicked="onAdminMapClicked"
							/>
						</div>
					</div>
				</div>

				<h6 class="fg-primary fw-bold mb-5 border-bottom pb-3">
					3. Supported Payment Methods
				</h6>
				<div class="mb-7">
					<div class="d-flex flex-wrap gap-5">
						<div
							v-for="method in availablePaymentOptions"
							:key="method.key"
							class="form-field"
						>
							<input
								:id="'pay-' + method.key"
								v-model="form.paymentMethods"
								type="checkbox"
								class="check"
								:value="method.key"
							/>
							<label
								class="small d-flex align-items-center"
								:for="'pay-' + method.key"
							>
								<span
									class="material-symbols-outlined me-1"
									style="font-size: 1rem"
								>
									{{ method.icon }}
								</span>
								{{ method.name }}
							</label>
						</div>
					</div>
					<div
						v-if="form.paymentMethods.length === 0"
						class="fg-danger small mt-3"
					>
						Please check at least one payment option.
					</div>
				</div>

				<h6
					class="fg-primary fw-bold mb-5 border-bottom pb-3 d-flex justify-content-between align-items-center"
				>
					<span>4. Rack Sections & Rates</span>
					<button
						type="button"
						class="btn btn-sm btn-outline theme-primary py-1 d-flex align-items-center"
						@click="addNewRateSection"
					>
						<span
							class="material-symbols-outlined me-1"
							style="font-size: 1rem"
						>
							add_circle
						</span>
						Add Section
					</button>
				</h6>

				<div
					v-if="form.rates.length === 0"
					class="alert theme-warning small"
				>
					At least one rack/section rate structure is required. Click
					"Add Section" above.
				</div>

				<AdminRackSectionCard
					v-for="(rate, rateIndex) in form.rates"
					:key="rate.id"
					:rate="rate"
					:index="rateIndex"
					:country="form.country"
					:currency-symbol="currentCurrencySymbol"
					@add-step="addNewStep(rateIndex)"
					@remove-step="
						(stepIndex) => removeStep(rateIndex, stepIndex)
					"
					@remove-section="removeRateSection(rateIndex)"
				/>

				<div class="mt-7 pt-5 border-top d-flex gap-3">
					<button
						type="submit"
						class="btn btn-solid theme-primary px-7 py-3"
						:disabled="submitting || form.rates.length === 0"
					>
						<span
							v-if="submitting"
							class="spinner-border spinner-border-sm me-1"
						></span>
						<span
							v-else
							class="material-symbols-outlined me-1"
							style="font-size: 1.1rem"
						>
							save
						</span>
						{{ isEditing ? 'Save Changes' : 'Create Location' }}
					</button>
					<button
						type="button"
						class="btn btn-outline theme-secondary px-7 py-3"
						@click="resetForm"
					>
						Reset Form
					</button>
				</div>
			</form>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import {
		COUNTRY_CONFIGS,
		PAYMENT_METHODS,
		type ParkingLocation,
		type PricingRate,
	} from '#shared/types/parking';

	type ParkingLocationForm = Omit<ParkingLocation, 'lastUpdated'> & {
		lastUpdated?: string;
		notes?: string;
		photoUrl?: string;
	};

	const props = defineProps<{
		initialLocation?: ParkingLocation | null;
	}>();

	const emit = defineEmits<{
		(e: 'saved', location: ParkingLocation): void;
	}>();

	const submitting = ref(false);
	const fileInput = ref<HTMLInputElement | null>(null);
	const adminMapCenter = ref<[number, number]>([35.7289, 139.7104]);
	let preserveMapViewportForNextCoordinateChange = false;
	const countries = ['Japan', 'United States', 'United Kingdom'];

	const getEmptyForm = (): ParkingLocationForm => ({
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
				chargeSteps: [
					{ durationMinutes: 120, rate: 0 },
					{ durationMinutes: 360, rate: 100 },
					{ durationMinutes: 120, rate: 100, isRecurring: true },
				],
			},
		],
		photoUrl: '',
		notes: '',
	});

	const cloneLocationForForm = (
		location: ParkingLocation,
	): ParkingLocationForm => ({
		...getEmptyForm(),
		...JSON.parse(JSON.stringify(location)),
		notes: location.notes || '',
		photoUrl: location.photoUrl || '',
	});

	const form = ref<ParkingLocationForm>(getEmptyForm());

	const isEditing = computed(() => Boolean(props.initialLocation?.id));

	watch(
		() => props.initialLocation,
		(location) => {
			form.value =
				location ? cloneLocationForForm(location) : getEmptyForm();
			adminMapCenter.value = [form.value.latitude, form.value.longitude];
			if (fileInput.value) {
				fileInput.value.value = '';
			}
		},
		{ immediate: true },
	);

	const currentCurrencySymbol = computed(() => {
		const config =
			COUNTRY_CONFIGS[form.value.country] || COUNTRY_CONFIGS.Japan;
		return config.currencySymbol;
	});

	const availablePaymentOptions = computed(() => {
		const config =
			COUNTRY_CONFIGS[form.value.country] || COUNTRY_CONFIGS.Japan;
		return config.supportedPaymentMethods.map(
			(key) => PAYMENT_METHODS[key],
		);
	});

	const enteredCoordinates = computed<[number, number] | null>(() => {
		const latitude = Number(form.value.latitude);
		const longitude = Number(form.value.longitude);

		if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
			return null;
		}

		return [latitude, longitude];
	});

	watch(enteredCoordinates, (coordinates) => {
		if (!coordinates) {
			return;
		}

		if (preserveMapViewportForNextCoordinateChange) {
			preserveMapViewportForNextCoordinateChange = false;
			return;
		}

		adminMapCenter.value = coordinates;
	});

	const onCountryChange = () => {
		const config =
			COUNTRY_CONFIGS[form.value.country] || COUNTRY_CONFIGS.Japan;
		form.value.paymentMethods = [...config.supportedPaymentMethods];

		if (isEditing.value) {
			return;
		}

		const defaultCoordinatesByCountry: Record<string, [number, number]> = {
			Japan: [35.7289, 139.7104],
			'United States': [37.7844, -122.408],
			'United Kingdom': [51.5074, -0.1278],
		};

		const coordinates =
			defaultCoordinatesByCountry[form.value.country]
			|| defaultCoordinatesByCountry.Japan;

		form.value.latitude = coordinates[0];
		form.value.longitude = coordinates[1];
		adminMapCenter.value = coordinates;
	};

	const onAdminMapClicked = (coordinates: { lat: number; lng: number }) => {
		preserveMapViewportForNextCoordinateChange = true;
		form.value.latitude = parseFloat(coordinates.lat.toFixed(6));
		form.value.longitude = parseFloat(coordinates.lng.toFixed(6));

		void nextTick(() => {
			preserveMapViewportForNextCoordinateChange = false;
		});
	};

	const onPhotoUpload = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (!target.files || !target.files[0]) {
			return;
		}

		const file = target.files[0];

		if (file.size > 1500000) {
			alert(
				'WARNING: File size exceeds 1.5MB. Please upload a smaller thumbnail image.',
			);
			return;
		}

		const reader = new FileReader();
		reader.onload = (loadEvent) => {
			form.value.photoUrl = loadEvent.target?.result as string;
		};
		reader.readAsDataURL(file);
	};

	const addNewRateSection = () => {
		form.value.rates.push({
			id: `rack-${Date.now()}`,
			name: 'New Section',
			chargeSteps: [
				{ durationMinutes: 60, rate: 100, isRecurring: true },
			],
		});
	};

	const removeRateSection = (index: number) => {
		form.value.rates.splice(index, 1);
	};

	const setLastStepRecurring = (rateIndex: number, recurring: boolean) => {
		const rate = form.value.rates[rateIndex];
		if (!rate || rate.chargeSteps.length === 0) {
			return;
		}

		const lastIndex = rate.chargeSteps.length - 1;
		rate.chargeSteps.forEach((step, stepIndex) => {
			if (
				stepIndex === lastIndex
				&& recurring
				&& Number(step.rate) !== 0
			) {
				step.isRecurring = true;
			} else {
				delete step.isRecurring;
			}
		});
	};

	const addNewStep = (rateIndex: number) => {
		const chargeSteps = form.value.rates[rateIndex].chargeSteps;
		const previousLastStep = chargeSteps[chargeSteps.length - 1];
		const shouldCarryRecurring = previousLastStep?.isRecurring === true;

		form.value.rates[rateIndex].chargeSteps.push({
			durationMinutes: 60,
			rate: 100,
		});
		setLastStepRecurring(rateIndex, shouldCarryRecurring);
	};

	const removeStep = (rateIndex: number, stepIndex: number) => {
		const chargeSteps = form.value.rates[rateIndex].chargeSteps;
		const removedLastStep = stepIndex === chargeSteps.length - 1;
		const shouldCarryRecurring =
			removedLastStep && chargeSteps[stepIndex]?.isRecurring === true;

		chargeSteps.splice(stepIndex, 1);

		if (removedLastStep) {
			setLastStepRecurring(rateIndex, shouldCarryRecurring);
		}
	};

	const validateForm = (): boolean => {
		if (form.value.paymentMethods.length === 0) {
			alert('Please choose at least one supported payment option.');
			return false;
		}

		if (form.value.rates.length === 0) {
			alert('Please configure at least one rate section.');
			return false;
		}

		for (const rate of form.value.rates) {
			if (rate.chargeSteps.length === 0) {
				alert(
					`Section "${rate.name}" requires at least one charge step.`,
				);
				return false;
			}

			if (
				rate.chargeSteps.some(
					(step) =>
						Number(step.rate) === 0 && step.isRecurring === true,
				)
			) {
				alert(
					`Section "${rate.name}" has a free recurring step. Make zero-cost steps non-recurring.`,
				);
				return false;
			}

			if (
				rate.chargeSteps.some(
					(step, stepIndex) =>
						stepIndex < rate.chargeSteps.length - 1
						&& step.isRecurring === true,
				)
			) {
				alert(
					`Section "${rate.name}" has a recurring step before the final step. Only the last step can recur.`,
				);
				return false;
			}
		}

		return true;
	};

	const sanitizeRates = (rates: PricingRate[]): PricingRate[] =>
		rates.map((rate) => ({
			...rate,
			chargeSteps: rate.chargeSteps.map((step, stepIndex) => ({
				durationMinutes: step.durationMinutes,
				rate: step.rate,
				...((
					stepIndex === rate.chargeSteps.length - 1
					&& Number(step.rate) !== 0
					&& step.isRecurring === true
				) ?
					{ isRecurring: true }
				:	{}),
			})),
		}));

	const saveLocation = async () => {
		if (!validateForm()) {
			return;
		}

		submitting.value = true;
		try {
			const payload = {
				...form.value,
				name: form.value.name.trim(),
				address: form.value.address.trim(),
				hoursOfOperation: form.value.hoursOfOperation.trim(),
				notes: form.value.notes?.trim() || undefined,
				rates: sanitizeRates(form.value.rates),
			};

			const response = await $fetch<{
				success: boolean;
				location: ParkingLocation;
			}>('/api/parking', {
				method: 'POST',
				body: payload,
			});

			emit('saved', response.location);
		} catch (error: any) {
			alert(`Failed to save: ${error.statusMessage || error.message}`);
		} finally {
			submitting.value = false;
		}
	};

	const resetForm = () => {
		form.value =
			props.initialLocation ?
				cloneLocationForForm(props.initialLocation)
			:	getEmptyForm();
		adminMapCenter.value = [form.value.latitude, form.value.longitude];
		if (fileInput.value) {
			fileInput.value.value = '';
		}
	};
</script>
