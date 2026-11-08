import { staticFile } from "remotion"

const SITE_ASSET = /^\/[\w-]+\.(png|jpe?g|gif|svg|webp|mp4|webm)$/

function toSiteAsset(value: string): string {
  return SITE_ASSET.test(value) ? staticFile(`site${value}`) : value
}

const imageSource = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, "src")!
Object.defineProperty(HTMLImageElement.prototype, "src", {
  ...imageSource,
  set(value: string) {
    imageSource.set!.call(this, toSiteAsset(value))
  },
})

const setAttribute = Element.prototype.setAttribute
Element.prototype.setAttribute = function (name: string, value: string) {
  setAttribute.call(this, name, (this instanceof HTMLImageElement || this instanceof HTMLMediaElement || this instanceof HTMLSourceElement) && name === "src" ? toSiteAsset(value) : value)
}

const mediaSource = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, "src")!
Object.defineProperty(HTMLMediaElement.prototype, "src", {
  ...mediaSource,
  set(value: string) {
    mediaSource.set!.call(this, toSiteAsset(value))
  },
})

const matchMedia = window.matchMedia.bind(window)
window.matchMedia = (query: string) => {
  if (query === "(min-width: 80rem)") {
    return { ...matchMedia(query), matches: true, media: query, addEventListener() {}, removeEventListener() {} } as MediaQueryList
  }
  return matchMedia(query)
}
