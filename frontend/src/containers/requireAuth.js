import React from 'react';
import { connect } from 'react-redux';

export default function (ComposedComponent) {
    class Authentication extends React.Component {
        componentWillMount() {
            if (!this.props.authenticated) {
                this.context.router.push('/login');
            }
        }

        componentWillUpdate(nextProps) {
            if (!this.props.authenticated) {
                this.context.router.push('/login');
            }
        }

        render() {
            return <ComposedComponent {...this.props} />;
        }
    }

    mapStateToProps = (state) => {
        const A = state.Auth;
        return {
            authenticated: A.get("authenticated")
        }
    }

    return connect(mapStateToProps)(Authentication);
}
