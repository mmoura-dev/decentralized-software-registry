<script>
	import SearchForm from './SearchForm.svelte';
	import welcome from '$lib/images/svelte-welcome.webp';
	import welcome_fallback from '$lib/images/svelte-welcome.png';
</script>

<svelte:head>
	<title>DSR</title>
	<meta name="description" content="DSR" />
</svelte:head>

<section>
	<h1>
		Search for registries
	</h1>

	<SearchForm />
</section>

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 0.6;
	}

	h1 {
		width: 100%;
	}
</style>

