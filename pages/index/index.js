// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    username: '',
    password: '',
  },

  handleLogin() {
    const { username, password } = this.data;
    if (!username || !password) {
      wx.showToast({
        title: '请输入用户名和密码',
        icon: 'none'
      });
      return;
    }

    // 验证管理员账号
    if (username === 'admin' && password === '123456') {
      wx.showLoading({
        title: '登录中...',
      });

      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500,
          success: () => {
            // 登录成功后保存登录状态
            wx.setStorageSync('isLoggedIn', true);
            wx.setStorageSync('userRole', 'admin');
            
            // 使用 reLaunch 而不是 switchTab
            wx.reLaunch({
              url: '/pages/environment/environment'
            });
          }
        });
      }, 1000);
    } else {
      wx.showToast({
        title: '用户名或密码错误',
        icon: 'none'
      });
    }
  },

  onForgetPassword() {
    wx.showActionSheet({
      itemList: ['通过手机号找回', '通过邮箱找回'],
      success: (res) => {
        if (res.tapIndex === 0) {
          this.handlePhoneRecovery();
        } else if (res.tapIndex === 1) {
          this.handleEmailRecovery();
        }
      }
    });
  },

  handlePhoneRecovery() {
    wx.navigateTo({
      url: '/pages/recovery/phone-recovery'
    });
  },

  handleEmailRecovery() {
    wx.navigateTo({
      url: '/pages/recovery/email-recovery'
    });
  },

  handleWechatLogin() {
    wx.showLoading({
      title: '正在登录...',
    });
    
    // 微信登录逻辑
    wx.login({
      success: (res) => {
        if (res.code) {
          // 发送 res.code 到后台换取 openId, sessionKey, unionId
          console.log('微信登录成功:', res.code);
          wx.hideLoading();
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          });
        }
      }
    });
  },

  handlePhoneLogin() {
    wx.navigateTo({
      url: '/pages/login/phone-login'
    });
  }
})
