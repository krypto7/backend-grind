const express = require("express");
const app = express();

app.use(express.json());

const notes = [
  {
    id: 1,
    title: "Hello this is note",
    description: "and this is description",
  },
  {
    id: 1775634759435,
    title: "Hello New Note",
    description: "Always the best time to write",
  },
];

//create notes

app.post("/add-note", (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    res.status(400).json("all fields are required");
  }

  const newNote = {
    id: Date.now(),
    title,
    description,
  };

  notes.push(newNote);

  res.status(200).json({
    msg: "new note added",
    notes,
  });
});

//edit-notes

app.put("/edit-post/:id", (req, res) => {
  const id = Number(req.params.id);
  const { title, description } = req.body;

  const note = notes.find((item) => item.id === id);

  if (title) note.title = title;
  if (description) note.description = description;

  res.status(200).json({
    msg: "notes update successfully",
    notes,
  });
});

//get notes list:

app.get("/", (req, res) => {
  res.status(200).json({
    msg: "notes list successfully",
    notes,
  });
});

//delete notes:
app.delete("/delete-note/:id", (req, res) => {
  const id = Number(req.params.id);
  notes.pop(id);

  res.status(200).json({
    msg: "note delete successfully",
  });
});

app.listen(3000);
