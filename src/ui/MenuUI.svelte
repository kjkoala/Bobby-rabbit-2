<script lang="ts">
  import { Menu } from "src/scenes/mainMenu";
  import { resources } from "src/app/resources";
  import { onDestroy, onMount } from "svelte";
  import { getMusicStatus } from "src/common/getMusicStatus";
  import {
    starts_2_levels,
    getLevelsLocalStorage,
    isMobile,
    tilemap,
  } from "src/common/constants";
  import { InputTypes } from "../common/types";
  import { getInputType } from "src/common/getInputType";
  import { computedTimeUTC } from "src/common/computedTimeUTC";
  import ResizeWidthHUD from "src/common/ResizeWidthHUD.svelte";

  export let menu: Menu;
  const storageLevelsCarrots = getLevelsLocalStorage(starts_2_levels);
  let records: false | "carrots" = false;
  let musicEnable = getMusicStatus();
  let currentInputType = getInputType();
  let rules: boolean | string = false;
  let ready: boolean = false;
  let levelsDontStart = [
    storageLevelsCarrots.length === 0,
  ];

  let backgroundUI: HTMLDivElement;

  onMount(() => {
    const background = resources.Title.data.cloneNode();
    backgroundUI.append(background);


    setTimeout(() => {
      ready = true;
    }, 100);
  });

  onDestroy(() => {
    window.localStorage.setItem("inputType", currentInputType);
  });

  let onChangeMusicStatus = () => {
    musicEnable = !musicEnable;
    menu.toggleMusic(musicEnable);
  };

  const changeInputType = () => {
    let nextInputType = currentInputType;
    if (currentInputType === InputTypes.stick) {
      nextInputType = InputTypes.classic;
    } else if (currentInputType === InputTypes.classic) {
      nextInputType = InputTypes.right;
    } else if (currentInputType === InputTypes.right) {
      nextInputType = InputTypes.left;
    } else if (currentInputType === InputTypes.left) {
      nextInputType = InputTypes.center;
    } else if (currentInputType === InputTypes.center) {
      nextInputType = InputTypes.stick;
    }
    currentInputType = nextInputType;
  };
</script>

