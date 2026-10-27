<template>
	<div class="d-flex flex-column min-vh-100 bg-body">
		<AppNavbar />

		<main class="container py-7 flex-grow-1">
			<div
				class="d-flex flex-column lg:flex-row gap-5 justify-content-between lg:align-items-center mb-7"
			>
				<div>
					<p class="admin-kicker fg-secondary mb-1">
						Parking Lot Management
					</p>
					<h1 class="h3 fw-bold mb-0">Bicycle Parking Lots</h1>
				</div>
				<NuxtLink
					to="/admin/new"
					class="btn btn-solid theme-primary d-inline-flex align-items-center justify-content-center"
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

			<div class="card shadow border-0 rounded-5">
				<div class="card-body p-5 md:p-7">
					<div class="row g-5 align-items-end mb-7">
						<div class="col-12 lg:col-8">
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
						<div class="col-12 sm:col-6 lg:col-2">
							<label class="form-label small fw-bold">
								Country
							</label>
							<select
								v-model="selectedCountry"
								class="form-control"
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
						<div class="col-12 sm:col-6 lg:col-2">
							<button
								type="button"
								class="btn btn-outline theme-secondary w-100"
								:disabled="!hasActiveFilters"
								@click="clearFilters"
							>
								Clear
							</button>
						</div>
					</div>

					<div
						class="d-flex justify-content-between align-items-center mb-5"
					>
						<span class="fg-secondary small">
							Showing {{ filteredLocations.length }} of
							{{ locationsList.length }} lots
						</span>
						<span
							v-if="loadingList"
							class="spinner-border spinner-border-sm fg-primary"
						></span>
					</div>

					<div
						v-if="loadingList"
						class="text-center py-12"
					>
						<div
							class="spinner-border fg-primary"
							role="status"
						></div>
						<p class="mt-3 fg-secondary mb-0">
							Loading parking list...
						</p>
					</div>

					<div
						v-else-if="filteredLocations.length === 0"
						class="text-center py-12 fg-secondary"
					>
						<span
							class="material-symbols-outlined"
							style="font-size: 3rem"
						>
							info
						</span>
						<p class="mt-3 mb-0">No matching parking lots found.</p>
					</div>

					<div
						v-else
						class="row g-5"
					>
						<div
							v-for="location in filteredLocations"
							:key="location.id"
							class="col-12 lg:col-6"
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
			locationsList.value =
				await $fetch<ParkingLocation[]>('/api/parking');
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
