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
  postRecruitBatchList
} from '@/actions/recruit';
const AllDic_ItemList = 'AllDic_RecruitBatchList';

/*
    hideAll: boolean//default=false
    scope: all,current//default=all
*/
class SelectRecruitBatch extends React.Component {
  constructor(props) {
    super(props)
    let value = `${props.value || ''}`;
    this.state = {
      value: (split(value).length > 0) ? split(value) : value,
      data_list: [],//数组
    };
  }
  componentWillMount() {
    //字典缓存介入
    let dicKey = AllDic_ItemList;
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
      if ((split(value).length > 0)) {
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
    this.props.postRecruitBatchList().payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        let currentItem = null;
        let data_list = response.payload.data.data.filter((a) => {
          if (this.props.scope === 'current') {
            if (a.state == 1) {
              currentItem = a;
              return true;
            }
            else if (currentItem != null && currentItem.beginDate > a.beginDate) {
              return true;
            }
            else {
              return false;
            }
          }
          else {
            return true;
          }
        }).map((item, index) => {
          return { title: item.recruitBatchName, value: `${item.recruitBatchId}` };
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

  onSelectChange = (value, selectedOptions) => {
    //通知更改 
    const onChange = this.props.onChange;
    if (typeof (value) != 'string') {
      value = value.join(',');
    }
    if (onChange) {
      onChange(value);
    }
    if(this.state.data_list.length){ 
      let find = this.state.data_list[parseInt(selectedOptions.key)];
      find.key = selectedOptions.key;
      //支持外部接口事件监听
      if (this.props.onSelectChange) {
        this.props.onSelectChange(value, find);
      }
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
            if(option.props.children.indexOf(inputValue) != -1){
              result = true;
              break;
            }
          }
          return result;
          // return (option.props.children.indexOf(inputValue) != -1);
        }}
        onChange={this.onSelectChange}
      >
        {!this.props.hideAll && <Option value="">全部</Option>}
        {this.state.data_list.map((item, index) => {
          return <Option title={item.title} value={item.value} key={`${index}`}>{item.title}</Option>
        })}
      </Select>
    );
  }
}


const mapStateToProps = (state) => { //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    setDictionary: bindActionCreators(setDictionary, dispatch),
    postRecruitBatchList: bindActionCreators(postRecruitBatchList, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectRecruitBatch);