Component({

  behaviors: [],

  // 属性定义（详情参见下文）
  properties: {
    //必须指定type
    item: {
      type: Object
    },
    text: {
      type: String,
      value: 'default value',
    },
    key: {
      type: String,
    },
    
  },

  data: {
  }, // 私有数据，可用于模板渲染

  lifetimes: {
    // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
    attached: function () { },
    moved: function () { },
    detached: function () { },
  },

  // 生命周期函数，可以为函数，或一个在methods段中定义的方法名
  attached: function () { }, // 此处attached的声明会被lifetimes字段中的声明覆盖
  ready: function () { 
  },

  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function () { },
    hide: function () { },
    resize: function () { },
  },

  methods: {
    remove: function() {
      this.triggerEvent('myevent', this.properties.key);
    },
    radioChange: function(){
      let checked = !this.properties.item.status;

      let status = checked ? 1 : 0;
      let url = checked ? '../../images/icon/yiwancheng.png' : '../../images/icon/weiwancheng.png'
      
      this.triggerEvent('changeStatus', {status:status,key:this.properties.key, url:url});
    }
  }

})