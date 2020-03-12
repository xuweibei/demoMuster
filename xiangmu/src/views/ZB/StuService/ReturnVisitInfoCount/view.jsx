import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox, DatePicker, InputNumber, message } from 'antd';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime, split, formatMoment, convertTextToHtml, formatMoney } from '@/utils';
import { loadBizDictionary, searchFormItemLayout,searchFormItemLayout24, onSearch, onPageIndexChange, onShowSizeChange,} from '@/utils/componentExt';
import { env } from '@/api/env';
import ContentBox from '@/components/ContentBox';
import { returnVisitStudentSelectReturnVisitTjmx } from '@/actions/stuService';
import { loadDictionary } from '@/actions/dic';
const FormItem = Form.Item;
const btnsearchFormItemLayout = {
  wrapperCol: { span: 24 },
};


/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class AuditView extends React.Component {
  constructor(props) {
    super(props)
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.state = {
      dataModel: props.currentDataModel,//数据模型
      data: [],
      pagingSearch: {
        currentPage: 1,
        pageSize: env.defaultPageSize,
      },
      loading: false,
      totalRecord: 0,
    };
  }
  onCancel = () => {
    this.props.viewCallback();
  }
  componentWillMount() {
      this.fetch();
  }
  fetch = (params) => {
    this.setState({ loading: true })
    var condition = params || this.state.pagingSearch;
    condition.itemId = this.state.dataModel.itemId;
    condition.branchId = this.state.dataModel.branchId;
    this.props.returnVisitStudentSelectReturnVisitTjmx(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state != 'success') {
        message.error(data.message);
      }
      else {
        this.setState({
          totalRecord: data.totalRecord,
          loading: false,
          pagingSearch: condition,
        })
        this.setState({ data: data.data, loading: false })
      }
    })
  }


  viewColumns = [
    {
        title: '教学点',
        dataIndex: 'teachCenter',
    },
    {
        title: '学服老师',
        dataIndex: 'teacher',
    },
    {
        title: '工号',
        dataIndex: 'userNo',
    },
    {
        title: '专属学生数',
        dataIndex: 'studentCount',
    },
    {
        title: '学生任务总数',
        dataIndex: 'studentTaskCount',
    },
    {
        title: '学生任务回访数',
        dataIndex: 'returnVisitCount',
    },
    {
        title: '回访率',
        dataIndex: 'hfl',
        render:(text,record)=>{
          return Math.round(record.hfl*100)/100 + '%';
        }
    },
  ];


  //标题
  getTitle() {
    let op = '';
    if (this.props.editMode == 'View') {
      op = '回访情况统计明细'
      return `${op}`
    }

  }

  //表单按钮处理
  renderBtnControl() {
      return <FormItem
        className='btnControl'
        {...btnsearchFormItemLayout}
      >
        <Button onClick={this.onCancel} icon="rollback">返回</Button>
      </FormItem>
  }

  //多种模式视图处理
  renderEditModeOfView() {
    let block_content = <div></div>
    const { getFieldDecorator } = this.props.form;

    switch (this.props.editMode) {
      case "View":
        block_content = (
          <Form className="search-form">
            <Row gutter={24}>
              <Col span={12}>
                  <FormItem
                    {...searchFormItemLayout}
                    label="项目"
                  >
                    {this.state.dataModel.itemName}
                  </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="分部"
                >
                  {this.state.dataModel.branchName}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label="时间段"
                >
                  {this.state.dataModel.startDate ? `${timestampToTime(this.state.dataModel.startDate)} 至 ${timestampToTime(this.state.dataModel.endDate)}` : ''}
                </FormItem>
              </Col>
              <Col span={12}>
                <FormItem
                  {...searchFormItemLayout}
                  label='回访任务数'
                >
                  {this.state.dataModel.taskCount}
                </FormItem>
              </Col>
              
            </Row>
            <Row>
                {/* 内容分割线 */}
                <div className="search-result-list" style={{padding:'0 20px'}}>
                  <div className="space-default"></div>
                  <Table columns={this.viewColumns} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.data}//数据
                    bordered
                  />
                  <div className="space-default"></div>
                  <div className="search-paging">
                    <Row justify="end" align="middle" type="flex">
                      <Col span={24} className='search-paging-control'>
                        <Pagination showSizeChanger
                                    current={this.state.pagingSearch.currentPage}
                                    defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                                    onShowSizeChange={this.onShowSizeChange}
                                    onChange={this.onPageIndexChange}
                                    showTotal={(total) => { return `共${total}条数据`; }}
                                    total={this.state.totalRecord} />
                      </Col>
                    </Row>
                  </div>
                </div>
            </Row>
          </Form>
        );
        break;

    }
    return block_content;
  }

  render() {
    let title = this.getTitle();
    let block_editModeView = this.renderEditModeOfView();
    return (<div>
        <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
          {block_editModeView}
        </ContentBox>
      </div>
    );
  }
}

const WrappedAuditView = Form.create()(AuditView);

const mapStateToProps = (state) => {
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    returnVisitStudentSelectReturnVisitTjmx: bindActionCreators(returnVisitStudentSelectReturnVisitTjmx, dispatch),
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAuditView);
