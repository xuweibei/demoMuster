'use strict';
import { getCookie } from '@/utils/index';
export const env = {
    // serverURL: 'http://118.25.104.143:8080/edu',
    // serverURL: 'http://10.10.49.67:8080',
    // serverURL: 'http://10.10.50.243:8080',//徐建丰
    // serverURL: 'http://10.10.20.16:5001', 
    // serverURL: 'http://10.10.20.233:8080',//杨振林 
    serverURL: 'http://10.10.20.188:8080',//陈晓伟
    // serverURL: 'http://10.10.20.16:5001',
    // serverURL: 'http://10.10.51.117:8080',
    // serverURL: 'http://10.10.20.214:8080',
    // serverURL: 'http://10.10.20.21:8080',
    // serverURL: 'http://10.10.20.241:8081',
    // serverURL: 'http://10.10.51.114:8080',
    // serverURL: 'http://localhost:8080',
    // serverURL: 'http://10.10.20.21:8088',
    // serverURL: 'https://zbesdemo.zbgedu.com',
    // serverURL: 'http://123.126.152.178:8198',
    // serverURL: 'http://10.10.20.16:8006',
    // serverURL: 'https://zbes.zbgedu.com',
    // serverURL: 'https://zbesdev.zbgedu.com',
    //testServerURL: 'http://192.168.0.165:8080',
    product: false,//false=开发模式
    extendAllMenus: 4,//菜单过少全部展开
    defaultPageSize: 10,
    appName: (window.Global_AppName || '中博教育'),
    copyright: (window.Global_Copyright || `中博教育 版权所有 © ${new Date().getFullYear()} zbjy.com`),
    getToken: function () {
        //在请求发送之前做一些事
        //var token = window.localStorage.getItem('token') || '';
        var token = getCookie('token') || '';
        return token;
    },
    getEducode: function () {
        //在请求发送之前做一些事
        //var token = window.localStorage.getItem('educode') || '';2
        var token = getCookie('educode') || '';
        return token;
    },
    loginHandler: function () {
        // let loginUrl = 'https://oa.zbgedu.com';//oa正式入口
        
        let loginUrl = '#login';//本地
        // let loginUrl = 'https://oademo.zbgedu.com';//oa测试入口
        //重新登录
        if (loginUrl.indexOf('/') == 0) {
            window.location.href = '#' + loginUrl;
        }
        else {
            window.location.href = loginUrl;
        }
    },
    applicationId: 1,
    // getFeeQrCodeUrl: 'https://zbesdemo.zbgedu.com//edupay/payRecord/requestPay',
    // getFeeQrCodeUrl: 'https://pay.zbgedu.com//edupay/payRecord/requestPay',
    getFeeQrCodeUrl: 'http://123.126.152.178:8199//edupay/payRecord/requestPay',
    // getFeeQrCodeUrl: 'http://10.10.20.16:8006//edupay/payRecord/requestPay',
};
