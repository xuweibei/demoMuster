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
  getUniversityByBranchId//用户负责高校列表（受数据范围限制）
} from '@/actions/base';
//用户项目列表
const UserDic_ItemList = 'UserDic_ItemList';
const AllDic_UniversityList = 'AllDic_UniversityList';

/*
    scope: string,//{all,my} (default=my)
    hideAll: boolean//default=false
    showCheckBox:boolearn//defalt=false
*/
class SelectUniversity extends React.Component {
  constructor(props) {
    super(props)
    let value = `${props.value || ''}`;
    this.state = {
      value: (split(value).length > 0 || props.showCheckBox) ? split(value) : value,
      data_list: [],//数组
    };
  }
  componentWillMount() {
    this.fetch();
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

  //检索数据
  fetch = () => {
    let condition = {};
    this.props.getUniversityByBranchId(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        let data_list = response.payload.data.data.map((item, index) => {
          return { title: item.universityName, value: `${item.universityId}`, state: item.state, };
        });
        //动态表达式
        let userDic = {};
        userDic = eval(`({'${AllDic_UniversityList}': data_list })`)
        this.props.setDictionary(userDic);
        //所有列表
        this.setState({ data_list });
      }
    })
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
    //支持外部接口事件监听
    if (this.props.onSelectChange) {
      this.props.onSelectChange(value);
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
          {this.state.data_list.map((item, index) => {
            return <Option value={item.value} key={`item_${index}`}>{item.title}{item.state === 0 ? '【停用】' : ''}</Option>
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
    getUniversityByBranchId: bindActionCreators(getUniversityByBranchId, dispatch)
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectUniversity);