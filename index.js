require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const app = express();
const Person = require("./modules/person");


app.use(express.json());

//app.use(morgan('tiny'))
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :person"
  )
);
app.use(express.static("build"));

app.use(cors());

//info page
app.get("/info", (req, res) => {
  Person.find({}).then((persons) => {
  res.send(`<div><p>Phonebook has info for ${persons.length} people. </p>
   <p>${Date()}</p></div>`);
  });
})

//fetching persons
app.get("/api/persons", (req, res) => {
  Person.find({}).then((persons) => {
    res.json(persons);
  });
})

//fetching single resource
app.get("/api/persons/:id", (req, res, next) => {
  Person.findById(req.params.id)
  .then((person) => {
    if(person){
      res.json(person);
    }else{
      res.status(404).end()
    } 
  })
  .catch(error=>{
    next(error)
  })
});


app.delete("/api/persons/:id",(req,res,next)=>{
  Person.findByIdAndRemove(req.params.id)
  .then(result=>{
    console.log(result)
    res.status(204).end()
  })
  .catch(error=> {
    next(error);
  })
})



function integerId(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
//adding data

app.post("/api/persons", (req, res,next) => {
  const body = req.body;

  if (body.name === undefined || body.number === undefined) {
    return res.status(400).json({
      error: "name or number or both  missing",
    });
  }
  // creating an instance of Person object
  const person = new Person({
    name: body.name,
    number: body.number,
  });
  person.save()
  .then((savedandformated) => {
    res.json(savedandformated);
  })
  .catch(error=>{
    next(error)
  })
});

app.put("/api/persons/:id", (req,res,next)=>{
  const body = req.body;
  const person ={
    name: body.name,
    number: body.number,
  }
  
  // const opts= {
  //   runValidators: true
  // }
  Person.findByIdAndUpdate(req.params.id, person, {new:true,runValidators: true,context: 'query'})
  .then((updatedPerson) =>{
    res.json(updatedPerson)
  })
  .catch((error)=>{
    next(error)
  })
})




morgan.token("person", (req, res) => {
  if (req.method === "POST") {
    return JSON.stringify(req.body);
  }
});

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, req, res, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if(error.name === 'ValidationError'){
    return res.status(400).json({error: error.message})
  }

  next(error)
}

app.use(errorHandler)




const PORT = process.env.PORT;

app.listen(PORT);
console.log(`app started on ${PORT}`);
