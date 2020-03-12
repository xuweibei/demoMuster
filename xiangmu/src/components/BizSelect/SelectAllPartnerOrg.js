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
import {
  queryAllPartners,//用户负责大客户
} from '@/actions/partner';
//用户分部列表
const UserDic_PartnerList = 'UserDic_PartnerList';
const AllDic_PartnerList = 'AllDic_PartnerList';
const BranchDicParnterList = 'BranchDicParnterList';  //按分部来过滤大客户

/*
    scope: string,//{all,my} (default=my)
    hideAll: boolean//default=false
*/
class SelectFBOrg extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: `${props.value || ''}`,
      all_org_list: [],//数组

      data_list: [],  //暂存全部数据
    };
  }
  componentWillMount() {
    //字典缓存介入
    let dicKey = this.props.scope === 'all' ? AllDic_PartnerList
      : this.props.scope === 'branch' ? BranchDicParnterList
        : UserDic_PartnerList;//默认取用户授权的分部范围
    //先不启用缓存
    let findItem = null;// this.props.Dictionarys[dicKey];
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

  //检索用户负责的分区列表数据
  fetch = () => {
    var that = this;
    var setData = function (data) {
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        var data_list = [];
        let all_org_list = data.data.map((item, index) => {
          data_list.push(item);
          return {
            title: item.orgName,
            value: `${item.orgId}`,
            state: item.state,
          }
        })

        if (that.state.value) {
          //for
          for (var i = 0; i < data_list.length; i++) {
            if (that.state.value == data_list[i].orgId) {
              if (that.props.callback) {
                that.props.callback(data_list[i])
              }
              break;
            }
          }
        }

        //动态表达式
        let userDic = {};
        if (that.props.scope === 'all') {
          userDic = eval(`({'${AllDic_PartnerList}': all_org_list })`)
        }
        else {
          userDic = eval(`({'${UserDic_PartnerList}': all_org_list })`)
        }
        that.props.setDictionary(userDic);
        //所有列表
        that.setState({ all_org_list, data_list: data_list })
      }
    }
    
    this.props.queryAllPartners({}).payload.promise.then((response) => {
      let data = response.payload.data;
      setData(data);
    })
  }

  onSelectChange = (value, selectedOptions) => {
    //通知更改
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(value);
    }
    let find = this.state.all_org_list[parseInt(selectedOptions.key)];
    //支持外部接口事件监听
    if (this.props.onSelectChange) {
      this.props.onSelectChange(value, find);
    }

    if (this.props.callback) {
      for (var i = 0; i < this.state.data_list.length; i++) {
        if (this.state.data_list[i].orgId == value) {
          this.props.callback(this.state.data_list[i])
          break;
        }
      }
    }
  }

  forRefInfo() {
    return this.state.value;
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
              if(item && item.indexOf(inputValue) != -1){
                hasFilter = true;
              }
            })
          }
          return hasFilter;
        }}
        onChange={this.onSelectChange}
        //callbackData={this.state.callbackData}
        disabled={this.props.disabledPartner}
      >
        {!this.props.hideAll && <Option value="">全部</Option>}
        {this.state.all_org_list.map((item, index) => {
          return <Option value={item.value} title={item.title} key={index}>{item.title}{item.state === 0 ? '【停用】' : ''}</Option>
        })}
      </Select>
    );
  }
}


const mapStateToProps = (state) => { //基本字典数据
  let { Dictionarys } = state.dic;
  let branchId = state.auth.currentUser.userType.orgId;
  return { Dictionarys, branchId };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    setDictionary: bindActionCreators(setDictionary, dispatch),
    queryAllPartners: bindActionCreators(queryAllPartners, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectFBOrg);
