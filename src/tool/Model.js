/**
 * Created by xiao on 2017/2/26.
 */
import mysql from 'mysql';
import { database as DB } from '../config';

/**
 * 实例化一次只能query一次，如果需要多次需要参数autoEnd = false;然后在使用完毕后调用end方法
 * @param autoEnd
 * @constructor
 */
const Model = function(autoEnd = true) {
    let _pool, _error, _autoEnd, _connection, _startTrans;
    _pool = mysql.createPool(DB);
    _error = null;
    _autoEnd = autoEnd;
    _connection = null;
    _startTrans = false;
    if(autoEnd){
        _pool.on('release', async connection => {
            await this.end();
        });
    }

    //startTrans
    this.startTrans = async function () {
        return  new Promise((resolve, reject) => {
            _pool.getConnection((err, connection) => {
                if(err){
                    _error = err;
                    reject(err);
                    endTrans();
                }else{
                    connection.beginTransaction(err => {
                        if(err){
                            _error = err;
                            reject(err);
                            if(_autoEnd) _pool.end();
                        }else{
                            _connection = connection;
                            _startTrans = true;
                            resolve();
                        }
                    });
                }
            });
        });
    };

    const endTrans = function () {
        _startTrans = false;
        if(_connection) _connection.release();
        _connection = null;
        if(_autoEnd) _pool.end();
    };

    //commit
    this.commit = async function () {
        return  new Promise((resolve, reject) => {
            if(!_startTrans){
                reject(new Error('Transaction is not beginning!'));
            }else{
                _connection.commit(err => {
                    if(err){
                        _connection.rollback(() => {
                            endTrans();
                            reject(err);
                        });
                    }else{
                        endTrans();
                        resolve();
                    }
                });
            }
        });
    };

    //rollback
    this.rollback = async function () {
        return  new Promise((resolve, reject) => {
            if(!_startTrans){
                reject(new Error('Transaction is not beginning!'));
            }else{
                _connection.rollback(() => {
                    endTrans();
                    resolve();
                });
            }
        });
    };

    this.query = async function (sql, values) {
        return new Promise((resolve, reject) => {

            //事务不断开连接[connection]
            if(_startTrans){
                _connection.query(sql, values, (error, results, fields) => {
                    if(error === null){
                        resolve({results, fields});
                    }else{
                        _connection.rollback(() => {
                            endTrans();
                            reject(error);
                        });
                    }
                });
            }else{
                _pool.getConnection((err, connection) => {
                    if(err){
                        _error = err;
                        reject(err);
                        endTrans();
                    }else{
                        connection.query(sql, values, (error, results, fields) => {
                            if(error === null){
                                resolve({results, fields});
                            }else{
                                reject(error);
                            }
                            connection.release();
                        });
                    }
                });
            }
        });
    };

    this.end = async function () {
        return new Promise((resolve, reject) => {
            _pool.end(err => {
                if(err){
                    reject(err);
                }else{
                    resolve();
                }
            });
        });
    };

    this.getLastError = function () {
        return _error;
    };

};


async function test() {
    try {
        let M = new Model();
        let result;
        result = await M.query('SHOW DATABASES');
        console.log(result);
        await M.end();
    }catch (ex){
        console.warn(ex);
    }

}

export default Model;
