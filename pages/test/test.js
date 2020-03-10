//index.js
//获取应用实例
const app = getApp()
const { link } = require('../../utils/ajax.js');

Page({
    data: {
        condition: false
    },
    onLoad() {
        // 测试自己封装的ajax
        link.ajax({ path: '/api/login/login', method: 'POST' }).then(res => {
            console.log(res);
        })
    },
    formSubmit: function (e) {
        console.log('form发生了submit事件，携带数据为：', e)
    },
})
