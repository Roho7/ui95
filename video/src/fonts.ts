import { loadFont as loadSilkscreen } from "@remotion/google-fonts/Silkscreen"
import { loadFont as loadVt323 } from "@remotion/google-fonts/VT323"

const display = loadSilkscreen("normal", { weights: ["400"], subsets: ["latin"] })
const body = loadVt323("normal", { weights: ["400"], subsets: ["latin"] })

document.documentElement.style.setProperty("--font-display", `"${display.fontFamily}"`)
document.documentElement.style.setProperty("--font-body", `"${body.fontFamily}"`)
