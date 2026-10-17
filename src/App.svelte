<script lang="ts">
  import { FILES, RANKS, fromIndices, isLight } from './core/squares'

  // Ranks top-down so White is at the bottom.
  const rows = [...RANKS.keys()].reverse()
</script>

<main>
  <h1>BoardSight</h1>
  <p class="tagline">Train chess coordinates until they are muscle memory.</p>

  <div class="board" aria-hidden="true">
    {#each rows as r (r)}
      {#each FILES.keys() as f (f)}
        {@const sq = fromIndices(f, r)}
        <div class="square" class:light={isLight(sq)}></div>
      {/each}
    {/each}
  </div>

  <p class="soon">Coming soon.</p>
</main>

<style>
  main {
    max-width: 32rem;
    margin: 0 auto;
    padding: 3rem 1rem;
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 2.5rem;
    letter-spacing: -0.02em;
  }

  .tagline,
  .soon {
    color: var(--muted);
  }

  .board {
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    width: min(100%, 20rem);
    aspect-ratio: 1;
    margin: 2rem auto;
    border-radius: 4px;
    overflow: hidden;
  }

  .square {
    background: var(--dark-square);
  }

  .square.light {
    background: var(--light-square);
  }
</style>
