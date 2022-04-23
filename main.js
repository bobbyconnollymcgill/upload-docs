const fs = require("fs")
const path = require("path")

const express = require("express")
const app = express()

const multer = require("multer")
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

// This is to initialize the firebase admin api
const { initializeApp, cert } = require("firebase-admin/app")

const serviceAccountKey = require("./firebaseServiceAccountKey.json")

initializeApp({ credential: cert(serviceAccountKey) })

// This "getStorage" method is to get the storage api instance thing
const { getStorage } = require("firebase-admin/storage")
const { Readable } = require("stream")

// This is to serve static files to the public (like homepage)
app.use(express.static("public"))

app.post("/upload", upload.single("file"), (req, res) => {
    const storage = getStorage()
    const bucket = storage.bucket("gs://upload-docs-afc28.appspot.com")

    const file = bucket.file(req.file.originalname)
    const firebaseWritableStream = file.createWriteStream({
        // metadata: {
        //     contentType: req.file.mimetype,
        // },
    })

    firebaseWritableStream.write(req.file.buffer)

    firebaseWritableStream.end()

    res.end()
    // const readableStream = Readable.from(req.file.buffer)

    // readableStream
    //     .on("data", (chunk) => {
    //         console.log("taco", chunk)
    //         firebaseWritableStream.write(chunk)
    //     })
    //     .on("end", () => {
    //         res.status(200).end()
    //     })
})

app.post("/fake", (req, res) => {
    const storage = getStorage()
    const bucket = storage.bucket("gs://upload-docs-afc28.appspot.com")
    const file = bucket.file("forest_cloud_3.png")

    const filePath = path.resolve("public", "forest_original.png")

    const writeableStream = file.createWriteStream()

    fs.createReadStream(filePath).pipe(writeableStream)

    res.end()
})

app.post("/console-log-file", (req, res) => {
    req.on("data", (chunk) => {
        // console.log(chunk)

        console.log(chunk.toString("utf8"))
    }).on("end", () => {
        res.end()
    })
})

app.post("/upload-fs", (req, res) => {
    const filePath = path.resolve("public", "forest_hope.png")

    const writableStream = fs.createWriteStream(filePath)

    req.pipe(writableStream).on("close", () => {
        res.end()
    })
})

app.post("/upload-BAD", (req, res) => {
    // console.log(req.rawHeaders)

    // This gets the storage api instance
    const storage = getStorage()

    // This gets me my "bucket" instance
    const bucket = storage.bucket("gs://upload-docs-afc28.appspot.com")

    // Gives me a "file" instance (like a reference to the file on firebase storage)
    const file = bucket.file("example-pdf.pdf")

    // Create a stream to write to
    const firebaseStream = file.createWriteStream()

    // Just a shorter syntax (pipe a readable stream to a writeable stream)
    // req.pipe(firebaseStream)

    // Longer syntax
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
