/**
 * Created by xiao on 2017/2/26.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { store } from '../../tool/store';

class Error extends Component {
    constructor(props){
        super(props);
        this.state = {
            error:  props.error
        }
    }
    render(){
        const error = this.state.error;
        return (
            <div id="error">
                <h1>Error</h1>
                <h2 dangerouslySetInnerHTML={{__html: error.message}}/>
                <pre dangerouslySetInnerHTML={{__html: error.stack}}/>
            </div>
        );
    }
}

Error.propTypes = {
    error: PropTypes.object
};

const map = ['error'];

export default store(Error,map);