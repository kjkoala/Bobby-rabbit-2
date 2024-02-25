import { Color, Engine, Loader, DisplayMode } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { eggs_levels, levels } from "./levels";
import { resources } from "./resources";
import { Menu } from "src/scenes/mainMenu";
import { isMobile, tileFinish, tilemap } from "src/common/constants";
import { bobbyCarrotLogo } from "./bobbyCarrot";

const convertPath = (map: TiledMapResource) => {
  map.convertPath = (_originPath: string, relativePath: string): string => {
    if (relativePath === '1level.png') {
      return tilemap
    }
    if (relativePath === 'tile_finish.png') {
      return tileFinish
    }
    return 'levels/'+relativePath
  }
}


const engine = new Engine({
  antialiasing: false,
  canvasElementId: 'game',
  resolution: {
    width: 512,
    height: 512,
  },

  displayMode: isMobile ? DisplayMode.FitScreenAndFill : undefined,
  fixedUpdateFps: 60,
  maxFps: 60,
  backgroundColor: Color.fromHex('#E8F0F8'),
})

export const carrotsMaps = levels.map(level => new TiledMapResource(level))
export const eggsMaps = eggs_levels.map(level => new TiledMapResource(level))
engine.addScene('menu', new Menu)

eggsMaps.forEach(convertPath)

carrotsMaps.forEach(convertPath)

const loader = new Loader([...Object.values(resources), ...carrotsMaps, ...eggsMaps])


loader.logoWidth = 186;
loader.logoHeight = 168;
loader.logo = bobbyCarrotLogo

loader.playButtonText = "Запустить игру";
engine.start(loader).then(() => {
    engine.goToScene('menu')
});