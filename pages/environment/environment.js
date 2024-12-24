Page({
  data: {
    location: '定位中...',
    locationInfo: null,
    environmentData: {
      temperature: '--',
      humidity: '--',
      pm25: '--',
      wind: '--'
    },
    refreshing: false
  },

  onLoad() {
    this.startLocationUpdate();
    this.startEnvironmentDataUpdate();
  },

  updateLocationInfo(location) {
    console.log('更新位置信息:', location);
    // 使用高德地图API进行逆地址解析
    wx.request({
      url: 'https://restapi.amap.com/v3/geocode/regeo',
      data: {
        key: '2ad5e1decc2657c5e55ab67076cc1076',
        location: `${location.longitude},${location.latitude}`,
        output: 'JSON',
        extensions: 'all'
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        console.log('高德地图响应:', res);
        if (res.data && res.data.status === '1' && res.data.regeocode) {
          const regeocode = res.data.regeocode;
          const addressComponent = regeocode.addressComponent;
          
          // 优先使用地址组件构建地址
          let address = '';
          if (addressComponent) {
            const province = addressComponent.province || '';
            const city = addressComponent.city || '';
            const district = addressComponent.district || '';
            const township = addressComponent.township || '';
            const street = addressComponent.streetNumber?.street || '';
            
            // 如果是直辖市，省份名称和城市名称相同，只显示一个
            if (city && city !== province) {
              address = province + city + district + township + street;
            } else {
              address = city + district + township + street;
            }
          }
          
          // 如果地址组件构建失败，使用格式化地址
          if (!address && regeocode.formatted_address) {
            address = regeocode.formatted_address;
          }
          
          // 如果还是没有地址，使用位置名称
          if (!address && location.name) {
            address = location.name;
          }
          
          // 如果还是没有，使用POI信息
          if (!address && regeocode.pois && regeocode.pois.length > 0) {
            address = regeocode.pois[0].name;
          }
          
          this.setData({
            location: address || '未知位置',
            locationInfo: location
          });
        } else {
          // API 返回错误，尝试使用原始位置信息
          const address = location.name || location.address;
          this.setData({
            location: address || '未知位置',
            locationInfo: location
          });
        }
        // 无论地址解析是否成功，都更新环境数据
        this.fetchEnvironmentData(location);
      },
      fail: (error) => {
        console.error('获取地址失败', error);
        // 使用原始位置信息
        const address = location.name || location.address;
        this.setData({
          location: address || '未知位置',
          locationInfo: location
        });
        this.fetchEnvironmentData(location);
      }
    });
  },

  startLocationUpdate() {
    // 先检查位置权限
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.userLocation']) {
          // 如果没有权限，获取权限
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.getAndUpdateLocation();
            },
            fail: () => {
              // 用户拒绝授权，引导用户打开设置页面
              wx.showModal({
                title: '需要位置权限',
                content: '请允许使用位置信息以获取当前环境数据',
                confirmText: '去设置',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    wx.openSetting();
                  }
                }
              });
            }
          });
        } else {
          // 已有权限，直接获取位置
          this.getAndUpdateLocation();
        }
      }
    });
  },

  getAndUpdateLocation() {
    // 获取位置
    wx.getLocation({
      type: 'gcj02',
      isHighAccuracy: true,
      success: (res) => {
        console.log('获取位置成功:', res);
        this.updateLocationInfo(res);
        
        // 开启实时定位更新
        wx.startLocationUpdate({
          success: () => {
            console.log('开启实时定位成功');
            wx.onLocationChange((res) => {
              this.updateLocationInfo(res);
            });
          },
          fail: (err) => {
            console.error('开启实时定位失败', err);
            wx.showToast({
              title: '实时定位失败',
              icon: 'none'
            });
          }
        });
      },
      fail: (err) => {
        console.error('获取位置失败', err);
        wx.showToast({
          title: '定位失败，请检查权限设置',
          icon: 'none'
        });
      }
    });
  },

  startEnvironmentDataUpdate() {
    // 每5分钟更新一次环境数据
    this.fetchEnvironmentData(this.data.locationInfo);
    setInterval(() => {
      if (this.data.locationInfo) {
        this.fetchEnvironmentData(this.data.locationInfo);
      }
    }, 300000); // 5分钟
  },

  async fetchEnvironmentData(location) {
    if (!location) return;
    
    try {
      // 先通过经纬度获取城市编码
      wx.request({
        url: 'https://restapi.amap.com/v3/geocode/regeo',
        data: {
          key: '2ad5e1decc2657c5e55ab67076cc1076',
          location: `${location.longitude},${location.latitude}`,
          output: 'JSON'
        },
        success: (geoRes) => {
          if (geoRes.data.status === '1' && geoRes.data.regeocode) {
            const adcode = geoRes.data.regeocode.addressComponent.adcode;
            
            // 使用城市编码获取天气
            wx.request({
              url: 'https://restapi.amap.com/v3/weather/weatherInfo',
              data: {
                key: '2ad5e1decc2657c5e55ab67076cc1076',
                city: adcode,  // 使用城市编码
                extensions: 'base',
                output: 'JSON'
              },
              success: (weatherRes) => {
                console.log('天气数据:', weatherRes.data);
                if (weatherRes.data.status === '1' && weatherRes.data.lives && weatherRes.data.lives.length > 0) {
                  const weatherData = weatherRes.data.lives[0];
                  this.setData({
                    environmentData: {
                      temperature: weatherData.temperature || '--',
                      humidity: weatherData.humidity || '--',
                      pm25: weatherData.pm25 || '--',
                      wind: weatherData.winddirection && weatherData.windpower ? 
                            `${weatherData.winddirection}风${weatherData.windpower}级` : '--'
                    }
                  });
                } else {
                  console.error('获取天气数据失败:', weatherRes.data);
                }
              },
              fail: (err) => {
                console.error('获取天气数据失败', err);
              }
            });
          }
        },
        fail: (error) => {
          console.error('获取城市编码失败', error);
        }
      });
    } catch (error) {
      console.error('获取环境数据失败', error);
    }
  },

  // 添加随机数据生成方法（作为备选）
  getRandomTemp() {
    return (Math.random() * 15 + 15).toFixed(1); // 15-30度
  },

  getRandomHumidity() {
    return Math.floor(Math.random() * 30 + 40); // 40-70%
  },

  getRandomPM25() {
    return Math.floor(Math.random() * 50 + 10); // 10-60
  },

  getRandomWind() {
    const directions = ['东', '南', '西', '北', '东北', '东南', '西南', '西北'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    const speed = Math.floor(Math.random() * 5 + 1); // 1-6级
    return `${direction}风${speed}级`;
  },

  // 手动刷新数据
  onRefresh() {
    // 转到实时监测页面
    wx.navigateTo({
      url: '/pages/drone/drone',
      success: () => {
        console.log('跳转成功');
      },
      fail: (error) => {
        console.error('跳转失败', error);
        wx.showToast({
          title: '跳转失败',
          icon: 'none'
        });
      }
    });
  },

  // 选择位置
  onChooseLocation() {
    wx.chooseLocation({
      success: (res) => {
        console.log('选择的位置:', res);
        // 直接更新位置示
        this.setData({
          location: res.name || res.address || '未知位置',
          locationInfo: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        });

        // 使用高德地图API进行逆地址解析获取详细的地址信息
        wx.request({
          url: 'https://restapi.amap.com/v3/geocode/regeo',
          data: {
            key: '2ad5e1decc2657c5e55ab67076cc1076',
            location: `${res.longitude},${res.latitude}`,
            output: 'JSON'
          },
          success: (geoRes) => {
            console.log('高德地图响应:', geoRes.data);
            if (geoRes.data.status === '1' && geoRes.data.regeocode) {
              const formatted = geoRes.data.regeocode.formatted_address;
              this.setData({
                location: formatted || res.name || res.address
              });
            }
          }
        });

        // 获取新位置的环境数据
        this.fetchEnvironmentData({
          latitude: res.latitude,
          longitude: res.longitude
        });
      },
      fail: (err) => {
        console.error('选择位置失败:', err);
        wx.showToast({
          title: '选择位置失败',
          icon: 'none'
        });
      }
    });
  }
}); 