/*
班级管理  学习情况查询
2018-09-19
王强
*/
//标准组件环境
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Divider, Modal } from 'antd';
const FormItem = Form.Item;

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';
//数据转字典标题
import { getDictionaryTitle, timestampToTime } from '@/utils';

//业务接口方法引入
//import { getCourseArrangeList, updateFinishStatus } from '@/actions/base';
import { getStudySituation,getTeachCenterByBranchId } from '@/actions/base';
//业务数据视图（增、删、改、查)
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import SelectItemCoursePlanBatch from '@/components/BizSelect/SelectItemCoursePlanBatch';
import SelectTeachCenterByUser from '@/components/BizSelect/SelectTeachCenterByUser';
import FileDownloader from '@/components/FileDownloader';
import DropDownButton from '@/components/DropDownButton';
//学生详情
import StudentIndexView from '@/components/DetailStudentContentBox/TabsStudentContents';
import Detail from './view'
import SelectFBOrg from '@/components/BizSelect/SelectFBOrg';



class ZStudentStudyInfo  extends React.Component {

  constructor() {
    super()
    //扩展方法用于本组件实例
    this.loadBizDictionary = loadBizDictionary.bind(this);
    this.onToggleSearchOption = onToggleSearchOption.bind(this);
    this.renderSearchTopButtons = renderSearchTopButtons.bind(this);
    this.renderSearchBottomButtons = renderSearchBottomButtons.bind(this);
    this.onSearch = onSearch.bind(this);
    this.onPageIndexChange = onPageIndexChange.bind(this);
    this.onShowSizeChange = onShowSizeChange.bind(this);

    this.state = {
      currentDataModel: null,
      editMode: '',//Edit,Create,View,Delete
      pagingSearch: {
        currentPage: 1,
        pageSize: 10,
        operationType:1,//operationType	true	普通参数	Integer		1、总部操作 2、分部操作
        teachCenterId: '',
        itemId: '',
        courseCategoryId:'',
        teachMode: '',
        state:'',//state	false	普通参数	Integer		学习情况 1、通过;2、学习中;3、终止;5、未学习'
        realName:'',//false	普通参数	String		学生姓名
        courseplanBatchId: '',
        courseName: '',
        finishStatus: '',
        startDate:null,
        endDate:null,
        branchId:'',
        branchName: '',//分部
      },
      bz_teach_center_list:[],
      data: [],
      totalRecord: 0,
      loading: false,

    };

  }
  componentWillMount() {
    //载入需要的字典项
    this.loadBizDictionary(['teach_class_type','teachmode', 'category_state']);//课程班类型
    //首次进入搜索，加载服务端字典项内容
    // this.onSearch();
  }
  componentWillUnMount() {
  }


