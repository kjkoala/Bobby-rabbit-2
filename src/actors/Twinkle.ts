import { Actor, Engine, Timer, vec, Animation } from "excalibur";
import { twinkleAnim } from "src/animations/Twinkle";

export class Twinkle extends Actor {
    timer!: Timer;
    twinkle!: Animation;
    halfLoop = false;
    endLoop = false;
    constructor(x: number, y: number) {
        super({
            pos: vec(x + 8, y - 16),
            z: 100,
        })
    }

    override onInitialize(engine: Engine): void {
        this.twinkle = this.graphics.use(twinkleAnim)
        this.twinkle.events.clear()
        this.twinkle.events.on('frame', () => {
            this.halfLoop = this.halfLoop || this.twinkle.currentFrameIndex === 4 
            if (this.endLoop && this.twinkle.currentFrameIndex === 0) {
                this.twinkleStop(engine);
            }
            this.endLoop = this.endLoop || this.halfLoop && this.twinkle.currentFrameIndex === 0
        })
    }

    twinkleStop(engine: Engine) {
        this.graphics.visible = false;
        this.twinkle.pause();
        engine.clock.schedule(() => this.twinkleRestart(), 2500)
    }

    twinkleRestart() {
        this.graphics.visible = true;
        this.halfLoop = false;
        this.endLoop = false;
        this.twinkle.play();
    }
}