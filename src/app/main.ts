import { Color, Engine, Loader, DisplayMode } from "excalibur";
import { TiledMapResource } from '@excaliburjs/plugin-tiled';
import './style.css';
import { levels } from "./levels";
import { resources } from "./resources";
import { Menu } from "src/scenes/mainMenu";
import { WORLD_SIZE, isMobile, tilemap } from "src/common/constants";
import { bobbyCarrotLogo } from "./bobbyCarrot";

const convertPath = (map: TiledMapResource) => {
  map.convertPath = (_originPath: string, relativePath: string): string => {
    if (relativePath === 'tileset.png') {
      return tilemap
    }
    return 'levels/'+relativePath
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

const loader = new Loader([...Object.values(resources), ...carrotsMaps])


loader.logoWidth = 186;
loader.logoHeight = 168;
loader.logo = bobbyCarrotLogo

loader.playButtonText = "Запустить игру";
engine.start(loader).then(() => {
    engine.goToScene('menu')
});