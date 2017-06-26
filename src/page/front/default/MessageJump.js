/**
 * Created by xiao on 2017/5/24.
 */
import React, { Component } from 'react';
import { store } from '../../../tool/store';

class MessageJump extends Component {
    constructor(props){
        super(props);
        this.state = {
            second: 2
        }
    }
    componentDidMount(){
        this.setState({
            second: 2
        });
        this.setTimer();
    }
    setTimer = () => {
        this.timer = window.setTimeout(() => {
            this.setState({
                second: this.state.second - 1
            });
            if(this.state.second - 1 > 0){
                this.setTimer();
            }else{
                const { message } = this.props;
                window.location.href = message.url;
            }
        },1000);
    };
    componentWillUnmount(){
        if(this.timer && window) {
            window.clearTimeout(this.timer);
            this.timer = false;
        }
    }
    render() {
        const { message } = this.props;
        const st = {
            width: '100%',
            height: '100%',
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        };
        return (
            <div style={st}>
                <div style={{textAlign: 'center'}}>
                    <h1>{message.text}</h1>
                    <span>{this.state.second}秒后自动跳转</span>
                </div>
            </div>
        );
    }
}

const map = state => ({ message: state._page.state.message });
export default store(MessageJump, map);
