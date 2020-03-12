//大区
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
import { getReginList } from '@/actions/recruit';
//用户分部列表
const UserDic_FBList = 'UserDic_FBList';
const AllDic_FBList = 'AllDic_FBList';

/*
    scope: string,//{all}
    hideAll: boolean//default=false
*/
class SelectRegion extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: `${props.value || ''}`,
      all_org_list: [],//数组
    };
  }
  componentWillMount() {
    //先不启用缓存
    let findItem = null;
    if (!findItem) {
      this.fetch();
    }
    else {
      //所有列表
      this.setState({ all_org_list: findItem })
    }
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      let value = `${nextProps.value || ''}`;
      this.setState({
        value
      });
    }
  }


  fetch = () => {
    let condition = { currentPage: 1, pageSize: 999, };
    this.props.getReginList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        //循环
        data.data.map((a) => {
          //没有分部
          let dqItem = { value: `${a.orgId}`, title: a.orgName, state: a.state, };
          this.state.all_org_list.push(dqItem);
        });
        this.setState({ all_org_list })
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
        {this.state.all_org_list.map((item, index) => {
          return <Option value={item.value} key={`${index}`}>{item.title}{item.state === 0 ? '【停用】' : ''}</Option>
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
    getReginList: bindActionCreators(getReginList, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectRegion);