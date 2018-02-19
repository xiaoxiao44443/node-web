/**
 * Created by xiao on 2018/2/15.
 */
import React from 'react';
import http from '../../../tool/http';
import PageComponent from '../../../component/common/base/PageComponent';
import Spin from '../../../component/common/tool/Spin';

const FormInput = props => {
    return <input className="admin-form-input" type="text" value={props.value} onChange={(event) => {props.onChange(props.name, event.target.value)}} />
};

class MusicConfig extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            musicConfig: {
                mode: 0,
                defaultMusic: 0
            },
            loading: false
        };
        this._setDefaultState(state);
    }
    formInputOnChange =(name, value) => {
        if(name in this.state.musicConfig){
            let musicConfig = {...this.state.musicConfig};
            musicConfig[name] = value;
            this.setState({ musicConfig });
        }
    };
    formRadioOnchange = e => {
        const musicConfig = { ...this.state.musicConfig };
        musicConfig.mode = e.target.value;
        this.setState({ musicConfig });
    };
    saveConfig = () =>{
        if(this.state.loading) return;

        const { musicConfig } = this.state;
        if(musicConfig.defaultMusic === ''){
            alert('必须输入默认音乐id~');
            return;
        }
        if(isNaN(musicConfig.defaultMusic)){
            alert('默认音乐id必须为数字哦~');
            return;
        }

        this.setState({
            loading: true
        });

        const url = this.props.match.url;
        const data = {
            musicConfig: musicConfig
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
            return <Spin loading><div className="admin-music-config" /></Spin>
        }

        const { mode, defaultMusic } = this.state.musicConfig;
        const formInputOnChange = this.formInputOnChange;
        const formRadioOnchange = this.formRadioOnchange;

        return (
            <div className="admin-music-config slideInUp animated-fast">
                <div className="admin-form-group">
                    <h2>音乐设置~~</h2>
                    <h5>【播放模式】</h5>
                    <label><input className="admin-form-radio" type="radio" name="mode" value="0" checked={mode == 0} onChange={formRadioOnchange}/>列表循环</label>
                    <label><input className="admin-form-radio" type="radio" name="mode" value="1" checked={mode == 1} onChange={formRadioOnchange}/>随机播放</label>
                    <label><input className="admin-form-radio" type="radio" name="mode" value="2" checked={mode == 2} onChange={formRadioOnchange}/>单曲循环</label>
                    <h5>【默认音乐索引-从0开始的数字】</h5>
                    <FormInput name="defaultMusic" value={defaultMusic} onChange={formInputOnChange} />
                </div>
                <div className="admin-form-group text-right">
                    <a className="btn btn-confirm" href="javascript:void(0);" onClick={this.saveConfig}>{this.state.loading ? '保存...': '保存'}</a>
                    <a className="btn btn-cancel" href="javascript:history.go(-1);">取消</a>
                </div>
            </div>
        )
    }
}

export default PageComponent.withStore(MusicConfig);