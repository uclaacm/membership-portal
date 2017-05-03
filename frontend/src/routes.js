import React from 'react';
import { Route, IndexRoute } from 'react-router-dom';

import App from './components/App';
import Dashboard from './components/DashBoard/';

export default (
    <Route path="/" component={App}>
        <IndexRoute component={HomePage} />
        <Route path="register" component={Register} />
        <Route path="login" component={Login} />
        <Route path="dashboard" component={DashBoard} />

        <Route path="*" component={NotFoundPage} />
    </Route>
);
