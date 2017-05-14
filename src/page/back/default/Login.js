/**
 * Created by xiao on 2017/5/14.
 */
import React from 'react';
import PageComponent from '../../../component/common/base/PageComponent';
import Spin from '../../../component/common/tool/Spin';
import './login.css';
import http from '../../../tool/http';

class Login extends PageComponent {

    constructor(props){
        super(props);

        const state = {
            account: '',
            password: '',
            loading: false
        };

        this._setDefaultState(state);
    }
    accountOnChange = event => {
        this.setState({
            account: event.target.value
        });
    };
    passwordOnChange = event => {
        this.setState({
            password: event.target.value
        });
    };
    login = () => {
        if(this.state.loading) return;

        const { account, password } = this.state;

        if(account.length == 0){
            alert('啊咧，忘记主人叫什么了');
            return;
        }
        if(password.length < 6){
            alert('口令是不小于六位的，笨蛋！');
            return;
        }

        this.setState({
            loading: true
        });

        const data = {
            account: account,
            password: password
        };

        const url = this.props.match.url;
        http.apiPost(url, data).then(res => {
            this.setState({
                loading: false
            });
            if(res.code == 0){
                alert('欢迎主人~');
                this.props.history.push('/admin');
            }else{
                alert('口令错误，哼！');
            }
        });
    };
    inputOnKeyDown = (event) =>{
        //回车键
        if(event.keyCode == 13){
            this.login();
        }
    };

    render(){
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-login" /></Spin>
        }

        const { account, password } = this.state;
        return (
            <div className="admin-welcome admin-login">
                <div className="welcome">
                    <h1>欢迎主人~~~才怪///</h1>
                    <div className="admin-login-group">
                        <h4>主人你是谁？</h4>
                        <input className="admin-form-input" type="text" onKeyDown={this.inputOnKeyDown} onChange={this.accountOnChange} value={account} />
                        <h4>此山是我开,此树是我栽...快说口令！</h4>
                        <input className="admin-form-input" type="password" onKeyDown={this.inputOnKeyDown} onChange={this.passwordOnChange} value={password} />
                        <div className="text-right">
                            <a className="admin-login-btn" href="javascript:void(0);" onClick={this.login}>{!this.state.loading ? '好了' : '进入中...'}</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PageComponent.withStore(Login);