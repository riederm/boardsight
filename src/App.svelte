<script lang="ts">
  import FindSquare from './modes/find-square/FindSquare.svelte'
</script>

<header>
  <h1>BoardSight</h1>
</header>

<main>
  <FindSquare />
</main>

<style>
  header {
    padding: 1rem 1rem 0;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 1.5rem;
    letter-spacing: -0.02em;
  }

  main {
    padding: 0.5rem 1rem 2rem;
  }
</style>
