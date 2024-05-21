const http = require("http")
const { json } = require("stream/consumers")

require('dotenv').config()
const cors = require("cors")
const express = require("express")
const app = express()
const { error } = require("console")
const mongoose = require("mongoose")
const Note = require("./note")

const requestLogger = (request, response, next) => {
    console.log("Method:", request.method)
    console.log("Path:  ", request.path)
    console.log("Body:  ", request.body)
    console.log("---")
    next()
}



app.use(express.json())
app.use(requestLogger)
app.use(cors())
app.use(express.static("dist"))



const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})


let notes = [
    {
      id: 1,
      content: "HTML is easy",
      important: true
    },
    {
      id: 2,
      content: "Browser can execute only JavaScript",
      important: false
    },
    {
      id: 3,
      content: "GET and POST are the most important methods of HTTP protocol",
      important: true
    }
]


app.get("/", (request, response) => {
    response.send("<h1>Hello World!</h1>")
})

app.get("/api/notes", (request, response) => {
    Note.find({}).then(notes => {
        response.json(notes)
    })
})

app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id).then(note => {
        response.json(note)
       })
})

app.delete("/api/notes/:id", (request, response) => {
    Note.findById(request.params.id).then(note => {
    response.json(note)
   })
})

app.post("/api/notes", (request, response) => {
  const body = request.body

  if(body.content === undefined ){
    return response.status(400).json({error: "content missing"})
  }
    
  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })

})

const unknownEndpoint = (request, response) => {
    response.status(404).send({error: "unknown endpoint"})
}

app.use(unknownEndpoint)

const generateId = () => {
    const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0

    return maxId + 1
}

