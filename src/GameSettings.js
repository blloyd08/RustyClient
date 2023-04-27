import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Accordion from 'react-bootstrap/esm/Accordion';

import axios from 'axios';
import { GameState } from "./GameState";


export class GameSettings extends React.Component {

  constructor(props) {
    super(props);
    var address = `http://${this.props.address}/`;
    if (props.debug)
      console.log(`Server Address: ${address}`)
    this.rustyClient = axios.create({
      baseURL: address,
      timeout: 10000,
    });

    this.timerHandle = null;

    this.state = {
      worldSize: 10,
      gameSpeed: 1000,
      gameId: '',
      userId: '',
      gameState: {},
    }
    this.onCreateGame = this.onCreateGame.bind(this)
    this.onJoinGame = this.onJoinGame.bind(this)
    this.onStartGame = this.onStartGame.bind(this)
    this.onGetGameStatus = this.onGetGameStatus.bind(this)
    this.onUpdateGame = this.onUpdateGame.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.updateTimer = this.updateTimer.bind(this)

  }

  render() {
    return (
      <>
        <Accordion defaultActiveKey={1}>
          <Accordion.Item eventKey={0}>
            <Accordion.Header>Create Game</Accordion.Header>
            <Accordion.Body>
              <Form>
                <Form.Group className="mb-3" controlId='worldSize'>
                  <Form.Label>World Size</Form.Label>
                  <Form.Range
                    defaultValue={this.state.worldSize}
                    onChange={(evt) => this.setState({ worldSize: evt.target.value })}
                    min={5} max={100}
                  />
                  <Form.Text>{this.state.worldSize}</Form.Text>
                </Form.Group>
                <Form.Group className="mb-3" controlId='gameSpeed'>
                  <Form.Label>Turn Duration (milliseconds)</Form.Label>
                  <Form.Range
                    defaultValue={this.state.gameSpeed}
                    step={100} min={100} max={10000}
                    onChange={(evt) => this.setState({ gameSpeed: evt.target.value })} />
                  <Form.Text>{this.state.gameSpeed}</Form.Text>
                </Form.Group>
                <Button variant='primary' onClick={this.onCreateGame}>Create Game</Button>
                <Button variant='primary' onClick={this.onStartGame}>Start Game</Button>
              </Form>
            </Accordion.Body>
          </Accordion.Item>

          <Accordion.Item eventKey={1}>
            <Accordion.Header>Join Game</Accordion.Header>
            <Accordion.Body>
              <Form>
                <Form.Group className="mb-3" controlId='gameId'>
                  <Form.Label>Game Id</Form.Label>
                  <Form.Control type='input' value={this.state.gameId} onChange={(evt) => this.setState({ gameId: evt.target.value })} />
                </Form.Group>
                <Button variant='primary' onClick={this.onJoinGame}>Join Game</Button>
                <Form.Group>
                  <Form.Text>User Id: {this.state.userId}</Form.Text>
                </Form.Group>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
        <GameState
          gameState={JSON.stringify(this.state.gameState)}
          width={this.state.worldSize}
          height={this.state.worldSize}
          onKeyDown={this.onKeyDown}
          debug={this.props.debug}
        />


        <br />
        <Controls
          onUpdateGame={this.onUpdateGame}
          onKeyDown={this.onKeyDown}
        />
      </>
    );
  }


  componentWillUnmount() {
    if (this.props.debug)
      console.log("Clearing Interval timer on unmount");
    this.updateTimer(false);
  }

  onKeyDown(event) {
    var key = event.key;
    if (key === "ArrowUp" || key === 'w')
      this.onUpdateGame(0)
    else if (key === "ArrowRight" || key === 'd')
      this.onUpdateGame(1)
    else if (key === "ArrowDown" || key === 's')
      this.onUpdateGame(2)
    else if (key === "ArrowLeft" || key === 'a')
      this.onUpdateGame(3)
  }

  onUpdateGame(direction) {
    var address = `/update/${this.state.gameId}/${this.state.userId}/${direction}`;
    if (this.props.debug) {
      console.log(`Updating Game: ${this.state.gameId}`);
      console.log(address);
    }
    this.rustyClient.get(address)
      .then((resp) => {
        if (this.props.debug)
          console.log(resp);
      }).catch((reason) => {
        console.log("Update Game Failed:", reason);
      });
  }

  onGetGameStatus() {
    var address = `/status/${this.state.gameId}/${this.state.userId}`;
    if (this.props.debug) {
      console.log(`Getting Status: ${this.state.gameId}`);
      console.log(address);
    }
    this.rustyClient.get(address)
      .then((resp) => {
        if (this.props.debug)
          console.log(resp);
        var apiResponse = resp.data;
        if (this.props.debug)
          console.log(apiResponse)
        if (apiResponse.error) {
          console.log("Clearing Interval timer on api error:", apiResponse);
          this.updateTimer(false);
        } else {
          this.setState({ gameState: apiResponse });
        }
      }).catch((reason) => {
        console.log("Clearing Interval timer on request error:", reason);
        this.updateTimer(false);
      });
  }

  onCreateGame() {
    var address = `/create/${this.state.worldSize}/${this.state.worldSize}/${this.state.gameSpeed}`;
    if (this.props.debug) {
      console.log(`Creating Game\nWidth: ${this.state.worldSize} Height: ${this.state.worldSize} Tick: ${this.state.gameSpeed}`);
      console.log(address);
    }
    this.rustyClient.get(address)
      .then((resp) => {
        if (this.props.debug)
          console.log(resp);
        this.setState({ gameId: resp.data });
      });
  }

  updateTimer(startNewTimer) {
    if (this.timerHandle) {
      clearInterval(this.timerHandle);
    }
    if (startNewTimer)
      this.timerHandle = setInterval(this.onGetGameStatus, 100);
  }

  onJoinGame() {
    var address = `/join/${this.state.gameId}`;
    if (this.props.debug) {
      console.log(`Joining Game: ${this.state.gameId}`);
      console.log(address);
    }
    this.rustyClient.get(address)
      .then((resp) => {
        if (this.props.debug)
          console.log(resp);
        var response = resp.data.response;
        this.setState({
          userId: response.user_id,
          worldSize: response.width,
        });
        if (this.props.debug)
          console.log("Starting update timer after joining game")
        this.updateTimer(true);
      });
  }

  onStartGame() {
    var address = `/start/${this.state.gameId}/${this.state.userId}`;
    if (this.props.debug) {
      console.log(`Starting Game: ${this.state.gameId}`);
      console.log(address);
    }
    this.rustyClient.get(address)
      .then((resp) => {
        if (this.props.debug)
          console.log(resp);
      });
  }
}

function Controls(props) {
  return (
    <>
      <input onKeyDown={props.onKeyDown} placeholder='Focus here to use keys' />
      <Table style={{ width: '100px' }}>
        <tbody>
          <tr>
            <td></td>
            <td><Button onClick={() => props.onUpdateGame(0)}>North</Button></td>
            <td></td>
          </tr>
          <tr>
            <td><Button onClick={() => props.onUpdateGame(3)}>West</Button></td>
            <td><Button onClick={() => props.onUpdateGame(2)}>South</Button></td>
            <td><Button onClick={() => props.onUpdateGame(1)}>East</Button></td>
          </tr>
        </tbody>
      </Table>
    </>
  );
}
