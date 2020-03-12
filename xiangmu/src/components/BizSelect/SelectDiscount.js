import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Select } from 'antd'

const { Option, OptGroup } = Select;
import { getDictionaryTitle, ellipsisText, getWeekTitle,
  convertJSONDateToJSDateObject, split } from '@/utils';

//基本字典接口方法引入
import { setDictionary } from '@/actions/dic';
//业务接口方法引入
//import { getAllUniversityList } from '@/actions/base';
//用户项目列表
const UserDic_ItemList = 'UserDic_ItemList';
const AllDic_UniversityList = 'AllDic_UniversityList';

import { queryDiscountBySingle, queryDiscountByFold } from '@/actions/recruit';

class SelectDiscount extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data_list: [],//数组
      title: '',
      value: props.value,
      productIds: props.productIds,
      isAutoSearch: props.isAutoSearch,

      //bz_discount_single: [],
      //bz_discount_fold: [],
      bz_discount_list: [],
    };
    (this: any).onHandleSearch = this.onHandleSearch.bind(this);
    (this: any).onHandleChange = this.onHandleChange.bind(this);
  }
  componentWillMount() {
    if(this.state.isAutoSearch){
      this.onHandleSearch();
    }
  }

  componentWillReceiveProps(nextProps) {
    if('productIds' in nextProps){
      this.setState({
        productIds: nextProps.productIds
      })
      //this.onHandleSearch();
    }
    if ('title' in nextProps) {
      if(nextProps.title && !this.state.title){
        this.setState({
          value: nextProps.value,
          //title: nextProps.title
        });
      }
    }
  }

  //检索数据
  onHandleSearch = (t) => {
    if(!this.state.productIds){
      return;
    }
    let condition = { productIds: this.state.productIds }
    if(this.state.isAutoSearch){
      this.props.queryDiscountByFold(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            this.setState({
              bz_discount_list: data.data
            })
          }
          else {
            message.error(data.message);
          }
      })
    }else {
      if(!t){
        return;
      }
      condition.discountName = t//this.state.title;
      this.props.queryDiscountBySingle(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            this.setState({
              bz_discount_list: data.data
            });
          }
          else {
            message.error(data.message);
          }
      })
    }
  }

  onHandleChange = (v) => {
    var that = this;
    /*this.setState({
      title: value
    })*/
    for(var i = 0; i < this.state.bz_discount_list.length; i++){
      var _i = this.state.bz_discount_list[i];
      if(_i.productDiscountId == v){
        that.setState({title: _i.productDiscountName, value: _i.productDiscountId});
        this.props.setChooseValueChange(v, _i);
        return;
      }
    }
    this.setState({
      value: v,
    })

    if(!this.props.isAutoSearch){
      this.setState({
        title: v    //供 combobox 使用
      })
    }
    if(this.props.isShowSelect)
      this.props.setChooseValueChange('', {});
    else
      this.props.setChooseValueChange('', null);
  }

  render() {
      const options = this.state.bz_discount_list.map((item, index) => {
        return <Option value={item.productDiscountId} key={`item_${index}`}>{item.productDiscountName}{item.state === 0 ? '【停用】' : ''}</Option>
      });
      return (
        this.props.isAutoSearch ?
        <Select
          //value={this.state.title}
          value={this.state.value}
          onChange={this.onHandleChange}
        >
          {this.props.isShowSelect &&
            <Option value="" key="-1">请选择</Option>
          }
          {options}
        </Select>
        :
        <Select
          mode="combobox"
          value={this.state.title}
          placeholder={this.props.placeholder}
          style={this.props.style}
          defaultActiveFirstOption={false}
          filterOption={false}
          onChange={this.onHandleChange}
          onSearch={this.onHandleSearch}
        >
          {options}
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
    queryDiscountByFold: bindActionCreators(queryDiscountByFold, dispatch),
    queryDiscountBySingle: bindActionCreators(queryDiscountBySingle, dispatch),
    //getAllUniversityList: bindActionCreators(getAllUniversityList, dispatch)
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectDiscount);
