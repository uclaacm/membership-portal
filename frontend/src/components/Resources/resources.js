import React from 'react';

export default class Resources extends React.Component {
    render() {
        if (this.props.error) {
            return <div className="resources-wrapper"><h1>{this.props.error}</h1></div>;
        } else {
            return (
                <div className="resources-wrapper">
                    <h1>Resources</h1>
                </div>
            );
        }
    }
}