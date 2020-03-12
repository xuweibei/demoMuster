/*
订单业绩相关调整
*/

import React from 'react'; 
import FileDownloader from '@/components/FileDownloader';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux'; 
import {
  message, Form, Row, Col, Input, Select, Button, Icon,
  Table, Pagination, Modal, DatePicker,InputNumber
} from 'antd'; 
const FormItem = Form.Item;
const { Option, OptGroup } = Select;
import { timestampToTime, getDictionaryTitle, formatMoney, dataBind, formatMoment } from '@/utils';
import { loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
import moment from 'moment';
import { loadDictionary } from '@/actions/dic';
import { queryAllBranch,UserSourceDivision } from '@/actions/base'; 

import { getStudentAskBenefitList } from '@/actions/enrolStudent';
import { updateOrderAchievementUser } from '@/actions/enrolStudent';
import { updateArea } from '@/actions/enrolStudent';
import { editUser } from '@/actions/recruit';
import ContentBox from '@/components/ContentBox';
import StudentAskBenefitView from './view';
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import SelectArea from '../../../../components/BizSelect/SelectArea';
import EditableActive from '@/components/EditableActive';

const dateFormat = 'YYYY-MM-DD';
const { RangePicker } = DatePicker;
const searchFormItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
class StudentAskBenefitManage extends React.Component {

  constructor() {
    super();
    (this: any).fetch = this.fetch.bind(this);
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);
    this.onSearch = onSearch.bind(this);
    let timeArr = timestampToTime(new Date().getTime()).split('-');
    let nowYear = timeArr[0];
    let studyUniversityEnterYear = [];
    for(var i=0; i<20; i++){
        studyUniversityEnterYear.push({ title: (nowYear-i), value: (nowYear-i) })
    }
    this.state = {
      showHide:false,
      all_org_list:[],
      editMode: '',
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        askType: '1',
        regRegionId: '',
        realName: '',
        assignType: '',  //
        regSource: '',   //\
        grade: '',
        orderTypes: '',
        sourceBranchId:'',
        benefitMarketUserName: '',
        benefitPconsultUserName: '',
        notAskDate: '',        //开始时间
        studyUniversityName:'',
        activeName:'',
        createDateStart:'',
        createDateEnd:'',
        isPublic: '',
        askSource: '',
        askDateStart:'',
        askDateEnd:'',
      },
      data: [],
      totalRecord: 0,
      UserSelecteds: [],
      loading: false,
      startValue: null,
      endValue: null,
      activeIdData: [],
      studyUniversityEnterYear: studyUniversityEnterYear,//入学年份列表
    };
  }
  componentWillMount() {
    this.loadBizDictionary(['reg_source','dic_YesNo','ask_source']);
    this.loadBizDictionary(['grade']);
    this.UserSource();
    // this.onSearch()
  }
  componentDidMount(){
    document.addEventListener("keydown",this.handleEnterKey);
  }
  componentWillUnmount() {
      document.removeEventListener("keydown",this.handleEnterKey);
  }
  handleEnterKey = (e) => {
      if(e.keyCode === 13){
          this.onSearch();
      }
  }

  //用户来源分部
  UserSource = () => { 
    this.props.queryAllBranch({state:1}).payload.promise.then((response) => {
      let data = response.payload.data; 
          if(data.state == 'success'){
              let all_org_list = [];
              let orderDQList = data.data.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; })//按大区顺序排列
              //循环
              orderDQList.map((a) => {
              //没有分部
              if (a.organizationList.length == 0) {
                  return;
              }

              let orderFBList = a.organizationList.sort((a, b) => { return a.orderNo > b.orderNo ? 0 : 1; });//分部排序
              let dqItem = { orgId: `${a.orgId}`, orgName: a.orgName, children: [], state: a.state };
              orderFBList.map((fb) => {
                  dqItem.children.push({ orgId: `${fb.orgId}`, orgName: fb.orgName, state: fb.state })
              })
              all_org_list = [...all_org_list, dqItem];
              });
              this.setState({ all_org_list })
          }else{
            message.error(data.msg)
          }
      }
    )
  }
  disabledStartDate = (startValue) => {
    const endValue = this.state.endValue;
    if (!startValue || !endValue) {
        return false;
    }
    return startValue.valueOf() > endValue.valueOf();
}

