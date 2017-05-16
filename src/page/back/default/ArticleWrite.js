/**
 * Created by xiao on 2017/5/13.
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './articleWrite.css';
import http from '../../../tool/http';
import PageComponent from '../../../component/common/base/PageComponent';
import { Link } from 'react-router-dom';
import markdown from '../../../tool/markdown';
import Spin from '../../../component/common/tool/Spin';
import FileInput from '../../../component/common/tool/FileInput';
import Modal from '../../../component/common/tool/Modal';

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

        preUploadSelected.forEach(val => {
            if(preUploadPics[val]){
                form.append('images', preUploadPics[val]);
            }
        });

        http.apiFile('/admin/article/edit/upload-img', form).then(res => {
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
            p: p + 1
        };
        http.apiPost('/admin/article/edit/uploaded-pics', data).then(res => {
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
    onConfirm: PropTypes.func
};
PicSelector.defaultProps = {
    show: false,
    onClose: () => {}
};


class ArticleWrite extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            article:{
                title: '',
                text: '',
                summary: ''
            },
            article_title: '',
            article_html: '',
            editor_type: 0,  //0:md编辑模式 1:预览模式 2:双栏模式 3:html查看,
            saving: false,
            showSelectPicModal: false,
            uploadedPics: [],
            preUploadPics: []
        };

       this._setDefaultState(state);
    }
    titleOnChange = (event) => {
        let value = event.target.value;
        if(value.length > 128){
            value = value.substring(0,128);
        }
        let article = {...this.state.article};
        article.title = value;
        this.setState({
            article: article
        });
    };
    summaryOnChange = (event) => {
        let value = event.target.value;
        let article = {...this.state.article};
        article.summary = value;
        this.setState({
            article: article
        });
    };
    editorOnChange = event => {
        const article_md = event.target.value;
        let article = {...this.state.article};
        article.text = article_md;
        this.setState({
            article: article,
            article_html: markdown.render(article_md)
        });
    };
    editorOnScroll = event => {
        const targetTop = parseInt(this.refs.editorResult.scrollHeight / (event.target.scrollHeight / event.target.scrollTop));
        if(Math.abs(this.refs.editorResult.scrollTop - targetTop) > 2){
            this.refs.editorResult.scrollTop =  targetTop;
        }
    };
    resultOnScroll = event => {
        const targetTop = parseInt(this.refs.editor.scrollHeight / (event.target.scrollHeight / event.target.scrollTop));
        if(Math.abs(this.refs.editor.scrollTop - targetTop) > 2){
            this.refs.editor.scrollTop =  targetTop;
        }
    };
    toggleEditorMode = mode => {
        if(this.state.article.text){
            this.setState({
                article_html: markdown.render(this.state.article.text)
            });
        }
        this.setState({
            editor_type: mode
        });
    };
    saveArticle = () => {
        const { article, saving } = this.state;

        if(saving) return;

        if(!article.id){
            alert('文章数据出错,请刷新重试');
            return;
        }
        //输入验证
        if(article.title.length == 0){
            alert('请输入标题!');
            return;
        }
        if(article.summary.length == 0){
            alert('请输入摘要!');
            return;
        }
        if(article.summary.length == 0){
            alert('请输入文字内容!');
            return;
        }

        const data = {
            ad: article.id,
            article: article
        };

        this.setState({
            saving: true
        });
        http.apiPost('/admin/article/edit', data).then((res) => {
            this.setState({
                saving: false
            });
            if(res.code == 0){
                alert('保存成功~');
            }else{
                alert('服务器返回异常');
            }
        });
    };
    publishArticle = () => {
        const { article, saving } = this.state;

        if(saving) return;

        //输入验证
        if(article.title.length == 0){
            alert('请输入标题!');
            return;
        }
        if(article.summary.length == 0){
            alert('请输入摘要!');
            return;
        }
        if(article.summary.length == 0){
            alert('请输入文字内容!');
            return;
        }

        let newArticle = {
            title: article.title,
            summary: article.summary,
            text: article.text,
            main_img: 1,  //主图先定死
            tags: '',
            categroy: 0,
            stick:0
        };

        const data = {
            ad: -1, //小于0约定为发布文章
            article: newArticle
        };

        this.setState({
            saving: true
        });
        http.apiPost('/admin/article/edit', data).then((res) => {
            this.setState({
                saving: false
            });
            if(res.code == 0){
                alert('发布成功~');
                return this.props.history.push('/admin/article/list');
            }else{
                alert(res.data);
            }
        });
    };
    showSelectPicModel = (confirm) => {
       this.setState({
           showSelectPicModal: true,
           picSelectorConfirm: typeof confirm === 'function' ? confirm : false
       });
    };
    closeSelectPicModel = () => {
        this.setState({
            showSelectPicModal: false
        });
    };
    setMainImg = (id) => {
        if(isNaN(id)) {
            alert('错误的图片');
            return;
        }
        let article = {...this.state.article};
        article.main_img = id;
        this.setState({
            article: article
        });
    };
    render(){
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-article-edit" /></Spin>
        }
        const { article, article_html, editor_type, saving, picSelectorConfirm } = this.state;
        const toggleEditorMode = this.toggleEditorMode;

        let editor;

        switch(editor_type){
            case 0:
                editor =
                    <div className="edit-area">
                        <textarea ref="editor" style={{width: '100%'}} onChange={this.editorOnChange} value={article.text}/>
                    </div>;
                break;
            case 1:
                editor =
                    <div className="edit-area">
                        <div ref="editorResult" className="result-html article-html gey"  style={{width: '100%'}}  dangerouslySetInnerHTML={{
                            __html: article_html
                        }} />
                    </div>;
                break;
            case 2:
                editor =
                    <div className="edit-area">
                        <textarea ref="editor" onChange={this.editorOnChange} style={{marginRight: '1%'}} value={article.text} onScroll={this.editorOnScroll} />
                        <div ref="editorResult" onScroll={this.resultOnScroll}  className="result-html article-html grey" dangerouslySetInnerHTML={{
                            __html: article_html
                        }} />
                    </div>;
                break;
            case 3:
                editor =
                    <div className="edit-area">
                        <div ref="editorResult" className="result-html"  style={{width: '100%'}} >
                            <pre className="result-src"><code className="result-src-content">{article_html}</code></pre>
                        </div>
                    </div>;
        }

        return (
            <div className="admin-article-edit slideInUp animated-fast">
                <PicSelector show={this.state.showSelectPicModal} onClose={this.closeSelectPicModel} onConfirm={picSelectorConfirm} />

                <div className="editor-wrap">
                    <div className="edit-title">
                        <h2>文章编辑~~</h2>
                        <h5>【标题编辑】</h5>
                        <input type="text" value={article.title} onChange={this.titleOnChange} />
                        <h5>【摘要编辑】</h5>
                        <textarea className="summary" value={article.summary} onChange={this.summaryOnChange} />
                        <h5>【主图编辑】</h5>
                        <div className="main-img-wrap">
                            {article.main_img ?
                                <img src={`/api/pic${article.main_img}`}/> : null}
                            <div className="mask" onClick={()=>this.showSelectPicModel(this.setMainImg)}/>
                        </div>
                    </div>
                    <div className="editor">
                        <h5>【内容编辑】</h5>
                        <div className="tools">
                            <a className={editor_type==0 ? 'select' : ''} href="javascript:void(0);" onClick={() => toggleEditorMode(0)}>编辑模式</a>
                            <a className={editor_type==1 ? 'select' : ''} href="javascript:void(0);" onClick={() => toggleEditorMode(1)}>预览</a>
                            <a className={editor_type==2 ? 'select' : ''} href="javascript:void(0);" onClick={() => toggleEditorMode(2)}>双屏模式</a>
                            <a className={editor_type==3 ? 'select' : ''} href="javascript:void(0);" onClick={() => toggleEditorMode(3)}>查看HTML</a>
                        </div>
                        {editor}
                    </div>
                </div>
                <div className="editor-tool-bar">
                    <div className="tool-wrap publish">
                        <div className="tool-title">保存/发布</div>
                        <div className="tool-content">
                            <Link className="btn cancel" to="/admin/article/list">取消</Link>
                            {article.id ?
                                <a className="btn confirm" href="javascript:void(0);" onClick={this.saveArticle}>{!saving ? '保存' : '保存...'}</a>:
                                <a className="btn confirm" href="javascript:void(0);" onClick={this.publishArticle}>{!saving ? '发布' : '发布...'}</a>
                            }
                        </div>
                    </div>
                    <div className="tool-wrap">
                        <div className="tool-title">分类</div>
                        <div className="tool-content">
                            <h4>暂未实现</h4>
                        </div>
                    </div>
                    <div className="tool-wrap">
                        <div className="tool-title">图片上传</div>
                        <div className="tool-content">
                            <a className="btn confirm" href="javascript:void(0);" onClick={this.showSelectPicModel}>选择图片</a>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default PageComponent.withStore(ArticleWrite);