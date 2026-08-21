<template>
	<div class="d-flex flex-column min-vh-100 bg-body">
		<AppNavbar />

		<main class="container py-4 flex-grow-1">
			<AdminParkingLotForm @saved="onSaved" />
		</main>
	</div>
</template>

<script lang="ts" setup>
	import type { ParkingLocation } from '#shared/types/parking';

	const router = useRouter();

	const onSaved = async (_location: ParkingLocation) => {
		alert('Bicycle Parking Lot successfully saved!');
		await router.push('/admin');
	};
</script>
