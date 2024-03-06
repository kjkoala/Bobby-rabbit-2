import { resources } from 'src/app/resources';
import { SpriteSheet, Animation, range, AnimationStrategy } from 'excalibur'

const twinkleImage = SpriteSheet.fromImageSource({
    image: resources.Twinkle,
    grid: {
        rows: 1,
        columns: 5,
        spriteWidth: 16,
        spriteHeight: 16
    }
});

export const twinkleAnim = Animation.fromSpriteSheet(twinkleImage, range(0, 5), 80, AnimationStrategy.PingPong)
