<template>
	<div class="d-flex flex-column min-vh-100 bg-body">
		<AppNavbar />

		<main class="container py-4 flex-grow-1">
			<div
				class="d-flex flex-column flex-lg-row gap-3 justify-content-between align-items-lg-center mb-4"
			>
				<div>
					<p class="admin-kicker text-secondary mb-1">
						Parking Lot Management
					</p>
					<h1 class="h3 fw-bold mb-0">Bicycle Parking Lots</h1>
				</div>
				<NuxtLink
					to="/admin/new"
					class="btn btn-primary d-inline-flex align-items-center justify-content-center"
				>
					<span
						class="material-symbols-outlined me-1"
						style="font-size: 1.1rem"
					>
						add
					</span>
					Add Parking Lot
				</NuxtLink>
			</div>

			<div class="card shadow border-0 rounded-3">
				<div class="card-body p-3 p-md-4">
					<div class="row g-3 align-items-end mb-4">
						<div class="col-12 col-lg-8">
							<label class="form-label small fw-bold">
								Search lots
							</label>
							<div class="input-group">
								<span class="input-group-text">
									<span
										class="material-symbols-outlined"
										style="font-size: 1.2rem"
									>
										search
									</span>
								</span>
								<input
									v-model="searchText"
									type="search"
									class="form-control"
									placeholder="Search by name, address, country, notes, or payment method"
								/>
							</div>
						</div>
						<div class="col-12 col-sm-6 col-lg-2">
							<label class="form-label small fw-bold">
								Country
							</label>
							<select
								v-model="selectedCountry"
								class="form-select"
							>
								<option value="">All countries</option>
								<option
									v-for="country in countries"
									:key="country"
									:value="country"
								>
									{{ country }}
								</option>
							</select>
						</div>
						<div class="col-12 col-sm-6 col-lg-2">
							<button
								type="button"
								class="btn btn-outline-secondary w-100"
								:disabled="!hasActiveFilters"
								@click="clearFilters"
							>
								Clear
							</button>
						</div>
					</div>

					<div
						class="d-flex justify-content-between align-items-center mb-3"
					>
						<span class="text-secondary small">
							Showing {{ filteredLocations.length }} of
							{{ locationsList.length }} lots
						</span>
						<span
							v-if="loadingList"
							class="spinner-border spinner-border-sm text-primary"
						></span>
					</div>

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
						v-else-if="filteredLocations.length === 0"
						class="text-center py-5 text-secondary"
					>
						<span
							class="material-symbols-outlined"
							style="font-size: 3rem"
						>
							info
						</span>
						<p class="mt-2 mb-0">No matching parking lots found.</p>
					</div>

					<div
						v-else
						class="row g-3"
					>
						<div
							v-for="location in filteredLocations"
							:key="location.id"
							class="col-12 col-lg-6"
						>
							<AdminParkingLotCard
								:location="location"
								:selected="false"
								@edit="openEditPage"
								@delete="confirmDelete"
							/>
						</div>
					</div>
				</div>
			</div>
		</main>
	</div>
</template>

<script lang="ts" setup>
	import type { ParkingLocation } from '#shared/types/parking';

	const router = useRouter();

	const locationsList = ref<ParkingLocation[]>([]);
	const loadingList = ref(false);
	const searchText = ref('');
	const selectedCountry = ref('');

	const countries = computed(() =>
		[...new Set(locationsList.value.map((location) => location.country))]
			.filter(Boolean)
			.sort(),
	);

	const normalizedSearchText = computed(() =>
		searchText.value.trim().toLowerCase(),
	);

	const hasActiveFilters = computed(
		() => normalizedSearchText.value.length > 0 || selectedCountry.value,
	);

	const filteredLocations = computed(() => {
		return locationsList.value.filter((location) => {
			const matchesCountry =
				!selectedCountry.value
				|| location.country === selectedCountry.value;

			if (!matchesCountry) {
				return false;
			}

			if (!normalizedSearchText.value) {
				return true;
			}

			const searchableFields = [
				location.name,
				location.address,
				location.country,
				location.hoursOfOperation,
				location.notes || '',
				...location.paymentMethods,
				...location.rates.map((rate) => rate.name),
			];

			return searchableFields.some((field) =>
				field.toLowerCase().includes(normalizedSearchText.value),
			);
		});
	});

	onMounted(async () => {
		await fetchLocations();
	});

	const fetchLocations = async () => {
		loadingList.value = true;
		try {
			locationsList.value = await $fetch<ParkingLocation[]>('/api/parking');
		} catch (error) {
			console.error('Failed to load locations list', error);
		} finally {
			loadingList.value = false;
		}
	};

	const clearFilters = () => {
		searchText.value = '';
		selectedCountry.value = '';
	};

	const openEditPage = (location: ParkingLocation) => {
		router.push(`/admin/${encodeURIComponent(location.id)}`);
	};

	const confirmDelete = async (location: ParkingLocation) => {
		const confirmed = confirm(
			`Are you sure you want to delete "${location.name}"?`,
		);
		if (!confirmed) {
			return;
		}

		try {
			await $fetch(`/api/parking?id=${encodeURIComponent(location.id)}`, {
				method: 'DELETE',
			});
			await fetchLocations();
		} catch (error: any) {
			alert(`Failed to delete: ${error.statusMessage || error.message}`);
		}
	};
</script>
