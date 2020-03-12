/*
直播回放管理
2018-11-06
*/
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
  message, Modal, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Divider, Radio, DatePicker
} from 'antd';
const FormItem = Form.Item;
const { RangePicker } = DatePicker;
const dateFormat = 'YYYY-MM-DD';
import moment from 'moment';

import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';

import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import {
  loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange,
  searchFormItemLayout, searchFormItemLayout24,
  onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons
} from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime, split, formatMoney, dataBind, formatMoment } from '@/utils';

import { queryLiveStudentDetail, addLiveReplay, batchReleaseLives } from '@/actions/live';

class LivePlayBackManage extends React.Component {
  constructor() {
    super();
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);

    let timeArr = timestampToTime(new Date().getTime()).split('-');
    let startTimeYear = timeArr[0];
    let startTimeMonth = timeArr[1];
    let startTimeDay = timeArr[2];

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        item: '',
        courseCategory:'',
        studentSource: '',
        signStatus: '',
        bookSource: '',
        startDate: (startTimeYear-1)+'-'+startTimeMonth+'-'+startTimeDay,
        endDate: startTimeYear+'-'+startTimeMonth+'-'+startTimeDay,
      },
      data: [],
      totalRecord: 0,
      loading: false,
      UserSelecteds: [],
    };
  }
  componentWillMount() {

    if(this.props.orgType == 3){
      this.columns.splice(3, 1);
    }

    // this.onSearch();
  }
  componentWillUnMount() {
  }

  columns = [
    {
      title: '学生姓名',
      dataIndex: 'realName',
      fixed: 'left',
      width: 120,
    },
    {
      title: '学号',
      dataIndex: 'studentNo',
    },
    {
      title: '手机',
      dataIndex: 'mobile',
      width: 120,
    },
    {
      title: '学生分部',
      dataIndex: 'branchName',
      width: 180,
    },
    {
      title: '教学点',
      dataIndex: 'teachCentername',
      width: 200,
    },
    {
      title: '课程班名称',
      width: 200,
      dataIndex: 'courseplanName',
    },
    {
      title: '来源',
      dataIndex: 'studentSource',
      width: 120,
    },
    {
      title: '是否重修',
      dataIndex: 'isGive',
      width: 80,
    },
    {
      title: '预约方式',
      dataIndex: 'bookSource',
      width: 80,
    },
    {
      title: '直播名称',
      dataIndex: 'liveName',
      width: 200,
    },
    {
      title: '项目',
      width: 120,
      dataIndex: 'item',
    },
    {
      title: '科目',
      width: 150,
      dataIndex: 'courseCategory'
    },
    {
      title: '签到状态',
      dataIndex: 'signStatus',
      fixed: 'right',
      width: 120,
    },
  ];
  //检索数据
  fetch(params = {}) {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let startDate = condition.startDate;
    if(Array.isArray(startDate)){
      condition.startDate = formatMoment(startDate[0]);
      condition.endDate = formatMoment(startDate[1]);
    }	
    this.props.queryLiveStudentDetail(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          ...data,
          loading: false
        })
      }
      else {
        this.setState({ loading: false })
        message.error(data.message);
      }
    })
  }
  //浏览视图
  onLookView = (op, item) => {
    this.setState({
      editMode: op,//编辑模式
      currentDataModel: item,//编辑对象
    });
  };
  //视图回调
  onViewCallback = (dataModel) => {
    if (!dataModel) {
      this.setState({ currentDataModel: null, editMode: 'Manage' })
    } else {
      switch (this.state.editMode) {
        case 'Create':
        case 'Edit':
            
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

  render() {
    let block_content = <div></div>
    switch (this.state.editMode) {
      case 'Create':
      case 'Edit':
        
        break; 
       
      case 'Manage':
      default:
        
        const { getFieldDecorator } = this.props.form;
        let extendButtons = [];
        
        block_content = (
          <div>
            {/* 搜索表单 */}
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form className="search-form" >
                  <Row gutter={24}>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'项目'}>
                        {getFieldDecorator('item', {
                          initialValue: this.state.pagingSearch.item
                        })(
                          <SelectItem
                            scope={'my'}
                            hideAll={false}
                            hidePleaseSelect={true}
                            onSelectChange={(value) => {
                              this.state.pagingSearch.item = value;
                              this.setState({ pagingSearch: this.state.pagingSearch });
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    
                    <Col span={12} >
                      <FormItem
                        {...searchFormItemLayout}
                        label="科目"
                      >
                        {getFieldDecorator('courseCategory', { initialValue: this.state.pagingSearch.courseCategory })(
                          <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.item} hideAll={false} />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'直播名称'} >
                        {getFieldDecorator('liveName', { initialValue: this.state.pagingSearch.liveName })(
                          <Input placeholder="直播名称" />
                        )}
                      </FormItem>
                    </Col>
                    {
                      this.props.orgType != 3 && <Col span={12}>
                          <FormItem {...searchFormItemLayout} label={'所属分部'} >
                            {getFieldDecorator('branchId', { initialValue: this.state.pagingSearch.branchId })(
                              <SelectFBOrg scope='my' hideAll={false} />
                            )}
                          </FormItem>
                      </Col>
                    }
                    

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="来源" >
                        {getFieldDecorator('studentSource', { initialValue: this.state.pagingSearch.studentSource })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="1" key='1'>面授班</Option>
                            <Option value="2" key='2'>赠送面授串讲</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="签到状态" >
                        {getFieldDecorator('signStatus', { initialValue: this.state.pagingSearch.signStatus })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="0" key='0'>未签到</Option>
                            <Option value="1" key='1'>已签到</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                          <Input placeholder="学生姓名" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'手机'} >
                        {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                          <Input placeholder="手机" />
                        )}
                      </FormItem>
                    </Col>
                    
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label="预约方式" >
                        {getFieldDecorator('bookSource', { initialValue: this.state.pagingSearch.bookSource })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="1" key='1'>集体预约</Option>
                            <Option value="2" key='2'>学生预约</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                      <FormItem {...searchFormItemLayout} label={'课程班名称'} >
                        {getFieldDecorator('courseplanName', { initialValue: this.state.pagingSearch.courseplanName })(
                          <Input placeholder="课程班名称" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={12}>
                        <FormItem
                            {...searchFormItemLayout}
                            label={'预约时间'}
                        >
                            {getFieldDecorator('startDate', { initialValue:this.state.pagingSearch.startDate?[moment(this.state.pagingSearch.startDate, dateFormat),moment(this.state.pagingSearch.endDate, dateFormat)]:[]})(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                  </Row>
                </Form>
              }
            </ContentBox>
            {/* 内容分割线 */}
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: this.props.orgType == 3 ? 1700 : 1900 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={24} className={'search-paging-control'}>
                    <Pagination showSizeChanger
                      current={this.state.pagingSearch.currentPage}
                      defaultPageSize={this.state.pagingSearch.pageSize}      pageSizeOptions = {['10','20','30','50','100','200']}
                      pageSize={this.state.pagingSearch.pageSize}
                      onShowSizeChange={this.onShowSizeChange}
                      onChange={this.onPageIndexChange}
                      showTotal={(total) => { return `共${total}条数据`; }}
                      total={this.state.totalRecord} />
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        );
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedManage = Form.create()(LivePlayBackManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  //1 总部；2 大区；3 分部
  let orgType = state.auth.currentUser.userType.usertype;
  return { Dictionarys, orgType };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    queryLiveStudentDetail: bindActionCreators(queryLiveStudentDetail, dispatch),
    addLiveReplay: bindActionCreators(addLiveReplay, dispatch),
    batchReleaseLives: bindActionCreators(batchReleaseLives, dispatch),
    
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
