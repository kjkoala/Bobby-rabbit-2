import { Actor, EasingFunctions, Engine, Vector, vec } from "excalibur";
import { MeltedCubeAnim } from "src/animations/MeltedCube";
import { BLOCK_SIZE, isMobile, WORLD_SIZE } from "src/common/constants";
import type { Level } from "src/scenes/level";
import { Directon, InteractiveSpritesIds, MirrorReflectToLaserDirection } from "./types";

export class Laser {
    declare scene: Level
    private path: Actor[] = []
    /**Внутренняя переменная дла направления лазера */
    private Dir = Directon.UP
    constructor() {}

    start(engine: Engine, { x, y }: Vector, scene: Level, dir: Directon) {
        scene.player.playerIceCount = 1;
        this.Dir = dir;
        // Центруем лазер
        const startLaserCenter = vec(
            x + 0x10,
            y - 0x10,
        );
        // координаты лазера
        const laserVector = vec(
            x,
            y,
        );

            while (true) {
                const actor = new Actor({
                    z: 90,
                });
    
                if (this.Dir === Directon.UP) {
                    laserVector.y -= BLOCK_SIZE
                    startLaserCenter.y -= BLOCK_SIZE
                } else if (this.Dir === Directon.DOWN) {
                    laserVector.y += BLOCK_SIZE
                    startLaserCenter.y += BLOCK_SIZE
                } else if (this.Dir === Directon.LEFT) {
                    laserVector.x -= BLOCK_SIZE
                    startLaserCenter.x -= BLOCK_SIZE
                } else if (this.Dir === Directon.RIGHT) {
                    laserVector.x += BLOCK_SIZE
                    startLaserCenter.x += BLOCK_SIZE
                }
    
                const laserVectorString = `${laserVector.x}x${laserVector.y}`
    
                if (this.Dir === Directon.UP || this.Dir === Directon.DOWN) {
                    actor.graphics.use(scene.getSprite(InteractiveSpritesIds.LaserY))
                } else {
                    actor.graphics.use(scene.getSprite(InteractiveSpritesIds.LaserX))
                }
    
                if (scene.mirrors.has(laserVectorString)) {
                    const mirror = scene.mirrors.get(laserVectorString)
                        if (mirror!.state === MirrorReflectToLaserDirection.RIGHT && (this.Dir === Directon.UP || this.Dir === Directon.LEFT)) {
                            actor.graphics.use(scene.getSprite(InteractiveSpritesIds.Laser3))
                            this.Dir = this.Dir === Directon.UP ? Directon.RIGHT : Directon.DOWN
                        } else if (mirror!.state === MirrorReflectToLaserDirection.DOWN && (this.Dir === Directon.UP || this.Dir === Directon.RIGHT)) {
                            actor.graphics.use(scene.getSprite(InteractiveSpritesIds.Laser4))
                            this.Dir = this.Dir === Directon.UP ? Directon.LEFT : Directon.DOWN
                        } else if (mirror!.state === MirrorReflectToLaserDirection.LEFT && (this.Dir === Directon.DOWN || this.Dir === Directon.RIGHT)) {
                            actor.graphics.use(scene.getSprite(InteractiveSpritesIds.Laser1))
                            this.Dir = this.Dir === Directon.DOWN ? Directon.LEFT : Directon.UP
                        } else if (mirror!.state === MirrorReflectToLaserDirection.UP && (this.Dir === Directon.DOWN || this.Dir === Directon.LEFT)) {
                            actor.graphics.use(scene.getSprite(InteractiveSpritesIds.Laser2))
                            this.Dir = this.Dir === Directon.DOWN ? Directon.RIGHT : Directon.UP
                        }
                }
    
                actor.pos = startLaserCenter
                engine.add(actor)
                this.path.push(actor)
    
                if (scene.locks && laserVectorString in scene.locks) {
                    scene.collisionMap.delete(`${laserVector.x / BLOCK_SIZE}x${laserVector.y / BLOCK_SIZE - 1}`);
                    const cubeActor = (scene.locks[laserVectorString] as Actor);
                    if (isMobile) {
                        engine.clock.schedule(() => {
                            scene.camera.removeStrategy(scene.strategyCamera)
                            scene.camera.move(cubeActor.pos, 1000, EasingFunctions.Linear)
                        }, 240)
                    }
                    
                    engine.clock.schedule(() => {
                        const graphics = cubeActor.graphics.use(MeltedCubeAnim.clone())
                        graphics.events.clear();
                        graphics.events.on('end', () => {
                            cubeActor.z = actor.z - 1;
                            this.start(engine, vec(laserVector.x, laserVector.y), scene, this.Dir)
                        })
                    }, 500)
                    delete scene.locks[laserVectorString];
                    break
                }
    
                if (laserVector.x < 0 || laserVector.y < 0 || laserVector.x > WORLD_SIZE || laserVector.y > WORLD_SIZE) {
                    scene.player.playerIceCount = 0;
                    if (isMobile) {
                        scene.camera.move(scene.player.pos, 1000, EasingFunctions.Linear)
                        .then(() => {
                            scene.lockCameraOnActor(true)
                        });
                    }
                    break
                }
            }
    }

    kill() {
        this.path.forEach((actor) => actor.kill())
        this.path.splice(0, this.path.length)
    }
}