import bridge, { BannerAdLocation, EAdsFormats } from '@vkontakte/vk-bridge';
import { starts_2_levels } from './constants';

const noop = () => {}

const TWO_MIN_IN_MS = 120_000
class VK {
  private addCountMS: number;

  constructor() {
    this.addCountMS = 0;
    }

  static init() {
    bridge.send("VKWebAppInit", {})
        .then(this.getVKSaves)
        .catch(console.error)

      return new VK()
    }

    static getVKSaves() {
      return bridge.send("VKWebAppStorageGet", {
        keys: [starts_2_levels]
      }).then((data) => {
        if(data.keys) {
          data.keys.forEach((level) => {
              window.localStorage.setItem(level.key, level.value || '[]')
          })
        }
      })
    }

    setSave(){
      bridge.send("VKWebAppStorageSet", {
        key: starts_2_levels,
        value: window.localStorage.getItem(starts_2_levels) || '[]'
      })
      .catch(noop)
    }

    inviteFriend() {
      bridge.send('VKWebAppShowInviteBox')
      .catch(noop)
    }

    checkAds() {
        bridge.send('VKWebAppCheckNativeAds', { ad_format: EAdsFormats.INTERSTITIAL})
        .catch(noop)
    }

    showAds() {
        return bridge.send('VKWebAppShowNativeAds', { ad_format: EAdsFormats.INTERSTITIAL })
          .catch(noop);
    }

    showBannerAds() {
      return bridge.send('VKWebAppShowBannerAd', {
        banner_location: BannerAdLocation.BOTTOM,
      })
      .catch(noop)
    }

    countLevel(ms: number) {
      this.addCountMS += ms
      if (this.addCountMS > TWO_MIN_IN_MS) {
        this.addCountMS = 0;
        return this.showAds()
        .then(() => {
          this.checkAds()
          this.showBannerAds()
        })
        .catch(noop)
      }

      return Promise.resolve()
    }
}

export default VK.init()