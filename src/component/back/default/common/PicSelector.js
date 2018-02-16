/**
 * Created by xiao on 2018/2/16.
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import http from "../../../../tool/http";
import FileInput from '../../../common/tool/FileInput';
import Modal from '../../../common/tool/Modal';
import Spin from '../../../common/tool/Spin';

class PicSelector extends Component {
    constructor(props){
        super(props);
        this.state = {
            uploadedPics: [],
            preUploadPics: [],
            uploadedSelected: -1,
            preUploadSelected: [],
            loadingUploadedPics: false,
            uploading: false,
            picSelectorConfirm: false
        };
    }
    componentDidMount(){
        this.getUploadedPics(true);
        this._isMounted = true;
    }
    selectPicFileChange = (files, event) => {
        const newPicList = this.state.preUploadPics.concat(files);
        this.setState({
            preUploadPics: newPicList
        })
    };
    onSelectUpLoadedPic = (index) =>{
        this.setState({
            uploadedSelected: index
        });
    };
    onSelectPrePics = (index) =>{
        let newList = [];
        let flag = false;
        this.state.preUploadSelected.forEach((val, i) => {
            if(index != val){
                newList.push(val);
            }else{
                flag = true;
            }
        });
        if(!flag) newList.push(index);
        this.setState({
            preUploadSelected: newList
        });
    };
    //上传选中图片
    upload = () => {
        const { preUploadSelected, preUploadPics } = this.state;
        if(this.state.uploading) return;

        if(preUploadSelected.length == 0){
            alert('请选择图片');
            return;
        }
        let form = new FormData();

        this.setState({
            uploading: true
        });

        form.append('type', this.props.picType);

        preUploadSelected.forEach(val => {
            if(preUploadPics[val]){
                form.append('images', preUploadPics[val]);
            }
        });

        http.apiFile('/admin/edit/upload-img', form).then(res => {
            this.setState({
                uploading: false
            });
            if(res.code == 0){
                //清空预上传图片
                this.setState({
                    preUploadPics: []
                });
                alert('上传成功');
                //重新获取新的课选择图片列表（服务器返回）
                this.getUploadedPics(true);
            }else{
                alert('上传失败');
            }
        });
    };
    getUploadedPics = (init = false) => {
        if(this.state.loadingUploadedPics) return;
        this.setState({
            loadingUploadedPics: true,
            uploadedSelected: -1
        });

        let p;
        if(init){
            p = 0;
        }else{
            p = this.state.nowPage || 0;
        }

        const data = {
            p: p + 1,
            type: this.props.picType
        };
        http.apiPost('/admin/edit/uploaded-pics', data).then(res => {
            if(!this._isMounted) return;
            this.setState({
                loadingUploadedPics: false
            });
            if(res.code == 0){
                const pics = res.data.map(val => {
                    return {id: val.id, url: `/api/pic${val.id}`};
                });
                this.setState({
                    uploadedPics: pics,
                    nowPage: p + 1
                });
            }else{
                alert('获取图片列表失败');
            }
        });
    };
    onConfirm = () => {
        const { uploadedSelected, uploadedPics} = this.state;
        if(uploadedSelected == -1){
            alert('没有选择任何已上传图片哦');
            return;
        }
        if(typeof this.props.onConfirm === 'function'){
            this.props.onConfirm(uploadedPics[uploadedSelected].id);
        }
        this.props.onClose();
    };
    render(){
        const { show, onClose } = this.props;
        const { uploadedSelected, uploading, loadingUploadedPics } = this.state;

        const uploadedPicLst = this.state.uploadedPics.map((val,index) => {
            let cls = uploadedSelected == index ? 'select' : '';
            return <li key={val.id} className={cls} onClick={() =>this.onSelectUpLoadedPic(index)}><img src={val.url} /></li>
        });
        const preUploadPicList = this.state.preUploadPics.map((val,index) => {
            let cls = '';
            if(this.state.preUploadSelected.indexOf(index)!==-1){
                cls = 'select';
            }
            return <li className={cls} key={val.thumb} onClick={() => this.onSelectPrePics(index)}><img src={val.thumb} /></li>
        });

        const nowSelected = uploadedSelected >-1 ? this.state.uploadedPics[uploadedSelected].url : false;
        return(
            <Modal visible={show} onClose={onClose} closeMaskOnClick={false} width={900} height={590}>
                <Spin loading={uploading || loadingUploadedPics} delay={0}>
                    <div className="admin-pic-select">
                        <h3>选择图片</h3>
                        <a className="btn btn-confirm" href="javascript:void(0);" onClick={() => this.getUploadedPics(true)}>刷新</a>
                        <span>当前选择图片：{nowSelected? <input value={nowSelected} readOnly/>:null}{nowSelected? <small style={{marginLeft:15}}>可右键复制图片地址233~~</small>:null}</span>
                        <div className="thumbs-box">
                            <ul>{uploadedPicLst}</ul>
                        </div>
                        <h3>上传图片</h3>
                        <FileInput btnValue="添加图片" className="upload-button" multiple onChange={this.selectPicFileChange}/>
                        <div className="thumbs-box">
                            <ul>{preUploadPicList}</ul>
                        </div>
                        <div className="text-right">
                            <a className="btn btn-confirm" href="javascript:void(0);" onClick={this.upload}>选中上传</a>
                            {this.props.onConfirm ? <a href="javascript:void(0);" className="btn btn-confirm" onClick={this.onConfirm}>确定修改</a>: null}
                            <a href="javascript:void(0);" className="btn btn-cancel" onClick={onClose}>关闭</a>
                        </div>
                    </div>
                </Spin>
            </Modal>
        );
    }
}

PicSelector.PropTypes = {
    selectPic: PropTypes.func,
    show: PropTypes.bool,
    onClose: PropTypes.func,
    onConfirm: PropTypes.func,
    picType: PropTypes.number
};
PicSelector.defaultProps = {
    show: false,
    onClose: () => {},
    picType: 1
};

export default PicSelector;