<template>
	<div
		class="admin-lot-card border rounded-5 p-5 mb-5 bg-body hover-shadow transition"
		:class="{ selected }"
	>
		<div class="d-flex justify-content-between align-items-start mb-3">
			<div>
				<h6 class="fw-bold mb-0 fg-body">
					{{ location.name }}
				</h6>
				<span
					class="badge bg-secondary bg-10 fg-secondary border border-secondary border-20 px-3 py-1 rounded-pill mt-1"
					style="font-size: 0.65rem"
				>
					<span
						class="material-symbols-outlined me-1"
						style="font-size: 0.75rem"
						>location_on</span
					>
					{{ location.country }}
				</span>
			</div>
			<div class="d-flex gap-1">
				<button
					class="btn btn-sm btn-outline theme-primary d-flex align-items-center p-2"
					title="Edit"
					@click="$emit('edit', location)"
				>
					<span
						class="material-symbols-outlined"
						style="font-size: 0.95rem"
						>edit</span
					>
				</button>
				<button
					class="btn btn-sm btn-outline theme-danger d-flex align-items-center p-2"
					title="Delete"
					@click="$emit('delete', location)"
				>
					<span
						class="material-symbols-outlined"
						style="font-size: 0.95rem"
						>delete</span
					>
				</button>
			</div>
		</div>

		<p class="fg-secondary small mb-3">
			{{ location.address }}
		</p>
		<p
			v-if="location.notes"
			class="small mb-3 fg-body"
		>
			<span class="fw-semibold">Notes:</span>
			{{ location.notes }}
		</p>
		<div
			class="d-flex justify-content-between fg-secondary small gap-5"
			style="font-size: 0.72rem"
		>
			<span>Hrs: {{ location.hoursOfOperation }}</span>
			<span>Updated: {{ formattedUpdatedDate }}</span>
		</div>

		<div class="mt-3 pt-3 border-top">
			<span
				class="fw-bold fg-secondary text-uppercase d-block admin-kicker"
			>
				Rack Sub-options & Cost structures
			</span>
			<div class="d-flex flex-wrap gap-1">
				<span
					v-for="rate in location.rates"
					:key="rate.id"
					class="badge bg-3 border fg-body text-xs py-1 px-2"
					style="font-size: 0.65rem"
				>
					{{ rate.name }} ({{ formatRateSummary(rate) }})
				</span>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	const props = defineProps<{
		location: ParkingLocation;
		selected: boolean;
	}>();

	defineEmits<{
		(e: 'edit', location: ParkingLocation): void;
		(e: 'delete', location: ParkingLocation): void;
	}>();

	const formattedUpdatedDate = computed(() => {
		if (!props.location.lastUpdated) {
			return 'Unknown';
		}
		return new Date(props.location.lastUpdated).toLocaleDateString();
	});

	const formatRateSummary = (rate: PricingRate): string => {
		const firstStep = rate.chargeSteps[0];

		if (!firstStep) {
			return 'No steps';
		}

		const duration =
			firstStep.durationMinutes >= 60 ?
				`${firstStep.durationMinutes / 60}h`
			:	`${firstStep.durationMinutes}m`;

		if (firstStep.rate === 0 && !firstStep.isRecurring) {
			return `${duration} free`;
		}

		return `${duration} first step`;
	};
</script>
