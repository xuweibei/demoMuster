//查询当前用户对应的教学点
import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Select } from 'antd'

const { Option, OptGroup } = Select;
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject, split } from '@/utils';

//基本字典接口方法引入
import { setDictionary } from '@/actions/dic';
//业务接口方法引入
import { getTeachCenterByUserList } from '@/actions/base';

/*
    hideAll: boolean//default=false
*/
class SelectTeachCenterByUser extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value || '',
      data_list: [],//数组
      branchId: props.branchId,
    };
  }

  componentWillMount() {
    this.fetch(this.state.branchId);
  }
  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
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

  //检索列表数据
  fetch = (branchId) => {

    let condition = { currentPage: 1, pageSize: 999, branchId: branchId };
    this.props.getTeachCenterByUserList(branchId).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        let data_list = [];
        data.data.map(r => {
          data_list.push({
            value: r.orgId,
            title: r.orgName,
            state: r.state,
          })
        });
        this.setState({ data_list });
      }
      else {
        message.error(data.message);
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
          return <Option value={item.value} key={index}>{item.title}{item.state === 0 ? '【停用】' : ''}</Option>
        })}
      </Select>
    );
  }
}


const mapStateToProps = (state) => { //基本字典数据
  return {};
  // let { Dictionarys } = state.dic;
  // let { currentUser } = state.auth
  // return { currentUser, Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    setDictionary: bindActionCreators(setDictionary, dispatch),
    getTeachCenterByUserList: bindActionCreators(getTeachCenterByUserList, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectTeachCenterByUser);