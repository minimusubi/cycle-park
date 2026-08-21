<template>
	<nav :class="navClasses">
		<div :class="containerClass">
			<NuxtLink
				to="/"
				class="navbar-brand d-flex align-items-center"
			>
				<span class="material-symbols-outlined logo-icon me-2">
					directions_bike
				</span>
				<span>CyclePark</span>
			</NuxtLink>
			<button
				class="navbar-toggler"
				type="button"
				data-bs-toggle="collapse"
				data-bs-target="#navbarNav"
			>
				<span class="navbar-toggler-icon"></span>
			</button>
			<div
				id="navbarNav"
				class="collapse navbar-collapse"
			>
				<ul class="navbar-nav ms-auto align-items-center">
					<li class="nav-item">
						<NuxtLink
							to="/"
							class="nav-link"
							:class="{ active: route.path === '/' }"
						>
							Home
						</NuxtLink>
					</li>
					<li class="nav-item">
						<NuxtLink
							to="/search"
							class="nav-link"
							:class="{ active: route.path === '/search' }"
						>
							Find Parking
						</NuxtLink>
					</li>
					<li class="nav-item">
						<NuxtLink
							to="/admin"
							class="nav-link btn btn-sm text-white ms-lg-2 px-3 py-1"
							:class="
								route.path.startsWith('/admin') ?
									'active btn-primary'
								:	'btn-outline-primary'
							"
						>
							<span
								class="material-symbols-outlined align-middle me-1"
								style="font-size: 1.1rem"
							>
								admin_panel_settings
							</span>
							Admin Portal
						</NuxtLink>
					</li>
					<li class="nav-item ms-lg-3 mt-2 mt-lg-0">
						<button
							class="btn btn-sm btn-link text-secondary p-1 border-0"
							title="Toggle Theme"
							@click="toggleColorMode"
						>
							<span
								v-if="colorMode.preference === 'dark'"
								class="material-symbols-outlined text-warning"
							>
								light_mode
							</span>
							<span
								v-else
								class="material-symbols-outlined text-light"
							>
								dark_mode
							</span>
						</button>
					</li>
				</ul>
			</div>
		</div>
	</nav>
</template>

<script lang="ts" setup>
	const props = withDefaults(
		defineProps<{
			containerClass?: string;
			shadow?: boolean;
		}>(),
		{
			containerClass: 'container-fluid',
			shadow: false,
		},
	);

	const route = useRoute();
	const colorMode = useColorMode();

	const navClasses = computed(() => [
		'navbar',
		'navbar-expand-lg',
		'navbar-dark',
		'bg-dark',
		'px-3',
		'py-2',
		'border-bottom',
		'border-secondary',
		props.shadow ? 'border-opacity-20 shadow-sm' : '',
	]);

	const toggleColorMode = () => {
		colorMode.preference =
			colorMode.preference === 'dark' ? 'light' : 'dark';
	};
</script>