disabledEndDate = (endValue) => {
    const startValue = this.state.startValue;
    if (!endValue || !startValue) {
        return false;
    }
    return endValue.valueOf() <= startValue.valueOf();
}
handleStartOpenChange = (open) => {
    if (!open) {
        this.setState({ endOpen: true });
    }
}

handleEndOpenChange = (open) => {
    this.setState({ endOpen: open });
}
onChange = (field, value) => {
    this.setState({
        [field]: value,
    });
}

onStartChange = (value) => {
    this.onChange('startValue', value);
}

onEndChange = (value) => {
    this.onChange('endValue', value);
}

  columns = [
    {
      title: '学生姓名',
      dataIndex: 'realName',
      render: (text, record, index) => {
        return <a onClick={() => {
          this.onStudentView(record)
        }}>{record.realName}</a>;
      },
      fixed: 'left',
      width: 120
    },
    {
      title: '用户来源分部',
      dataIndex: 'sourceBranchName'
    },
    {
      title: '市场人员',
      dataIndex: 'benefitMarketUserName',
      
    },
    {
      title: '电咨人员',
      dataIndex: 'benefitPconsultUserName',
    },
    {
      title: '面咨人员',
      dataIndex: 'benefitFconsultUserName',
    },
    {
      title: '所属区域',
      dataIndex: 'regRegionName',
    },
    {
      title: '学生来源',
      dataIndex: 'regSource',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.reg_source, record.regSource);
      }
    },
    {
      title: '最新参加活动',
      dataIndex: 'activityName',
    },
    {
      title: '在读高校',
      dataIndex: 'studyUniversityName'
    },
    {
      title: '学生意向等级 ',
      dataIndex: 'grade',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.grade, record.grade);
      }
    },
    {
      title: '订单状态',
      dataIndex: 'orderTypes',
      render: (text, record, index) => {
        switch (record.orderTypes) {
          case 0:
            return "无订单";
          case 1:
            return "已下单未缴费";
          case 2:
            return "已下单已缴费";
          default:
            return "全部";
        }
      }
    },
    {
      title: '分配电咨日期',
      dataIndex: 'benefitPconsultDate',
      render: (text, record, index) => (`${timestampToTime(record.benefitPconsultDate)}`)
    },
    {
      title: '最新电咨日期',
      dataIndex: 'askDate',
      render: (text, record, index) => (`${timestampToTime(record.askDate)}`)
    },
    {
      title: '计划下次电咨日期',
      dataIndex: 'nextAskDate',
      render: (text, record, index) => (`${timestampToTime(record.nextAskDate)}`)
    },
    {
      title: '距今天数',
      dataIndex: 'ago',
    },
    {
      title: '学生创建时间',
      dataIndex: 'studentCreateDate',
      render: (text, record, index) => {
        return timestampToTime(record.studentCreateDate)
      }
    },
    {
      title: '电咨情况',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (text, record) => (
        //编辑   适用商品 互斥设置(2)
        <Row justify="space-around" type="flex">
          <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
        </Row>
      ),
    }
  ];

  //检索数据

  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    let createDateStart = condition.createDateStart;
    if(createDateStart){
      condition.createDateStart = createDateStart[0];
      condition.createDateEnd = createDateStart[1];
    }

    if (condition.activeId && condition.activeId.length > 0) {
        this.setState({ activeIdData: condition.activeId })
        condition.activeId = condition.activeId[0].id
    }
    let askDate = condition.askDateStart;
    if (askDate) {
        condition.askDateStart = formatMoment(askDate[0]);
        condition.askDateEnd = formatMoment(askDate[1]);
    }

    this.props.getStudentAskBenefitList(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.result === false) {
        this.setState({ loading: false })
        message.error(data.message);
      }
      else {
        this.setState({ pagingSearch: condition, ...data, loading: false })
      }
    })
  }
  onStudentView = (record) => {
    this.onLookView("View", record)
  }
  oneditpUser = () => {
    let results='';
    let flag = true;
    this.state.UserSelecteds.map((item, index) => {
      let result = this.state.data.find(rocode => rocode.studentId == `${item}`)
      if(results==''){
        results = result.regRegionId;
      }
      else if(results!=result.regRegionId){
        message.error('所选区域不同,不允许进行人员调整');
        flag = false;
      }
    });
    if(flag){
      let params = { ids: this.state.UserSelecteds,results:results, type: 2 }
      this.onLookView("editpUser", params);
    }
   
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
      this.setState({ currentDataModel: null, editMode: 'Manage', isBack: true })
    } else {
      switch (this.state.editMode) {
        case "EditDate":
          this.props.discountRuleExpiryDateBatchUpdate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Edit':
          this.props.updateOrderAchievementUser(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'Create':
          this.props.discountRuleCreate(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        case 'editArea':
          this.props.updateArea(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.onSearch();
              //进入管理页
              this.onLookView("Manage", null);
            }
          })
          break;
        default:
          this.props.editUser(dataModel).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'error') {
              message.error(data.message);
            }
            else {
              this.setState({ UserSelecteds: [] });
              this.onSearch();
              this.onLookView("Manage", null);
            }
          })
          break;
      }
    }
  }
  showHideFN = () =>{ 
      let { showHide } = this.state;
      this.setState({ 
          showHide:!showHide
      })
  }

  render() {
    const { getFieldDecorator } = this.props.form;
    let block_content = <div></div>
    switch (this.state.editMode) {
      case "View":
        block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
        break;
      case 'EditDate':
      case 'Edit':
      case 'editmUser':
      case 'editpUser':
      case 'editfUser':
      case 'editArea':
        block_content = <StudentAskBenefitView
          viewCallback={this.onViewCallback}
          {...this.state}

        />
        break;
      case 'Create':
      case 'Audit':
        // block_content = <DiscountView
        //   viewCallback={this.onViewCallback}
        //   {...this.state}
        // />
        // break;
        break;
      case 'Manage':
      default:
        var rowSelection = {
          selectedRowKeys: this.state.UserSelecteds,
          onChange: (selectedRowKeys, selectedRows) => {
            this.setState({ UserSelecteds: selectedRowKeys })
          },
          getCheckboxProps: record => ({
            disabled: false,    // Column configuration not to be checked
          }),
        };
        let extendButtons = [];
        const {getFieldDecorator} = this.props.form;
        extendButtons.push(<FileDownloader
          apiUrl={'/edu/studentAsk/exportStudentBenefitList'}//api下载地址
          method={'post'}//提交方式
          options={this.state.pagingSearch}//提交参数
          title={'导出电咨信息'}
        >
        </FileDownloader>);
        extendButtons.push(<Button onClick={() => { this.showHideFN() }
        } icon={this.state.showHide?'caret-up':'caret-down'} className="button_dark" > 搜索条件{this.state.showHide?'收起':'展开'}</Button>);

        // extendButtons.push(<Button onClick={() => { this.onLookView('Create', { itemNames: '', startDate: '', endDate: '', remark: '', productDiscountType: '', productDiscountName: '', validDate: '', productDiscountPrice: '' }) }
        // } icon="plus" className="button_dark" > 优惠</Button>);
        block_content = (
          <div>
            <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
              {!this.state.seachOptionsCollapsed &&
                <Form
                  className="search-form"
                >
                  <Row justify="center" gutter={24} align="middle" type="flex">

                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'学生姓名'} >
                        {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                           <Input placeholder="学生姓名" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'手机号'} >
                        {getFieldDecorator('mobile', { initialValue: this.state.pagingSearch.mobile })(
                         <Input placeholder="手机号" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'区域'} >
                        {
                          getFieldDecorator('regRegionId', { initialValue: this.state.pagingSearch.regRegionId })(
                            <SelectArea scope='my' hideAll={false} showCheckBox={false} />
                          )
                        }
                      </FormItem>
                    </Col>
                    <Col span={8}>
                          <FormItem {...searchFormItemLayout} label={'用户来源分部'}>
                            {getFieldDecorator('sourceBranchId',{ initialValue:this.state.pagingSearch.sourceBranchId})(
                               <Select
                                  showSearch={true}
                                  filterOption={(inputValue, option) => {  
                                  var result = false;
                                  for(var i = 0; i < option.props.children.length; i++){
                                  if(option.props.children[i].indexOf(inputValue) != -1){
                                      result = true;
                                      break;
                                  }
                                  }
                                  return result;
                                  }}
                              >
                                  <Option value=''>全部</Option> 
                                  {this.state.all_org_list.map((dqItem) => {
                                      return <OptGroup label={dqItem.orgName}>
                                          {dqItem.children.map((fbItem, index) => {
                                          return <Option title={fbItem.state === 0?fbItem.orgName+'【停用】':fbItem.orgName} value={fbItem.orgId} key={index}>{fbItem.orgName}{fbItem.state === 0 ? '【停用】' : ''}</Option>
                                          })}
                                      </OptGroup>
                                  })}
                              </Select>
                            )}
                          </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'分配电咨情况'} >
                        {getFieldDecorator('assignType', { initialValue: this.state.pagingSearch.assignType })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="1">已分配</Option>
                            <Option value="0">未分配</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'学生来源'} >
                        {getFieldDecorator('regSource', { initialValue: this.state.pagingSearch.regSource })(
                          <Select>
                            <Option value="">全部</Option>
                            {this.state.reg_source.map((item, index) => {
                              return <Option value={item.value} key={index}>{item.title}</Option>
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>

                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'学生订单情况'} >
                        {getFieldDecorator('orderTypes', { initialValue: this.state.pagingSearch.orderTypes })(
                          <Select>
                            <Option value="">全部</Option>
                            <Option value="0" key="0">无订单</Option>
                            <Option value="1" key="1">已下单未缴费</Option>
                            <Option value="2" key="2">已下单已缴费</Option>
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'电询人员姓名'} >
                        {getFieldDecorator('benefitPconsultUserName', { initialValue: this.state.pagingSearch.benefitPconsultUserName })(
                         <Input placeholder="电询人员姓名" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'?天内未电咨'} >
                        {getFieldDecorator('notAskDate', { initialValue: this.state.pagingSearch.notAskDate })(
                          <InputNumber placeholder="天数" min={0} defaultValue={0} style={{marginRight:8}}/>
                        )}
                        天
                      </FormItem>
                    </Col>
                    {
                      this.state.showHide && <div>
                        
                    <Col span={8} >
                        <FormItem {...searchFormItemLayout} label="入学年份" >
                            {getFieldDecorator('studyUniversityEnterYear', { initialValue: '' })(
                                <Select>
                                    <Option value="">全部</Option>
                                    {this.state.studyUniversityEnterYear.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'市场人员姓名'} >
                        {getFieldDecorator('benefitMarketUserName', { initialValue: this.state.pagingSearch.benefitMarketUserName })(
                          <Input placeholder="市场人员姓名" />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'在读高校'} >
                        {getFieldDecorator('studyUniversityName', { initialValue: this.state.pagingSearch.studyUniversityName })(
                         <Input placeholder="在读高校" />
                        )}
                      </FormItem>
                    </Col>
                    {/* <Col span={8}>
                      <FormItem {...searchFormItemLayout} label={'参加活动名称'} >
                        {getFieldDecorator('activeName', { initialValue: this.state.pagingSearch.activeName })(
                         <Input placeholder="参加活动名称" />
                        )}
                      </FormItem>
                    </Col> */}
                    <Col span={8} >
                        <FormItem {...searchFormItemLayout}
                            label="首次活动名称">
                            {getFieldDecorator('activeId', { initialValue: (!this.state.activeIdData.length ? [] : [{
                                id: this.state.activeIdData[0].id,
                                name: this.state.activeIdData[0].name
                              }]) })(
                                <EditableActive  maxTags={1}/>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8} >
                        <FormItem
                          {...searchFormItemLayout}
                          label="学生创建日期"
                         >
                          {getFieldDecorator('createDateStart', { initialValue: this.state.pagingSearch.createDateStart?[moment(this.state.pagingSearch.createDateStart,dateFormat),moment(this.state.pagingSearch.createDateEnd,dateFormat)]:[] })(
                            
                                <RangePicker style={{width:210}}/>
                          )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...searchFormItemLayout} label={'咨询来源'} >
                            {getFieldDecorator('askSource', { initialValue: this.state.pagingSearch.askSource })(
                                <Select>
                                    <Option value="">全部</Option>
                                    {this.state.ask_source.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    <Col span={8}>
                        <FormItem {...searchFormItemLayout} label={'学生意向等级'} >
                            {getFieldDecorator('grade', { initialValue:this.state.pagingSearch.grade })(
                                <Select>
                                    <Option value="">全部</Option>
                                    {this.state.grade.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                    </Col>
                    
                    <Col span={8}>
                        <FormItem
                            {...searchFormItemLayout}
                            label="咨询日期">
                            {getFieldDecorator('askDateStart', { initialValue: this.state.pagingSearch.askDateStart?[moment(this.state.pagingSearch.askDateStart,dateFormat),moment(this.state.pagingSearch.askDateEnd,dateFormat)]:[] })(
                                <RangePicker style={{width:220}}/>
                            )}
                        </FormItem>
                    </Col>
                    
                    {//线下分部
                      (this.props.currentUser.userType.branchType && this.props.currentUser.userType.branchType == 2) ? <Col span={8} >
                          <FormItem {...searchFormItemLayout}
                              label="是否公海">
                              {getFieldDecorator('isPublic', { initialValue: this.state.pagingSearch.isPublic })(
                                  <Select>
                                      <Option value="">全部</Option>
                                      {this.state.dic_YesNo.map((item, index) => {
                                          return <Option value={item.value} key={index}>{item.title}</Option>
                                      })}
                                  </Select>
                              )}
                          </FormItem>
                      </Col>
                      :
                      <Col span={8} ></Col>
                    }
                    <Col span={8} ></Col>
                    <Col span={8} ></Col>
                    <Col span={8} ></Col> 
                    </div>
                    }
                  </Row>
                </Form>
              }
            </ContentBox>
            <div className="space-default"></div>
            <div className="search-result-list">
              <Table columns={this.columns} //列定义
                loading={this.state.loading}
                rowSelection={rowSelection}
                rowKey={'studentId'}
                pagination={false}
                dataSource={this.state.data}//数据
                bordered
                scroll={{ x: 2000 }}
              />
              <div className="space-default"></div>
              <div className="search-paging">
                <Row justify="space-between" align="middle" type="flex">
                  <Col span={4}>
                    {(this.state.data.length > 0 && this.state.UserSelecteds.length > 0) ?
                      <Button onClick={this.oneditpUser} icon='editpUser'>电咨人员调整</Button> :
                      <Button disabled icon='editpUser'>电咨人员调整</Button>
                    }
                  </Col>
                </Row>
                <Row justify="end" align="right" type="flex">
                  <Col span={20} className={'search-paging-control'} align="right">
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
const WrappedManage = Form.create()(StudentAskBenefitManage);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  let { currentUser } = state.auth;
  return { Dictionarys, currentUser };
};

function mapDispatchToProps(dispatch) {
  return {
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    getStudentAskBenefitList: bindActionCreators(getStudentAskBenefitList, dispatch),
    updateArea: bindActionCreators(updateArea, dispatch),
    updateOrderAchievementUser: bindActionCreators(updateOrderAchievementUser, dispatch),
    editUser: bindActionCreators(editUser, dispatch),
    //用户分部来源
    queryAllBranch: bindActionCreators(queryAllBranch, dispatch),
    //用户分部来源
    UserSourceDivision: bindActionCreators(UserSourceDivision, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
