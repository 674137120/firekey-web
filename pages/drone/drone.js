Page({
  data: {
    zoomLevel: 1,
    direction: 'none',
    cameraContext: null,
    devicePosition: 'back'  // 默认使用后置摄像头
  },

  onLoad() {
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: '实时监测'
    });
    
    // 创建相机上下文
    this.setData({
      cameraContext: wx.createCameraContext()
    });
  },

  // 切换摄像头
  switchCamera() {
    this.setData({
      devicePosition: this.data.devicePosition === 'back' ? 'front' : 'back'
    });
  },

  // 拍照
  takePhoto() {
    const cameraContext = this.data.cameraContext;
    if (!cameraContext) return;

    cameraContext.takePhoto({
      quality: 'high',
      success: (res) => {
        // 保存照片到相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempImagePath,
          success: () => {
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            });
          },
          fail: () => {
            wx.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        });
      },
      fail: () => {
        wx.showToast({
          title: '拍照失败',
          icon: 'none'
        });
      }
    });
  },

  onZoomIn() {
    this.setData({
      zoomLevel: Math.min(this.data.zoomLevel + 0.1, 2)
    });
  },

  onZoomOut() {
    this.setData({
      zoomLevel: Math.max(this.data.zoomLevel - 0.1, 0.5)
    });
  },

  onDirectionControl(e) {
    const direction = e.currentTarget.dataset.direction;
    this.setData({ direction });
    // 这里添加实际的方向控制逻辑
  },

  onTakePhoto() {
    this.takePhoto();
  },

  onPlayback() {
    this.switchCamera();
  },

  // 错误处理
  onCameraError(e) {
    wx.showToast({
      title: '相机启动失败',
      icon: 'none'
    });
    console.error('相机错误:', e.detail);
  }
}); 