import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Select } from 'antd'

const { Option, OptGroup } = Select;

//基本字典接口方法引入
import { setDictionary } from '@/actions/dic';
//业务接口方法引入

import { getPaymentWay } from '@/actions/base'

class SelectPaymentWay extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: `${props.value || ''}`,
      all_org_list: [],//数组
    };
  }
  componentWillMount() {
    
      this.fetchAll();

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

  //检索区列表数据
  fetchAll = () => {
    let condition = { groupName: 'payment_way'};
    this.props.getPaymentWay(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        let all_org_list = data.data;
        //所有列表
        this.setState({ all_org_list })
      }
    })
  }

  onSelectChange = (value, selectedOptions) => {
    const onChangeWay = this.props.onChangeWay;
    if (onChangeWay) {
      onChangeWay(value, selectedOptions);
    }
  }

  render() {
    return (
      <Select
        value={this.state.value}
        showSearch={true}
        onChange={this.onSelectChange}
      >
        {!this.props.hideAll && <Option value="">全部</Option>}
        {
            this.state.all_org_list.map((dqItem,key) => {
              if(dqItem.childList.length){
                return <OptGroup label={dqItem.title}>
                  {dqItem.childList.map((fbItem, index) => {
                    return <Option value={fbItem.value} key={index} parentValue={dqItem.value}>{fbItem.title}</Option>
                  })}
                </OptGroup>
              }else{
                return <Option value={dqItem.value} key={key}>{dqItem.title}</Option>
              }
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
    getPaymentWay: bindActionCreators(getPaymentWay, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectPaymentWay);
