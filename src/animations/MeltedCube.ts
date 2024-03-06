import { SpriteSheet, Animation, range, AnimationStrategy } from 'excalibur'
import { resources } from 'src/app/resources';

const MeltedImage = SpriteSheet.fromImageSource({
    image: resources.SmeltedCube,
    grid: {
        rows: 1,
        columns: 4,
        spriteWidth: 32,
        spriteHeight: 32
    }
});

export const MeltedCubeAnim = Animation.fromSpriteSheet(MeltedImage, range(0, 4), 250, AnimationStrategy.Freeze)
