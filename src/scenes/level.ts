import type { TiledMapResource } from "@excaliburjs/plugin-tiled";
import {
  Actor,
  CollisionType,
  Engine,
  Scene,
  BoundingBox,
  Color,
  vec,
  LockCameraToActorStrategy,
} from "excalibur";
import { Bobby } from "src/actors/Bobby";
import HUD from "src/ui/HUD.svelte";
import {
  BLOCK_SIZE,
  DEFAULT_VOLUME,
  WORLD_SIZE,
  starts_2_levels,
  getLevelsLocalStorage,
  isMobile,
} from "src/common/constants";
import VK from "src/common/VKBridge";
import { Menu } from "./mainMenu";
import { getMusicStatus } from "src/common/getMusicStatus";
import { resources } from "src/app/resources";
import { EndGameScene } from "./endGame";
import VKBridge from "src/common/VKBridge";
import { getInputType } from "src/common/getInputType";
import { InputTypes } from "src/common/types";
import { finishImageAnim } from "src/animations/Finish";
import { Twinkle } from "src/actors/Twinkle";
import { Laser } from "src/actors/Laser";

const MAX_SNOW_ENTITY = isMobile ? 5 : 15;

class Snow extends Actor {

  constructor() {
    super({
      z: 10_000,
    })
  }

  override onInitialize(engine: Engine): void {
    this.graphics.use(resources.Flake.toSprite())
    this.randomPosAndVel(engine)
  }


  override onPostUpdate(engine: Engine): void {
    if (this.pos.y > engine.canvasHeight) {
      this.randomPosAndVel(engine)
    }
  }
  
  randomPosAndVel(engine: Engine) {
    this.pos = vec(Math.random() * (engine.canvasWidth - 20) + 20, Math.random() * -500)
    this.vel = vec(0, Math.random() * 20 + 30)
  }
}

