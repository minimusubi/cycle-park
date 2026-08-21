<template>
	<div class="w-100 h-100 position-relative">
		<div
			ref="mapContainer"
			class="w-100 h-100"
			style="min-height: 350px"
		></div>

		<div
			v-if="interactiveMode"
			class="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-dark text-white px-3 py-2 rounded-pill shadow-lg border border-secondary text-nowrap pointer-events-none"
			style="z-index: 10; font-size: 0.85rem; opacity: 0.9"
		>
			<span
				class="material-symbols-outlined me-1"
				style="font-size: 1.1rem"
				>touch_app</span
			>
			Click anywhere on the map to place a pin
		</div>
	</div>
</template>

<script lang="ts" setup>
	import * as maplibregl from 'maplibre-gl';
	import mapLibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';

	interface MapPin {
		id: string;
		name: string;
		latitude: number;
		longitude: number;
		address: string;
		priceLabel?: string;
		isDestination?: boolean;
		isCheapest?: boolean;
	}

	const props = withDefaults(
		defineProps<{
			center: [number, number];
			zoom?: number;
			pins?: MapPin[];
			destination?: [number, number] | null;
			interactiveMode?: boolean;
		}>(),
		{
			zoom: 15,
			pins: () => [],
			destination: null,
			interactiveMode: false,
		},
	);

	const emit = defineEmits<{
		(e: 'map-clicked', coordinates: { lat: number; lng: number }): void;
		(e: 'pin-clicked', pinId: string): void;
	}>();

	const runtimeConfig = useRuntimeConfig();
	const colorMode = useColorMode();
	const mapContainer = ref<HTMLElement | null>(null);
	let map: maplibregl.Map | null = null;
	let destinationMarker: maplibregl.Marker | null = null;
	let interactiveMarker: maplibregl.Marker | null = null;
	let parkingMarkers: maplibregl.Marker[] = [];

	const toLngLat = (coords: [number, number]): [number, number] => [
		coords[1],
		coords[0],
	];

	const getMapStyleUrl = (darkMode: boolean): string => {
		const lightStyle = String(runtimeConfig.public.mapStyleUrl || '');
		const configuredDarkStyle = String(
			runtimeConfig.public.mapDarkStyleUrl || '',
		);
		const configuredStyle =
			darkMode && configuredDarkStyle ? configuredDarkStyle
			: darkMode ?
				lightStyle.replace(
					'/maps/streets-v4/',
					'/maps/streets-v4-dark/',
				)
			:	lightStyle;
		const mapTilerKey = String(runtimeConfig.public.mapTilerKey || '');

		if (configuredStyle.includes('{key}')) {
			return configuredStyle.replace('{key}', mapTilerKey);
		}

		return configuredStyle;
	};

	const createMarkerElement = (
		markerClass: string,
		icon: string,
		size: number,
		priceLabel = '',
	): HTMLElement => {
		const wrapper = document.createElement('div');
		wrapper.className = 'maplibre-marker-wrapper';

		const marker = document.createElement('div');
		marker.className = `custom-marker-pin ${markerClass} text-white shadow-md border border-2 border-white`;
		marker.style.width = `${size}px`;
		marker.style.height = `${size}px`;
		marker.style.borderRadius = '50%';

		const iconSpan = document.createElement('span');
		iconSpan.className = 'material-symbols-outlined';
		iconSpan.style.fontSize = size >= 40 ? '24px' : '20px';
		iconSpan.textContent = icon;
		marker.appendChild(iconSpan);
		wrapper.appendChild(marker);

		if (priceLabel) {
			const badge = document.createElement('div');
			badge.className =
				'bg-dark text-white rounded-pill px-2 mt-1 border border-secondary shadow-sm text-nowrap text-center';
			badge.style.fontSize = '0.7rem';
			badge.style.fontWeight = 'bold';
			badge.style.width = 'fit-content';
			badge.style.margin = '0 auto';
			badge.textContent = priceLabel;
			wrapper.appendChild(badge);
		}

		return wrapper;
	};

	const removeMarker = (marker: maplibregl.Marker | null) => {
		if (marker) {
			marker.remove();
		}
	};

	const clearParkingMarkers = () => {
		parkingMarkers.forEach((marker) => marker.remove());
		parkingMarkers = [];
	};

	onMounted(() => {
		if (!mapContainer.value) {
			return;
		}

		maplibregl.setWorkerUrl(mapLibreWorkerUrl);

		map = new maplibregl.Map({
			container: mapContainer.value,
			style: getMapStyleUrl(colorMode.value === 'dark'),
			center: toLngLat(props.center),
			zoom: props.zoom,
			attributionControl: true,
		});

		map.addControl(new maplibregl.NavigationControl(), 'top-right');

		map.on('click', (event: maplibregl.MapMouseEvent) => {
			const clickTarget = event.originalEvent?.target;
			if (
				clickTarget instanceof Element
				&& clickTarget.closest('.maplibregl-marker, .maplibregl-popup')
			) {
				return;
			}

			const coords = event.lngLat;

			if (props.interactiveMode && !props.destination) {
				placeInteractiveMarker(coords.lat, coords.lng);
			}

			emit('map-clicked', { lat: coords.lat, lng: coords.lng });
		});

		map.on('load', () => {
			renderDestination();
			renderPins();
		});
	});

	onBeforeUnmount(() => {
		clearParkingMarkers();
		removeMarker(destinationMarker);
		removeMarker(interactiveMarker);

		if (map) {
			map.remove();
			map = null;
		}
	});

	watch(
		() => props.center,
		(newCenter) => {
			if (map && newCenter) {
				map.setCenter(toLngLat(newCenter));
			}
		},
		{ deep: true },
	);

	watch(
		() => props.zoom,
		(newZoom) => {
			if (map && typeof newZoom === 'number') {
				map.setZoom(newZoom);
			}
		},
	);

	watch(
		() => colorMode.value,
		(mode) => {
			if (map) {
				map.setStyle(getMapStyleUrl(mode === 'dark'));
			}
		},
	);

	watch(
		() => props.pins,
		() => {
			renderPins();
		},
		{ deep: true },
	);

	watch(
		() => props.destination,
		() => {
			renderDestination();
		},
		{ deep: true },
	);

	const placeInteractiveMarker = (lat: number, lng: number) => {
		if (!map) {
			return;
		}

		if (interactiveMarker) {
			interactiveMarker.setLngLat([lng, lat]);
			return;
		}

		interactiveMarker = new maplibregl.Marker({
			element: createMarkerElement('bg-danger', 'location_on', 36),
			anchor: 'bottom',
		})
			.setLngLat([lng, lat])
			.addTo(map);
	};

	const renderDestination = () => {
		if (!map) {
			return;
		}

		removeMarker(destinationMarker);
		destinationMarker = null;

		if (!props.destination) {
			return;
		}

		const [lat, lng] = props.destination;
		const element = createMarkerElement(
			'bg-danger shadow-lg border border-3 border-white animate-bounce',
			'my_location',
			40,
		);

		destinationMarker = new maplibregl.Marker({
			element,
			anchor: 'center',
		})
			.setLngLat([lng, lat])
			.setPopup(
				new maplibregl.Popup({ offset: 20 }).setHTML(
					'<strong class="text-danger">Search Destination</strong>',
				),
			)
			.addTo(map);
	};

	const renderPins = () => {
		if (!map) {
			return;
		}

		clearParkingMarkers();

		props.pins.forEach((pin) => {
			const markerClass = pin.isCheapest ? 'bg-success' : 'bg-primary';
			const icon = pin.isCheapest ? 'payments' : 'directions_bike';
			const element = createMarkerElement(
				markerClass,
				icon,
				36,
				pin.priceLabel || '',
			);

			element.addEventListener('click', () => {
				emit('pin-clicked', pin.id);
			});

			const popupContent = `
      <div style="font-family: 'Inter', sans-serif; min-width: 180px;">
        <h6 class="mb-1 text-primary fw-bold">${pin.name}</h6>
        <p class="mb-1 text-secondary" style="font-size: 0.8rem;">
          <span class="material-symbols-outlined me-1" style="font-size: 0.9rem;">location_on</span>${pin.address}
        </p>
        ${pin.priceLabel ? `<div class="mt-2 text-success fw-bold" style="font-size: 0.95rem;">Cost: ${pin.priceLabel}</div>` : ''}
        <button data-pin-id="${pin.id}" class="btn btn-sm btn-primary w-100 mt-2 py-1 map-popup-detail-button" style="font-size: 0.75rem;">View Details</button>
      </div>
    `;

			const popup = new maplibregl.Popup({ offset: 28 }).setHTML(
				popupContent,
			);

			popup.on('open', () => {
				const button = document.querySelector(
					`.map-popup-detail-button[data-pin-id="${pin.id}"]`,
				);
				button?.addEventListener('click', () => {
					emit('pin-clicked', pin.id);
				});
			});

			const marker = new maplibregl.Marker({
				element,
				anchor: 'top',
			})
				.setLngLat([pin.longitude, pin.latitude])
				.setPopup(popup)
				.addTo(map);

			parkingMarkers.push(marker);
		});
	};
</script>

<style>
	.maplibre-marker-wrapper {
		align-items: center;
		background: transparent;
		border: none;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.maplibregl-popup-content {
		border-radius: 8px;
		box-shadow: 0 10px 30px rgba(15, 23, 42, 0.18);
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.animate-bounce {
		animation: bounce 2s infinite ease-in-out;
	}
</style>
