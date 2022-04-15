const express = require("express")
const app = express()

// This is to initialize the firebase admin api
const { initializeApp, cert } = require("firebase-admin/app")
const serviceAccountKey = require("./firebaseServiceAccountKey.json")
initializeApp({ credential: cert(serviceAccountKey) })

// This "getStorage" method is to get the storage api instance thing
const { getStorage } = require("firebase-admin/storage")

// This is to serve static files to the public (like homepage)
app.use(express.static("public"))

app.post("/upload", (req, res) => {
    // console.log(req.rawHeaders)

    // This gets the storage api instance
    const storage = getStorage()

    // This gets me my "bucket" instance
    const bucket = storage.bucket("gs://upload-docs-afc28.appspot.com")

    // Gives me a "file" instance (like a reference to the file on firebase storage)
    const file = bucket.file("smokey.jpeg")

    // Create a stream to write to
    const firebaseStream = file.createWriteStream()

    req.on("data", (chunk) => {
        firebaseStream.write(chunk)
        // console.log(chunk)
    })

    req.on("end", () => {
        firebaseStream.end()
        res.status(200).send("TACOO")
    })

    // This is bad here because it ends the req/res cycle prematurely
    // res.status(200).send("TACOO")
})

app.listen(3000, () => console.log("Listening on port 3000...."))
