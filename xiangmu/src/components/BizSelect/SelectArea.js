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
import { selectAreaByBranchId } from '@/actions/base';
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
    //字典缓存介入
    //let dicKey = this.props.scope === 'all' ? AllDic_FBList : UserDic_FBList;//默认取用户授权的分部范围
    let findItem = null;//this.props.Dictionarys[dicKey];
    if (!findItem) {
      if (this.props.scope == 'all') {
        this.fetchAll(this.state.branchId);
      }
      else {
        this.fetchMy();
      }
    }
    else {
      //所有列表
      this.setState({ data_list: findItem })
    }
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      let value = `${nextProps.value || ''}`;
      if (nextProps.branchId != this.state.branchId) {
        this.fetchAll(nextProps.branchId);
      }
      this.setState({
        value: nextProps.value,
        branchId: nextProps.branchId,
      });
    }
  }

  autoFirstSelected(firstValue) {
    if (this.props.isFirstSelected && this.props.value === '') {
      this.onSelectChange(firstValue, { key: '0' });
    }
  }

  fetchAll = (branchId) => {
    if (branchId) {
      let condition = { currentPage: 1, pageSize: 999, branchId: branchId };
      this.props.selectAreaByBranchId(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
          message.error(data.message);
        }
        else {
          let data_list = [];
          //循环
          data.data.map((a) => {
            //没有分部
            let dqItem = { value: `${a.orgId}`, title: a.orgName, state: a.state };
            data_list.push(dqItem);
          });
          this.setState({ data_list })
          this.autoFirstSelected(data_list[0].value)
        }
      })
    }
  }
  fetchMy = () => {
    let condition = { currentPage: 1, pageSize: 999 };
    this.props.selectAreaByUser(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        let data_list = [];
        //循环
        data.data.map((a) => {
          //没有分部
          let dqItem = { value: `${a.orgId}`, title: a.orgName, state: a.state };
          data_list.push(dqItem);
        });
        this.setState({ data_list })
        this.autoFirstSelected(data_list[0].value)
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
          return <Option value={item.value} key={`${index}`}>{item.title}{item.state == 0 ? '【停用】' : ''}</Option>
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
    selectAreaByBranchId: bindActionCreators(selectAreaByBranchId, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectArea);