import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Card, Row, Col, Progress, Button, Icon, Input, Upload, Cascader, Tag } from 'antd'
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject } from '@/utils';
import { env } from '@/api/env';
// 引入编辑器以及编辑器样式
import BraftEditor from 'braft-editor'
import 'braft-editor/dist/braft.css'
import { getAreaList, getAllAreas } from '@/actions/partner';
import './index.less'
/*
value:id 
areaName:路径描述
valueType:{id,name}
*/
class AreasSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value || '',
      areaName: props.areaName || '',
      areasTreeNodes: [],
      isFilter: props.isFilter || false
    };

  }
  componentWillMount() {
    //加载树
    this.fetchAreaList();
  }
  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      this.setState({
        value: nextProps.value,
        areaName: nextProps.areaName,
      });
    }
  }
  onSelectChange = (value, selectedOptions) => {


    let areaName = selectedOptions.map(a => a.label).join(',');
    this.setState({ selectAreaName: areaName, editMode: true })
    //通知更改
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(this.props.valueType === 'name' ? areaName : value);
    }

  }

  //整个数据获取到处理
  convertToStandardMenus = (zbItems) => {
    var firstMenus = [];
    zbItems.filter(a => (a.parentId == null)).map((firstItem, index) => {
      let firstMenu = firstMenus.find(aa => aa.value == `${firstItem.areaId}`);
      //判断一级菜单是否存在
      if (!firstMenu) {
        //二级菜单准备
        var secondtMenus = [];
        zbItems
          .filter(a => a.parentId == firstItem.areaId)//过滤二级菜单
          .map((secondItem) => {
            //判断二级菜单是否存在？
            let findSecondMenu = secondtMenus.find(aa => aa.value == `${secondItem.areaId}`);
            if (!findSecondMenu) {
              //三级菜单准备
              var thridMenus = [];
              zbItems
                .filter(a => a.parentId == secondItem.areaId)
                .map((thridItem) => {
                  let findThridMenu = thridMenus.find(aa => aa.value == `${thridItem.areaId}`);
                  if (!findThridMenu) {
                    findThridMenu = {
                      value: `${thridItem.areaId}`,
                      label: `${thridItem.areaName}`,
                      depth: 3,
                    };
                    thridMenus.push(findThridMenu);
                  }
                });
              findSecondMenu = {
                value: `${secondItem.areaId}`,
                label: `${secondItem.areaName}`,
                depth: 2,
                children: thridMenus,
              };
              secondtMenus.push(findSecondMenu);
            }
          });
        firstMenu = {
          value: `${firstItem.areaId}`,
          label: `${firstItem.areaName}`,
          isLeaf: false,
          depth: 1,
          //children: secondtMenus,
        };
        firstMenus.push(firstMenu);
      }
    });
    return firstMenus;
  }

  //数据形式转换
  convertToCascaderOptions = (dataList) => {
    return dataList.map((item, index) => {
      if (!item.parentId) {
        return {
          value: `${item.areaId}`,
          label: `${item.areaName}`,
          isLeaf: (item.isLeaf === 1),
          depth: 1,
        };
      }
      else {
        return {
          value: `${item.areaId}`,
          label: `${item.areaName}`,
          isLeaf: true,
          depth: 2,
        };
      }
    })
  }

  onLoadData = (selectedOptions) => {
    const targetOption = selectedOptions[selectedOptions.length - 1];
    targetOption.loading = true;
    let parentId = targetOption.value;
    let _this = this;
    this.fetchAreaList(parentId, (children) => {
      targetOption.loading = false;
      targetOption.children = children;
      var findItem = _this.state.areasTreeNodes.find((item) => { return item.value == parentId });
      if (children.length == 0) {
        findItem.isLeaf = true;
      }
      else {
        findItem.children = children;
      }
      _this.setState({ areasTreeNodes: _this.state.areasTreeNodes });
    });
  }

  fetchAreaList = (areaId = '', callback) => {
    var that = this;
    this.props.getAllAreas().payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        var list = [];
        //list = this.convertToStandardMenus(data.data)
        list = this.getAreaDateList(data.data)
          that.setState({ areasTreeNodes: list })
        
      }
      else {
        message.error(data.message);
      }
    })
  }

  getAreaDateList = (dataList) => {
    return dataList.filter(a => !a.parentId).map((item, index) => {
      if (!item.parentId) {
        let children = [];
        if(this.state.isFilter){
          if(item.municipality == 0){
            dataList.map((list) => {
              if(list.parentId && (item.areaId == list.parentId)){
                let child = {
                  value: `${list.areaId}`,
                  label: `${list.areaName}`,
                }
                children.push(child);
              }
            })
          }
        }else{
          dataList.map((list) => {
            if(list.parentId && (item.areaId == list.parentId)){
              let child = {
                value: `${list.areaId}`,
                label: `${list.areaName}`,
              }
              children.push(child);
            }
          })
        }
        
        return {
          value: `${item.areaId}`,
          label: `${item.areaName}`,
          children: children
        };
      }
    })
  }

  // fetchAreaList = (areaId = '', callback) => {
  //   var that = this;
  //   let condition = { areaId };
  //   this.props.getAreaList(condition).payload.promise.then((response) => {
  //     let data = response.payload.data;
  //     if (data.state === 'success') {
  //       var list = [];
  //       //list = this.convertToStandardMenus(data.data)
  //       list = this.convertToCascaderOptions(data.data)
  //       if (areaId == '') {
  //         that.setState({ areasTreeNodes: list })
  //       }
  //       else if (callback) {
  //         callback(list);
  //       }
  //     }
  //     else {
  //       message.error(data.message);
  //     }
  //   })
  // }
  handleClose = () => {
    this.setState({ editMode: true })
  }

  render() {
    let block_content = null;
    if (this.state.editMode || !this.state.areaName) {
      block_content = <Cascader
        options={this.state.areasTreeNodes}
        // changeOnSelect={true}
        // loadData={this.onLoadData}
        // displayRender={label => label.join(',')}
        onChange={this.onSelectChange}
        showSearch
        placeholder="请选择省市" />
    } else {
      block_content = <Tag closable afterClose={() => this.handleClose()}>
        {this.state.selectAreaName ? this.state.selectAreaName : this.state.areaName}
      </Tag>
    }
    return block_content;
  }
}


const mapStateToProps = (state) => {
  return {};
};

function mapDispatchToProps(dispatch) {
  return {
    getAreaList: bindActionCreators(getAreaList, dispatch),
    getAllAreas: bindActionCreators(getAllAreas, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(AreasSelect);