
import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Modal, Form, Row, Col, Table, Input, Select, Button, Icon, DatePicker, InputNumber, Radio, message, Spin } from 'antd';
const Option = Select.Option;
import moment from 'moment';
import ContentBox from '@/components/ContentBox';
import { env } from '@/api/env';
const FormItem = Form.Item;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

import { getViewEditModeTitle, dataBind, timestampToTime, formatMoney, getDictionaryTitle, formatMoment } from '@/utils';
const dateFormat = 'YYYY-MM-DD';

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';
//组件实例模板方法引入
import { searchFormItemLayout, searchFormItemLayout24, loadBizDictionary, onSearch, onPageIndexChange, onShowSizeChange, onToggleSearchOption, renderSearchTopButtons, renderSearchBottomButtons } from '@/utils/componentExt';

import { getCourseList } from '@/actions/base';
import { coursesversionlist, getPlanByCourseId, getZBTeacherSelectList, classInfoQueryById } from '@/actions/teaching';

class ClassManageView extends React.Component {
    constructor(props) {
        super(props);
        //扩展方法用于本组件实例
        this.loadBizDictionary = loadBizDictionary.bind(this);

        this.state = {
            dataModel: props.currentDataModel || {courseCategoryId:'',isPublic:0},//数据模型
            data: [],
              isUpload: true,
            classCourseList: [],
            courseVersionList: [],
            coursePlanList: [],
            teachList: [],
            value: [],
            fetching: false,
            teachList2: [],
            value2: [],
            fetching2: false,
            assistants: [],
            lecturers: []
        };
    }

    componentWillMount() {

        this.fetch();
        //获取课程列表
        this.getCourseList();
        
        
    }

    fetch(params = {}) {
        this.setState({ loading: true });
        this.props.classInfoQueryById({classId:this.state.dataModel.classId}).payload.promise.then((response) => {
          let data = response.payload.data;
          if (data.state === 'success') {
            this.setState({
              dataModel: data.data,
              loading: false
            })

            if(data.data.versionId){
                this.getCourseVersion();
            }
            if(data.data.planId){
                this.getCoursePlan();
            }

            //处理讲师和助教数据
            if(data.data.lecturerIds){
                let lecturerIdArr = data.data.lecturerIds.split(',');
                let lecturerNameArr = data.data.lecturerNames.split(',');
                // let assistantIdArr = data.data.assistantIds.split(',');
                // let assistantNameArr = data.data.assistantNames.split(',');
                let lecturers = [],assistants = [];
                for(var i=0;i<lecturerIdArr.length;i++){
                    lecturers.push({key:lecturerIdArr[i],label:lecturerNameArr[i]});
                }
                // for(var i=0;i<assistantIdArr.length;i++){
                //     assistants.push({key:assistantIdArr[i],label:assistantNameArr[i]});
                // }

                this.setState({
                    lecturers: lecturers,
                    // assistants: assistants
                })
            }

            

          }
          else {
            this.setState({ loading: false })
            message.error(data.message);
          }
        })
      }