const arraySnow = new Array(MAX_SNOW_ENTITY).fill(Snow)
export class Level extends Scene {
  declare player: Bobby;
  levels: TiledMapResource[];
  currentLevel: number;
  stars: number | undefined;
  nests: number | undefined;
  mapWidth!: number;
  collisionMap!: Map<string, boolean>;
  diamonds!: Map<string, boolean>;
  laser: Laser;
  rotatePlatform!: Map<
    string,
    { state: string | number; actor: Actor; x: number; y: number }
  >;
  mirrors!: Map<
  string,
  { state: string | number; actor: Actor; x: number; y: number }>
  rotateButtons!: Map<string, boolean> | null;
  locks!: Record<string, string | Actor> | null;
  hud!: HUD;
  lockCamera: boolean;
  startLevelTime: number;
  currentInputType!: InputTypes;
  strategyCamera!: LockCameraToActorStrategy;
  constructor(carrotsMaps: TiledMapResource[], currentLevel: number) {
    super();
    this.levels = carrotsMaps;
    this.currentLevel = currentLevel;
    this.lockCamera = true;
    this.startLevelTime = 0;
    this.backgroundColor = Color.fromHex('#E8F0F8');
    this.laser = new Laser();
  }
  override onInitialize(engine: Engine): void {
    this.currentInputType = getInputType();
    const currentMap = this.levels[this.currentLevel];
    this.mapWidth = currentMap.data.width;
    this.collisionMap = new Map();
    this.rotatePlatform = new Map();
    this.mirrors = new Map()
    this.rotateButtons = null;
    this.locks = null;
    resources['mp3InGame'].loop = true;

    const rotatePlatform = currentMap.data.objectGroups.find(
      (object) => object.name === "Rotate"
    );

    const mirrors = currentMap.data.objectGroups.find(
      (object) => object.name === "Mirrors"
    );

    const rotateButtons = currentMap.data.objectGroups.find(
      (object) => object.name === "RotateButtons"
    );
    const traps = currentMap.data.objectGroups.find(
      (object) => object.name === "Traps"
    );

    const diamonds = currentMap.data.objectGroups.find(
      (object) => object.name === "Diamonds"
    )

    const wall = this.findIndexLayer(currentMap, "Wall");
    this.createMapForCollision(wall);

    this.stars =
      currentMap.data.objectGroups.find((obj) => obj.name === "Stars")
        ?.objects.length;

    const playerStart = currentMap.data.objectGroups
      .find((obj) => obj.name === "Camera")
      ?.objects.find((obj) => obj.name === "Start");
    if (playerStart && playerStart.x && playerStart.y) {
      engine.add(new Bobby(playerStart.x, playerStart.y));
    }

    arraySnow.forEach((Snow) => engine.add(new Snow))

    currentMap.addTiledMapToScene(engine.currentScene);

    if (rotateButtons) {
      this.rotateButtons = new Map(
        (rotateButtons.properties[0].value as string)
          .split(",")
          .map((el: string) => {
            const els = el.split("=");
            els[1] = JSON.parse(els[1]);
            return els;
          }) as [string, boolean][]
      );
    }

    this.player = this.actors.find((actor) => actor.name === "Bobby") as Bobby;
    if (isMobile) {
      this.strategyCamera = new LockCameraToActorStrategy(this.player);
      const min = Math.min(window.innerHeight, window.innerWidth);
      const max = Math.max(window.innerHeight, window.innerWidth);
      this.camera.zoom = (max - min) / min + 1.6;
      this.lockCameraOnActor(this.lockCamera);
    }
    this.actors.forEach((actor) => {
      if (actor.name.startsWith("RotateButton")) {
        this.rotateControl(actor);
      } else if (actor.name.startsWith("Lock") || actor.name === 'Cube') {
        const lockPos = `${actor.pos.x / BLOCK_SIZE}x${
          actor.pos.y / BLOCK_SIZE - 1
        }`;
        this.collisionMap.set(lockPos, true);
        if (actor.name === 'Cube') {
          actor.z = 11
          if (this.locks) {
            this.locks[`${actor.pos.x}x${actor.pos.y}`] = actor;
          } else {
            this.locks = {
              [`${actor.pos.x}x${actor.pos.y}`]: actor,
            };
          }
        } else {
          if (this.locks) {
            this.locks[actor.name] = lockPos;
          } else {
            this.locks = {
              [actor.name]: lockPos,
            };
          }
        }
      } else if (actor.name === 'Trap') {
        const trap = traps?.objects.find(trap => trap.x === actor.pos.x && trap.y === actor.pos.y)
        const hide = trap?.properties.find((prop) => prop.name === 'hide')
        if (hide?.value) {
          actor.graphics.visible = false
        }
      } else if (actor.name === '2_Rotate' || actor.name === '4_Rotate') {
        const platform = rotatePlatform?.objects.find(rotate => rotate.x === actor.pos.x && rotate.y === actor.pos.y)
        if (platform) {
          const state = platform.properties.find((prop) => prop.name === "state");
          const x = actor.pos.x / BLOCK_SIZE;
          const y = actor.pos.y / BLOCK_SIZE - 1;
          this.rotatePlatform.set(`${x}x${y}`, {
          state: state!.value as string,
          x,
          y,
          actor,
        });
        }
      } else if (actor.name === 'Diamond') {
        const diamond = diamonds?.objects.find(diamond => diamond.x === actor.pos.x && diamond.y === actor.pos.y)
        if (diamond) {
          const laserDirection = diamond.properties.find((prop) => prop.name === 'LaserDir')
          if (laserDirection) {
            actor.addTag(laserDirection.value as string)
          }
          engine.add(new Twinkle(diamond.x, diamond.y))
        }
      } else if (actor.name === 'Mirror') {
        const mirror = mirrors?.objects.find(mirror => mirror.x === actor.pos.x && mirror.y === actor.pos.y)
        if (mirror) {
          const state = mirror.properties.find((prop) => prop.name === "state");
          const x = actor.pos.x;
          const y = actor.pos.y;
          this.mirrors.set(`${x}x${y}`, {
          state: state!.value as string,
          x,
          y,
          actor,
        });
        }
      }
    });

    this.on("takeStar", () => {
      this.countEntity("stars");
    });

    this.on("levelComplete", () => {
      resources['mp3InGame'].stop();
      engine.clock.schedule(() => {
        VK.countLevel().finally(() => {
          engine.removeScene(this);
          const nextLevel = this.currentLevel + 1;
          if (nextLevel >= this.levels.length) {
            this.endScene();
          } else {
            engine.addScene("level", new Level(this.levels, nextLevel));
            engine.goToScene("level");
          }
        });
      }, 5000);
    });

    this.on("playerDied", () => {
      VK.countLevel().finally(() => {
        engine.removeScene(this);
        engine.addScene("level", new Level(this.levels, this.currentLevel));
        engine.goToScene("level");
      })
    });

    this.hud = new HUD({
      target: document.querySelector("#root")!,
      props: {
        scene: this,
      },
    });
  }

  goToMenu() {
    if (!this.player.isFreeze) {
      this.engine.addScene('menu', new Menu)
      this.engine.goToScene('menu')
    }
  }

  endScene() {
    this.engine.addScene("endLevel", new EndGameScene);
    this.engine.goToScene("endLevel");
  }

  override onDeactivate() {
    resources['mp3InGame'].stop();
    this.engine.removeScene(this);
    this.hud.$destroy();
  }

  countEntity(name: "stars") {
      this[name]! -= 1;
      if (this[name]! <= 0) {
        const finish = this.actors.find((obj) => obj.name === "Finish");
        if (finish) {
          finish.graphics.use(finishImageAnim)
          finish.body.collisionType = CollisionType.Passive
        }
      }
  }