<div class="wrapper">
  <ResizeWidthHUD nameSelector=".wrapper" />
  <div class:mobilebg={isMobile} class="background" bind:this={backgroundUI} />
  {#if !records && !rules && ready}
    {#if !levelsDontStart[0]}
      <button type="button" on:click={() => menu.continueGame(starts_2_levels)}
        >Продолжить</button
      >
    {/if}
    <button type="button" on:click={() => menu.startCarrotsNewGame()}>Новая игра</button>
    {#if storageLevelsCarrots.length > 0}
      <button type="button" on:click={() => (records = "carrots")}>Рекорды</button>
    {/if}
    <button type="button" on:click={onChangeMusicStatus}
      >Музыка {musicEnable ? "выкл." : "вкл."}</button
    >
    {#if isMobile}
      <button type="button" on:click={changeInputType}
        >Управление ({currentInputType === InputTypes.stick
          ? "стиком"
          : currentInputType === InputTypes.classic
          ? "стрелки стандартное"
          : currentInputType === InputTypes.center
          ? "стрелки центр"
          : currentInputType === InputTypes.left
          ? "стрелки слева"
          : "стрелки справа"})</button
      >
    {/if}
    <button type="button" on:click={() => (rules = "1")}>Правила</button>
  {/if}
  {#if records === "carrots"}
    <div class="records">
      <div class="levels" class:mobile={isMobile}>
        {#each storageLevelsCarrots as carrot}
          <button
            class="level"
            on:click={() => {
              menu.handleNextLevel(carrot.level);
            }}
            >Уровень {carrot.level + 1}<br />
            Время: {computedTimeUTC(new Date(carrot.time))}<br />
            Шаги: {carrot.steps}
          </button>
        {/each}
      </div>
      <button type="button" on:click={() => (records = false)}>Назад</button>
    </div>
  {/if}
  {#if rules === "1"}
    <div class="records rules" class:rules_mobile={isMobile}>
      Кролик идёт по направлению нажатой кнопки.
      <div class="arrow_keys">
        <span class="arrow"
          ><div>←</div>
          <div>A</div>
        </span><span class="arrow top"
          ><div>W</div>
          <div>↑</div></span
        ><span class="arrow"
          ><div>S</div>
          <div>↓</div></span
        ><span class="arrow"
          ><div>D</div>
          <div>→</div></span
        >
      </div>
      <button type="button" on:click={() => (rules = "2")}>Далее (1 / 8)</button
      >
    </div>
  {/if}
  {#if rules === "2"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img carrots_img_wrap">
        <img class="rules_img carrots_img" src={tilemap} alt="" />
      </div>
      Звезда:
      <div>
        Встань на звезду - кролик подберёт её. <br />
        Собери всё звезды на уровне для активации выхода.
      </div>
      <button type="button" on:click={() => (rules = "3")}>Далее (2 / 8)</button
      >
    </div>
  {/if}
  {#if rules === "3"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img locks_img_wrap">
        <img class="rules_img lock_img" src={tilemap} alt="" />
      </div>
      Замок и ключ:
      <div>
        На карте есть места закрытые замком. <br />
        Кролику надо найти подходящий по цвету ключ.<br />
        После того, как кролик подберёт ключ, он может идти смело к замку.
        <br />
      </div>
      <button type="button" on:click={() => (rules = "4")}>Далее (3 / 8)</button
      >
    </div>
  {/if}
  {#if rules === "4"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img carrots_img_wrap">
        <img class="rules_img traps_img" src={tilemap} alt="" />
      </div>
      Ловушки:
      <div>
        Если так случилось, <br />что кролик пробежал по ловушке,<br />
        ловушка активируется. <br /> после чего второй раз на неё наступать нельзя.
      </div>
      <button type="button" on:click={() => (rules = "5")}>Далее (4 / 8)</button
      >
    </div>
  {/if}
  {#if rules === "5"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img locks_img_wrap">
        <img class="rules_img rotate_block_img" src={tilemap} alt="" />
      </div>
      Динамическая стена:
      <div>
        Через этот камень можно пройти только в определенном направлении. <br />
        Когда кролик уходит с платформы, она двигается на 90 градусов по часовой
        стрелке.
      </div>
      <button type="button" on:click={() => (rules = "6")}>Далее (5 / 8)</button
      >
    </div>
  {/if}
  {#if rules === "6"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img diamonds_img_wrap">
        <img class="rules_img diamonds_block_img" src={tilemap} alt="" />
      </div>
      Волшебный кристалл:
      <div>
        Стреляет лучом направленной энергии, <br />этот луч может растопить ледяной куб.
      </div>
      <button type="button" on:click={() => (rules = "7")}>Далее (6 / 8)</button
      >
    </div>
  {/if}
  {#if rules === "7"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img carrots_img_wrap">
        <img class="rules_img mirrors_block_img" src={tilemap} alt="" />
      </div>
      Зеркала:
      <div>
        Ловит луч от кристалла и меняет его направление.
      </div>
      <button type="button" on:click={() => (rules = "8")}>Далее (7 / 8)</button
      >
    </div>
  {/if}
  {#if rules === "8"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img carrots_img_wrap">
        <img class="rules_img rotate_switch_img" src={tilemap} alt="" />
      </div>
      Переключатель вращения:
      <div>
        Эти красные переключатели поворачивают все динамические стены на 90
        градусов.
      </div>
      <button type="button" on:click={() => (rules = false)}
        >Меню (8 / 8)</button
      >
    </div>
  {/if}
</div>

<style>
  .rotate_switch_img {
    object-position: -192px -64px;
  }
  .rotate_block_img {
    object-position: 0px -96px;
  }
  
  .mirrors_block_img {
    object-position: -160px -160px;
  }
  
  .diamonds_block_img {
    object-position: -32px -192px;
  }

  .traps_img {
    object-position: -192px -94px;
  }
  .locks_img_wrap {
    width: 192px !important;
  }
  .diamonds_img_wrap {
    width: 128px !important;
  }
  .lock_img {
    object-position: 0px -128px;
  }
  .carrots_img {
    object-position: -95px -64px;
  }
  .carrots_img_wrap {
    width: 64px !important;
  }
  .rules_wrap_img {
    pointer-events: none;
    image-rendering: pixelated;
    width: 32px;
    height: 32px;
    overflow: hidden;
    transform: scale(2);
    margin-bottom: 16px;
    border-radius: 5px;
  }
  .rules_img {
    object-fit: cover;
  }
  .rules {
    background-color: black;
    height: 100%;
    box-shadow: inset 0 0 12px #82baf3;
    border: 2px solid #529ae1;
    justify-content: center;
    font-size: 20px;
    text-align: center;
  }

  .rules_mobile {
    font-size: 16px;
  }
  .arrow {
    border: 1px solid white;
    width: 45px;
    height: 45px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .arrow.top {
    position: absolute;
    margin-top: -44px;
  }

  .arrow_keys {
    margin-top: 45px;
  }
  .records {
    color: white;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .levels {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
    justify-content: center;
    align-items: center;
    max-height: min(80vw, 80vh);
    overflow: auto;
  }

  .levels.mobile {
    max-height: min(100vw, 100vh);
  }

  .level {
    color: white;
    background-color: black;
    padding: 5px;
    cursor: pointer;
    border: 1px solid white;
    font-size: 14px;
    min-width: 128px;
    flex: 1;
  }
  .wrapper {
    margin: auto;
    touch-action: none;
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
  }

  .background {
    display: flex;
    pointer-events: none;
    position: absolute;
    z-index: 0;
    width: 100%;
    height: 100%;
  }

  .mobilebg {
    background-color: #098ece;
  }

  :global(.mobilebg img) {
    height: auto !important;
    margin-top: auto !important;
    margin-bottom: 0 !important;
  }
  
  :global(.background img) {
    width: 100%;
    height: 100%;
    object-fit: contain;
    margin: auto;
  }

  button {
    cursor: pointer;
    color: white;
    border: none;
    background: none;
    padding: 8px;
    text-shadow: 1px 1px 0 black;
    z-index: 1;
    font-size: 20px;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.25);
  }

  button:hover {
    box-shadow: inset 0 2px 0 0 #82baf3, inset 0px -2px 0px #0d5399;
    background-color: #529ae1;
    color: black;
    text-shadow: none;
  }
</style>
