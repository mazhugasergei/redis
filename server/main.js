import { redis, app } from "."

export const main = async () => {
  try {
    await redis.connect()
    console.log(`\x1b[7m\x1b[31m[Redis]\x1b[0m Connected`)

    app.get("/", async (req, res) => {
      try {
        const data = await redis.get("data")
        if (data)
          return res.status(200).json({
            fromChache: true,
            data,
          })

        const newData = new Date().toISOString().slice(0, 19).replace("T", " ")
        await redis.set("data", newData, { EX: 10, NX: true })
        return res.status(200).json({
          fromChache: false,
          data: newData,
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
