import React from 'react';
import { Route, IndexRoute } from 'react-router-dom';

import App from './components/App';
import Dashboard from './components/Dashboard/';

export default (
    <Route path="/" component={App}>
        <Route path="register" component={Register} />
        <Route path="login" component={Login} />
        <Route path="dashboard" component={Dashboard} />

        <Route path="*" component={NotFoundPage} />
    </Route>
);
