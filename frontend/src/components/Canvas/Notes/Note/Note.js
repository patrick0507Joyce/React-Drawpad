import React, { useState, useEffect } from "react";
import Draggable from 'react-draggable';
import {BsPencilSquare, BsTrash} from "react-icons/bs";
import {BiSave} from "react-icons/bi";
import socket from "../../../socket";
import "./Note.css";

const Note = ({ index, coordinate, noteContent, removeNote, updateNoteText, updateNoteCoordinates }) => {
  const [editingStatus, setEditingStatus] = useState(false);
  const [textValue, setTextValue] = useState(noteContent);
  const [coordinates, setCoordinates] = useState(coordinate);

  useEffect(() => {
    socket.on("incoming-notes", (updatedNotes) => {
      console.log("incoming notes", updatedNotes);
      updatedNotes.map((updatedNote) => {
        if (updatedNote.id === index) {
          setTextValue(updatedNote.noteText);
          setCoordinates(updatedNote.coordinates);
        }
      })
    })
  }, []);

  const onEditNote = () => {
    setEditingStatus(true);
  };

  const onRemoveNote = () => {
    removeNote(index);
  };

  const handleTextValueChange = (event) => {
    event.preventDefault();
    setTextValue(event.target.value);
  }

  const onSaveNote = (event) => {
    //TODO: changevalue
    console.log({noteContent});
    updateNoteText(textValue, index);
    setEditingStatus(false);
  };

  const eventControl = (event, infor) => {
    //event.preventDefault();
    //console.log("Event name", event.type);
  }

  const handleDragStart = (event) => {
    console.log("handle drag start");
  }

  const handleDragStop = (event, data) => {
    console.log("handle drag stop");
    console.log(data.x, data.y);
    
    setCoordinates({
      x: data.x,
      y: data.y
    });
    updateNoteCoordinates({
      x: data.x,
      y: data.y
    }, index);


  }

  if (editingStatus) {
    return (
      <Draggable
        onStart={handleDragStart}
        onStop={handleDragStop}
        position={coordinates}   
      >
        <div className="note">
          <form onSubmit={onSaveNote}>
            <input
              value={textValue}
              onChange={handleTextValueChange}
            />
            <button type="submit" id="save">
              <BiSave />
            </button>
          </form>
        </div>
      </Draggable>
    );
  } else {
    return (
        <Draggable
        onStart={handleDragStart}
        onStop={handleDragStop}   
        position={coordinates}   
      >
      <div className="note">
        <p>{textValue}</p>
        <span>
          <button onClick={onEditNote} id="edit">
            <BsPencilSquare />
          </button>
          <button onClick={onRemoveNote} id="remove">
            <BsTrash />
          </button>
        </span>
      </div>
      </Draggable>
    );
  }
};

export default Note;
