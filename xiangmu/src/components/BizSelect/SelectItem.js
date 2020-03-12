import React from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { message, Select, Checkbox } from 'antd'

const { Option, OptGroup } = Select;
const CheckboxGroup = Checkbox.Group
import { getDictionaryTitle, ellipsisText, getWeekTitle, convertJSONDateToJSDateObject, split } from '@/utils';

//基本字典接口方法引入
import { setDictionary } from '@/actions/dic';
//业务接口方法引入
import {
  getItemList,//全部项目列表（不受数据范围限制）
  getItemListByUser,//用户负责项目列表（受数据范围限制）
} from '@/actions/base';
//用户项目列表
const UserDic_ItemList = 'UserDic_ItemList';
const AllDic_ItemList = 'AllDic_ItemList';

/*
    scope: string,//{all,my} (default=my)
    hideAll: boolean//default=false
    showCheckBox:boolearn//defalt=false
*/
class SelectItem extends React.Component {
  constructor(props) {
    super(props)
    let value = `${props.value || ''}`;
    this.state = {
      value: (split(value).length > 0 || props.showCheckBox) ? split(value) : value,
      data_list: [],//数组
    };
  }
  componentWillMount() {
    //字典缓存介入
    let dicKey = this.props.scope === 'all' ? AllDic_ItemList : UserDic_ItemList;//默认取用户授权的分部范围
    //先不启用缓存
    let findItem = null;// this.props.Dictionarys[dicKey];
    if (!findItem) {
      this.fetch((data_list) => {
        //自动加载第一条
        this.autoFirstSelected(data_list[0].value)
      });
    }
    else {
      //所有列表
      this.setState({ data_list: findItem })
      //自动加载第一条
      this.autoFirstSelected(findItem[0].value)
    }
  }

  componentWillReceiveProps(nextProps) {
    // Should be a controlled component.
    if ('value' in nextProps) {
      let value = `${nextProps.value || ''}`;
      if ((split(value).length > 0 || nextProps.showCheckBox)) {
        this.setState({
          value: split(value),
        });
      }
      else {
        this.setState({
          value,
        });
      }
    }
  }
  autoFirstSelected(firstValue) {
    if (this.props.isFirstSelected && this.props.value === '') {
      this.onSelectChange(firstValue, { key: '0' });
    }
  }
  //检索数据
  fetch = (callback) => {
    if (this.props.scope === 'all') {
      let condition = { currentPage: 1, pageSize: 999};
      this.props.getItemList(condition).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
          message.error(data.message);
        }
        else {
          let data_list = data.data.map((item, index) => {
            return { title: item.itemName, value: `${item.itemId}`, state: item.state };
          });
          //动态表达式
          let userDic = {};
          userDic = eval(`({'${AllDic_ItemList}': data_list })`)
          this.props.setDictionary(userDic);
          //所有列表
          this.setState({ data_list });
          if (callback) {
            callback(data_list);
          }
        }
      })
    }
    else {
      const { userId } = this.props.currentUser.user;//当前用户
      this.props.getItemListByUser(userId).payload.promise.then((response) => {
        let data = response.payload.data;
        if (data.result === false) {
          message.error(data.message);
        }
        else {
          let data_list = data.data.map((item, index) => {
            return { title: item.itemName, value: `${item.itemId}`, state: item.state };
          });
          //动态表达式
          let userDic = {};
          userDic = eval(`({'${UserDic_ItemList}': data_list })`)
          this.props.setDictionary(userDic);
          //所有列表
          this.setState({ data_list });
          if (callback) {
            callback(data_list);
          }
        }
      })
    }
  }

  onSelectChange = (value, selectedOptions) => {
    //通知更改
    const onChange = this.props.onChange;
    if (typeof (value) != 'string') {
      value = value.join(',');
    }
    if (onChange) {
      onChange(value);
    }
    let find = null;
    if (!this.props.showCheckBox) {
      find = this.state.data_list[parseInt(selectedOptions.key)];
    }
    //支持外部接口事件监听
    if (this.props.onSelectChange) {
      this.props.onSelectChange(value, find);
    }
  }

  render() {
    if (this.props.showCheckBox) {
      return (<CheckboxGroup value={this.state.value} onChange={this.onSelectChange}>
        {
          this.state.data_list.map((item, index) => {
            return <Checkbox value={item.value} key={index}>{item.title}{item.state === 0 ? '【停用】' : ''}</Checkbox>
          })
        }
      </CheckboxGroup>
      );
    }
    else {
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
          {(this.props.hideAll && !this.props.hidePleaseSelect) && <Option value="">--请选择--</Option>}
          {this.state.data_list.map((item, index) => {
            return <Option value={item.value} key={`${index}`}>{item.title}{item.state === 0 ? '【停用】' : ''}</Option>
          })}
        </Select>
      );
    }
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
    getItemList: bindActionCreators(getItemList, dispatch),
    getItemListByUser: bindActionCreators(getItemListByUser, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectItem);
