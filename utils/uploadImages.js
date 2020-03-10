/**
 * 上传多张图片
 * data: 
 * */ 
const uploadImages = data=>{
    let _this = this;               
    let i = data.i ? data.i : 0;                    //当前上传的哪张图片 
    let success = data.success ? data.success : 0;  //上传成功的个数         
    let fail = data.fail ? data.fail : 0;           //上传失败的个数
    let imgsIdArr = [];                             // 上传成功后返回的图片id，需要重组到该里面
    wx.uploadFile({
        url: 'https://zhangyu.liangziqishi.shop/api/user/uploadFile',
        filePath: data[i],
        name: 'file',
        header: {//和服务器约定的token, 一般也可以放在header中
            token: wx.getStorageSync("token"),
            "Content-Type": "multipart/form-data" // 配置必须
        },
        success({ data }){
            let [{ id }] = JSON.parse(data).data; // 图片id
            success++;//图片上传成功，图片上传成功的变量+1
            console.log(data);
            imgsIdArr.push(id);
            console.log(i);
        },
        fail(err){
            fail++;//图片上传失败，图片上传失败的变量+1
            console.log('fail:' + i + "fail:" + fail);
        },
        complete: () => {
            console.log(i);
            i++;    //这个图片执行完上传后，开始上传下一张            
            if (i == data.length) {   //当图片传完时，停止调用          
                console.log('执行完毕');
                console.log('成功：' + success + " 失败：" + fail);
                console.log( imgsIdArr );
            } else {//若图片还没有传完，则继续调用函数                
                console.log(i);
                data.i = i;
                data.success = success;
                data.fail = fail;
                _this.uploadImages(data);
            }
        }
    });

}

module.exports = {
    uploadImages: uploadImages
}