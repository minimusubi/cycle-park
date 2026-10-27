<template>
	<div>
		<div class="d-flex justify-content-between align-items-center mb-1">
			<label class="form-label small fw-semibold fg-secondary mb-0">
				{{ label }}
			</label>
			<div class="d-flex align-items-center">
				<input
					:value="hours"
					type="number"
					class="form-control form-control-sm text-center fw-bold me-1"
					style="width: 50px"
					min="0"
					max="48"
					@change="onHoursChange"
				/>
				<span class="small fg-secondary me-3">h</span>
				<input
					:value="minutes"
					type="number"
					class="form-control form-control-sm text-center fw-bold me-1"
					style="width: 50px"
					min="0"
					max="59"
					@change="onMinutesChange"
				/>
				<span class="small fg-secondary">m</span>
			</div>
		</div>

		<input
			:value="sliderValue"
			type="range"
			class="price-slider"
			min="0"
			max="1440"
			step="15"
			@input="onSliderInput"
		/>

		<div class="d-flex flex-wrap gap-1 mt-3 justify-content-between">
			<button
				v-for="preset in presets"
				:key="preset.value"
				type="button"
				class="btn btn-xs py-1 px-3 border rounded-pill text-nowrap"
				:class="
					sliderValue === preset.value ?
						'btn-subtle theme-primary fg-white border-primary'
					:	'btn-text theme-secondary'
				"
				:style="{ fontSize }"
				@click="$emit('preset', preset.value)"
			>
				{{ preset.label }}
			</button>
		</div>
	</div>
</template>

<script lang="ts" setup>
	interface DurationPreset {
		label: string;
		value: number;
	}

	withDefaults(
		defineProps<{
			label: string;
			sliderValue: number;
			hours: number;
			minutes: number;
			presets: DurationPreset[];
			fontSize?: string;
		}>(),
		{
			fontSize: '0.75rem',
		},
	);

	const emit = defineEmits<{
		(e: 'update:sliderValue', value: number): void;
		(e: 'update:hours', value: number): void;
		(e: 'update:minutes', value: number): void;
		(e: 'slider-input'): void;
		(e: 'hours-change'): void;
		(e: 'minutes-change'): void;
		(e: 'preset', value: number): void;
	}>();

	const onSliderInput = (event: Event) => {
		emit(
			'update:sliderValue',
			Number((event.target as HTMLInputElement).value),
		);
		emit('slider-input');
	};

	const onHoursChange = (event: Event) => {
		emit('update:hours', Number((event.target as HTMLInputElement).value));
		emit('hours-change');
	};

	const onMinutesChange = (event: Event) => {
		emit(
			'update:minutes',
			Number((event.target as HTMLInputElement).value),
		);
		emit('minutes-change');
	};
</script>
