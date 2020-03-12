/*
课表管理 冲突查询
2018-05-16
lixuliang
*/
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider } from 'antd';
const FormItem = Form.Item;
import { formatMoney, timestampToTime, getDictionaryTitle, openExport } from '@/utils';
import { env } from '@/api/env';

import ContentBox from '@/components/ContentBox';
import SearchForm from '@/components/SearchForm';
import FileDownloader from '@/components/FileDownloader';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange } from '@/utils/componentExt';

import { loadDictionary } from '@/actions/dic';
import { courseArrangeConflictQuery } from '@/actions/course';

class Conflict extends React.Component {
  state= {
    editMode: '',
    data_list: [],
    totalRecord: 0,
    loading: false,
  };
  constructor(){
    super();
    (this: any).fetch2 = this.fetch2.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    (this: any).onCancel = this.onCancel.bind(this);
    (this: any).onExport = this.onExport.bind(this);
  }
  componentWillMount(){
    this.loadBizDictionary(['dic_YesNo']);
    this.fetch2();
  }

  onCancel = () => {
    this.props.viewCallback();
  }
  onExport = () => {
    if(!this.state.data_list.length){
      message.error("没有数据可导出");
      return;
    }
    var that = this;
    //var url = env.serverURL + "/edu/courseArrangeDetail/exportConflick?token=" + env.getToken();
    var url = env.testServerURL + "/edu/courseArrangeDetail/exportConflick?token=" + env.getToken();
    for(var i in this.props.pagingSearch){
      url += "&" + i + "=" + encodeURI(this.props.pagingSearch[i]);
    }

    openExport(url);
  }


  columns = [
    {
        title: '讲师',
        width:120,
        fixed:'left',
        dataIndex: 'teacherName',
    },
    {
        title: '上课日期',
        dataIndex: 'courseDate',
        render: text => <span>{timestampToTime(text)}</span>
    },
    {
        title: '上课时段',
        dataIndex: 'timeQuantumStr'
    },
    {
        title: '课时',
        dataIndex: 'hour'
    },
    {
        title: '教学点',
        dataIndex: 'teachCentername',
    },
    {
        title: '课程班名称',
        dataIndex: 'courseplanName',
    },
    {
        title: '课程班类型',
        dataIndex: 'teachClassTypeName',
    },
    {
        title: '科目',
        dataIndex: 'courseCategoryName',
    },
    {
        title: '班型备注',
        dataIndex: 'classTypeRemark',
    },
    {
        title: '阶段备注',
        dataIndex: 'periodRemark',
    },
    {
        title: '授课科目备注',
        dataIndex: 'courseRemark',
        fixed:'right',
        width:120,
    },
  ];
  //检索数据
  fetch2(){
      var condition = this.props.pagingSearch;
      if (!condition || !condition.itemId || !condition.courseplanBatchId) {
        this.setState({
          data_list: []
        })
        return;
      }
      this.setState({ loading: true });
      this.props.courseArrangeConflictQuery(condition).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            this.setState({
              data_list: data.data.listResult,
              totalRecord: data.totalRecord,
              loading: false
            })
          }
          else {
              this.setState({ loading: false })
              message.error(data.message);
          }
      })
  }
  render(){
    let block_content = <div></div>
        block_content = (
          <div>
            <SearchForm
              num_column={2}
              form_item_list={[
                {type:'text', value: this.props.pagingSearch.itemName, title: '项目'},
                {type:'text', value: this.props.pagingSearch.coursePlanBatchName, title: '开课批次'},
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
              <FileDownloader
                apiUrl={'/edu/courseArrangeDetail/exportConflick'}//api下载地址
                method={'post'}//提交方式
                options={this.props.pagingSearch}//提交参数
                title={'导出'}
              />
              <span className="split_button"></span>
              <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </div>
          </div>
        )
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(Conflict);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        courseArrangeConflictQuery: bindActionCreators(courseArrangeConflictQuery, dispatch),
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),

    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
