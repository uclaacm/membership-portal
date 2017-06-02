import React from 'react';
import {connect} from 'react-redux';
import {replace} from 'react-router-redux';

import {Action} from 'reducers';
import ResourcesComponent from 'components/Resources';

class Resources extends React.Component {
    render() {
        return <ResourcesComponent/>;
    }
}

export default connect(null, null)(Resources);