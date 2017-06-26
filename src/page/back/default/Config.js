/**
 * Created by xiao on 2017/5/13.
 */
import React from 'react';
import http from '../../../tool/http';
import PageComponent from '../../../component/common/base/PageComponent';
import Spin from '../../../component/common/tool/Spin';

const FormInput = props => {
    return <input className="admin-form-input" type="text" value={props.value} onChange={(event) => {props.onChange(props.name, event.target.value)}} />
};

class Config extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            websiteConfig: {
                site_name: [],
                site_url:'',
                author: '',
                application_name: '',
                description: '',
                keywords: ''
            },
            loading: false
        };
        this._setDefaultState(state);
    }
    formInputOnChange =(name, value) => {
        if(name in this.state.websiteConfig){
            let websiteConfig = {...this.state.websiteConfig};
            websiteConfig[name] = value;
            this.setState({websiteConfig: websiteConfig});
        }
    };
    saveConfig = () =>{
        if(this.state.loading) return;
        this.setState({
            loading: true
        });

        const { websiteConfig } = this.state;
        if(websiteConfig.site_name.length == 0){
            alert('必须输入站点名称哦~');
            return;
        }

        const url = this.props.match.url;
        const data = {
            websiteConfig: websiteConfig
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

        const { websiteConfig } = this.state;
        const formInputOnChange = this.formInputOnChange;

        return (
            <div className="admin-config slideInUp animated-fast">
                <div className="admin-form-group">
                    <h2>站点设置~~</h2>
                    <h5>【站点名称】</h5>
                    <FormInput name="site_name" value={websiteConfig.site_name} onChange={formInputOnChange} />
                    <h5>【站点网址】</h5>
                    <FormInput name="site_url" value={websiteConfig.site_url} onChange={formInputOnChange} />
                    <h5>【作者】</h5>
                    <FormInput name="author" value={websiteConfig.author} onChange={formInputOnChange} />
                    <h5>【application_name】</h5>
                    <FormInput name="application_name" value={websiteConfig.application_name} onChange={formInputOnChange} />
                    <h5>【description】</h5>
                    <FormInput name="description" value={websiteConfig.description} onChange={formInputOnChange} />
                    <h5>【keywords】</h5>
                    <FormInput name="keywords" value={websiteConfig.keywords} onChange={formInputOnChange} />
                </div>
                <div className="admin-form-group text-right">
                    <a className="btn btn-confirm" href="javascript:void(0);" onClick={this.saveConfig}>{this.state.loading ? '保存...': '保存'}</a>
                    <a className="btn btn-cancel" href="javascript:history.go(-1);">取消</a>
                </div>
            </div>
        )
    }
}

export default PageComponent.withStore(Config);