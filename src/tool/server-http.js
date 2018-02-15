/**
 * Created by xiao on 2017/5/20.
 */
import axios from 'axios';
axios.defaults.timeout = 15000;
import querystring from 'querystring';

const apiMethods = {
    apiGet(url, data) {
        return new Promise((resolve, reject) => {
            axios.get(url, data, {
                method: 'get'
            }).then((response) => {
                resolve(response.data);
            }, (response) => {
                reject(response);
            })
        })
    },
    apiPost(url, data) {
        return new Promise((resolve, reject) => {
            axios.post(url, querystring.stringify(data),{
                method: 'post',
                headers: {'Content-Type': 'application/x-www-form-urlencoded'}
            }).then((response) => {
                resolve(response.data);
            }).catch((response) => {
                reject(response);
            })
        })
    },
    apiPost2(url, data, header = {}) {
        return new Promise((resolve, reject) => {
            axios.post(url, querystring.stringify(data),{
                method: 'post',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    ...header
                }
            }).then((response) => {
                resolve(response.data);
            }).catch((response) => {
                reject(response);
            })
        })
    },
    apiFile(url, data) {
        return new Promise((resolve, reject) => {
            axios.post(url, data,{
                method: 'post',
                headers: {'Content-Type': 'multipart/form-data'}
            }).then((response) => {
                resolve(response.data);
            }).catch((response) => {
                reject(response);
            })
        })
    }
};

export default apiMethods;