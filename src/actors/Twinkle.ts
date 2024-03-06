import { Actor, AnimationDirection, Engine, Timer, vec } from "excalibur";
import { twinkleAnim } from "src/animations/Twinkle";

export class Twinkle extends Actor {
    timer!: Timer
    constructor(x: number, y: number) {
        super({
            pos: vec(x + 8, y - 16),
            z: 100,
        })
        

        // this.timer = new Timer({
        //     interval: 7000,
        //     fcn: () => this.toggleTwinkAnim()
        // })
    }

    override onInitialize(engine: Engine): void {
        const graphics = this.graphics.use(twinkleAnim)
        graphics.events.clear()
        graphics.events.once('loop', () => {
        })
        // engine.currentScene.add(this.timer)
    }

    // override update(): void {
    //     if (twinkleAnim.done && twinkleAnim.direction === AnimationDirection.Forward) {
    //         this.toggleTwinkAnim()
    //         this.timer.start()
    //     }
    // }

    toggleTwinkAnim() {
        twinkleAnim.reverse()
        twinkleAnim.play()
    }

}