<template>
	<div class="w-100 h-100 position-relative">
		<div
			ref="mapContainer"
			class="w-100 h-100"
			style="min-height: 350px"
		></div>

		<!-- Instruction overlay for interactive mode -->
		<div
			v-if="interactiveMode"
			class="position-absolute bottom-0 start-50 translate-middle-x mb-3 bg-dark text-white px-3 py-2 rounded-pill shadow-lg border border-secondary text-nowrap pointer-events-none"
			style="z-index: 1000; font-size: 0.85rem; opacity: 0.9"
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

	const mapContainer = ref<HTMLElement | null>(null);
	let map: any = null;
	let markerLayer: any = null;
	let destinationMarker: any = null;
	let interactiveMarker: any = null;

	// Initialize Leaflet Map
	onMounted(() => {
		if (!mapContainer.value) {
			return;
		}

		const L = (window as any).L;
		if (!L) {
			console.error('Leaflet is not loaded on the window object.');
			return;
		}

		// Initialize Map
		map = L.map(mapContainer.value, {
			zoomControl: true,
		}).setView(props.center, props.zoom);

		// Add OSM Tiles
		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(map);

		// Initialize Layer for Parking Pins
		markerLayer = L.layerGroup().addTo(map);

		// Set click listener for interactive mode / placing custom pins
		map.on('click', (e: any) => {
			const coords = e.latlng;

			if (props.interactiveMode) {
				// Place marker at clicked coordinate
				placeInteractiveMarker(coords.lat, coords.lng);
				emit('map-clicked', { lat: coords.lat, lng: coords.lng });
			} else {
				// For main search page, clicking the map moves the destination
				emit('map-clicked', { lat: coords.lat, lng: coords.lng });
			}
		});

		// Render initial inputs
		renderDestination();
		renderPins();
	});

	onBeforeUnmount(() => {
		if (map) {
			map.remove();
		}
	});

	// Watch center property changes
	watch(
		() => props.center,
		(newCenter) => {
			if (map && newCenter) {
				map.setView(newCenter, map.getZoom());
			}
		},
		{ deep: true },
	);

	// Watch pins property changes
	watch(
		() => props.pins,
		() => {
			renderPins();
		},
		{ deep: true },
	);

	// Watch destination property changes
	watch(
		() => props.destination,
		() => {
			renderDestination();
		},
		{ deep: true },
	);

	const placeInteractiveMarker = (lat: number, lng: number) => {
		const L = (window as any).L;
		if (!L || !map) {
			return;
		}

		if (interactiveMarker) {
			interactiveMarker.setLatLng([lat, lng]);
		} else {
			// Custom Red Pin Icon
			const customIcon = L.divIcon({
				html: `
        <div class="custom-marker-pin bg-danger text-white" style="width: 36px; height: 36px;">
          <span class="material-symbols-outlined" style="font-size: 20px;">location_on</span>
        </div>
      `,
				className: 'custom-leaflet-icon',
				iconSize: [36, 36],
				iconAnchor: [18, 36],
			});

			interactiveMarker = L.marker([lat, lng], {
				icon: customIcon,
			}).addTo(map);
		}
	};

	const renderDestination = () => {
		const L = (window as any).L;
		if (!L || !map) {
			return;
		}

		// Clear previous destination marker
		if (destinationMarker) {
			map.removeLayer(destinationMarker);
			destinationMarker = null;
		}

		// Draw new destination marker if provided
		if (props.destination) {
			const [lat, lng] = props.destination;

			const customIcon = L.divIcon({
				html: `
        <div class="custom-marker-pin bg-danger text-white shadow-lg border border-3 border-white animate-bounce" style="width: 40px; height: 40px; border-radius: 50%;">
          <span class="material-symbols-outlined" style="font-size: 24px; font-variation-settings: 'FILL' 1;">my_location</span>
        </div>
      `,
				className: 'custom-leaflet-icon',
				iconSize: [40, 40],
				iconAnchor: [20, 20], // Center it
			});

			destinationMarker = L.marker([lat, lng], {
				icon: customIcon,
			}).addTo(map);
			destinationMarker
				.bindPopup(
					'<strong class="text-danger">Search Destination</strong>',
				)
				.openPopup();
		}
	};

	const renderPins = () => {
		const L = (window as any).L;
		if (!L || !map || !markerLayer) {
			return;
		}

		// Clear existing parking pins
		markerLayer.clearLayers();

		props.pins.forEach((pin) => {
			// Determine pin color and badge based on type/pricing
			let pinClass = 'bg-primary'; // Default blue
			let icon = 'directions_bike';

			if (pin.isCheapest) {
				pinClass = 'bg-success'; // Green for cheapest
				icon = 'payments';
			}

			const priceLabel =
				pin.priceLabel ?
					`<div class="bg-dark text-white rounded-pill px-2 py-0.5 mt-1 border border-secondary shadow-sm text-nowrap text-center" style="font-size: 0.7rem; font-weight: bold; width: fit-content; margin: 0 auto;">${pin.priceLabel}</div>`
				:	'';

			const customIcon = L.divIcon({
				html: `
        <div class="d-flex flex-column align-items-center">
          <div class="custom-marker-pin ${pinClass} text-white shadow-md border border-2 border-white" style="width: 36px; height: 36px; border-radius: 50%;">
            <span class="material-symbols-outlined" style="font-size: 20px;">${icon}</span>
          </div>
          ${priceLabel}
        </div>
      `,
				className: 'custom-leaflet-icon',
				iconSize: [60, 60],
				iconAnchor: [30, 18], // Adjusted to put the pin center at lat/lng
			});

			const marker = L.marker([pin.latitude, pin.longitude], {
				icon: customIcon,
			});

			// Popup Content
			const popupContent = `
      <div style="font-family: 'Inter', sans-serif; min-width: 180px;">
        <h6 class="mb-1 text-primary fw-bold">${pin.name}</h6>
        <p class="mb-1 text-secondary" style="font-size: 0.8rem;">
          <span class="material-symbols-outlined me-1" style="font-size: 0.9rem;">location_on</span>${pin.address}
        </p>
        ${pin.priceLabel ? `<div class="mt-2 text-success fw-bold" style="font-size: 0.95rem;">Cost: ${pin.priceLabel}</div>` : ''}
        <button onclick="window.dispatchEvent(new CustomEvent('map-pin-select', { detail: '${pin.id}' }))" class="btn btn-sm btn-primary w-100 mt-2 py-1" style="font-size: 0.75rem;">View Details</button>
      </div>
    `;

			marker.bindPopup(popupContent);

			// Event hooks
			marker.on('click', () => {
				emit('pin-clicked', pin.id);
			});

			markerLayer.addLayer(marker);
		});

		// Listen to the window event dispatched by popup button
		if (typeof window !== 'undefined') {
			(window as any)._onMapPinSelect = (e: any) => {
				emit('pin-clicked', e.detail);
			};
			window.addEventListener(
				'map-pin-select',
				(window as any)._onMapPinSelect,
			);
		}
	};

	onBeforeUnmount(() => {
		if (typeof window !== 'undefined' && (window as any)._onMapPinSelect) {
			window.removeEventListener(
				'map-pin-select',
				(window as any)._onMapPinSelect,
			);
		}
	});
</script>

<style>
	.custom-leaflet-icon {
		background: transparent !important;
		border: none !important;
		box-shadow: none !important;
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
