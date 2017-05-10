/**
 * Created by xiao on 2017/5/6.
 */
import React from 'react';
import { Route } from 'react-router-dom';

const Status = ({ code, children }) => (
    <Route render={({ staticContext }) => {
        if (staticContext)
            staticContext.status = code;
        return children
    }}/>
);
export default Status;