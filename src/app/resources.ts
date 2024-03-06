import { ImageSource, Sound } from "excalibur";
import BobbyFade from '/bobby/bobby_fade.png'
import BobbyIdle from '/bobby/bobby_idle.png'
import BobbyDown from '/bobby/bobby_down.png'
import BobbyRight from '/bobby/bobby_right.png'
import BobbyLeft from '/bobby/bobby_left.png'
import BobbyUp from '/bobby/bobby_up.png'
import BobbyDeath from '/bobby/bobby_death.png'
import Tile_finish from '/tile_finish.png'
import End from '/end.png'
import HUD from '/hud.png'
import mp3Death from '/music/death.mp3'
import mp3Title from '/music/title.mp3'
import mp3Clered from '/music/cleared.mp3'
import mp3End from '/music/end.mp3'
import Restart from '/restart.png'
import Title from '/title.webp'
import Menu from '/menu.png'
import Arrows from '/arrows.png'
import Twinkle from '/twinkle.png'
import SmeltedCube from '/smelted_cube.png'

export const resources = {
    Bobby_idle: new ImageSource(BobbyIdle),
    Bobby_fade: new ImageSource(BobbyFade),
    Bobby_death: new ImageSource(BobbyDeath),
    Bobby_left: new ImageSource(BobbyLeft),
    Bobby_right: new ImageSource(BobbyRight),
    Bobby_up: new ImageSource(BobbyUp),
    Bobby_down: new ImageSource(BobbyDown),
    Tile_finish: new ImageSource(Tile_finish),
    GameEnd: new ImageSource(End),
    HUD: new ImageSource(HUD),
    mp3Death: new Sound(mp3Death),
    mp3Clered: new Sound(mp3Clered),
    mp3End: new Sound(mp3End),
    mp3Title: new Sound(mp3Title),
    Arrows: new ImageSource(Arrows),
    Restart: new ImageSource(Restart),
    Menu: new ImageSource(Menu),
    Title: new ImageSource(Title),
    Twinkle: new ImageSource(Twinkle),
    SmeltedCube: new ImageSource(SmeltedCube)
}