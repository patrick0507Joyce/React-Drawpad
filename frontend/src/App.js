import React from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';
import Room from './components/Room/Room';

import './app.css';
import Board from './components/Canvas/Notes/Board/Board';


const App = () => (
    <Router>
        <Route path='/' exact component={Join} />
        <Route path='/room' component={Room} />
        <Route path='/chat' component={Chat} />
        <Route path ='/notes' component={Board} />
    </Router>
);

export default App;