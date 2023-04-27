import React from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';


import { GameSettings } from './GameSettings';
import './App.css';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '',
      debug: false
    }
    this.onAddressChange = this.onAddressChange.bind(this);
    this.onDebugChange = this.onDebugChange.bind(this);
  }

  onAddressChange(address) {
    this.setState({address: address});
  }

  onDebugChange(evt) {
    this.setState({debug: evt.target.checked});
  }

  render() {
    return (
      <div className="App">
        <Container className="p-3">
          <Container className="p-5 mb-4 bg-light rounded-3">
            {this.state.address 
              ? <GameSettings address={this.state.address} debug={this.state.debug}/>
              : <AddressForm onAddressChange={this.onAddressChange} onDebugChange={this.onDebugChange}/>
            }
          </Container>
        </Container>
      </div>
    );
  }
}

class AddressForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      address: '127.0.0.1:8000'
    }
  }

  render() {
    return (
      <Form>
        <Form.Group className="mb-3" controlId='ipAddress'>
          <Form.Label>Server Address</Form.Label>
          <Form.Control type='input' value={this.state.address} onChange={(evt) => this.setState({address: evt.target.value})}/>
        </Form.Group>
        <Form.Check type='switch' label='Debug Mode' onChange={this.props.onDebugChange} />
        <Button variant='primary' onClick={() => this.props.onAddressChange(this.state.address)}>Save</Button>
      </Form>
    );
  }
}

export default App;
