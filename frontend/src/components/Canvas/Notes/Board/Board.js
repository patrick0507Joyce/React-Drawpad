import React, { useState, useEffect } from "react";
import Note from "../Note/Note";
import FaPlus from "react-icons/lib/fa/plus";
import "./Board.css";
import socket from "../../../socket";

const defaultNoteText = "A New Sticky Note";

const Board = ({ count }) => {
  const [notes, setNotes] = useState([]);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    socket.emit('requestNotes');
    //initilize notes on connection
    socket.on("notesData", (updatedNotes) => {
      console.log("on connection notes", updatedNotes);
      setNotes(updatedNotes.notes);
    })

    socket.on("incoming-notes", (updatedNotes) => {
      console.log("incoming notes", updatedNotes);
      setNotes(updatedNotes);
    })
      
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
        x:x,
        y:y,
      }
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

  return (
    <div className="board">
      <button onClick={() => addNote(defaultNoteText)} id="add">
        <FaPlus />
      </button>
      {notes.map(getEachNote)}
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