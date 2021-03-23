import React, { useState, useEffect } from "react";
import Note from "../Note/Note";
import ImageNote from "../ImageNote/ImageNote";
import { GrAdd } from "react-icons/gr";
import "./Board.css";
import socket from "../../../socket";
import { Divider, Typography } from "@material-ui/core";

const defaultNoteText = "A New Sticky Note";
const defaultImageNoteText = "A new Image Note";

const Board = ({ count }) => {
  const [notes, setNotes] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageNotes, setImageNotes] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [imagesUpdatingStatus, setImagesUpdatingStatus] = useState(false);

  useEffect(() => {
    socket.emit("requestNotes");
    //initilize notes on connection
    socket.on("notesData", (updatedNotes) => {
      console.log("on connection notes", updatedNotes);
      setNotes(updatedNotes.notes);
    });

    socket.on("imageNotesData", (updatedImageNotes) => {
      console.log("on connection notes", updatedImageNotes);
      setImageNotes(updatedImageNotes.imageNotes);
    });

    socket.on("incoming-notes", (updatedNotes) => {
      console.log("incoming notes", updatedNotes);
      setNotes(updatedNotes);
    });

    socket.on("incoming-image-notes", (updatedImageNotes) => {
      console.log("incoming-image-notes", updatedImageNotes);
      setImageNotes(updatedImageNotes);
    });
  }, []);

  useEffect(() => {
    if (updatingStatus) {
      console.log(notes.length);
      socket.emit("sync_notes", notes, (response) => {
        console.log(response.status); // ok
      });
      setUpdatingStatus(false);
    }
  }, [updatingStatus]);

  useEffect(() => {
    if (imagesUpdatingStatus) {
      console.log(imageNotes.length);
      socket.emit("sync_image_notes", imageNotes, (response) => {
        console.log(response.status); // ok
      });
      setUpdatingStatus(false);
    }
  }, [imagesUpdatingStatus]);

  const randomBetweenXY = (x, y) => {
    return x + Math.ceil(Math.random() * (y - x));
  };

  const addNote = (noteText) => {
    let x = randomBetweenXY(0, 200);
    let y = randomBetweenXY(0, 200);
    let newNote = {
      noteText: noteText ? noteText : defaultNoteText,
      id: randomBetweenXY(0, 999999),
      coordinates: {
        x: x,
        y: y,
      },
    };
    setNotes([...notes, newNote]);
    setUpdatingStatus(true);
  };

  const updateNoteText = (newNoteText, noteId) => {
    console.log("updating item at index", noteId, newNoteText);
    let updatedNotes = notes.map((note) => {
      if (note.id === noteId) {
        note.noteText = newNoteText;
      }
      return note;
    });

    setNotes(updatedNotes);
    setUpdatingStatus(true);
  };

  const updateNoteCoordinates = (coordinates, noteId) => {
    console.log("updating item codes at index", noteId, coordinates);
    let updatedNotes = notes.map((note) => {
      if (note.id === noteId) {
        note.coordinates = coordinates;
      }
      return note;
    });

    setNotes(updatedNotes);
    setUpdatingStatus(true);
  };

  const removeNote = (id) => {
    let afterRemovingNotes = notes.filter((note) => note.id !== id);
    setNotes(afterRemovingNotes);
    setUpdatingStatus(true);
  };


  const onFileChange = (event) => {
    const files = Array.from(event.target.files)

    const formData = new FormData()

    files.map((file, i) => {
      formData.append(i, file)
    })

    fetch(process.env.REACT_APP_IMAGE_UPLOAD_URL, {
      method: 'POST',
      body: formData
    })
    .then(res => res.json())
    .then(images => {
      images.map((image) => addImageNote(image.secure_url));
    })
  }

  const addImageNote = (imageURL, noteText) => {
    let x = randomBetweenXY(0, 200);
    let y = randomBetweenXY(0, 200);
    let newImageNote = {
      noteText: noteText ? noteText : defaultImageNoteText,
      id: randomBetweenXY(0, 999999),
      coordinates: {
        x: x,
        y: y,
      },
      imageURL:imageURL
    };
    setImageNotes([...imageNotes, newImageNote]);
    //TODO:sync with websocket in the future
    setImagesUpdatingStatus(true);
  };

  const removeImageNote = (id) => {
    let afterRemovingNotes = imageNotes.filter((note) => note.id !== id);
    setImageNotes(afterRemovingNotes);
    setImagesUpdatingStatus(true);
  };

  const updateImageNoteText = (newNoteText, noteId) => {
    console.log("updating item at index", noteId, newNoteText);
    let updatedImageNotes = imageNotes.map((note) => {
      if (note.id === noteId) {
        note.noteText = newNoteText;
      }
      return note;
    });

    setImageNotes(updatedImageNotes);
    setImagesUpdatingStatus(true);
  };

  const updateImageNoteCoordinates = (coordinates, noteId) => {
    console.log("updating item codes at index", noteId, coordinates);
    let updatedNotes = imageNotes.map((note) => {
      if (note.id === noteId) {
        note.coordinates = coordinates;
      }
      return note;
    });

    setImageNotes(updatedNotes);
    setImagesUpdatingStatus(true);
  };

  const getEachNote = (note) => {
    return (
      <Note
        index={note.id}
        coordinate={note.coordinates}
        noteContent={note.noteText}
        updateNoteText={updateNoteText}
        updateNoteCoordinates={updateNoteCoordinates}
        removeNote={removeNote}
      >
        {note.noteText}
      </Note>
    );
  };

  const getEachImageNote = (imageNote) => {
    return (
      <ImageNote
        index={imageNote.id}
        imageURL={imageNote.imageURL}
        coordinate={imageNote.coordinates}
        noteContent={imageNote.noteText}
        updateNoteText={updateImageNoteText}
        updateNoteCoordinates={updateImageNoteCoordinates}
        removeNote={removeImageNote}
      >
        {imageNote.noteText}
      </ImageNote>
    );
  };

  return (
    <div className="board">
      <button onClick={() => addNote(defaultNoteText)} id="add">
        <GrAdd />
        <Typography>
          Add Notes
        </Typography>
      </button>
      <input type='file' id='single' onChange={onFileChange} /> 
      {notes.map(getEachNote)}
      {imageNotes.map(getEachImageNote)}
    </div>
  );
};

export default Board;

/**
 let noteCount = count ? count : 10;
    let noteArray = [];
    fetch(`https://baconipsum.com/api/?type=all-meat&sentences=${noteCount}`)
      .then((response) => response.json())
      .then((json) => {
        json[0].split(". ").forEach((sentence, index) => {
          let left = randomBetweenXY(600, 1200);
          let top = randomBetweenXY(0, 200);

          let newNote = {
            noteText: sentence.substring(0, 25),
            id: index,
            coordinates: `transform: translate(${left}, ${top})`
          };
          noteArray.push(newNote);
        });
        //TODO: add in the future to initilize code
        //setNotes(noteArray);
 */
 