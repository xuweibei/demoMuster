
/*
   组件实例方法扩展，将Component经常复用的一下方法归纳使用。
*/
import React from 'react';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider } from 'antd';
import moment from 'moment';

//搜索表单项布局
export const searchFormItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 12 },
};
export const searchFormItemLayout24 = {
  labelCol: { span: 4 },
  wrapperCol: { span: 19 },
};
export const searchFormItemLayout16 = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

//载入业务字典，支持多个业务字典同时加载
export function loadBizDictionary(dicTypes: Array) {
  //把不在缓存中的字典筛选出来
  let needLoadDicTypes = [];
  //准备接收对象，一起将对象下的字典属性字典导入到state中
  let stateDicTypes = {};
  dicTypes.map((item) => {
    //通过动态计算取值
    let findItem = this.props.Dictionarys[item];
    if (!findItem && item != 'dic_Status' && item != 'dic_YesNo'
    && item != 'dic_Allow' && item != 'dic_OrgType' && item != 'dic_IsSee'
    && item != 'dic_sex'
  ) {//状态字典默认不提供，需要虚拟
      needLoadDicTypes.push(item);
      findItem = [];//提前占位，等待服务端加载更新
    }
    else if (item == 'dic_Status') {//启用停用类型
      findItem = [{ title: '启用', value: '1', state: 1 }, { title: '停用', value: '0', state: 1 }]
    }
    else if (item == 'dic_IsSee') {//项目是否可见
      findItem = [{ title: '不可见', value: '1', state: 1 }, { title: '可见', value: '0', state: 1 }]
    }
    else if (item == 'dic_YesNo') {//是否类型
      findItem = [{ title: '是', value: '1', state: 1 }, { title: '否', value: '0', state: 1 }]
    }
    else if (item == 'dic_Allow') {//是否类型
      findItem = [{ title: '允许', value: '1', state: 1 }, { title: '不允许', value: '0', state: 1 }]
    }
    else if (item == 'dic_OrgType') {//机构类型
      findItem = [
        { title: '总部', value: '1', state: 1 },
        { title: '大区', value: '2', state: 1 },
        { title: '分部', value: '3', state: 1 },
        { title: '大客户', value: '4', state: 1 },
        { title: '区域', value: '5', state: 1 },
        { title: '教学点', value: '6', state: 1 }
      ];
    }
    else if(item == 'dic_sex'){
      findItem = [{title: '男', value: '1', state: 1}, {title: '女', value: '2', state: 1}]
    }
    //动态设置属性值
    eval(`stateDicTypes.${item}=findItem`);
  });
  if(stateDicTypes){
    //用于清除缓存中的 字典添加了其他项的数据（比如“全部”等）
    for(var d in stateDicTypes){
      if(stateDicTypes[d] && stateDicTypes[d].length){
        for(var i = 0; i < stateDicTypes[d].length; i++){
          var s = stateDicTypes[d][i];
          if(s.title && s.value == ""){
            stateDicTypes[d].splice(i, 1);
            break;
          }
        }
      }
    }
  }
  //先按照要求将字典推入state中（不存在的字典先空数组占位）
  this.setState({ ...stateDicTypes });
  //远程请求加载不存在的字典
  if (needLoadDicTypes.length > 0) {
    if(dicTypes.indexOf('reg_source_child')>-1){//查询学生来源子项
      this.props.systemCommonChild(needLoadDicTypes).payload.promise.then(res => {
        //请求完成后更新到state数据
        this.setState({ ...res.payload.data.data });
      }).catch(err => {
      })
    }else{
      this.props.loadDictionary(needLoadDicTypes).payload.promise.then(res => {
        //请求完成后更新到state数据
        this.setState({ ...res.payload.data.data });
      }).catch(err => {
      })
    }
  }
}

//处理搜索事件
export function onSearch(e, callback) {
  if (e) {
    e.preventDefault();
    this.state.pagingSearch.currentPage = 1;//重新查询时重置到第一页
  }
  this.props.form.validateFields((err, values) => {
    if (err) {
      return;
    }
    console.log('Received values of form: ', values);
    let pagingSearch = { ...this.state.pagingSearch, ...values };
    if (callback) {//自定义方法回调
      callback(pagingSearch);
    }
    else {//默认通过fetch方法来调用
      this.fetch(pagingSearch);
    }
  });
}

//处理分页事件
export function onPageIndexChange(currentPage, pageSize) {
  let pagingSearch = this.state.pagingSearch;
  pagingSearch.currentPage = currentPage;
  this.setState({ pagingSearch });
  setTimeout(() => {
    //重新查找
    this.onSearch();
  }, 100);
}

//处理调整页面大小
export function onShowSizeChange(current, size) {
  let pagingSearch = this.state.pagingSearch;
  pagingSearch.pageSize = size;
  pagingSearch.currentPage = 1;//重置到第一页
  this.setState({ pagingSearch });
  setTimeout(() => {
    //重新查找
    this.onSearch();
  }, 100);
}

//搜索条件展开与收起
export function onToggleSearchOption() {
  this.setState({ seachOptionsCollapsed: !(this.state.seachOptionsCollapsed || false) })
}

//搜索顶部按钮区域渲染（一般对应于收起,展开)
export function renderSearchTopButtons(extendButtons) {
  extendButtons = extendButtons || [];
  let blocks = [];
  extendButtons.map((item) => {
    blocks.push(<span className="split_button"></span>)
    blocks.push(item);
  });
  let { seachOptionsCollapsed } = this.state;
  return <div>
    {!seachOptionsCollapsed ? <Button type="default" className="button_dark" onClick={this.onToggleSearchOption}><Icon type="caret-up" />检索收起</Button> : <Button type="default" className="button_dark" onClick={this.onToggleSearchOption}><Icon type="caret-down" />检索展开</Button>}
    {seachOptionsCollapsed && blocks}
  </div>
}

//搜索底部按钮区域渲染
export function renderSearchBottomButtons(extendButtons, defaultName, noShowSearch) {
  let { seachOptionsCollapsed } = this.state;
  extendButtons = extendButtons || [];
  let blocks = [];
  extendButtons.map((item) => {
    blocks.push(<span className="split_button"></span>)
    blocks.push(item);
  })
  //展开时才显示
  return (!seachOptionsCollapsed && <div>
    {noShowSearch ?
      ''
    :
      <Button type="primary" icon="search" onClick={this.onSearch}>{defaultName ? defaultName : "查询"}</Button>
    }
    {blocks}
  </div>
  );
}

//搜索表单区域渲染
export function renderSearchForm(form) {
  let { seachOptionsCollapsed } = this.state;
  return (!this.state.seachOptionsCollapsed && form);
}
