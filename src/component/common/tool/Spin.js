/**
 * Created by xiao on 2017/5/14.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './spin.css';

class Spin extends Component {

    constructor(props){
        super(props);
        this.state = {
            show: false
        };
        this.timer = false;

        if(!this.state.show && props.loading){
            const delay = parseInt(props.delay) >= 0 ? parseInt(props.delay) : 1000;
            if(delay == 0){
                this.state.show = true;
            }else{
                this.timer = window.setTimeout(() => {
                    if(!this.timer) return;
                    this.timer = false;
                    this.setState({show: true});
                }, delay)
            }
        }
    }
    componentWillReceiveProps(nextProps){
        if(!nextProps.loading){
            this.setState({
                show: false
            });
            if(this.timer) clearTimeout(this.timer);
            this.timer = false;
            return;
        }
        if(!this.state.show && nextProps.loading){
            const delay = parseInt(nextProps.delay) >= 0 ? parseInt(nextProps.delay) : 1000;
            if(delay == 0){
                this.setState({show: true});
            }else{
                this.timer = window.setTimeout(() => {
                    if(!this.timer) return;
                    this.timer = false;
                    this.setState({show: true});
                }, delay)
            }
        }
    }
    componentWillUnmount(){
        if(this.timer && window) {
            window.clearTimeout(this.timer);
            this.timer = false;
        }
    }
    render(){
        if(this.state.show){
            return (
                <div className="spin-loading">
                    <div>
                        <div className="spin spin-spinning">
                            <div className="pacman">
                                <div/>
                                <div/>
                                <div/>
                                <div/>
                                <div/>
                            </div>
                        </div>
                    </div>
                    <div className="spin-container spin-blur">
                        {this.props.children}
                    </div>
                </div>
            );
        }else{
            return <div>{this.props.children}</div>;
        }
    }
}

Spin.propTypes = {
    loading: PropTypes.bool,
    delay: PropTypes.number
};
Spin.defaultProps = {
    loading: false,
    delay: 1000
};

export default Spin;