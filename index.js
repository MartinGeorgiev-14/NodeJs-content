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

app.get('/api/notes/:id', (request, response, next) => {
    Note.findById(request.params.id).then(note => {
        if(note){
            response.json(note)
        }
        else{
            response.status(404).end()
        }
       }).catch(error => next(error))   
})

app.delete("/api/notes/:id", (request, response, next) => {
    Note.findByIdAndDelete(request.params.id).then(note => {
        response.status(204).end()
    }).catch(error => next(error))
})

app.put("/api/notes/:id", (request, response, next) => {
    const {content, important} = request.body

    const body = request.body

    const note = {
        content: body.content,
        important: body.important || false
    }

    Note.findByIdAndUpdate(request.params.id, 
        {content, important},
        {new: true, runValidators: true, context: "query"} )
    .then(updatedNote => {
        response.json(updatedNote)
    })
    .catch(error => next(error))
})

app.post("/api/notes", (request, response, next) => {
  const body = request.body

  console.log(body.content)
  if(body.content === undefined){
    return response.status(400).json({error: "content missing"})
  }
    
  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

  note.save().then(savedNote => {
    response.json(savedNote)
  })
  .catch(error => next(error))

})


const unknownEndpoint = (request, response) => {
    response.status(404).send({error: "unknown endpoint"})
}

app.use(unknownEndpoint)

const errorHander = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === "CastError"){
        return response.status(400).send({error: "malformatted id"})
    }else if(error.name === "ValidationError"){
        return response.status(400).json({error: error.message})
    }
}
app.use(errorHander)

const generateId = () => {
    const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0

    return maxId + 1
}

