<template>
	<div
		class="card parking-card mb-3 shadow-sm"
		:class="{ selected }"
		@click="$emit('select')"
	>
		<div class="card-body p-3">
			<div class="row g-2">
				<div class="col-4">
					<img
						:src="photoSrc"
						class="parking-img-thumb"
						alt="Parking spot thumbnail"
					/>
				</div>

				<div class="col-8 d-flex flex-column justify-content-between">
					<div>
						<div
							class="d-flex justify-content-between align-items-start"
						>
							<h6
								class="card-title fw-bold text-truncate mb-0"
								:title="lot.name"
							>
								{{ lot.name }}
							</h6>
							<span
								v-if="isCheapest && isClosest"
								class="badge badge-both text-xs px-2 py-0.5 rounded-pill"
								style="font-size: 0.65rem"
							>
								Cheapest & Closest
							</span>
							<span
								v-else-if="isCheapest"
								class="badge badge-cheapest text-xs px-2 py-0.5 rounded-pill"
								style="font-size: 0.65rem"
							>
								Cheapest
							</span>
							<span
								v-else-if="isClosest"
								class="badge badge-closest text-xs px-2 py-0.5 rounded-pill"
								style="font-size: 0.65rem"
							>
								Closest
							</span>
						</div>
						<p
							class="text-secondary small mb-1 text-truncate"
							:title="lot.address"
						>
							<span
								class="material-symbols-outlined align-middle me-1"
								style="font-size: 0.95rem"
							>
								location_on
							</span>
							{{ lot.address }}
						</p>
						<p
							v-if="lot.notes"
							class="text-secondary small mb-1"
						>
							<span
								class="material-symbols-outlined align-middle me-1"
								style="font-size: 0.95rem"
							>
								info
							</span>
							{{ lot.notes }}
						</p>

						<div class="d-flex gap-3 align-items-center mt-1">
							<span
								class="small fw-semibold text-secondary d-flex align-items-center"
							>
								<span
									class="material-symbols-outlined align-middle me-1"
									style="font-size: 1rem; color: #ba6bff"
								>
									navigation
								</span>
								{{
									lot.distance !== undefined ?
										formatDistance(lot.distance)
									:	'Calculating...'
								}}
							</span>

							<span
								class="fw-bold text-success d-flex align-items-center"
							>
								<span
									class="material-symbols-outlined align-middle me-1"
									style="
										font-size: 1.1rem;
										font-variation-settings: 'FILL' 1;
									"
								>
									payments
								</span>
								{{ dynamicCostLabel }}
							</span>
						</div>
					</div>

					<div class="d-flex gap-1 flex-wrap mt-2">
						<span
							v-for="pKey in lot.paymentMethods"
							:key="pKey"
							class="badge bg-body-tertiary border text-body text-xs d-inline-flex align-items-center py-0.5 px-1.5"
							style="font-size: 0.65rem"
							:title="getPaymentName(pKey)"
						>
							<span
								class="material-symbols-outlined me-1"
								style="font-size: 0.85rem"
							>
								{{ getPaymentIcon(pKey) }}
							</span>
							{{ getPaymentName(pKey) }}
						</span>
					</div>
				</div>
			</div>

			<div
				v-if="selected"
				class="mt-3 pt-3 border-top"
				@click.stop
			>
				<div class="row g-2">
					<div class="col-12">
						<h6 class="fw-bold small text-secondary mb-2">
							Detailed Rates (by Rack Section)
						</h6>
						<div
							v-for="rate in lot.rates"
							:key="rate.id"
							class="p-2 border rounded bg-body-tertiary mb-2"
						>
							<div
								class="d-flex justify-content-between align-items-center"
							>
								<strong class="small">{{ rate.name }}</strong>
								<span class="text-success fw-bold text-sm">
									{{ formatRateCost(rate, lot.country) }}
								</span>
							</div>
							<div
								class="text-secondary"
								style="font-size: 0.75rem"
							>
								{{ formatChargeStepsDesc(rate, lot.country) }}
							</div>
						</div>
					</div>

					<div class="col-6">
						<span
							class="fw-semibold text-secondary"
							style="font-size: 0.75rem"
						>
							HOURS
						</span>
						<div class="small fw-bold">
							{{ lot.hoursOfOperation }}
						</div>
					</div>
					<div class="col-6">
						<span
							class="fw-semibold text-secondary"
							style="font-size: 0.75rem"
						>
							LAST UPDATED
						</span>
						<div class="small text-secondary">
							{{ formatDate(lot.lastUpdated) }}
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	const props = defineProps<{
		lot: ParkingLocation;
		selected: boolean;
		isCheapest: boolean;
		isClosest: boolean;
		durationMinutes: number;
	}>();

	defineEmits<{
		(e: 'select'): void;
	}>();

	const fallbackPhoto =
		'https://images.unsplash.com/photo-1541614101331-1a5a3a194e92?auto=format&fit=crop&w=300&q=80';

	const photoSrc = computed(() => props.lot.photoUrl || fallbackPhoto);

	const getCheapestRate = (lot: ParkingLocation, minutes: number): number => {
		if (!lot.rates || lot.rates.length === 0) {
			return 0;
		}

		const fees = lot.rates.map((rate) =>
			calculateParkingFee(rate, minutes),
		);
		return Math.min(...fees);
	};

	const dynamicCostLabel = computed(() => {
		const minCost = getCheapestRate(props.lot, props.durationMinutes);

		if (minCost === 0) {
			return 'Free';
		}
		return formatCurrency(minCost, props.lot.country);
	});

	const formatRateCost = (rate: PricingRate, country: string): string => {
		const cost = calculateParkingFee(rate, props.durationMinutes);
		if (cost === 0) {
			return 'Free';
		}
		return formatCurrency(cost, country);
	};

	const formatChargeStepsDesc = (
		rate: PricingRate,
		countryName: string,
	): string => {
		return rate.chargeSteps
			.map((step) => {
				const hrs = step.durationMinutes / 60;
				const durationLabel =
					hrs >= 1 ? `${hrs}h` : `${step.durationMinutes}m`;

				if (step.rate === 0) {
					return step.isRecurring ?
							`Free every ${durationLabel}`
						:	`First ${durationLabel} free`;
				}

				const rateStr = formatCurrency(step.rate, countryName);

				return step.isRecurring ?
						`${rateStr}/${durationLabel} after`
					:	`${rateStr} first ${durationLabel}`;
			})
			.join(', ');
	};

	const getPaymentDef = (key: string) => {
		return PAYMENT_METHODS[key] || { key, name: key, icon: 'help' };
	};

	const getPaymentName = (key: string): string => {
		return getPaymentDef(key).name;
	};

	const getPaymentIcon = (key: string): string => {
		return getPaymentDef(key).icon;
	};

	const formatDate = (isoString: string): string => {
		if (!isoString) {
			return 'Unknown';
		}
		try {
			const d = new Date(isoString);
			return d.toLocaleDateString(undefined, {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			});
		} catch (e) {
			return 'Unknown';
		}
	};
</script>
