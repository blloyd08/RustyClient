
import React from 'react';



function Square(props) {
  var contents = "";
  var style = {};
  if (props.row === props.food.y && props.column === props.food.x) {
    contents = "🥩"
  } else if (props.row === props.head.y && props.column === props.head.x) {
    contents = "🐸"
  }

  if (props.body.some((point) => point.x === props.column && point.y === props.row)) {
    style = { backgroundColor: 'green' };
  }

  return (
    <div
      style={style}
      className='square'
    >{contents}</div>);
}


export function GameState(props) {
  var gameState = JSON.parse(props.gameState);
  var displayBody = !!gameState.response;
  let body = displayBody ? gameState.response.body.slice(1) : [];
  let head = displayBody ? gameState.response.body[0] : { x: -1, y: -1 };
  let food = displayBody ? gameState.response.food : { x: -1, y: -1 };
  let rows = [];
  for (let rowIndex = 0; rowIndex < props.width; rowIndex++) {
    let columns = [];
    for (let columnIndex = 0; columnIndex < props.height; columnIndex++) {
      columns.push(<Square
        display={displayBody}
        body={body}
        head={head}
        food={food}
        row={rowIndex}
        column={columnIndex}
        key={`${rowIndex}-${columnIndex}`}
      />);
    }
    rows.push(<div className='board-row' key={rowIndex}>{columns}</div>);
  }
  return (
    <>
      <h3>Score: {body.length}</h3>
      <h3>Number of Players: {displayBody ? gameState.response.number_of_players : 0}</h3>
      <button style={{ padding: '0px 0px 0px 0px' }} onKeyDown={props.onKeyDown} >
        {rows}
      </button>
      {props.debug &&
        <h3>{props.gameState}</h3>
      }
    </>
  );
}

