//根据登陆的用户查看负责的区域 by：Dinghaotian
import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Select } from 'antd'

const { Option, OptGroup } = Select;
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject } from '@/utils';

//基本字典接口方法引入
import { setDictionary } from '@/actions/dic';
//业务接口方法引入
import { selectAreaByUser } from '@/actions/base';
import { selectAreaByBranchId,OutCallTask } from '@/actions/base';
//用户分部列表
const UserDic_FBList = 'UserDic_FBList';
const AllDic_FBList = 'AllDic_FBList';

/*
    scope: string,//{all,my}
    branchId:分部id，适用于all
    hideAll: boolean//default=false
*/
class SelectArea extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: `${props.value || ''}`,
      branchId: props.branchId || '',
      data_list: [],//数组
    };
  }
  componentWillMount() {
    //   this.fetch()
    this.fetch(this.state.branchId)
  }

  componentWillReceiveProps(nextProps) {
        if ('value' in nextProps) {
            let value = `${nextProps.value || ''}`;
            if (nextProps.branchId != this.state.branchId) {
                this.fetch(nextProps.branchId);
            }
            this.setState({
                value: nextProps.value,
                branchId: nextProps.branchId,
            });
        }
  }
  fetch = (branchId) => {
      let condition = {regionId: branchId };
      this.props.OutCallTask(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
          message.error(data.message);
        }
        else {
          let data_list = [];
          //循环
          data.data.map((a) => {
            //没有分部
            let dqItem = { value: `${a.callcenterTaskId}`, title: a.callcenterTaskName};
            data_list.push(dqItem);
          });
          this.setState({ data_list})
        }
      })
    
  }
  onSelectChange = (value, selectedOptions) => {
    //通知更改
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(value);
    }
    //支持外部接口事件监听
    if (this.props.onSelectChange) {
      this.props.onSelectChange(value);
    }
  }

  render() {
    return (
      <Select
        value={this.state.value}
        showSearch={true}
        filterOption={(inputValue, option) => {
          var hasFilter = false;
          if(Array.isArray(option.props.children)){
            option.props.children.map((item) => {
              if(item.indexOf(inputValue) != -1){
                hasFilter = true;
              }
            })
          }
          return hasFilter;
          // return (option.props.children.indexOf(inputValue) != -1);
        }}
        onChange={this.onSelectChange}
      >
        {!this.props.hideAll && <Option value="">全部</Option>}
        {this.state.data_list.map((item, index) => {
          return <Option value={item.value} key={`${index}`}>{item.title}</Option>
        })}
      </Select>
    );
  }
}


const mapStateToProps = (state) => { //基本字典数据
  let { Dictionarys } = state.dic;
  let { currentUser } = state.auth
  return { currentUser, Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    setDictionary: bindActionCreators(setDictionary, dispatch),
    selectAreaByUser: bindActionCreators(selectAreaByUser, dispatch),
    OutCallTask: bindActionCreators(OutCallTask, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectArea);