<template>
	<div class="card admin-surface-card mb-3 shadow-xs">
		<div
			class="card-header d-flex justify-content-between align-items-center py-2 bg-body-tertiary"
		>
			<strong class="small text-secondary">
				Rack Section #{{ index + 1 }}
			</strong>
			<button
				type="button"
				class="btn btn-sm btn-link text-danger p-0 d-flex align-items-center border-0 text-decoration-none"
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

		<div class="card-body p-3">
			<div class="row g-2 mb-3">
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

			<div class="border-top pt-2">
				<div
					class="d-flex justify-content-between align-items-center mb-2"
				>
					<span class="fw-bold text-secondary admin-kicker">
						Charge Steps Queue
					</span>
					<button
						type="button"
						class="btn btn-xs btn-outline-secondary py-0.5 d-flex align-items-center"
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
					class="text-danger small mb-2"
					style="font-size: 0.72rem"
				>
					Requires at least one charge step.
				</div>

				<div
					v-for="(step, stepIndex) in rate.chargeSteps"
					:key="stepIndex"
					class="row g-2 align-items-center mb-2 p-2 border rounded bg-body-tertiary shadow-xs"
				>
					<div class="col-auto">
						<span
							class="badge bg-secondary"
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
							class="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25"
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
								class="input-group-text px-1.5"
								style="font-size: 0.7rem"
								>mins</span
							>
						</div>
					</div>
					<div class="col">
						<label class="form-label d-none">Rate</label>
						<div class="input-group input-group-sm">
							<span
								class="input-group-text px-1.5"
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
						<div class="form-check mb-0">
							<template v-if="isLastStep(stepIndex)">
								<input
									:id="`rec-${index}-${stepIndex}`"
									v-model="step.isRecurring"
									type="checkbox"
									class="form-check-input"
									:disabled="step.rate === 0"
								/>
								<label
									class="form-check-label text-nowrap"
									:for="`rec-${index}-${stepIndex}`"
									style="font-size: 0.75rem"
								>
									Recurring
								</label>
							</template>
							<span
								v-else
								class="text-secondary text-nowrap"
								style="font-size: 0.75rem"
							>
								One-time
							</span>
						</div>
					</div>
					<div class="col-auto">
						<button
							type="button"
							class="btn btn-sm btn-link text-danger p-0 border-0"
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
					class="text-secondary small mb-2"
					style="font-size: 0.72rem"
				>
					Use a non-recurring step with cost 0 for an initial free
					period.
				</div>

				<div class="bg-body-tertiary border rounded p-2 mt-2">
					<span
						class="fw-bold text-secondary text-uppercase d-block mb-1"
						style="font-size: 0.65rem; letter-spacing: 0.5px"
					>
						Live Price Simulation Preview
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
								class="text-secondary"
								style="font-size: 0.65rem"
							>
								{{ preset.label }}
							</div>
							<strong class="text-success">
								{{ formatSimPrice(rate, preset.minutes) }}
							</strong>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	defineEmits<{
		(e: 'add-step'): void;
		(e: 'remove-step', stepIndex: number): void;
		(e: 'remove-section'): void;
	}>();

	const props = defineProps<{
		rate: PricingRate;
		index: number;
		country: string;
		currencySymbol: string;
	}>();

	const simulationPresets = [
		{ label: '1 Hour', minutes: 60 },
		{ label: '3 Hours', minutes: 180 },
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
