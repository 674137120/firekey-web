// app.js
App({
  onLaunch() {
    // 检查登录状态
    const isLoggedIn = wx.getStorageSync('isLoggedIn');
    if (!isLoggedIn) {
      wx.reLaunch({
        url: '/pages/index/index'
      });
      return;
    }

    // 处理未捕获的Promise错误
    wx.onUnhandledRejection(({reason}) => {
      console.error('Unhandled Promise Rejection:', reason);
    });

    // 处理全局错误
    wx.onError((error) => {
      console.error('Global Error:', error);
    });

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null
  }
})
