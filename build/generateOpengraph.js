import * as PImage from "pureimage"
import fs, { readFileSync } from "fs"
import { readFile } from "fs/promises"

const pretendard = PImage.registerFont(
  "build/assets/Pretendard-SemiBold.ttf",
  "Pretendard"
)

pretendard.loadSync()

// read all files inside of ./content
fs.readdir("./content", (err, folders) => {
  // for each file without starting with "."
  for (const folder of folders.filter((f) => !f.startsWith("."))) {
    fs.readdir(`./content/${folder}`, async (err, files) => {
      for (const file of files.filter((f) => !f.startsWith("."))) {
        const markdown = await readFile(`./content/${folder}/${file}`, "utf-8")
        const properties = markdown.match(/---(.*?)---/s)[1].split("\n")

        const info = {}
        for (const property of properties) {
          if (property === "") continue
          const key = property.split(": ")[0]
          const value = property.split(": ")[1]
          info[key] = value
        }

        const frame = PImage.make(1200, 600)
        const ctx = frame.getContext("2d")

        ctx.fillStyle = "#fcfcfc"
        ctx.fillRect(0, 0, 1200, 600)

        ctx.fillStyle = "black"
        ctx.font = "56pt Pretendard"
        ctx.fillText(info.title, 152, 128)

        if (folder === "feed") {
          if (info.description.length > 64) {
            ctx.fillStyle = "#a1a1aa"
            ctx.font = "32pt Pretendard"
            ctx.fillText(info.description.slice(0, 70), 152, 198)
            ctx.fillText(info.description.slice(70, 150) + "...", 152, 248)
          } else {
            ctx.fillStyle = "#a1a1aa"
            ctx.font = "32pt Pretendard"
            ctx.fillText(
              info.description.length > 64
                ? info.description.slice(0, 70) + "..."
                : info.description,
              152,
              198
            )
          }
        } else {
          ctx.fillStyle = "#a1a1aa"
          ctx.font = "32pt Pretendard"
          ctx.fillText(
            info.description.length > 64
              ? info.description.slice(0, 70) + "..."
              : info.description,
            152,
            198
          )
        }

        if (info.cover && info.cover.includes(".jpg")) {
          const publicRoot = "./public"

          await PImage.decodeJPEGFromStream(
            fs.createReadStream(`${publicRoot}${info.cover}`)
          )
            .then((img) => {
              // img width and height should be accordingly calculated
              // to contain the same aspect ratio, but the widht should
              // be exactly 1040
              ctx.drawImage(img, 152, 280, 896, 560)
            })
            .catch((e) => console.log("Error: ", e))
        }

        PImage.encodeJPEGToStream(
          frame,
          fs.createWriteStream(
            `./public/generated/${file.replace(".md", "")}.jpg`
          )
        )
          .then(() => {
            console.info(`Generated the opengraph image for ${file}`)
          })
          .catch((e) => {
            console.error("there was an error writing:", e)
          })
      }
    })
  }
})

fs.writeFile(
  "./public/generated/readme.md",
  `# This folder is autogenerated
    
It contains all the images that are generated by the build step. Do not edit these files, they will be overwritten on the next build step.`,
  (err) => {
    if (err) throw err
  }
)