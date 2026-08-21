<template>
	<div class="d-flex flex-column min-vh-100 bg-body">
		<AppNavbar />

		<main class="container py-4 flex-grow-1">
			<div
				v-if="loading"
				class="text-center py-5"
			>
				<div
					class="spinner-border text-primary"
					role="status"
				></div>
				<p class="mt-2 text-secondary mb-0">
					Loading parking lot...
				</p>
			</div>

			<div
				v-else-if="!location"
				class="card shadow border-0 rounded-3"
			>
				<div class="card-body text-center py-5">
					<span
						class="material-symbols-outlined text-secondary"
						style="font-size: 3rem"
					>
						error
					</span>
					<h1 class="h5 mt-3">Parking lot not found</h1>
					<p class="text-secondary">
						The selected parking lot may have been deleted.
					</p>
					<NuxtLink
						to="/admin"
						class="btn btn-primary"
					>
						Back to list
					</NuxtLink>
				</div>
			</div>

			<AdminParkingLotForm
				v-else
				:initial-location="location"
				@saved="onSaved"
			/>
		</main>
	</div>
</template>

<script lang="ts" setup>
	import type { ParkingLocation } from '#shared/types/parking';

	const route = useRoute();
	const router = useRouter();

	const loading = ref(true);
	const location = ref<ParkingLocation | null>(null);

	onMounted(async () => {
		await fetchLocation();
	});

	const fetchLocation = async () => {
		loading.value = true;
		try {
			const locations = await $fetch<ParkingLocation[]>('/api/parking');
			const locationId = String(route.params.id);
			location.value =
				locations.find((item) => item.id === locationId) || null;
		} catch (error) {
			console.error('Failed to load parking lot', error);
			location.value = null;
		} finally {
			loading.value = false;
		}
	};

	const onSaved = async (_location: ParkingLocation) => {
		alert('Bicycle Parking Lot successfully saved!');
		await router.push('/admin');
	};
</script>
