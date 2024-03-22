<script lang="ts">
  import { onMount } from "svelte";
  import { isMobile } from "./constants";
  export let nameSelector: string;

  onMount(() => {
    const hud = document.querySelector<HTMLDivElement>(nameSelector);
    const onSetWidth = () => {
      if (hud) {
        hud.style.width =
          document.querySelector<HTMLDivElement>("#game")?.style.width!;
            if (nameSelector === '.wrapper' && !isMobile) {
              hud.style.width = `${parseInt(hud.style.width) * 0.75}px`;
            }
      }
    };

    onSetWidth();

    window.addEventListener("resize", onSetWidth);
    return () => {
      window.removeEventListener("resize", onSetWidth);
    };
  });
</script>
