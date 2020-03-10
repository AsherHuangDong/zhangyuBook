// 1、获取应用实例
const app = getApp();
const {
  link
} = require('../../utils/ajax.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    userGrade: 1,
    listStudent: [],
    collectionId: '', // 作品集id  
    isSelectImg: false, // 是否更新了封面图片     
    collectionDesc: '', // 作品说明
    uploadImgFile: '', // 封面上传
    uploadImgFileId: '', // 封面作品id
    collectionName: '', // 作品名称
    studentName: '', // 学员姓名 ： 商类用户才显示
    ispublic: false, // 是否公开
    isselect: false, // 是否选择
    name: '请选择学员',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    console.log('-----------------------进入修改作品集页面');
    console.log(options);
    // 1、接收作品集id
    let shopId = options.shopId;
    this.setData({
      collectionId: shopId
    });

    // 2、启动缓存监测
    this.getStorageUserInfo();

    // 3、调用当前作品集信息接口数据
    this.getNowPageData(shopId);
    this.getListStudent();

  },
  isSelect() {
    let select = !this.data.isselect
    this.setData({
      isselect: select
    })
  },
  getSelect(e) {
    let name = '请选择...'
    let id = ''
    if (e.currentTarget.dataset.id) {
      name = e.currentTarget.dataset.name
      id = e.currentTarget.dataset.id
    }
    this.setData({
      name: name,
      isselect: false,
      studentId: id
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  /**
   * 判断当前页面路由：。
   * 1、如果为启动页->不处理
   * 2、如果为非启动页->则根据userInfo缓存判断
   *      1).存在userInfo缓存   -> 将用户身份数据取出保存在本地data中
   *      2).不存在userInfo缓存 -> 跳转到启动页
   */
  getStorageUserInfo() {
    let url = this.route;
    // console.log( url );
    if (url != "pages/loading/loading") {
      wx.getStorage({
        key: 'userInfo',
        success: res => {
          // console.log(`从缓存中取出授权登陆后的用户信息`);
          console.log(res);
          // 1、对用户状态进行更改
          this.setData({
            userId: res.data.userId,
            userGrade: res.data.status
          });
        },
        fail: err => {
          console.log(`缓存中没有，返回到启动页`);
          wx.redirectTo({
            url: "pages/loading/loading"
          });
        }
      });
    }

  },
  /**
   * 调用接口：获取当前作品集详情
   * 
   */
  getNowPageData(id) {
    let sampleReelsId = id || '';
    if (!sampleReelsId) {
      wx.showToast({
        title: '数据异常,请联系管理员进行处理！',
        icon: 'none',
        duration: 2000,
        success() {
          wx.redirectTo({
            url: '../myHuiGuan/myHuiGuan'
          });
        }
      })
    } else {
      link.ajax({
        path: '/api/sampleReels/getCollection',
        data: {
          sampleReelsId
        }
      }).then(res => {
        console.log(res);
        this.setData({
          collectionDesc: res.data.collectionDetail.samoleReelsDesc, // 作品说明
          uploadImgFile: res.data.path.filePath, // 封面上传
          uploadImgFileId: res.data.path.id, // 封面图片id
          collectionName: res.data.collectionDetail.sampleReelsName, // 作品名称
          ispublic: res.data.collectionDetail.status == 1 ? 1 : 0, // 是否公开
          studentName: this.data.userGrade == 1 ?
            '' :
            res.data.collectionDetail.studentName // 学员姓名(商类用户显示)  
        });
      });
    }
  },
  /**
   * 作品集说明
   */
  collectionDesc(e) {
    console.log(e);
    this.setData({
      collectionDesc: e.detail.value
    });
  },
  /**
   * 封面图片上传
   */
  uploadImg() {
    let _this = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        console.log(res);
        _this.setData({
          uploadImgFile: res.tempFilePaths[0],
          isSelectImg: true
        });
      },
    });
  },
  /**
   * 作品集名称
   */
  collectionName(e) {
    this.setData({
      collectionName: e.detail.value
    });
  },
  /**
   * 学员名称选择：商类用户
   * 
   */
  gotoStudentPage() {
    console.log(`看啥！ 点我干锤子`);
    wx.navigateTo({
      url: '../myStudents/myStudents',
    });
  },
  /**
   * 是否公开
   */
  switch1Change(e) {
    this.setData({
      ispublic: e.detail.value
    });
  },
  /**
   * 提交按钮
   */
  submitAll() {
    if (!this.data.collectionDesc) {
      wx.showToast({
        title: '请输入作品集说明',
        icon: 'none',
        duration: 2000
      });
    } else if (!this.data.uploadImgFile) {
      wx.showToast({
        title: '请上传作品集封面',
        icon: 'none',
        duration: 2000
      });
    } else if (!this.data.collectionName) {
      wx.showToast({
        title: '请输入作品集名称',
        icon: 'none',
        duration: 2000
      });
    } else {
      wx.showLoading({
        title: '提交中',
        mask:true
      })
      console.log('验证通过！--------------');
      console.log(this.data.collectionName);
      console.log(this.data.uploadImgFile);
      console.log("是否重新选择了封面：" + this.data.isSelectImg);
      let _this = this;
      // 进行是否选择了重置封面判断
      if (this.data.isSelectImg) { // 更新了封面
        wx.uploadFile({
          url: 'https://zhangyu.liangziqishi.shop/api/user/uploadFile',
          filePath: this.data.uploadImgFile,
          name: 'img',
          header: {
            //和服务器约定的token, 一般也可以放在header中
            token: wx.getStorageSync("token"),
            "Content-Type": "multipart/form-data" // 配置必须
          },
          success({data}) {
            console.log(JSON.parse(data).code);
            if (JSON.parse(data).code == 100) {
              let [{id}] = JSON.parse(data).data; // 图片id
              // if (_this.data.userGrade == 2 || _this.data.userGrade == 4) { // 机构 用户
              // } else { // 普通用户
              link.ajax({
                path: '/api/sampleReels/editCollection',
                data: {
                  collectionId: _this.data.collectionId, // 作品集id
                  description: _this.data.collectionDesc, // 作品集说明
                  fileId: id, // 封面上传
                  sampleReelsName: _this.data.collectionName, // 作品名称
                  status: _this.data.ispublic ? '1' : '2', // 是否公开
                }
              }).then(res => {
                console.log(res);
                if (res.code == 100) {
                  wx.showToast({
                    title: '修改作品集成功!',
                    icon: 'success',
                    duration: 2000,
                    success() {
                      wx.redirectTo({
                        url: '../myHuiGuan/myHuiGuan',
                      });
                    }
                  });
                }

              });
              //}

            } else {
              wx.showToast({
                title: '图片中含有涉嫌违规的信息，请选择规范图片重新上传',
                icon: 'none',
                duration: 2000
              })
            }

          }
        });
      } else { // 不为临时文件：直接调用变参接口
        // if (_this.data.userGrade != 1) { // 机构 用户
        // } else { // 普通用户
        console.log('没有新选择作品')
        // if (JSON.parse(data).code == 100) {
        //   let [{id}] = JSON.parse(data).data; // 图片id
          // if (_this.data.userGrade == 2 || _this.data.userGrade == 4) { // 机构 用户
          // } else { // 普通用户
          link.ajax({
            path: '/api/sampleReels/editCollection',
            data: {
              collectionId: _this.data.collectionId, // 作品集id
              description: _this.data.collectionDesc, // 作品集说明
              fileId: _this.data.uploadImgFileId, // 封面上传
              sampleReelsName: _this.data.collectionName, // 作品名称
              status: _this.data.ispublic ? '1' : '2', // 是否公开
            }
          }).then(res => {
            console.log(res);
            if (res.code == 100) {
              wx.showToast({
                title: '修改作品集成功!',
                icon: 'success',
                duration: 2000,
                success() {
                  wx.redirectTo({
                    url: '../myHuiGuan/myHuiGuan',
                  });
                }
              });
            }
          });
        //}
        //}
        //}

      //  else {
      //   wx.showToast({
      //     title: '图片中含有涉嫌违规的信息，请选择规范图片重新上传',
      //     icon: 'none',
      //     duration: 2000
      //   })
      // }
      }
    }
  },
  getListStudent() {
    let organizationId = wx.getStorageSync('userInfo').userId;
    link.ajax({
      path: '/api/organization/getStudent',
      data: {
        organizationId: organizationId,
        status: 3
      }
    }).then(res => {
      if (res.data.noStudent != 0) {
        this.setData({
          listStudent: res.data.allInfo
        });
      } else {
        // 显示没有拿数据  去创建 和 去首页
        console.log(`-----mylist 无数据`);
      }
    });
  },
})