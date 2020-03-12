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
  queryAllBranch,//全部分部
  qryBranchListByUserVo,//用户负责分部
} from '@/actions/base';
import { orgBranchListByParentId } from '@/actions/admin'
//用户分部列表
const UserDic_FBList = 'UserDic_FBList';
const DQDicFBList = 'DQDicFBList';
const AllDic_FBList = 'AllDic_FBList';

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
    };
  }
  componentWillMount() {
    //字典缓存介入
    let dicKey = this.props.scope === 'all' ? AllDic_FBList : this.props.scope === 'dq' ? DQDicFBList : UserDic_FBList;//默认取用户授权的分部范围
    //先不启用缓存
    let findItem = null;// this.props.Dictionarys[dicKey];
    if (!findItem) {
      if (this.props.scope === 'all') {
        this.fetchAll();
      } else if (this.props.scope === 'dq') {
        this.fetchDQ();
      } else {
        this.fetchMy();
      }
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
  fetchMy = () => {
    const { userId } = this.props.currentUser.user;//当前用户
    let condition = { currentPage: 1, pageSize: 999, userId: userId };
    this.props.qryBranchListByUserVo(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        let all_org_list = [];
        let orderDQList = data.data.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; })//按大区顺序排列
        //循环
        orderDQList.map((a) => {
          //没有分部
          if (a.organizationList.length == 0) {
            return;
          }

          let orderFBList = a.organizationList.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; });//分部排序
          let dqItem = { orgId: `${a.orgId}`, orgName: a.orgName, children: [], state: a.state };
          orderFBList.map((fb) => {
            dqItem.children.push({ orgId: `${fb.orgId}`, orgName: fb.orgName, state: fb.state })
          })
          all_org_list = [...all_org_list, dqItem];
        });
        //动态表达式
        let userDic = {};
        if (this.props.scope === 'all') {
          userDic = eval(`({'${AllDic_FBList}': all_org_list })`)
        }
        else {
          userDic = eval(`({'${UserDic_FBList}': all_org_list })`)
        }
        this.props.setDictionary(userDic);
        //所有列表
        this.setState({ all_org_list })
      }
    })
  }

  //检索区列表数据
  fetchAll = () => {
    const { userId } = this.props.currentUser.user;//当前用户
    let condition = { currentPage: 1, pageSize: 999, userId: userId, state: 1 };
    this.props.queryAllBranch(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        let all_org_list = [];
        let orderDQList = data.data.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; })//按大区顺序排列
        //循环
        orderDQList.map((a) => {
          //没有分部
          if (a.organizationList.length == 0) {
            return;
          }

          let orderFBList = a.organizationList.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; });//分部排序

          let dqItem = { orgId: `${a.orgId}`, orgName: a.orgName, children: [], state: a.state };
          orderFBList.map((fb) => {
            dqItem.children.push({ orgId: `${fb.orgId}`, orgName: fb.orgName, state: fb.state })
          })
          all_org_list = [...all_org_list, dqItem];
        });
        //动态表达式
        let userDic = {};
        if (this.props.scope === 'all') {
          userDic = eval(`({'${AllDic_FBList}': all_org_list })`)
        }
        else {
          userDic = eval(`({'${UserDic_FBList}': all_org_list })`)
        }
        this.props.setDictionary(userDic);
        //所有列表
        this.setState({ all_org_list })
      }
    })
  }

  //检索区列表数据
  fetchDQ = () => {
    this.props.orgBranchListByParentId(this.props.orgId).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        let all_org_list = data.data || [];
        //动态表达式
        let userDic = {};
        if (this.props.scope === 'dq') {
          userDic = eval(`({'${DQDicFBList}': all_org_list })`)
        }
        this.props.setDictionary(userDic);
        //所有列表
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
          var result = false;
          for(var i = 0; i < option.props.children.length; i++){
            if(option.props.children[i].indexOf(inputValue) != -1){
              result = true;
              break;
            }
          }
          return result;
          //return (option.props.children.indexOf(inputValue) != -1);
        }}
        onChange={this.onSelectChange}
      >
        {!this.props.hideAll && <Option value="">全部</Option>}
        {
          this.props.scope == 'dq' ?
            this.state.all_org_list.map((i, index) => {
              return <Option title={i.state === 0?i.orgName+'【停用】':i.orgName} value={i.orgId.toString()} key={'_' + index}>{i.orgName}{i.state === 0 ? '【停用】' : ''}</Option>
            })
            :
            this.state.all_org_list.map((dqItem) => {
              return <OptGroup label={dqItem.orgName}>
                {dqItem.children.map((fbItem, index) => {
                  return <Option title={fbItem.state === 0?fbItem.orgName+'【停用】':fbItem.orgName} value={fbItem.orgId} key={index}>{fbItem.orgName}{fbItem.state === 0 ? '【停用】' : ''}</Option>
                })}
              </OptGroup>
            })}
      </Select>
    );
  }
}


const mapStateToProps = (state) => { //基本字典数据
  let { Dictionarys } = state.dic;
  let { currentUser } = state.auth
  let { orgId } = state.auth.currentUser.userType;
  return { currentUser, Dictionarys, orgId };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    setDictionary: bindActionCreators(setDictionary, dispatch),
    queryAllBranch: bindActionCreators(queryAllBranch, dispatch),
    qryBranchListByUserVo: bindActionCreators(qryBranchListByUserVo, dispatch),
    orgBranchListByParentId: bindActionCreators(orgBranchListByParentId, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectFBOrg);
