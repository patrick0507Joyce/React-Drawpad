import React from 'react'
import ReactDOM from 'react-dom'

import App from './App'

ReactDOM.render(
    <div>
        <div>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-giJF6kkoqNQ00vy+HMDP7azOuL0xtbfIcaT9wjKHr8RbDVddVHyTfAAsrekwKmP1" crossorigin="anonymous"></link>
        </div>
        <div class="container-fluid bg-dark">
            <App />
        </div>
    </div>,
    document.querySelector('#root'));
