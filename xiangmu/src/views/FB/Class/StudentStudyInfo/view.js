/**
 * (分部)班级管理  学习情况查询详情
 * 2018-9-20
 */
import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import {
    Modal, Form, Row, Col, Input, Select, Button, Icon,
    Table, Pagination, Card, Radio, message, Checkbox, Cascader
} from 'antd';
const FormItem = Form.Item;

import { loadBizDictionary, searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import { getDictionaryTitle, getViewEditModeTitle, dataBind, split, formatMoney, timestampToTime,convertTextToHtml } from '@/utils';

import { loadDictionary } from '@/actions/dic';
import { queryCourseCategoryStudyInfo } from '@/actions/course';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};



class Detail extends React.Component {
    constructor(props) {
        super(props)

        this.loadBizDictionary = loadBizDictionary.bind(this);
        this.state = {
            dataModel: { ...props.currentDataModel },
          webCourseList:[],
          faceCourseList:[],
          examsList: [],
          allGive: false,
          user: {},
          //激活状态0、未激活 1、已激活 2、已激活未过期 3、已激活已过期
          activeState : [
            { title: '未激活', value: '0', state: 1 },
            { title: '已激活', value: '1', state: 1 },
            { title: '已激活未过期', value: '2', state: 1 },
            { title: '已激活已过期', value: '3', state: 1 },
          ],
          isGive : [
            { title: '是', value: '1', state: 1 },
            { title: '否', value: '0', state: 1 }
          ]
        };
    }
    componentWillMount() {
      //载入需要的字典项
      this.loadBizDictionary([ 'dic_sex','teach_class_type','category_state']);

      let {studentId,itemId,courseCategoryId} = this.state.dataModel;
        if (studentId) {
            this.props.queryCourseCategoryStudyInfo({ studentId:studentId, itemId:itemId, courseCategoryId:courseCategoryId }).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.state === 'success') {
                  this.setState({
                    faceCourseList: data.data.attendCourseArrangeDetails,
                    webCourseList: data.data.studentOnlineCourseStudyDetails,
                    examsList: data.data.studentParticipateExams,
                    user: data.data.studentCourseCategoryStudyInfo || {},
                    allGive: data.data.allGive,
                    loading: false
                  })
                }
                else {
                  this.setState({ loading: false })
                  message.error(data.message);
                }
            });
        }
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}学生学习情况详情`;
    }
    //表单按钮处理
    renderBtnControl() {
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button onClick={this.onCancel} icon="rollback">返回</Button>
        </FormItem>
    }
  renderDataTable = () => {
    return (<div>
        {(this.state.faceCourseList.length>0  || this.state.webCourseList.length>0)  &&   <div className="search-result-list" style={{padding:'20px'}}>
          {this.state.faceCourseList.length>0 && <div>
            <div className="space-default"></div>
            <p style={{paddingBottom:10}}>参加面授班情况{this.state.allGive ? '，面授赠送。':''}</p>
            <Table columns={this.columns} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.faceCourseList}//数据
                   bordered
                   scroll={{ x: 1300 }}
            />
          </div>
          }
          {this.state.examsList.length>0 && <div>
            <div className="space-default"></div>
              <p style={{paddingBottom:10}}>参加考试情况</p>
              <Table columns={this.columnsExam} //列定义
                    loading={this.state.loading}
                    pagination={false}
                    dataSource={this.state.examsList}//数据
                    bordered
                    scroll={{ x: 1300 }}
              />
            </div>
          }
          {this.state.webCourseList.length>0  && <div>
            <div className="space-default"></div>
            <p style={{paddingBottom:10}}>网课学习情况</p>
            <Table columns={this.columnweb} //列定义
                   loading={this.state.loading}
                   pagination={false}
                   dataSource={this.state.webCourseList}//数据
                   bordered
                   scroll={{ x: 1300 }}
            />
          </div>
          }
        </div>}
      </div>
    )
  }
  //table 输出列定义
  columns = [
    {
      title: '开课批次',
      fixed: 'center',
      dataIndex: 'courseplanBatchName'
    },
    {
      title: '教学点',
      dataIndex: 'teachCenterName'
    },
    {
      title: '课程班',
      dataIndex: 'courseplanName'
    },
    {
      title: '课程阶段',
      dataIndex: 'itemStageName',
    },
    {
      title: '是否结课阶段',
      dataIndex: 'isFinal',
      render: (text, record, index) => {
          return record.isFinal == 1 ? '是' : '否';
      }
    },
    {
      title: '课程班类型',
      dataIndex: 'teachClassType',
      render: (text, record, index) => {
          return getDictionaryTitle(this.state.teach_class_type, record.teachClassType);
      }
    },
    {
      title: '开课时段',
      dataIndex: 'startDate',
      render: (text, record, index) => {
          return timestampToTime(record.startDate) +' 至 ' + timestampToTime(record.endDate);
      }
    },
    {
      title: '课次',
      dataIndex: 'courseNum'
    },
    {
      title: '排课课时',
      dataIndex: 'classHour'
    },
    {
      title: '预估考季',
      dataIndex: 'examBatchName',
    },
    {
      title: '学习情况',
      dataIndex: 'finishStatus',
      render: (text, record, index) => {
        if(record.finishStatus == 0 || record.finishStatus == 1){
          return '正常';
        }else if(record.finishStatus == 2){
          return '延期';
        }else if(record.finishStatus == 3){
          return '终止';
        }
      }
    },
    {
      title: '出勤率',
      dataIndex: 'attendance',
      render: (text, record, index) => {
          return (record.attendance || 0)*100 +'%';
      }
    },
    {
      title: '讲师',
      dataIndex: 'teacherNames',
    },
  ];
    //table 输出列定义
    columnweb= [
    {
      title: '课程名称',
      fixed: 'center',
      dataIndex: 'courseName'
    },
    {
      title: '所属商品名称',
      dataIndex: 'productName'
    },
    {
      title: '是否赠送',
      dataIndex: 'isGive',
      render: (text, record, index) => {
          return record.isGive == 1 ? '是' : '否';
      }
    },
    {
      title: '激活状态',
      dataIndex: 'activeState',
      render: (text, record, index) => {
        return getDictionaryTitle(this.state.activeState, record.activeState);
      }
    },
    {
      title: '激活时间',
      dataIndex: 'activeTime',
      render: (text, record, index) => {
        return timestampToTime(record.activeTime);
      }
    },
    {
      title: '结束时间',
      dataIndex: 'endTime',
      render: (text, record, index) => {
        return timestampToTime(record.endTime);
      }
    },
    {
      title: '考试时间',
      dataIndex: 'examTime',
      render: (text, record, index) => {
        return timestampToTime(record.examTime);
      }
    }];
    //table 输出列定义
    columnsExam= [
      {
        title: '参考考季',
        fixed: 'center',
        dataIndex: 'examBatchName'
      },
      {
        title: '参考日期',
        dataIndex: 'startDate',
        render: (text, record, index) => {
          return timestampToTime(record.startDate);
        }
      },
      {
        title: '分数',
        dataIndex: 'score'
      },
      {
        title: '通过情况',
        dataIndex: 'state',
        render: (text, record, index) => {
          return record.state == 1 ? '通过':'未通过';
        }
      },
      {
        title: '录入人',
        dataIndex: 'createUserName'
      },
      {
        title: '录入日期',
        dataIndex: 'createDate',
        render: (text, record, index) => {
          return timestampToTime(record.createDate);
        }
      }];

    render() {
        let title = this.getTitle();
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
            switch (this.props.editMode) {
                case "View":
                    block_content = (
                        <Form>
                            <Row gutter={24}>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="学生姓名">
                                        {this.state.user.studentName}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem {...searchFormItemLayout} label="性别">
                                        {getDictionaryTitle(this.state.dic_sex, this.state.user.gender)}
                                    </FormItem>
                                </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="证件号">
                                  {this.state.user.certificateNo}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="手机号">
                                  {this.state.user.mobile}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="项目">
                                  {this.state.user.itemName}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="科目">
                                  {this.state.user.name}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="学习情况">
                                  {getDictionaryTitle(this.state.category_state, this.state.user.state)}
                                </FormItem>
                              </Col>
                              <Col span={12}>
                                {/* <FormItem {...searchFormItemLayout} label="是否重修">
                                  {this.state.dataModel.isRestudy == 1 ? '是': '否'}
                                </FormItem> */}
                              </Col>
                            </Row>
                          {this.renderDataTable()}
                        </Form>
                    );
                    break;
            }

        return (
            <div>
                {!this.state.showList && <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                    <div className="dv_split"></div>
                    {block_content}
                    <div className="dv_split"></div>
                </ContentBox>
                }
                {this.state.showList &&
                    <Row>
                        <Col span={24} className="center">
                            <Button onClick={() => {
                                this.setState({ showList: false })
                            }} icon="rollback">返回</Button>
                        </Col>
                    </Row>
                }
            </div>
        );
    }

}

//表单组件 封装
const WrappedManage = Form.create()(Detail);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
      loadDictionary: bindActionCreators(loadDictionary, dispatch),
      queryCourseCategoryStudyInfo: bindActionCreators(queryCourseCategoryStudyInfo, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedManage);