  //table 输出列定义
  columns = [
    {
      title: '分部',
      dataIndex: 'branchName',
      fixed: 'left',
      width: 160
    },
    {
      title: '教学点',
      width: 180,
      dataIndex: 'teachCenterName'
    },
    {
      title: '学生姓名',
      dataIndex: 'studentName',
      render: (text, record, index) => {
        return <span>
                <a href="javascript:;" onClick={() => { this.onLookView('ViewStudentDetail', record); }}>{text}</a>
            </span>
      }
    },
    {
      title: '手机号',
      dataIndex: 'mobile'
    },
    {
      title: '项目',
      dataIndex: 'itemName',
    },
    {
      title: '科目',
      dataIndex: 'courseCategoryName',
    },
    {
      title: '授课方式',
      dataIndex: 'teachMode',
      render: (text, record, index) => {
        if(record.teachMode == 3) return '网络+面授';
        return getDictionaryTitle(this.state.teachmode, record.teachMode);
      }
    },
    {
      title: '学习情况',
      dataIndex: 'state',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.category_state, record.state);
      }
    },
    {
        title: '最新面授批次',
        dataIndex: 'faceBatch',
    },
    {
        title: '最新课程阶段',
        dataIndex: 'itemStageName',
    },
    {
        title: '是否结课阶段',
        dataIndex: 'isFinal',
    },
    {
        title: '最新参考日期',
        dataIndex: 'examDate',
        render: (text, record, index) => {
            return timestampToTime(record.examDate);
        }
    },
    {
        title: '最新成绩',
        dataIndex: 'score',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (text, record) => {
        //编辑   适用商品 互斥设置(2)
        return <Button onClick={() => { this.onLookView('View', record); }}>查看</Button>
      },
    }];


  //检索数据
  fetch = (params = {}) => {
    this.setState({ loading: true });
    var condition = params || this.state.pagingSearch;
    this.props.getStudySituation(condition).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          pagingSearch: condition,
          data: data.data,
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
    }
    else {
      switch (this.state.editMode) {
        case "Student":
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Create":
        case "Edit": //提交
          this.onSearch();
          this.onLookView("Manage", null);
          break;
        case "Import":
          this.onSearch();
          this.onLookView("Manage", null);
          //提交
          break;

      }
    }
  }


  //渲染，根据模式不同控制不同输出
  render() {

    const { getFieldDecorator } = this.props.form;

    let block_content = <div></div>
    switch (this.state.editMode) {

      case 'ViewStudentDetail':
        block_content = <StudentIndexView viewCallback={this.onViewCallback} studentId={this.state.currentDataModel.studentId} />
        break;
      case "View":
        block_content = <Detail viewCallback={this.onViewCallback}
                                                          {...this.state}
        />
        break;
      case "Delete":
      case "Manage":
      default:
        //除查询外，其他扩展按钮数组
        let extendButtons = [];

        block_content = (<div>
          {/* 搜索表单 */}
          <ContentBox topButton={this.renderSearchTopButtons(extendButtons)} bottomButton={this.renderSearchBottomButtons(extendButtons)}>
            {!this.state.seachOptionsCollapsed &&
            <Form
              className="search-form"
            >
              <Row gutter={24}  type="flex">
                <Col span={12} >
                  <FormItem {...searchFormItemLayout} label='分部'>
                    {getFieldDecorator('branchId', {
                      initialValue: this.state.pagingSearch.branchId,
                    })(
                      <SelectFBOrg  scope='my'  hideAll={false}  onSelectChange={(value, name) => {
                        var branchId = null;
                        if(value){
                          branchId = value;
                        }
                        this.setState({branchId: branchId});
                        if (value) {
                          let  condition = { currentPage: 1, pageSize: 99, branchId: branchId }
                          this.props.getTeachCenterByBranchId(condition).payload.promise.then((response) => {
                            let data = response.payload.data;
                            let list=[];
                            if (data.state === 'success') {
                              data.data = data.data || [];
                              data.data.map(r => {
                                list.push({
                                  value: r.orgId,
                                  title: r.orgName
                                })
                              });

                              this.state.pagingSearch.teachCenterId = '';
                              this.setState({ pagingSearch: this.state.pagingSearch });

                              this.setState({ bz_teach_center_list: list });
                              setTimeout(() => {
                                  this.props.form.resetFields(['teachCenterId']);
                              }, 500);
                            }
                            else {
                              message.error(data.message);
                            }
                          })
                        }

                      }}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="教学点"
                  >
                    {getFieldDecorator('teachCenterId', { initialValue: this.state.pagingSearch.teachCenterId })(

                      <Select>
                        <Option value="">全部</Option>
                        {this.state.bz_teach_center_list.map((i, index) => {
                          return <Option value={i.value.toString()} key={i.value}>{i.title}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label={'项目'}>
                    {getFieldDecorator('itemId', {
                      initialValue: this.state.pagingSearch.itemId
                    })(

                      <SelectItem
                          scope={'my'}
                          hideAll={true}
                          hidePleaseSelect={true}
                          isFirstSelected={true}
                          onSelectChange={(value) => {
                            this.state.pagingSearch.itemId = value;
                            this.state.pagingSearch.courseCategoryId = '';
                            this.setState({ pagingSearch: this.state.pagingSearch });
                            setTimeout(() => {
                                {/* 重新重置科目项 */ }
                                this.props.form.resetFields(['courseCategoryId']);
                                this.onSearch();
                            }, 500);
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
                    {getFieldDecorator('courseCategoryId', { initialValue: this.state.pagingSearch.courseCategoryId })(
                      <SelectItemCourseCategory isMain={true} itemId={this.state.pagingSearch.itemId} hideAll={false} />
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="授课方式">
                    {getFieldDecorator('teachMode', { initialValue: this.state.pagingSearch.teachMode })(
                      <Select>
                        <Option value="">全部</Option>
                        {this.state.teachmode.map((item, index) => {
                          return <Option value={item.value} key={index}>{item.title}</Option>
                        })}
                        <Option value="3">网络+面授</Option>
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12}>
                  <FormItem {...searchFormItemLayout} label="学习情况">
                    {getFieldDecorator('state', { initialValue: this.state.pagingSearch.state })(
                      <Select>
                        <Option value="">全部</Option>
                        {this.state.category_state.map((item, index) => {
                          return <Option value={item.value} key={index}>{item.title}</Option>
                        })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
                <Col span={12} >
                  <FormItem
                    {...searchFormItemLayout}
                    label="学生姓名"
                  >
                    {getFieldDecorator('realName', { initialValue: this.state.pagingSearch.realName })(
                      <Input placeholder='请输入学生姓名'/>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Form>
            }
          </ContentBox>
          {/* 内容分割线 */}
          <div className="space-default"></div>
          {/* 数据表格 */}
          <div className="search-result-list">
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.data}//数据
                   bordered
                   scroll={{ x: 1500 }}
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
        </div>);
        break;
    }
    return block_content;
  }
}
//表单组件 封装
const WrappedCourseManage = Form.create()(ZStudentStudyInfo);

const mapStateToProps = (state) => {
  //基本字典数据
  let { Dictionarys } = state.dic;
  return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
  return {
    //基本字典接口
    loadDictionary: bindActionCreators(loadDictionary, dispatch),
    //各业务接口
    getStudySituation: bindActionCreators(getStudySituation, dispatch),
    getTeachCenterByBranchId: bindActionCreators(getTeachCenterByBranchId, dispatch),
  };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseManage);
