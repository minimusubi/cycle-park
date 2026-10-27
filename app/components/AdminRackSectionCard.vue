<template>
	<div class="card admin-surface-card mb-5 shadow-xs">
		<div
			class="card-header d-flex flex-row justify-content-between align-items-center py-3 bg-3"
		>
			<strong class="small fg-secondary">
				Rack Section #{{ index + 1 }}
			</strong>
			<button
				type="button"
				class="btn btn-sm btn-link fg-danger p-0 d-flex align-items-center border-0 text-decoration-none"
				@click="$emit('remove-section')"
			>
				<span
					class="material-symbols-outlined"
					style="font-size: 1.1rem"
					>delete</span
				>
				Remove
			</button>
		</div>

		<div class="card-body p-5">
			<div class="row g-3 mb-5">
				<div class="col-12">
					<label class="form-label small fw-bold">Section Name</label>
					<input
						v-model="rate.name"
						type="text"
						class="form-control form-control-sm"
						required
						placeholder="e.g. Top Rack, Main Gate"
					/>
				</div>
			</div>

			<div class="border-top pt-3">
				<div
					class="d-flex justify-content-between align-items-center mb-3"
				>
					<span class="fw-bold fg-secondary admin-kicker">
						Charge Steps Queue
					</span>
					<button
						type="button"
						class="btn btn-xs btn-outline theme-secondary py-1 d-flex align-items-center"
						style="font-size: 0.7rem"
						@click="$emit('add-step')"
					>
						<span
							class="material-symbols-outlined me-1"
							style="font-size: 0.9rem"
							>add</span
						>
						Add Step
					</button>
				</div>

				<div
					v-if="rate.chargeSteps.length === 0"
					class="fg-danger small mb-3"
					style="font-size: 0.72rem"
				>
					Requires at least one charge step.
				</div>

				<div
					v-for="(step, stepIndex) in rate.chargeSteps"
					:key="stepIndex"
					class="row g-3 align-items-center mb-3 p-3 border rounded bg-3 shadow-xs"
				>
					<div class="col-auto">
						<span
							class="badge theme-secondary"
							style="font-size: 0.7rem"
						>
							Step {{ stepIndex + 1 }}
						</span>
					</div>
					<div
						v-if="step.rate === 0"
						class="col-auto"
					>
						<span
							class="badge badge-subtle theme-success"
							style="font-size: 0.65rem"
						>
							Free
						</span>
					</div>
					<div class="col">
						<label class="form-label d-none">Duration (Mins)</label>
						<div class="input-group input-group-sm">
							<input
								v-model.number="step.durationMinutes"
								type="number"
								class="form-control text-center"
								min="1"
								required
								placeholder="Mins"
							/>
							<span
								class="input-group-text px-2"
								style="font-size: 0.7rem"
								>mins</span
							>
						</div>
					</div>
					<div class="col">
						<label class="form-label d-none">Rate</label>
						<div class="input-group input-group-sm">
							<span
								class="input-group-text px-2"
								style="font-size: 0.7rem"
							>
								{{ currencySymbol }}
							</span>
							<input
								v-model.number="step.rate"
								type="number"
								class="form-control text-center"
								min="0"
								required
								placeholder="Cost"
							/>
						</div>
					</div>
					<div class="col-auto d-flex align-items-center">
						<div class="form-field mb-0">
							<template v-if="isLastStep(stepIndex)">
								<input
									:id="`rec-${index}-${stepIndex}`"
									v-model="step.isRecurring"
									type="checkbox"
									class="check"
									:disabled="step.rate === 0"
								/>
								<label
									class="text-nowrap"
									:for="`rec-${index}-${stepIndex}`"
									style="font-size: 0.75rem"
								>
									Recurring
								</label>
							</template>
							<span
								v-else
								class="fg-secondary text-nowrap"
								style="font-size: 0.75rem"
							>
								One-time
							</span>
						</div>
					</div>
					<div class="col-auto">
						<button
							type="button"
							class="btn btn-sm btn-link fg-danger p-0 border-0"
							@click="$emit('remove-step', stepIndex)"
						>
							<span
								class="material-symbols-outlined"
								style="font-size: 1.1rem"
								>remove_circle_outline</span
							>
						</button>
					</div>
				</div>

				<div
					class="fg-secondary small mb-3"
					style="font-size: 0.72rem"
				>
					Use a non-recurring step with cost 0 for an initial free
					period.
				</div>

				<span
					class="fw-bold fg-secondary text-uppercase d-block mb-1"
					style="font-size: 0.65rem; letter-spacing: 0.5px"
				>
					Price Preview
				</span>
				<div
					class="d-flex justify-content-between text-center small text-nowrap gap-1"
				>
					<div
						v-for="preset in simulationPresets"
						:key="preset.minutes"
						class="border rounded p-1 flex-fill bg-body"
					>
						<div
							class="fg-secondary"
							style="font-size: 0.65rem"
						>
							{{ preset.label }}
						</div>
						<strong class="fg-success">
							{{ formatSimPrice(rate, preset.minutes) }}
						</strong>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	defineEmits<{
		'add-step': [];
		'remove-step': [stepIndex: number];
		'remove-section': [];
	}>();

	const props = defineProps<{
		rate: PricingRate;
		index: number;
		country: string;
		currencySymbol: string;
	}>();

	const simulationPresets = [
		{ label: '1 Hour', minutes: 60 },
		{ label: '2 Hours', minutes: 120 },
		{ label: '4 Hours', minutes: 480 },
		{ label: '8 Hours', minutes: 480 },
		{ label: '24 Hours', minutes: 1440 },
	];

	const isLastStep = (stepIndex: number): boolean =>
		stepIndex === props.rate.chargeSteps.length - 1;

	watch(
		() => props.rate.chargeSteps,
		(chargeSteps) => {
			chargeSteps.forEach((step, stepIndex) => {
				if (Number(step.rate) === 0 || !isLastStep(stepIndex)) {
					delete step.isRecurring;
				}
			});
		},
		{ deep: true },
	);

	const formatSimPrice = (rate: PricingRate, minutes: number): string => {
		const cost = calculateParkingFee(rate, minutes);
		if (cost === 0) {
			return 'Free';
		}
		return formatCurrency(cost, props.country);
	};
</script>
