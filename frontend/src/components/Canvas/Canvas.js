import React, { useState, useEffect, useRef, useCallback } from "react";
import InputColor from "react-input-color";
import Button from "@material-ui/core/Button";
import DeleteIcon from "@material-ui/icons/Delete";
import VideogameAssetIcon from "@material-ui/icons/VideogameAsset";
import BrushIcon from "@material-ui/icons/Brush";
import { CgUndo } from "react-icons/cg";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

import socket from "../socket";
import Popup from "../Popup/popup";
import Input from "../Input/Input";
import Board from "./Notes/Board/Board";

import "./Canvas.css";
import { Typography } from "@material-ui/core";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const Canvas = () => {
  const canvasRef = useRef(null);
  const [context, setContext] = useState(null);
  const [showPopup, setShowpopup] = useState(false);
  const [guessWord, setGuessWord] = useState("");
  const [color, setColor] = useState("#00000");
  const [forbidStartGame, setForbidStartGameStatus] = useState(false);
  const [guessContent, setGuessContent] = useState([]);
  const [successAlert, setSuccessAlert] = useState(false);

  let latestDrawActions = [];

  const clearCanvas = () => {
    if (context) {
      // DO NOT REMOVE, don't work without this piece of shit if
      context.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
    }
  };

  useEffect(() => {
    let blockDrawing = false;
    let mouseDown = false;
    let start = { x: 0, y: 0 };
    let end = { x: 0, y: 0 };
    let canvasOffsetLeft = 0;
    let canvasOffsetTop = 0;

    if (canvasRef.current) {
      const renderCtx = canvasRef.current.getContext("2d");

      if (renderCtx) {
        if (!blockDrawing) {
          canvasRef.current.addEventListener("mousedown", handleMouseDown);
          canvasRef.current.addEventListener("mouseup", handleMouseUp);
          canvasRef.current.addEventListener("mousemove", handleMouseMove);

          canvasOffsetLeft = canvasRef.current.offsetLeft;
          canvasOffsetTop = canvasRef.current.offsetTop;

          renderCtx.fillStyle = "white";
          renderCtx.fillRect(0, 0, canvasRef.width, canvasRef.height);

          setContext(renderCtx);
        }
      }
    }

    socket.on("incoming-canvas-coordinates", (incomingCoordinates) => {
      if (context) {
        drawLine(context, incomingCoordinates, incomingCoordinates['undo']);
      }
    });

    socket.on("blockDrawing", () => {
      console.log("Removed event listeners");
      if (context) {
        canvasRef.current.removeEventListener("mousedown", handleMouseDown);
        canvasRef.current.removeEventListener("mouseup", handleMouseUp);
        canvasRef.current.removeEventListener("mousemove", handleMouseMove);
        blockDrawing = true;
      }
    });

    socket.on("enableDrawing", () => {
      console.log("Enabled event listeners");
      if (context) {
        canvasRef.current.addEventListener("mousedown", handleMouseDown);
        canvasRef.current.addEventListener("mouseup", handleMouseUp);
        canvasRef.current.addEventListener("mousemove", handleMouseMove);

        blockDrawing = false;
      }
    });

    socket.on("canvas_clear", () => {
      clearCanvas();
    });

    socket.on(
      "start_new_game",
      () => {
        console.log("Received start new game");
        socket.emit("gameStart");
        setSuccessAlert(true);
      },
      [context]
    );

    function handleMouseDown(evt) {
      //clear cache for last move
      latestDrawActions = [];

      mouseDown = true;

      start = {
        x: evt.clientX - canvasOffsetLeft,
        y: evt.clientY - canvasOffsetTop,
      };

      end = {
        x: evt.clientX - canvasOffsetLeft,
        y: evt.clientY - canvasOffsetTop,
      };
    }

    function handleMouseUp(evt) {
      mouseDown = false;
    }

    function handleMouseMove(evt) {
      if (mouseDown && context) {
        start = {
          x: end.x,
          y: end.y,
        };

        end = {
          x: evt.clientX - canvasOffsetLeft,
          y: evt.clientY - canvasOffsetTop,
        };

        let canvas_mouse_coordinates = {
          start: start,
          end: end,
          color: color,
        };
        //TODO:add each latest actions into the array
        latestDrawActions.push(canvas_mouse_coordinates);

        socket.emit("canvas_mouse_co-ordinates", canvas_mouse_coordinates);

        // Draw our path
        drawLine(context, canvas_mouse_coordinates);
      }
    }

    // function randomColor() {
    //     const color = new Array(6);

    //     for (let i = 0; i < 6; i++) {
    //         const val = Math.floor(Math.random() * 16);

    //         if (val < 10) {
    //             color[i] = val.toString();
    //         } else {
    //             color[i] = String.fromCharCode(val + 87);
    //         }
    //     }

    //     return color.join('');
    // }

    return function cleanup() {
      if (canvasRef.current) {
        canvasRef.current.removeEventListener("mousedown", handleMouseDown);
        canvasRef.current.removeEventListener("mouseup", handleMouseUp);
        canvasRef.current.removeEventListener("mousemove", handleMouseMove);
      }
    };
  });

  socket.on("make_user_pick_new_room_msg", () => {
    console.log("Being made to pick new room message from server");
    togglePopup();
  });

  const drawLine = (context, coordinates, undoMode) => {
    if (undoMode) {
      console.log("undo");
      context.beginPath();
      context.moveTo(coordinates.start.x, coordinates.start.y);
      context.lineTo(coordinates.end.x, coordinates.end.y);
      context.strokeStyle = "#FFF";
      context.lineWidth = 5;
      context.stroke();
      context.closePath();
    } else {
      console.log("drawing");
      context.beginPath();
      context.moveTo(coordinates.start.x, coordinates.start.y);
      context.lineTo(coordinates.end.x, coordinates.end.y);
      context.strokeStyle = coordinates.color.hex;
      context.lineWidth = 1;
      context.stroke();
      context.closePath();
    }
  };

  const clearCanvasInformRoom = () => {
    socket.emit("canvas_clear");
    clearCanvas();
  };

  const handleUndoLastMove = () => {
    latestDrawActions.map((actionCoordinate) => {
      actionCoordinate['undo'] = true;
      socket.emit("canvas_mouse_co-ordinates", actionCoordinate);
      drawLine(context, actionCoordinate, true);
    });
    latestDrawActions = [];
  };

  const displayPopup = (event) => {
    event.preventDefault();
    if (guessWord == null || guessWord == "") {
      console.log("Game not started, user did not set word");
    } else {
      console.log("Sending room message");
      socket.emit("setRoomDrawMessage", guessWord);
      togglePopup();
    }
  };

  const startGame = () => {
    if (!forbidStartGame) {
      togglePopup();
    }
  };

  const endGame = () => {
    if (forbidStartGame) {
      setForbidStartGameStatus(false);
    }
  };

  const SendGuessContent = (event) => {
    event.preventDefault();
    setSuccessAlert(true);
  };

  const handleAlertClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setSuccessAlert(false);
  };

  const togglePopup = () => {
    console.log(showPopup);
    if (showPopup) {
      console.log("Hiding popup");
      setShowpopup(false);
    } else {
      console.log("Showing popup");
      setShowpopup(true);
    }
  };

  return (
    <div id="canvasContainer" className="canvasContainer">
      <div className="buttonContainer">
        <Button
          variant="contained"
          color="primary"
          startIcon={<VideogameAssetIcon />}
          onClick={startGame}
          disabled={forbidStartGame}
        >
          Start game
        </Button>
        <Button variant="contained" color="primary" startIcon={<BrushIcon />}>
          <InputColor
            initialValue="#000000"
            onChange={setColor}
            placement="right"
          />
        </Button>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<DeleteIcon />}
          onClick={clearCanvasInformRoom}
        >
          Clear Canvas
        </Button>
        <Button
          variant="contained"
          color="default"
          startIcon={<CgUndo />}
          onClick={handleUndoLastMove}
        >
          Undo Last Move
        </Button>
      </div>
      {showPopup ? (
        <Popup
          text="Pick a new word to guess!"
          setWord={displayPopup}
          closePopup={togglePopup}
          guessWord={guessWord}
          setGuessWord={setGuessWord}
        />
      ) : null}
      <div className="notesHeaderContainer">
        <Typography variant="h6" align="center">
          Add New Notes
        </Typography>
      </div>
      <canvas className="canvas" ref={canvasRef} width="775" height="300" />
      <div className="notesContainer">
        <Board />
      </div>

      {/*<div className="inputContainer">
        <Input
          message={guessContent}
          setMessage={setGuessContent}
          sendMessage={SendGuessContent}
        />
      </div>*/}
      <div>
        <Snackbar
          open={successAlert}
          autoHideDuration={3000}
          onClose={handleAlertClose}
        >
          {/* severity includes: error, success, info */}
          <Alert onClose={handleAlertClose} severity="success">
            CORRECT!
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default Canvas;
