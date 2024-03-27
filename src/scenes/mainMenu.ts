import { Engine, Scene, type SceneActivationContext } from "excalibur";
import MenuUI from "src/ui/MenuUI.svelte"
import { Level } from "./level";
import { carrotsMaps } from "src/app/main";
import { DEFAULT_VOLUME, starts_2_levels, getLevelsLocalStorage } from "src/common/constants";
import { resources } from "src/app/resources";
import type { TiledMapResource } from "@excaliburjs/plugin-tiled";
import { getMusicStatus } from "src/common/getMusicStatus";
import VKBridge from "src/common/VKBridge";

type TypeLevels = 'starts_2_levels'
export class Menu extends Scene {
    menu!: MenuUI
    constructor() {
        super()
    }
    onInitialize(_engine: Engine): void {
        this.toggleMusic(getMusicStatus());
        this.menu = new MenuUI({
            target: document.querySelector('#root')!,
            props: {
                menu: this
            }
        })
    }
    
    onDeactivate(_context: SceneActivationContext<undefined>): void {
        resources.mp3Title.stop()
        this.menu.$destroy();
        this.engine.removeScene(this);
    }
    
    toggleMusic(enable?: boolean) {
        window.localStorage.setItem('enableMusicBobbyCarrot2', `${Number(enable)}`)
        if (enable) {
            resources.mp3Title.loop = true;
            resources.mp3Title.play(DEFAULT_VOLUME)
        } else {
            resources.mp3Title.stop()
        }
    }

    startLevel(world: TiledMapResource[], lvl: number) {
        this.engine.addScene('level', new Level(world, lvl))
        this.engine.goToScene('level');
    }

    continueGame(lvl: TypeLevels) {
        const levels = getLevelsLocalStorage(lvl)
        if (levels.length > 0) {
            const nextlevel = levels.at(-1)!.level + 1
            if (lvl === starts_2_levels) {
                this.startLevel(carrotsMaps, nextlevel)
            }
        }
    }

    startCarrotsNewGame () {
        localStorage.removeItem(starts_2_levels);
        VKBridge.setSave();
        this.startLevel(carrotsMaps, 0);
    }

    handleNextLevel(level: number) {
        this.startLevel(carrotsMaps, level)
      }
}