    onCancel = () => {
        //如果有修改，则返回时强制刷新列表
        this.props.viewCallback();
    }
    onSubmit = () => {

        var that = this;
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.props.setSubmitLoading(true);
                
                if(this.state.dataModel.classId) values.classId = this.state.dataModel.classId;

                let lecturerIds = [],assistantIds = [];

                values.lecturerIds.map((item) => {
                    lecturerIds.push(item.key);
                })

                // values.assistantIds.map((item) => {
                //     assistantIds.push(item.key);
                // })

                values.lecturerIds = lecturerIds.join(',');
                // values.assistantIds = assistantIds.join(',');

                values.versionNameCache = this.state.dataModel.versionNameCache;
                values.planNameCache = this.state.dataModel.planNameCache;

                that.props.viewCallback(values);

            }
        });
    }

    //标题
    getTitle() {
        
        return `设置课程`;
        
    }
    //表单按钮处理
    renderBtnControl() {
        
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
            span={24}
        >
            <Button type="primary" loading={this.props.submitLoading} icon="save" onClick={this.onSubmit}>确定</Button>
            <span className="split_button"></span>
            <Button icon="rollback" onClick={this.onCancel} style={{ marginLeft: 8 }} >取消</Button>
        </FormItem>

    }

    

  onUploadFile = (flag) => {
    this.setState({
        isUpload: flag
    })
  }

  //获取课程列表
  getCourseList = () => {
      //courseType:4 //优播课(翻转课堂)
      //本班级对应项目科目的优播课
    this.props.getCourseList({itemId:this.state.dataModel.itemId,courseCategoryId:this.state.dataModel.courseCategoryId,courseType:4}).payload.promise.then((response) => {
      let data = response.payload.data;
      if (data.state === 'success') {
        this.setState({
          classCourseList:data.data,
        })
      }
      else {
        message.error(data.message);
      }
    })
  }
  //获取版本列表
  getCourseVersion = () => {
      //versionId:'ff8080814a04df96014a3d8e4f6a067a'
      if(this.state.dataModel.courseId){
        this.props.coursesversionlist({versionId:this.state.dataModel.courseId}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {

            this.setState({
                courseVersionList:data.data,
            })
            }
            else {
                message.error(data.message);
            }
        })
      }
        
    }
     //获取计划列表
     getCoursePlan = () => {
         //planType:1//教学计划
         if(this.state.dataModel.versionId){
            this.props.getPlanByCourseId({courseId:this.state.dataModel.versionId,planType:1}).payload.promise.then((response) => {
                let data = response.payload.data;
                if (data.state === 'success') {
                this.setState({
                    coursePlanList:data.data,
                })
                }
                else {
                message.error(data.message);
                }
            })
         }
        
    }
    //模糊查询教师列表
    getTearchList = (value) => {
        
        this.setState({
            // teachList: [],
            fetching: true,
        });

        this.props.getZBTeacherSelectList({currentPage:1,pageSize:100,realName:value}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {

               let teachList = data.data.map((item) => ({
                    text: `${item.realName} ${item.mobile || ''}`,
                    value: item.teacherId,
                }))

                this.setState({
                    teachList: teachList,
                })
            }
            else {
                message.error(data.message);
            }
        })
    }

    //模糊查询助教列表
    getTearchList2 = (value) => {
        
        this.setState({
            // teachList2: [],
            fetching2: true,
        });

        this.props.getZBTeacherSelectList({currentPage:1,pageSize:100,realName:value}).payload.promise.then((response) => {
            let data = response.payload.data;
            if (data.state === 'success') {

               let teachList2 = data.data.map((item) => ({
                    text: `${item.realName} ${item.mobile || ''}`,
                    value: item.teacherId,
                }))

                this.setState({
                    teachList2: teachList2,
                })
            }
            else {
                message.error(data.message);
            }
        })
    }

    handleChange = (value) => {
        this.setState({
          value,
        //   teachList: [],
          fetching: false,
        });
      }
      handleChange2 = (value2) => {
        this.setState({
          value2,
        //   teachList2: [],
          fetching2: false,
        });
      }

    //多种模式视图处理
    renderEditModeOfView_CourseProduct() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;

        const { fetching, value, fetching2, value2 } = this.state;

        switch (this.props.editMode) {
            case "Course":
                block_content = (
                    <Form>
                        <Row gutter={24}>

                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="选择课程">
                                    {getFieldDecorator('courseId', {
                                        initialValue: dataBind(this.state.dataModel.courseId),
                                        rules: [{
                                            required: true, message: '请选择课程!',
                                        }]
                                    })(
                                    <Select
                                        onChange={(value) => {
                                            this.state.dataModel.courseId = value;
                                            this.state.dataModel.versionId = '';
                                            this.state.dataModel.planId = '';
                                            this.setState({ dataModel: this.state.dataModel });
                                            setTimeout(() =>{
                                                this.props.form.resetFields(['versionId','planId']);
                                                this.getCourseVersion();
                                            },500)
                                        }}>
                                            <Option value="">--请选择--</Option>
                                            {this.state.classCourseList.map((item, index) => {
                                            return <Option value={item.courseId} title={item.courseName} key={index}>{item.courseName}</Option>
                                        })}
                                    </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="选择教学版本">
                                    {getFieldDecorator('versionId', {
                                        initialValue: dataBind(this.state.dataModel.versionId),
                                        rules: [{
                                            required: true, message: '请选择教学版本!',
                                        }]
                                    })(
                                    <Select onChange={(value,option) => {
                                        this.state.dataModel.versionId = value;
                                        this.state.dataModel.versionNameCache = option.props.children;
                                        this.state.dataModel.planId = '';
                                        this.setState({ dataModel: this.state.dataModel });
                                        setTimeout(() =>{
                                            this.props.form.resetFields(['planId']);
                                            this.getCoursePlan();
                                        },500)
                                    }}>
                                        <Option value="">--请选择--</Option>
                                        {this.state.courseVersionList.map((item, index) => {
                                        return <Option value={item.id} title={item.title} key={index}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="选择计划">
                                    {getFieldDecorator('planId', {
                                        initialValue: dataBind(this.state.dataModel.planId),
                                        rules: [{
                                            required: true, message: '请选择计划!',
                                        }]
                                    })(
                                    <Select onChange={(value,option) => {
                                        this.state.dataModel.planId = value;
                                        this.state.dataModel.planNameCache = option.props.children;
                                        this.setState({ dataModel: this.state.dataModel });
                                        
                                    }}>
                                        <Option value="">--请选择--</Option>
                                        {this.state.coursePlanList.map((item, index) => {
                                        return <Option value={item.id} title={item.title} key={index}>{item.title}</Option>
                                        })}
                                    </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={24}></Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="设置讲师">
                                    {getFieldDecorator('lecturerIds', {
                                        initialValue: this.state.lecturers.length ? this.state.lecturers : [],
                                        rules: [{
                                            required: true, message: '请选择讲师!',
                                        }]
                                    })(
                                        <Select
                                            mode="multiple"
                                            labelInValue
                                            value={value}
                                            placeholder="请按模糊搜索"
                                            notFoundContent={fetching ? <Spin size="small" /> : null}
                                            filterOption={false}
                                            onSearch={this.getTearchList}
                                            onChange={this.handleChange}
                                        >
                                            {this.state.teachList.map(d => <Option key={d.value}>{d.text}</Option>)}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            {/* <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="设置助教">
                                    {getFieldDecorator('assistantIds', {
                                        initialValue: this.state.assistants.length ? this.state.assistants : [],
                                        rules: [{
                                            required: true, message: '请选择助教!',
                                        }]
                                    })(
                                        <Select
                                            mode="multiple"
                                            labelInValue
                                            value={value2}
                                            placeholder="请按模糊搜索"
                                            notFoundContent={fetching2 ? <Spin size="small" /> : null}
                                            filterOption={false}
                                            onSearch={this.getTearchList2}
                                            onChange={this.handleChange2}
                                        >
                                            {this.state.teachList2.map(d => <Option key={d.value}>{d.text}</Option>)}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col> */}
                        </Row>
                    </Form>
                );
                break;
            case "View":
                block_content = (
                    <Form>
                        
                    </Form>
                );
                break;
        }
        return block_content;
    }

    render() {
        let title = this.getTitle();
        //对应编辑模式
        let block_editModeView = this.renderEditModeOfView_CourseProduct();
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedView = Form.create()(ClassManageView);

const mapStateToProps = (state) => {
    //基本字典数据
    let { Dictionarys } = state.dic;
    return { Dictionarys };
};

function mapDispatchToProps(dispatch) {
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        getCourseList: bindActionCreators(getCourseList, dispatch),
        getPlanByCourseId: bindActionCreators(getPlanByCourseId, dispatch),
        coursesversionlist: bindActionCreators(coursesversionlist, dispatch),
        getZBTeacherSelectList: bindActionCreators(getZBTeacherSelectList, dispatch),
        classInfoQueryById: bindActionCreators(classInfoQueryById, dispatch),
        
    };
}
export default connect(mapStateToProps, mapDispatchToProps)(WrappedView);
