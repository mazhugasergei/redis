import { createClient as createRedisClient } from "redis"
import express from "express"

const redis = createRedisClient()
const app = express()
app.use(express.json())

const main = async () => {
  try {
    await redis.connect()
    console.log(`\x1b[7m\x1b[31m[Redis]\x1b[0m Connected`)

    app.get("/", async (req, res) => {
      try {
        // Create 100 sample JSON objects
        for (let i = 0; i < 100; i++) await redis.json.set(`myjson:${i}`, "$", { key: i })

        const keys = await redis.keys("myjson:*")

        const data = await Promise.all(keys.map((key) => redis.json.get(key)))
        return res.json(data)
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
