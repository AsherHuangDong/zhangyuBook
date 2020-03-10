// 请求类封装
class _ajax {
  constructor() {
      this.baseURL = "https://zhangyu.liangziqishi.shop";
  }


  /* 
   * ajax 请求封装  author displayli  2019.05.27
   * @path 路径 
   * @data requestBody
   * @header null
   * @method 请求方法 「默认为post」
   * @dataType json
   * @success 成功回调函数
   * @fail 失败回调函数
   */
  ajax({ path, data, header, method, dataType, success, fail }) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.baseURL + path,
        data: data || {},
        header: header || {
          "content-type": "application/json",
            token: wx.getStorageSync("token") || '' 
        },
        method: method || "POST",
        dataType: dataType || "json",
        success: ({ data }) => {
          // 如果code == 100 说明成功
          if (data.code==100) {
            if (typeof success == 'function') {
              success(data);
            } else {
              resolve(data);
            }
          } else if(data.code == 400) {
            wx.showToast({
              title: data.msg,
              icon: "none",
              duration: 2000
            });
          }
        },
        fail: err => {
          if (typeof fail == 'function') {
            fail(err);
          } else {
            reject(err);
          }
          console.error(new Error(err));
        }
      });
    });
  }
}

// 对外公开
module.exports = {
  link: new _ajax()
};