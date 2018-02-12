/**
 * Created by xiao on 2018/2/12.
 */
import React from 'react';
import http from '../../../tool/http';
import PageComponent from '../../../component/common/base/PageComponent';
import Spin from '../../../component/common/tool/Spin';
import './account.css';

const FormInput = props => {
    return <input className="admin-form-input" type="text" value={props.value} onChange={(event) => {props.onChange(props.name, event.target.value)}} />
};

class Account extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            account: {
                nickname: '',
                head: '',
                sex: 0,
                email: ''
            },
            psw1: '',
            psw2: '',
            loading: false
        };
        this._setDefaultState(state);
    }
    formInputOnChange =(name, value) => {
        if(name in this.state.account){
            let account = {...this.state.account};
            account[name] = value;
            this.setState({account: account});
        }
        if(name in this.state){
            this.setState({ [name]: value });
        }
    };
    formRadioOnchange = e => {
        const account = { ...this.state.account };
        account.sex = e.target.value;
        this.setState({ account });
    };
    saveConfig = () => {
        if(this.state.loading) return;

        const { nickname, head, sex, email } = this.state.account;
        const { psw1, psw2 } = this.state;
        if(nickname.length == 0){
            alert('必须输入昵称哦~');
            return;
        }
        if(head.length == 0){
            alert('必须输入头像地址哦~');
            return;
        }

        if(psw2.length > 0){
            if (psw1.length == 0) {
                alert('修改密码必须输入旧密码哦~');
                return;
            }
            if(psw2.length < 6) {
                alert('新密码长度必须大于等于6位哦~');
                return;
            }
            if (psw2 == psw1) {
                alert('新旧密码不能一样哦~');
                return;
            }
        }

        this.setState({
            loading: true
        });

        const url = this.props.match.url;
        let account = {
            nickname,
            head,
            sex,
            email
        };
        if(psw2.length > 0){
            account.psw1 = psw1;
            account.psw2 = psw2;
        }

        const data = { account };

        http.apiPost(url, data).then(res => {
            this.setState({
                loading: false,
            });
            if(res.code == 0){
                alert('保存成功！');
                this.setState({ psw1: '', psw2: '' });
                this._pageUpdate();
            }else{
                alert(res.data);
            }
        });

    };

    render() {
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-account" /></Spin>
        }

        const { nickname, head, sex, email } = this.state.account;
        const { psw1, psw2 } = this.state;
        const formInputOnChange = this.formInputOnChange;
        const formRadioOnchange = this.formRadioOnchange;

        return (
            <div className="admin-account slideInUp animated-fast">
                <div className="admin-form-group">
                    <h2>账号设置~~</h2>
                    <h5>【昵称】</h5>
                    <FormInput name="nickname" value={nickname} onChange={formInputOnChange} />
                    <h5>【头像】</h5>
                    <FormInput name="head" value={head} onChange={formInputOnChange} />
                    <img className="img-head" src={head}/>
                    <h5>【邮箱】</h5>
                    <FormInput name="email" value={email} onChange={formInputOnChange} />
                    <h5>【性别】</h5>
                    <label><input className="admin-form-radio" type="radio" name="sex" value="0" checked={sex == 0} onChange={formRadioOnchange}/>未知</label>
                    <label><input className="admin-form-radio" type="radio" name="sex" value="1" checked={sex == 1} onChange={formRadioOnchange}/>女</label>
                    <label><input className="admin-form-radio" type="radio" name="sex" value="2" checked={sex == 2} onChange={formRadioOnchange}/>男</label>
                    <h5>【旧密码】</h5>
                    <FormInput name="psw1" value={psw1} onChange={formInputOnChange} />
                    <h5>【新密码】</h5>
                    <FormInput name="psw2" value={psw2} onChange={formInputOnChange} />
                </div>
                <div className="admin-form-group text-right">
                    <a className="btn btn-confirm" href="javascript:void(0);" onClick={this.saveConfig}>{this.state.loading ? '保存...': '保存'}</a>
                    <a className="btn btn-cancel" href="javascript:history.go(-1);">取消</a>
                </div>
            </div>
        )
    }
}

export default PageComponent.withStore(Account);