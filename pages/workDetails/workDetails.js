// 1、获取应用实例
const app = getApp();
const { link } = require('../../utils/ajax.js');

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        userId: '',                 // 用户id
        userGrade: 1,               // 1 普通用户 2 商户 3 商户学员 4 商户老师
        productId: '',              // 作品Id
        time: '',                   // 作品创建时间
        imgList: [],                // 图片列表
        productDesc: '',            // 作品详情
        isLiked: 0,                 // 点赞数
        likeNum: 0,                 // 点赞
        commentNum: 0,              // 评论数
        isShowLiuYanModel: false,   // 留言对话框
        liuYanInfo: '',
        isMoreShow: false,          // 是否加载更多留言
        isMoreBtnShow: true,        // 是否显示加载更多按钮
        status:'',
        imgheights: [],
        current: 0,
        imgwidth: 750,
        isShowAdvisoryModel: false, // 课程咨询对话框
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log( '99999999',options );
        // 1、获取作品id
        let productId = options.productId;
        if ( options.showLiuYan == 'true' ){
            console.log( "我是点击留言进来的，咋地？" );
            this.setData({
                isShowLiuYanModel: true   
            });
        }
        // 2、将作品id保存在本地
        this.setData({
            productId
        });

        
      let token = wx.getStorageSync('token')
      if(token){
        this.getStorageUserInfo();
      }
      // 判断是否从分享进来的
      if (options.productId && options.userId) {
        let self = this
        // 3、授权登陆
        if (token) {
          // 2、调取获得当前作品的详情
          self.getDataDetails(productId);
        } else {
          wx.login({
            success(res) {
              link.ajax({
                path: '/api/login/login',
                data: {
                  code: res.code,
                }
              }).then(res => {
                // 3.1、存储后台传过来的用户数据
                wx.setStorage({
                  key: 'userInfo',
                  data: res.data.userInfo
                });
                if (res.data.organizationName && res.data.status != 1) {
                  wx.setStorageSync('organizationName', res.data.organizationName)
                  if (res.data.status == 2) {
                    wx.setStorageSync('organizationHeadImg', res.data.organizationLogo)
                  }
                }
                wx.setStorageSync('token', res.data.userInfo.token)
                let token = wx.getStorageSync('token')
                if (token) {
                  self.getDataDetails(productId);
                  self.getStorageUserInfo();
                }
              });
            },
            fail(err) {
              console.log(`用户拒绝授权··········`);
              console.log(err);
            }
          });
        }
      }else{
        this.getDataDetails(productId);
      }

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // this.imageLoad();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
      
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function (e) {
      let name = wx.getStorageSync('userInfo').userName;
      let userId = wx.getStorageSync('userInfo').userId;
      let productId = this.data.productId;
      if (e.from == 'button') {
        return {
          title: `${name}` + ' ' + '邀请您看他的作品',
          path: '/pages/workDetails/workDetails?userId='+userId+'&&productId='+productId,
          imageUrl: wx.getStorageSync('userInfo').userHead,
          success: function (res) {
            wx.showToast({
              title: '分享成功！',
            })
          }
        }
      }
    },
    shareImg(e){
      let img = e.currentTarget.dataset.img;
      let id = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/shareImg/shareImg?img=' + img + '&&id=' + id,
      })
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
        if (url != "pages/loading/loading") {
            wx.getStorage({
                key: 'userInfo',
                success: res => {
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
     * 调取接口：从后台根据作品id获取作品详情
    */
    getDataDetails(id){
        let productId = id;
        console.log(`---- 当前作品的id为：${productId}` );
        link.ajax({
            path: '/api/sampleReels/getProduction',
            data:{
                productionId: productId
            }
        }).then(res=>{
            console.log( res );
            // 保存在本地进行展示
            this.setData({
                time: res.data.createTime,          // 作品创建时间
                imgList: res.data.imgList,          // 图片列表
                productDesc: res.data.productDesc,  // 作品详情
                isLiked: res.data.isLiked,          // 作品是否点赞
                likeNum: res.data.likeNum,          // 点赞数
                commentNum: res.data.commentNum,    // 评论数
                commentContentList: res.data.commentContentList || []  // 相关评论
            });
            // 对当前也textTitle进行修改
          this.setNavigationBarTitleText(`《${res.data.collectionName}》`);

            // 计算第一此图片的高度
            // var imgUrls = this.data.imgList;
            // this.imgH(imgUrls[0]);

        });
    },
    /**
         * 路由跳转 ——去上传作品页面
        */
    gotoUploadPage() {
        wx.navigateTo({
            url: '../uploadWork/uploadWork',
        })
    },
    /**
     * UI—— 计算图片的宽度，让图片自适应高度
    */
    /**
     * 获取图片的高度，把它设置成swiper的高度
    */
    imageLoad: function (e) {
        //获取图片真实宽度
        var imgwidth = e.detail.width,
            imgheight = e.detail.height,
            //宽高比
            ratio = imgwidth / imgheight;
        //计算的高度值
        var viewHeight = 750 / ratio;
        var imgheight = viewHeight;
        var imgheights = this.data.imgheights
        console.log( imgheights );
        //把每一张图片的高度记录到数组里
        imgheights[e.target.dataset['index']] = imgheight;// 改了这里 赋值给当前 index
        this.setData({
            imgheights: imgheights,
        })
    },
    bindchange: function (e) {
        // console.log(e);
        this.setData({
            current: e.detail.current
        })
    },
    /**
     * UI控制—— 打开课程咨询提交对话框
    */
    showAdvisoryModel(){
        // console.log("-------点击了开启");
        this.setData({
            isShowAdvisoryModel: true
        });
    },
    /**
     * UI控制—— 关闭课程咨询提交对话框
     *    以整个页面进行控制
     * */ 
    closeAdvisoryModel(e){
        console.log("-----点击了关闭");
        // console.log( e );
        if (e.target.id == 'advisoryModel' ){
            console.log( '没有点击 from' );
            this.setData({
                isShowAdvisoryModel: false
            });
        }
    },
    /**
     * 接口调用——课程咨询提交
     * 
    */
    advisorySubmit(e){
        console.log(`点击了提交按钮---------`);
        console.log(e);
        let studentName = e.detail.value.submitName;
        let mobile = e.detail.value.submitPhone;
        let remark = e.detail.value.submitRemarks;
        if ( !studentName ){
            wx.showToast({
                title: '请输入学员姓名',
                icon: 'none',
                duration: 2000
            });
        }else if( !mobile ){
            wx.showToast({
                title: '请输入家长电话',
                icon: 'none',
                duration: 2000
            });
        } else if ( !(/^1[3456789]\d{9}$/.test(mobile)) ){
            wx.showToast({
                title: '请输入正确的电话号码',
                icon: 'none',
                duration: 2000
            });
        }else{
            link.ajax({
                path: '/api/organization/getAdvisory',
                data: {
                    organizationId: this.data.userId,
                    studentName: studentName,
                    mobile: mobile,
                    remark: remark
                }
            }).then(res=>{
                console.log( res );
                if( res.code != '100' ){
                    wx.showToast({
                        title: res.msg,
                        icon: 'none',
                        duration: 2000
                    });
                }else{
                    let _this = this;
                    wx.showToast({
                        title: '提交成功',
                        icon: 'none',
                        duration: 2000,
                        success(){
                            // 关闭弹出层
                            _this.setData({
                                isShowAdvisoryModel: false    
                            });
                        }
                    })
                }
            });
        }

    },
    /**
     * 交互—— 点赞
    */
    userDianZan(e) {
        console.log(`---------- 我点赞了！ ----------------`);
        console.log(e);
        let productId = e.currentTarget.dataset.workid;
        let isLike = this.data.isLiked; 
        if (isLike) {
            link.ajax({
              path: '/api/productCollection/like',
                data: {
                  productId: productId
                }
            }).then(res => {
                this.setData({
                    isLiked: !isLike,
                    likeNum: this.data.likeNum -= 1
                });
                wx.showToast({
                    title: '已取消点赞!',
                    icon: 'success',
                    duration: 2000
                });
            });
        } else {
            link.ajax({
                path: '/api/productCollection/like',
                data: {
                    productId
                }
            }).then(res => {
                this.setData({
                    isLiked: !isLike,
                    likeNum: this.data.likeNum += 1
                });
                wx.showToast({
                    title: '已成功点赞!',
                    icon: 'success',
                    duration: 2000
                });

            });
        }
    },   

    /**
     * 交互——留言功能显示
    */
    userLiuYan(e){
        console.log( "我点击留言了" );
        this.setData({
            isShowLiuYanModel: true,
        });
    },
    userLiuYaned(e){
      console.log("我留言了");
      this.setData({
        isShowLiuYanModel:true,
      })
    },
    /**
     * 交互——留言功能提交
    */
    liuYan(e){
        console.log( e );
        this.setData({
            liuYanInfo: e.detail.value,
        });
    },
    /**
     * 加载更多留言交互
    */
    moreLiuYan(){
        console.log( '我点击了更多留言' );
        this.setData({
            isMoreShow: true,
            isMoreBtnShow: false    
        });
    },
    /**
     * 数据提交
    */
    submitLiuYan(){
        if( this.data.liuYanInfo != '' ){
            link.ajax({
                path: '/api/productCollection/comment',
                data:{
                    productId: this.data.productId,
                    content: this.data.liuYanInfo
                }
            }).then((res)=>{
              if(res.code==100){
                console.log(res);
                this.setData({
                  isShowLiuYanModel: false,
                  userId: res.data.userId,
                  status: res.data.status
                });
                // 重新调用页面数据
                this.getDataDetails(this.data.productId);
              }else{
                console.log(res.code);
                wx.showToast({
                  title: '输入内容涉嫌违规，请按规定重新输入',
                  icon:'none',
                  duration:500
                })
              }
            });
        }else{
            wx.showToast({
                title: '请输入要留言的信息!',
                icon: 'none',
                duration: 2000
            });
        }
    },
    /**
     * 动态修改作品集名称
     * 需传入标题
    */
    setNavigationBarTitleText(title) {
        wx.setNavigationBarTitle({
            title: `${title}`
        });
    },
    previewImg(e) {
      let that = this,
        imgsrc = e.currentTarget.dataset.presrc,
        arr = [];
      that.data.imgList.forEach((item,index)=>{
        arr.push(item.filePath);
      })
      //console.log(arr);
      //console.log(preArr)
      wx.previewImage({
        current: imgsrc,
        urls: arr
      })
    },
    hide(){
      console.log("----------------")
      if(this.data.isShowLiuYanModel){
        this.setData({
          isShowLiuYanModel: false
        })
        console.log(this.data.isShowLiuYanModel)
      }
    }
})