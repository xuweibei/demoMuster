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
import { getCoursePlanBatchByItemId } from '@/actions/course';  //根据项目查询开课批次
//用户分部列表
const AllDic_CoursePlanBatchList = 'AllDic_CoursePlanBatchList';

/*
    itemId:string //项目ID 必填
    hideAll: boolean//default=false
*/
class SelectItemCoursePlanBatch extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value || '',
      itemId: props.itemId || '',
      data_list: [],//数组
    };
  }

  componentWillMount() {
    //字典缓存介入
    //let dicKey = this.props.scope === 'all' ? AllDic_FBList : UserDic_FBList;//默认取用户授权的分部范围
    let findItem = null;//this.props.Dictionarys[dicKey];
    if (!findItem) {
      this.fetch(this.state.itemId);
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
      if (nextProps.itemId != this.state.itemId) {
        this.fetch(nextProps.itemId);
      }
      this.setState({
        value: nextProps.value,
        itemId: nextProps.itemId,
      });
    }
  }

  autoFirstSelected(firstValue) {
    if (this.props.isFirstSelected && this.props.value === '') {
      this.onSelectChange(firstValue, { key: '0' });
    }
  }

  //检索列表数据
  fetch = (itemId) => {
    if (!itemId) {
      this.setState({ data_list: [] });
      return;
    }
    this.props.getCoursePlanBatchByItemId(itemId).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        message.error(data.message);
      }
      else {
        let data_list = [];
        data.data.map(r => {
          data_list.push({
            title: r.courseplanBatchName,
            value: `${r.courseplanBatchId}`,
            state: r.state,
          })
        });
        //所有列表
        this.setState({ data_list })
        if (data_list.length > 0) {
          //自动加载第一条
          this.autoFirstSelected(data_list[0].value)

        }
      }
    })
  }

  onSelectChange = (value, selectedOptions) => {
    //通知更改
    const onChange = this.props.onChange;
    if (onChange) {
      onChange(value);
    }
    let find = this.state.data_list[parseInt(selectedOptions.key)];
    //支持外部接口事件监听
    if (this.props.onSelectChange) {
      this.props.onSelectChange(value, find);
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
    getCoursePlanBatchByItemId: bindActionCreators(getCoursePlanBatchByItemId, dispatch),
  };
}
export default connect(mapStateToProps, mapDispatchToProps)(SelectItemCoursePlanBatch);