import React from 'react';

import './Popup.css';

class Popup extends React.Component {
    render() {
        return (
            <div id="popup" class="d-flex justify-content-center">
                <form>
                    <div class='form-group'>
                        <h1>{this.props.text}</h1>
                        <input
                            class="form-control"
                            type="text"
                            placeholder="Type a word"
                            onChange={(event) => this.props.setGuessWord(event.target.value)}
                        />
                    </div>
                    <div class="d-flex justify-content-center">
                        <button class="btn btn-danger" onClick={this.props.closePopup}>Cancel</button>
                        <button class="btn btn-primary" onClick={(event) => this.props.setWord(event)}>Set word</button>
                    </div>
                </form>
            </div>
        );
    }
}

export default Popup;