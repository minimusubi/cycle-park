<template>
	<div class="position-relative">
		<label class="form-label small fw-semibold text-secondary">
			{{ label }}
		</label>
		<div class="input-group">
			<span
				class="input-group-text bg-body-tertiary text-secondary border-end-0"
			>
				<span
					class="material-symbols-outlined"
					style="font-size: 1.2rem"
				>
					location_on
				</span>
			</span>
			<input
				:value="modelValue"
				type="text"
				class="form-control border-start-0"
				:placeholder="placeholder"
				@input="onInput"
				@focus="$emit('focus')"
				@keydown.escape="$emit('escape')"
			/>
			<button
				v-if="modelValue"
				type="button"
				class="btn btn-outline-secondary border-start-0"
				@click="$emit('clear')"
			>
				<span
					class="material-symbols-outlined"
					style="font-size: 1.1rem"
				>
					close
				</span>
			</button>
		</div>

		<div
			v-if="showDropdown && results.length > 0"
			class="position-absolute w-100 bg-body shadow rounded-3 border mt-1 overflow-hidden"
			:style="{
				zIndex: 1050,
				maxHeight: `${maxDropdownHeight}px`,
				overflowY: 'auto',
			}"
		>
			<div
				v-for="result in results"
				:key="result.place_id"
				class="p-2 border-bottom hover-bg-body cursor-pointer text-start"
				@click="$emit('select', result)"
			>
				<div class="fw-bold small text-truncate">
					{{ result.display_name.split(',')[0] }}
				</div>
				<div
					class="text-secondary text-truncate"
					style="font-size: 0.75rem"
				>
					{{ result.display_name }}
				</div>
			</div>
		</div>

		<div
			v-if="loading"
			class="position-absolute end-0 top-50 translate-middle-y me-5 mt-2 spinner-border spinner-border-sm text-primary"
			role="status"
		></div>
	</div>
</template>

<script lang="ts" setup>
	interface GeocodeResult {
		place_id: string | number;
		display_name: string;
		lat: string;
		lon: string;
	}

	withDefaults(
		defineProps<{
			modelValue: string;
			label: string;
			placeholder: string;
			results: GeocodeResult[];
			loading: boolean;
			showDropdown: boolean;
			maxDropdownHeight?: number;
		}>(),
		{
			maxDropdownHeight: 250,
		},
	);

	const emit = defineEmits<{
		(e: 'update:modelValue', value: string): void;
		(e: 'input'): void;
		(e: 'focus'): void;
		(e: 'escape'): void;
		(e: 'clear'): void;
		(e: 'select', result: GeocodeResult): void;
	}>();

	const onInput = (event: Event) => {
		emit('update:modelValue', (event.target as HTMLInputElement).value);
		emit('input');
	};
</script>
