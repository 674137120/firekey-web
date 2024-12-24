Page({
  data: {
    phone: '',
    code: '',
    newPassword: '',
    confirmPassword: '',
    counting: false,
    countDown: 60
  },

  sendCode() {
    if (!/^1\d{10}$/.test(this.data.phone)) {
      wx.showToast({
        title: '请输入正确的手机号',
        icon: 'none'
      });
      return;
    }

    this.setData({
      counting: true
    });

    this.startCountDown();

    // 发送验证码的API调用
    wx.showToast({
      title: '验证码已发送',
      icon: 'success'
    });
  },

  startCountDown() {
    let count = 60;
    const timer = setInterval(() => {
      count--;
      this.setData({
        countDown: count
      });
      if (count === 0) {
        clearInterval(timer);
        this.setData({
          counting: false,
          countDown: 60
        });
      }
    }, 1000);
  },

  handleSubmit() {
    const { phone, code, newPassword, confirmPassword } = this.data;
    
    if (!phone || !code || !newPassword || !confirmPassword) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'none'
      });
      return;
    }

    // 调用重置密码API
    wx.showLoading({
      title: '提交中...',
    });

    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '密码重置成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }, 1500);
  }
}); 