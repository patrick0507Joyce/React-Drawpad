import React from 'react';

import { BrowserRouter as Router, Route } from 'react-router-dom';

import Join from './components/Join/Join';
import Chat from './components/Chat/Chat';
import Room from './components/Room/Room'

const App = () => (
    <Router>
        <Route path='/' exact component={Join} />
        <Route path='/room' component={Room} />
        <Route path='/chat' component={Chat} />
    </Router>
);

export default App;