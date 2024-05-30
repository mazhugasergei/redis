import { createClient as createRedisClient } from "redis"
import express from "express"

const redis = createRedisClient()
const app = express()
app.use(express.json())
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  next()
})

const EX = 10

const main = async () => {
  try {
    await redis.connect()
    console.log(`\x1b[7m\x1b[31m[Redis]\x1b[0m Connected`)

    app.get("/", async (req, res) => {
      try {
        // if data is in cache, return it
        const data = await redis.get("data")
        if (data)
          return res.status(200).json({
            fromChache: true,
            data,
            timeLeft: EX - new Date(Date.now() - new Date(data).getTime()).getSeconds(),
          })

        // if data is not in cache, fetch it
        const newData = new Date().toISOString().slice(0, 19).replace("T", " ") // imagine some data is fetched here
        await redis.set("data", newData, { EX, NX: true })
        return res.status(200).json({
          fromChache: false,
          data: newData,
          timeLeft: EX,
        })
      } catch (err) {
        console.error(err)
        return res.status(500).send("Internal Server Error")
      }
    })

    await new Promise((resolve) =>
      app.listen(3000, () => console.log(`\x1b[7m\x1b[33m[Server]\x1b[0m  Started on port 3000`))
    )
  } catch (err) {
    console.error(err)
  } finally {
    await redis.quit()
    console.log(`\x1b[7m\x1b[31m[Redis]\x1b[0m Disconnected`)
  }
}

main()
