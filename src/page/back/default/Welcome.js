/**
 * Created by xiao on 2017/5/14.
 */
import React from 'react';
import PageComponent from '../../../component/common/base/PageComponent';
import Spin from '../../../component/common/tool/Spin';
import './welcome.css';

class Well extends PageComponent {

    render(){
        if(!this.state._pageLoadOver){
            return <Spin loading><div className="admin-article-edit" /></Spin>
        }

        return (
            <div className="admin-welcome">
                <div className="welcome">
                    <h1>欢迎主人~~~///</h1>
                </div>
            </div>
        )
    }
}

export default PageComponent.withStore(Well);