
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker
} from 'antd';
const { RangePicker } = DatePicker;
const FormItem = Form.Item;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment ,openExport } from '@/utils';
import { searchFormItemLayout,searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';

import { returnVisitSelectStudent, returnVisitStudentAdd } from '@/actions/stuService';

import ContentBox from '@/components/ContentBox';
import DropDownButton from '@/components/DropDownButton';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';

import Return from './return';

const dateFormat = 'YYYY-MM-DD';
class VisitManage extends React.Component {
  constructor(props) {
    super(props);
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);

    this.state = {
      dataModel: props.currentDataModel,
      pagingSearch: {
        currentPage: 1,
        pageSize: 10, 
        visitInfo: ''
      }, 
      data: [],
      totalRecord: 0,
      UserSelecteds: [],
      MobileSelecteds: [],
      loading: false,
    };

  }
  
  
  componentWillMount() {

    this.loadBizDictionary(['return_visit_state','return_visit_type']); 

    if(this.state.dataModel.visitInfo == 1 || this.state.dataModel.visitInfo == 0){
      this.state.pagingSearch.visitInfo = this.state.dataModel.visitInfo;
    }

    this.setState({ pagingSearch: this.state.pagingSearch });

    this.onSearch();

  }
  compoentDidMount() {
    
  }
  
  columns = [
    {
      title: '学生姓名',
      width: 120,
      fixed: 'left',
      dataIndex: 'realName',
      render: (text, record, index) => {
        return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
            </span>
      }
    },
    {
      title: '回访情况',
      width:100,
      dataIndex: 'visitInfo',
    },
    {
      title: '手机',
      width:120,
      dataIndex: 'mobile',
    },
    {
      title: '微信',
      width:120,
      dataIndex: 'weixin',
    },
    {
      title: 'QQ',
      width:120,
      dataIndex: 'qq',
    },
    {
      title: '入学年份',
      width:90,
      dataIndex: 'year',
    },
    {
      title: '就读高校',
      dataIndex: 'university',
    },
    {
      title: '回访信息数',
      width:120,
      dataIndex: 'visitCount',
    },
    {
      title: '最新回访日期',
      width:120,
      dataIndex: 'visitDate',
      render: (text, record, index) => {
          return timestampToTime(record.visitDate);
      }
    },
    {
      title: '最新回访方式',
      width:120,
      dataIndex: 'visitType',
      render: (text, record, index) => {
          return getDictionaryTitle(this.state.return_visit_type,record.visitType);
      }
    },
    {
      title: '教学点',
      width:150,
      dataIndex:'teachCenter',
      
    },
    {
      title: '操作',
      fixed: 'right',
      width: 120,
      key: 'action',
      render: (text, record) => (
        <DropDownButton>
          <Button onClick={() => { this.onLookView('Edit', record); }}>回访</Button>
        </DropDownButton>
      ),
    }

  ];
  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;

    let startDate = condition.startDate;
    if(Array.isArray(startDate)){
      condition.startDate = formatMoment(startDate[0]);
      condition.endDate = formatMoment(startDate[1]);
    }	

    condition.returnVisitTaskId = this.state.dataModel.returnVisitTaskId;  //任务id
    condition.itemId = this.state.dataModel.itemId;  //任务id
    
    this.props.returnVisitSelectStudent(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false });
        message.error(data.message);
      }
      else {

        this.setState({ pagingSearch: condition, ...data, loading: false });

      }
    })
  }

  //视图回调
  onViewCallback = (dataModel) => {

    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' });
      this.onSearch();
    } else {
      switch (this.state.editMode) {
        case 'Create':
        case 'Edit':
          this.props.returnVisitStudentAdd(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message, 5);
            }
            else {
              message.success('操作成功！')
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
          case 'Manage':
          default:
            //进入管理页
            this.onSearch();
            this.onLookView("Manage", null);
            break;
      }
    }
  }

  //浏览视图
  onLookView = (op, item) => {
    if(item){
      item.returnVisitTaskId = this.state.dataModel.returnVisitTaskId;
      item.itemName = this.state.dataModel.itemName;
      item.returnVisitTaskName = this.state.dataModel.returnVisitTaskName;
      item.remark = this.state.dataModel.remark;
    }
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  onCancel = () => {
    this.props.viewCallback();
  }

  //视图回调
  render() { 
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Edit':
        block_content = <Return
            viewCallback={this.onViewCallback}
            editMode={this.state.editMode} 
            {...this.state}
            />
        break; 
      case 'ViewStudentDetail':
        block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
        break;
      case 'Manage':
      default:

      let extendButtons = [];

      const prefixSelector = getFieldDecorator('textKey', {
        initialValue: dataBind(this.state.pagingSearch.textKey || 'realName'),
      })(
        <Select style={{ width: 98 }} onChange={this.onCountryChange}>
          <Option value='realName'>学生姓名</Option>
          <Option value='mobile'>手机号</Option>
          <Option value='weixin'>微信号</Option>
          <Option value='qq'>QQ号</Option>
          <Option value='certificateNo'>证件号</Option>
          
        </Select>
        );
      
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons()} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">
                  <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="项目"
                        >
                          { this.state.dataModel.itemName }
                        </FormItem>
                    </Col>
                    <Col span={12} >
                        <FormItem
                            {...searchFormItemLayout}
                            label="任务名称"
                        >
                         { this.state.dataModel.returnVisitTaskName }
                        </FormItem>
                    </Col>
                    <Col span={24} >
                        <FormItem
                            {...searchFormItemLayout24}
                            label="回访要点"
                        >
                            { this.state.dataModel.remark }
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="回访情况">
                        {getFieldDecorator('visitInfo', {
                          initialValue: dataBind(this.state.pagingSearch.visitInfo),
                        })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.return_visit_state.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}><FormItem
                        {...searchFormItemLayout}
                        label="多条件查询"
                      >
                        {getFieldDecorator('textValue', {
                          initialValue: this.state.pagingSearch.textValue,
                        })(
                          <Input style={{width:250}} addonBefore={prefixSelector}
                          />
                          )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label={'回访日期'}
                        >
                            {getFieldDecorator('startDate', { initialValue: this.state.pagingSearch.startDate?[moment(this.state.pagingSearch.startDate,dateFormat),moment(this.state.pagingSearch.endTime,dateFormat)]:[] })(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="回访方式">
                        {getFieldDecorator('visitType', {
                          initialValue: dataBind(this.state.pagingSearch.visitType),
                        })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.return_visit_type.map((item, index) => {
                                return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>

                  </Row>
                </Form>
              }
              
            </ContentBox>
            
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowKey={record => record.liveStudentId}//主键
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 1500 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                </Row>
                <Row justify="end" align="middle" type="flex">
                  <Col span={4}>
                    <Button onClick={this.onCancel} icon="rollback">返回</Button>
                  </Col>
                  <Col span={20} className={'search-paging-control'}>
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
          </div>
        )
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(VisitManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    returnVisitSelectStudent: bindActionCreators(returnVisitSelectStudent, dispatch),//查询列表
    returnVisitStudentAdd: bindActionCreators(returnVisitStudentAdd, dispatch),//查询列表
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
