import React, { PropTypes } from 'react';

import Sidebar from './components/Sidebar/sidebar';

class App extends React.Component {
    render () {
        return(
            <div className="App-main">
                <Sidebar />
                {this.props.children}
            </div>
        );
    }
}

export default App;
