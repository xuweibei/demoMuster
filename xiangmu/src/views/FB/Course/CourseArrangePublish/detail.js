/*
分部 课表发布 明细
2018-05-23
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle, openExport } from '@/utils';
import { env } from '@/api/env';

import ContentBox from '@/components/ContentBox';
import SearchForm from '@/components/SearchForm';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic';
import { courseArrangePublishDetailQuery } from '@/actions/course';

class CourseArrangeDetail extends React.Component {
  constructor(props){
    super(props);
    this.state= {
      editMode: '',
      data_list: [],
      totalRecord: 0,
      loading: false,
      detail: props.currentDataModel,//数据模型
      UserSelecteds: [],
    };
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    (this: any).onCancel = this.onCancel.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo']);
    this.fetch();
  }

  onCancel = () => {
    this.props.viewCallback();
  }

  columns = [
    {
        title: '科目',
        width:120,
        fixed:'left',
        dataIndex: 'courseCategoryName',
    },
    {
        title: '上课日期',
        dataIndex: 'courseDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '上课时段',
        dataIndex: 'timeQuantum'
    },
    {
        title: '课时',
        dataIndex: 'hour'
    },
    {
        title: '讲师',
        dataIndex: 'teacherName',
    },
    {
        title: '班型备注',
        dataIndex: 'classTypeRemark',
    },
    {
        title: '课程阶段',
        dataIndex: 'periodRemark',
    },
    {
        title: '授课科目备注',
        dataIndex: 'courseRemark',
    },
    {
        title: '最后修改日期',
        width:120,
        fixed:'right',
        dataIndex: 'modifyDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
  ];
  //检索数据
  fetch(){
      this.setState({ loading: true });
      this.props.courseArrangePublishDetailQuery(this.state.detail.courseArrangeId).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            var list = [];
            data.data.listResult.map(i => {
              i.key = i.courseArrangeDetailId;
              list.push(i);
            })
            this.setState({
              data_list: list,
              totalRecord: data.totalRecord,
              loading: false
            })
          }
          else {
              this.setState({ loading: false, data_list: [] })
              message.error(data.message);
          }
      })
  }
  render(){
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Manage':
        default:
        block_content = (
          <div>
            <SearchForm
              num_column={2}
              form_item_list={[
                {type:'text', value: this.props.pagingSearch.itemName, title: '项目'},
                {type:'text', value: this.props.pagingSearch.coursePlanBatchName, title: '开课批次'},
                {type: 'text', value: this.state.detail.courseCategoryName, title: '科目'},
                {type: ''},
                {type:'text', value: this.state.detail.branchUniversityName, title: '分部'},
                {type:'text', value: this.state.detail.teachCentername, title: '教学点'},
                {type:'text', value: this.state.detail.courseplanName, title: '课程班'},
                {type:'text', value: this.state.detail.teachClassTypeName, title: '课程班类型'},
              ]}
              //fetch2={(params) =>this.fetch2(params)}
              hideTopButtons={true}
              hideBottomButtons={true}
            />
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data_list}//数据
                bordered
                scroll={{x:1300}}
              />
              <div className="space-default"></div>
            </div>
            <div className="dv_split">
              <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </div>
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(CourseArrangeDetail);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        courseArrangePublishDetailQuery: bindActionCreators(courseArrangePublishDetailQuery, dispatch),
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
