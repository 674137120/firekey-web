Page({
  data: {
    searchValue: '',
    searchResults: []
  },

  onSearch(e) {
    const keyword = e.detail.value;
    if (!keyword) return;

    // 使用高德地图POI搜索
    wx.request({
      url: 'https://restapi.amap.com/v3/place/text',
      data: {
        key: 'c2620f2feadba79eb75ca2df5faf8b9c',
        keywords: keyword,
        city: '成都',
        output: 'JSON'
      },
      success: (res) => {
        if (res.data.status === '1' && res.data.pois) {
          this.setData({
            searchResults: res.data.pois
          });
        }
      }
    });
  },

  onSelectLocation(e) {
    const location = e.currentTarget.dataset.location;
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    // 更新上一页数据
    prevPage.setData({
      location: location.name,
      locationInfo: {
        latitude: parseFloat(location.location.split(',')[1]),
        longitude: parseFloat(location.location.split(',')[0])
      }
    });

    // 获取新位置的环境数据
    prevPage.fetchEnvironmentData({
      latitude: parseFloat(location.location.split(',')[1]),
      longitude: parseFloat(location.location.split(',')[0])
    });

    wx.navigateBack();
  }
}); 