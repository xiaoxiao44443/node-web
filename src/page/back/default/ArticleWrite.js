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
import PicSelector from '../../../component/back/default/common/PicSelector';

class ArticleWrite extends PageComponent {
    constructor(props){
        super(props);
        const state = {
            article:{
                title: '',
                text: '',
                summary: '',
                main_img: 0,
            },
            article_title: '',
            article_html: '',
            editor_type: 0,  //0:md编辑模式 1:预览模式 2:双栏模式 3:html查看,
            saving: false,
            showSelectPicModal: false
        };

       this._setDefaultState(state);
    }
    componentWillUnmount(){
        clearTimeout(this.editorScroll);
        clearTimeout(this.resultScroll);
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
        //防止抖动
        if (this.resultScroll) return;
        if (this.editorScroll) clearTimeout(this.editorScroll);
        this.editorScroll = setTimeout(() => {
            this.editorScroll = false;
        }, 500);
        const editorResult = this.refs.editorResult;
        const ele = event.target;
        const targetTop = parseInt((editorResult.scrollHeight - editorResult.offsetHeight) / ((ele.scrollHeight - ele.offsetHeight) / ele.scrollTop));
        if(Math.abs(editorResult.scrollTop - targetTop) > 2){
            editorResult.scrollTop =  targetTop;
        }
    };
    resultOnScroll = event => {
        if (event.target.nodeName == 'PRE') return;
        //防止抖动
        if (this.editorScroll) return;
        if (this.resultScroll) clearTimeout(this.resultScroll);
        this.resultScroll = setTimeout(() => {
            this.resultScroll = false;
        }, 500);
        const editor = this.refs.editor;
        const ele = event.target;
        const targetTop = parseInt((editor.scrollHeight - editor.offsetHeight) / ((ele.scrollHeight -ele.offsetHeight) / ele.scrollTop));
        if(Math.abs(editor.scrollTop - targetTop) > 2){
            editor.scrollTop =  targetTop;
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
                alert(res.data);
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
            main_img: article.main_img,
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