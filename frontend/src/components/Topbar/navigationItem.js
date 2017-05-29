import React from 'react'

export default class NavigationItem extends React.Component {
    render () {
        return(
            <div className={"navigation-item" + (this.props.selected ? " selected" : "") }>
                <span>{this.props.text}</span>
            </div>
        );
    }
}
