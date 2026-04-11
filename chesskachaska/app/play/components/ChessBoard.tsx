"use client";

import { Chessboard } from "react-chessboard";
import { useState } from "react";

export default function ChessBoard() {
  const [position, setPosition] = useState("start");

  function onDrop(sourceSquare: string, targetSquare: string) {
    const move = `${sourceSquare}-${targetSquare}`;
    console.log("Move:", move);
    setPosition((prev) => prev); 

    return true;
  }
  const customBoardStyle = {
    
    darkSquareStyle: { backgroundColor: "#1a1a1a" },
    lightSquareStyle: { backgroundColor: "#f0f0f0" },
    allowDragOffBoard :false,
    allowDrawingArrows: true,
    alphaNotationStyle :{
        fontSize: "11px",
        position: "absolute",
        bottom: 1,
        right: 4,
        userSelect: 'none',
    },
    numericNotationStyle:{
        
  fontSize: "13px",
  position: "absolute",
  top: 2,
  left: 2,
  userSelect: 'none',

    },
    onMouseOutSquare : (square) => {
        console.log("Mouse out of square:", square);
    },
    onMouseOverSquare : (square) => {
        console.log("Mouse over square:", square);
    },
    onPieceClick : (piece) => {
        console.log("Piece clicked:", piece);
    },
    squareStyle : {
        
  aspectRatio: "1/1",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative",

    }
    ,
    squareStyles:{},
     

  }
  return (
    <div className="w-full max-w-[640px] aspect-square rounded-xl overflow-hidden shadow-2xl">
      <Chessboard
        options={customBoardStyle}
      />
    </div>
  );
}