import { resources } from 'src/app/resources';
import { SpriteSheet, Animation, range, AnimationStrategy } from 'excalibur'

const finishImage = SpriteSheet.fromImageSource({
    image: resources.Tile_finish,
    grid: {
        rows: 1,
        columns: 4,
        spriteWidth: 32,
        spriteHeight: 32
    }
});


export const finishImageAnim = Animation.fromSpriteSheet(finishImage, range(0, 4), 80, AnimationStrategy.Loop)