import React, { useState, useEffect, useRef, useCallback } from 'react'
import socket from '../socket'

import './Canvas.css';

const Canvas = () => {

    const canvasRef = useRef(null);
    const [context, setContext] = useState(null);


    const clearCanvas = () => {
        if (context) { // DO NOT REMOVE, don't work without this piece of shit if
            context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        }
    }

    useEffect(() => {
        let blockDrawing = false;
        let mouseDown = false;
        let start = { x: 0, y: 0 };
        let end = { x: 0, y: 0 };
        let canvasOffsetLeft = 0;
        let canvasOffsetTop = 0;

        if (canvasRef.current) {
            const renderCtx = canvasRef.current.getContext('2d');

            if (renderCtx) {
                if (!blockDrawing) {
                    canvasRef.current.addEventListener('mousedown', handleMouseDown);
                    canvasRef.current.addEventListener('mouseup', handleMouseUp);
                    canvasRef.current.addEventListener('mousemove', handleMouseMove);

                    canvasOffsetLeft = canvasRef.current.offsetLeft;
                    canvasOffsetTop = canvasRef.current.offsetTop;

                    renderCtx.fillStyle = "white";
                    renderCtx.fillRect(0, 0, canvasRef.width, canvasRef.height);

                    setContext(renderCtx);
                }
            }
        }

        socket.on('incoming-canvas-coordinates', (incomingCoordinates) => {
            if (context) {
                drawLine(context, incomingCoordinates)
            }
        });

        socket.on('blockDrawing', () => {
            console.log("Removed event listeners")
            if (context) {
                canvasRef.current.removeEventListener('mousedown', handleMouseDown)
                canvasRef.current.removeEventListener('mouseup', handleMouseUp)
                canvasRef.current.removeEventListener('mousemove', handleMouseMove)
                blockDrawing = true;
            }
        });

        socket.on('enableDrawing', () => {
            console.log("Removed event listeners")
            if (context) {
                canvasRef.current.addEventListener('mousedown', handleMouseDown);
                canvasRef.current.addEventListener('mouseup', handleMouseUp);
                canvasRef.current.addEventListener('mousemove', handleMouseMove);

                blockDrawing = false;
            }
        });

        socket.on('make_user_pick_new_room_msg', () => {
            displayPopup()
        });

        socket.on('canvas_clear', () => {
            clearCanvas()
        });

        socket.on('start_new_game', () => {
            console.log("Send new game to server")
            socket.emit('gameStart')
        });

        function handleMouseDown(evt) {
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
                    end: end
                }

                socket.emit('canvas_mouse_co-ordinates', canvas_mouse_coordinates);

                // Draw our path
                drawLine(context, canvas_mouse_coordinates)
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
                canvasRef.current.removeEventListener('mousedown', handleMouseDown);
                canvasRef.current.removeEventListener('mouseup', handleMouseUp);
                canvasRef.current.removeEventListener('mousemove', handleMouseMove);
            }
        }
    }, [context]);

    function drawLine(context, coordinates) {
        context.beginPath();
        context.moveTo(coordinates.start.x, coordinates.start.y);
        context.lineTo(coordinates.end.x, coordinates.end.y);
        context.strokeStyle = `#000000`;
        context.lineWidth = 3;
        context.stroke();
        context.closePath();
    }

    const clearCanvasInformRoom = () => {
        socket.emit('canvas_clear');
        clearCanvas();
    }

    const displayPopup = () => {
        var secret = prompt("Please enter the word people will have to guess!:");
        if (secret == null || secret == "") {
            console.log("Game not started, user did not set word")
        } else {
            socket.emit("setRoomDrawMessage", (secret))
        }
    }

    return (
        <div
            style={{
                textAlign: 'center',
            }}>
            <canvas
                id="canvas"
                ref={canvasRef}
                width={500}
                height={500}
                style={{
                    border: '2px solid #000',
                    marginTop: 10,
                }}
            ></canvas>
            <button onClick={() => clearCanvasInformRoom()}>Clear canvas</button>
            <button onClick={() => displayPopup()}>Start game</button>
        </div>
    );
}

export default Canvas;