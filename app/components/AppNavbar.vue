<template>
	<div class="contains-inline">
		<nav
			:class="navClasses"
			data-bs-theme="dark"
		>
			<div :class="containerClass">
				<NuxtLink
					to="/"
					class="navbar-brand d-flex align-items-center"
				>
					<span class="material-symbols-outlined logo-icon me-3">
						directions_bike
					</span>
					<span>CyclePark</span>
				</NuxtLink>
				<button
					class="btn-icon navbar-toggler"
					type="button"
					data-bs-toggle="drawer"
					data-bs-target="#navbarNav"
					aria-controls="navbarNav"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span
						class="navbar-toggler-icon"
						aria-hidden="true"
					></span>
				</button>
				<dialog
					id="navbarNav"
					ref="navigationDrawer"
					class="drawer drawer-end"
					aria-labelledby="navbarNavLabel"
				>
					<div class="drawer-header">
						<h5
							id="navbarNavLabel"
							class="drawer-title"
						>
							Menu
						</h5>
						<button
							type="button"
							class="btn-close"
							data-bs-dismiss="drawer"
							aria-label="Close"
						></button>
					</div>
					<div class="drawer-body">
						<ul class="navbar-nav ms-auto align-items-center">
							<li class="nav-item">
								<NuxtLink
									to="/"
									class="nav-link"
									:class="{ active: route.path === '/' }"
									@click.capture="
										closeDrawerAndNavigate($event, '/')
									"
								>
									Home
								</NuxtLink>
							</li>
							<li class="nav-item">
								<NuxtLink
									to="/search"
									class="nav-link"
									:class="{
										active: route.path === '/search',
									}"
									@click.capture="
										closeDrawerAndNavigate(
											$event,
											'/search',
										)
									"
								>
									Find Parking
								</NuxtLink>
							</li>
							<li class="nav-item">
								<NuxtLink
									to="/admin"
									class="nav-link btn btn-sm fg-white lg:ms-2 px-5 py-1"
									:class="
										route.path.startsWith('/admin') ?
											'active btn-solid theme-primary'
										:	'btn-outline theme-primary'
									"
									@click.capture="
										closeDrawerAndNavigate($event, '/admin')
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
							<li class="nav-item lg:ms-3 mt-3 lg:mt-0">
								<button
									class="btn btn-sm btn-link fg-secondary p-1 border-0"
									title="Toggle Theme"
									@click="toggleColorMode"
								>
									<span
										v-if="colorMode.preference === 'dark'"
										class="material-symbols-outlined fg-warning"
									>
										light_mode
									</span>
									<span
										v-else
										class="material-symbols-outlined fg-white"
									>
										dark_mode
									</span>
								</button>
							</li>
						</ul>
					</div>
				</dialog>
			</div>
		</nav>
	</div>
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
	const { $bootstrapDrawer } = useNuxtApp();
	const navigationDrawer = ref<HTMLDialogElement | null>(null);

	const navClasses = computed(() => [
		'navbar',
		'lg:navbar-expand',
		'bg-black',
		'px-5',
		'py-3',
		'border-bottom',
		'border-secondary',
		props.shadow ? 'border-20 shadow-sm' : '',
	]);

	const toggleColorMode = () => {
		colorMode.preference =
			colorMode.preference === 'dark' ? 'light' : 'dark';
	};

	const closeDrawerAndNavigate = async (event: MouseEvent, path: string) => {
		if (
			event.button !== 0
			|| event.metaKey
			|| event.ctrlKey
			|| event.shiftKey
			|| event.altKey
		) {
			return;
		}

		const drawer = navigationDrawer.value;
		if (!drawer?.open) {
			return;
		}

		event.preventDefault();
		await $bootstrapDrawer.getOrCreateInstance(drawer).hide();
		await navigateTo(path);
	};

	onBeforeUnmount(() => {
		if (navigationDrawer.value) {
			$bootstrapDrawer.getInstance(navigationDrawer.value)?.dispose();
		}
	});
</script>
