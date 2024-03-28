import { Color, Engine, Loader, DisplayMode, type Loadable } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { levels } from "./levels";
import { resources } from "./resources";
import { Menu } from "src/scenes/mainMenu";
import { WORLD_SIZE, isMobile, tilemap } from "src/common/constants";
import LoaderUI from 'src/ui/Loader.svelte';
import VKBridge from "src/common/VKBridge";

const convertPath = (map: TiledMapResource) => {
  map.convertPath = (_originPath: string, relativePath: string): string => {
    if (relativePath === 'tileset.png') {
      return tilemap
    }
    return 'levels/'+relativePath
  }
}

export class CustomLoader extends Loader {
  loaderUI!: LoaderUI
  constructor(loadables?: Loadable<any>[]) {
    super(loadables)

    this.playButtonText = "Начать приключение";
  }

  wireEngine(engine: Engine): void {
    this.loaderUI = new LoaderUI({
      target: document.querySelector('#root')!,
    })

    super.wireEngine(engine)
  }

  destroyUI() {
    this.loaderUI.$destroy()
  }
  draw(): void {
    this.loaderUI.$set({
      loader: this.progress
    })
  }
  
}


const engine = new Engine({
  antialiasing: false,
  canvasElementId: 'game',
  resolution: {
    width: WORLD_SIZE,
    height: WORLD_SIZE,
  },

  displayMode: isMobile ? DisplayMode.FitScreenAndFill : undefined,
  fixedUpdateFps: 60,
  maxFps: 60,
  backgroundColor: Color.Black,
})

export const carrotsMaps = levels.map(level => new TiledMapResource(level))
engine.addScene('menu', new Menu)


carrotsMaps.forEach(convertPath)

const loader = new CustomLoader([...Object.values(resources), ...carrotsMaps])


engine.start(loader).then(() => {
  // Баг движка, если изменится размер экрана то при загрузке сцены экран не обновится
  window.dispatchEvent(new Event('resize'));
  loader.destroyUI()
  engine.goToScene('menu')
  VKBridge.checkAds()
  VKBridge.showBannerAds()
});