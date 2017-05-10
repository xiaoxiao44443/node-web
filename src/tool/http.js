/**
 * Created by xiao on 2017/4/28.
 */
import axios from 'axios';
import nprogress from 'nprogress';
axios.defaults.timeout = 1000 * 15;
axios.defaults.headers['Content-Type'] = 'application/json';
axios.defaults.headers['If-Modified-Since'] = '0';

const apiMethods = {
    apiGet(url, data) {
        nprogress.start();
        return new Promise((resolve, reject) => {
            axios.get(url, data).then((response) => {
                nprogress.done();
                resolve(response.data);
            }, (response) => {
                nprogress.done();
                document.title = 'Error';
                reject(response);
                this.handelResponse(response);
            })
        })
    },
    apiPost(url, data) {
        nprogress.start();
        return new Promise((resolve, reject) => {
            axios.post(url, data).then((response) => {
                nprogress.done();
                resolve(response.data);
            }).catch((response) => {
                nprogress.done();
                document.title = 'Error';
                reject(response);
                this.handelResponse(response);
            })
        })
    },
    handelResponse(res) {
        if(res.response){
            if(res.response.status == 500){
                this.showError('服务器返回异常');
            }else{
                this.showError(`请求失败：\n${response.message}`);
            }
        }else{
            this.showError('网络错误，请求失败');
        }
    },
    handleError(res) {
        if (res.code) {
        } else {
            console.log('default error')
        }
    },
    showError(msg){
        alert(msg);
    }
};

export default apiMethods;