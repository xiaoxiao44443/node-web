/**
 * Created by xiao on 2017/5/13.
 */
import React from 'react';
import http from '../../../tool/http';
import PageComponent from '../../../component/common/base/PageComponent';
import Spin from '../../../component/common/tool/Spin';

const FormTextArea = props => {
        return <textarea className="admin-form-textarea" value={props.value} onChange={(event) => {props.onChange(props.name, event.target.value)}} />
};

class Recommend extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            recommend: {
                motto: ''
            },
            loading: false
        };
        this._setDefaultState(state);
    }
    formInputOnChange =(name, value) => {
        if(name in this.state.recommend){
            let recommend = {...this.state.recommend};
            recommend[name] = value;
            this.setState({recommend: recommend});
        }
    };
    saveConfig = () =>{
        if(this.state.loading) return;
        this.setState({
            loading: true
        });

        const { recommend } = this.state;

        const url = this.props.match.url;
        const data = {
            recommend: recommend
        };

        http.apiPost(url, data).then(res => {
            this.setState({
                loading: false
            });
            if(res.code == 0){
                alert('保存成功！');
                this._pageUpdate();
            }else{
                alert(res.data);
            }
        });

    };
    render(){
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-article-edit" /></Spin>
        }

        const { recommend } = this.state;
        const formInputOnChange = this.formInputOnChange;

        return (
            <div className="admin-config slideInUp animated-fast">
                <div className="admin-form-group">
                    <h2>推荐设置~~</h2>
                    <h5>【今日格言】</h5>
                    <FormTextArea name="motto" value={recommend.motto} onChange={formInputOnChange} />
                </div>
                <div className="admin-form-group text-right">
                    <a className="btn btn-confirm" href="javascript:void(0);" onClick={this.saveConfig}>{this.state.loading ? '保存...': '保存'}</a>
                    <a className="btn btn-cancel" href="javascript:history.go(-1);">取消</a>
                </div>
            </div>
        )
    }
}

export default PageComponent.withStore(Recommend);