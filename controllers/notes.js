const notesRouter = require('express').Router()
const Note = require('../models/note')

notesRouter.get('/', async (request, response) => {
  const result = await Note.find({})

  response.json(result)
})

notesRouter.get('/:id', async (request, response, next) => {
  try {
    const note = await Note.findById(request.params.id)
    if(note){
      response.json(note)
    }
    else{
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }

})

notesRouter.post('/', async (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
  })

try {
  const savedNote = await note.save()
  response.status(201).json(savedNote)
} catch (error) {
  next(error)
}


})

notesRouter.delete('/:id', async (request, response, next) => {

  try {
    const result = await Note.findByIdAndDelete(request.params.id)
    if(result){
      response.status(204).end()
    }
    else{
      response.status(404).end()
    }
  } catch (error) {
    next(error)
  }

//  const result = await Note.findByIdAndDelete(request.params.id)
//   if(result) {
//     response.status(204).end()
//   }else{
//     next(new Error("CastError"))
//   }
})

notesRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const note = {
    content: body.content,
    important: body.important,
  }

  const result = await Note.findByIdAndUpdate(request.params.id, note, { new: true })
  if(result) {
    response.json(result)
  }else{
    next(new Error("CastError"))
  }
})

module.exports = notesRouter