  lockCameraOnActor(lock: boolean) {
    this.camera.removeStrategy(this.strategyCamera);
    if (lock) {
      this.camera.addStrategy(this.strategyCamera)
    }
    this.camera.strategy.limitCameraBounds(new BoundingBox(0, 0, WORLD_SIZE, WORLD_SIZE));
    this.lockCamera = lock;
  }

  rotateControl(actor?: Actor) {
    if (this.rotateButtons && actor) {
      if (this.rotateButtons.get(actor.name)) {
        actor.graphics.visible = true;
        actor.body.collisionType = CollisionType.Passive;
      } else {
        actor.graphics.visible = false;
        actor.body.collisionType = CollisionType.PreventCollision;
      }
    } else {
      this.actors.forEach((actor) => {
        if (actor.name.startsWith("RotateButton")) {
          if (actor.body.collisionType === CollisionType.PreventCollision) {
            actor.graphics.visible = true;
            actor.body.collisionType = CollisionType.Passive;
          } else if (actor.body.collisionType === CollisionType.Passive) {
            actor.graphics.visible = false;
            actor.body.collisionType = CollisionType.PreventCollision;
          }
        }
      });
      this.rotatePlatform.forEach((platformState, name) => {
        if (platformState.state === "X" || platformState.state === "Y") {
          this.rotate2Platform(name);
        } else {
          this.rotate4Platform(name);
        }
      });
    }
  }

  rotate2Platform(x: string): void;
  rotate2Platform(x: number, y: number): void;
  rotate2Platform(x: string | number, y?: number) {
    const platform =
      typeof x === "string"
        ? this.rotatePlatform.get(x)
        : this.rotatePlatform.get(`${x / BLOCK_SIZE}x${y! / BLOCK_SIZE - 1}`);
    if (platform) {
      if (platform.state === "Y") {
        platform.state = "X";
        platform.actor.graphics.use(this.getSprite(29));
      } else {
        platform.state = "Y";
        platform.actor.graphics.use(this.getSprite(30));
      }
    }
  }

  rotate4Platform(x: string): void;
  rotate4Platform(x: number, y: number): void;
  rotate4Platform(x: string | number, y?: number) {
    const platform =
      typeof x === "string"
        ? this.rotatePlatform.get(x)
        : this.rotatePlatform.get(`${x / BLOCK_SIZE}x${y! / BLOCK_SIZE - 1}`);
    if (platform) {
      if (platform.state === 1) {
        platform.state = 2;
        platform.actor.graphics.use(this.getSprite(26));
      } else if (platform.state === 2) {
        platform.state = 3;
        platform.actor.graphics.use(this.getSprite(27));
      } else if (platform.state === 3) {
        platform.state = 4;
        platform.actor.graphics.use(this.getSprite(28));
      } else if (platform.state === 4) {
        platform.state = 1;
        platform.actor.graphics.use(this.getSprite(25));
      }
    }
  }

  getSprite(gid: number) {
    return this.levels[this.currentLevel].getSpriteForGid(gid);
  }

  createMapForCollision(wall: number[]) {
    for (var y = 0; y <= this.mapWidth; y++) {
      var yStart = y * this.mapWidth;
      var yFinish = (y + 1) * this.mapWidth;
      for (var x = 0; x < wall.length; x++) {
        if (wall[x] >= yStart && wall[x] <= yFinish) {
          this.collisionMap.set(`${wall[x] - yStart}x${y}`, true);
        }
      }
    }
  }


  findIndexLayer(currentMap: TiledMapResource, name: string) {
    const layer = currentMap.data.layers.find((obj) => obj.name === name);
    if (layer && Array.isArray(layer.data)) {
      return layer.data.reduce<number[]>((acc, item, index) => {
        if (item > 0) {
          acc.push(index);
        }
        return acc;
      }, []);
    }
    return [];
  }

  playSound(title: 'mp3Death' | 'mp3Clered' | 'mp3InGame') {
    if (getMusicStatus()) {
      resources[title].play(DEFAULT_VOLUME)
    }
  }

  computedTime() {
    const finishTime = this.engine.clock.now() - this.startLevelTime;
    const nameStorage = starts_2_levels;
      const stogareLevels = getLevelsLocalStorage(nameStorage);
      const updateLevel = stogareLevels.findIndex((lvl) => lvl.level === this.currentLevel)
    if (updateLevel > -1) {
      if (this.player.steps < stogareLevels[updateLevel].steps || finishTime < stogareLevels[updateLevel].time) {
        stogareLevels.splice(updateLevel, 1, {
          time: finishTime,
          steps: this.player.steps,
          level: this.currentLevel,
        })
      }
    } else {
      stogareLevels.push({
        time: finishTime,
        steps: this.player.steps,
        level: this.currentLevel,
      });
    }
    const stringify = JSON.stringify(stogareLevels);
    VKBridge.setSave(nameStorage, stringify);
    window.localStorage.setItem(nameStorage, stringify);
    return finishTime;
  }
}
