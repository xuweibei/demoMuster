import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Form,Button,Select,Row,Col,Input, message } from 'antd';
const FormItem = Form.Item;
const { TextArea } = Input;
import ContentBox from '@/components/ContentBox';
import { loadBizDictionary,searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';
import { timestampToTime,dataBind } from '@/utils';
import { selectAttendanceTeacher } from '@/actions/base';

const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

//基本字典接口方法引入
import { loadDictionary } from '@/actions/dic';

class Teacher extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            loading:false,
            pagingSearch:{
                item:''
            },
            dataModal:props.currentDataModel
        }
        this.loadBizDictionary = loadBizDictionary.bind(this);
    }
    componentWillMount(){
        this.loadBizDictionary(['attend_status']); 
    }
    onSubmit = () => {
        this.props.form.validateFields((err, values) => {
                if (!err) { 
                    values.teacherId = this.state.dataModal.teacherId;
                    values.courseArrangeId = this.state.dataModal.courseArrangeId;
                    values.courseArrangeDetailId = this.state.dataModal.courseArrangeDetailId;
                    values.attendDate = timestampToTime(this.state.dataModal.courseDate); 
                    this.props.selectAttendanceTeacher(values).payload.promise.then((response) => {
                            let data = response.payload.data; 
                            if(data.state == 'success'){
                                message.success('编辑成功')
                                this.props.viewCallback(true);
                            }else{
                                message.error(data.error)
                            }
                        }
                    )
                }
            }
        )
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    renderBtnControl = () => {
        return <FormItem
            className='btnControl'
            {...btnformItemLayout}
        >
            <Button type='primary' loading={this.state.loading} icon='save' onClick = {this.onSubmit}>确定</Button><span className='split_button'></span><Button icon="rollback" onClick={this.onCancel}>取消</Button>
        </FormItem>
    }
    render(){ 
        const { getFieldDecorator } = this.props.form;
        return <div>
            <ContentBox titleName={'讲师考勤情况编辑'} bottomButton = {this.renderBtnControl()}>
                <Form
                    className='search-form'
                >
                    <Row
                        justify = 'center'
                        gutter = {24}
                        align = "middle"
                        type = "flex"
                    >
                        <Col span={12}>
                            <FormItem
                                {...searchFormItemLayout} 
                                label='课程名称'
                            >
                                {
                                    this.state.dataModal.courseplanName
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}> 
                            <FormItem
                                {...searchFormItemLayout} 
                                label='教学点'
                            >
                                {
                                    this.state.dataModal.teacheCenterName
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}> 
                            <FormItem
                                {...searchFormItemLayout} 
                                label='科目'
                            >
                                {
                                    this.state.dataModal.courseCategoryName
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}> 
                            <FormItem
                                {...searchFormItemLayout} 
                                label='课程阶段'
                            >
                                {
                                    this.state.dataModal.itemStageName
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}> 
                            <FormItem
                                {...searchFormItemLayout} 
                                label='上课日期'
                            >
                                {
                                    timestampToTime(this.state.dataModal.courseDate)
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}> 
                            <FormItem
                                {...searchFormItemLayout} 
                                label='上课时段'
                            >
                                {
                                    this.state.dataModal.classTime
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}> 
                            <FormItem
                                {...searchFormItemLayout} 
                                label='课时'
                            >
                                {
                                    this.state.dataModal.classHour
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}> 
                            <FormItem
                                {...searchFormItemLayout} 
                                label='讲师姓名'
                            >
                                {
                                    this.state.dataModal.teacherName
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}> 
                            <FormItem
                                {...searchFormItemLayout} 
                                label='所属城市'
                            >
                                {
                                    this.state.dataModal.areaName
                                }
                            </FormItem>
                        </Col>
                        <Col span={12}> 
                            <FormItem
                                {...searchFormItemLayout} 
                                label='考勤情况'
                            >
                               {getFieldDecorator('attendStatus', {
                                    initialValue: dataBind(this.state.dataModal.attendStatus?this.state.dataModal.attendStatus:'')
                                })(
                                    <Select>
                                        <Option value=''>全部</Option>
                                        {this.state.attend_status.filter(item=>item.value !=5 ).map(item=>{
                                            return <Option value={item.value}>{item.title}</Option>
                                        })}
                                    </Select>
                                )}
                            </FormItem>
                        </Col>
                        <Col span={24}>
                            <FormItem
                                {...searchFormItemLayout24} 
                                label='考勤备注'
                            >
                                {getFieldDecorator('remark', {
                                    initialValue: this.state.dataModal.remark
                                })(
                                    <TextArea />
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </ContentBox>
        </div>
    }
}

const WrappedCourseManage = Form.create()(Teacher);


const mapStateToProps = (state) => {
    let { Dictionarys } = state.dic;
    return { Dictionarys };
}

function mapDispatchToProps(dispatch){
    return {
        //基本字典接口
        loadDictionary: bindActionCreators(loadDictionary, dispatch),
        selectAttendanceTeacher:bindActionCreators(selectAttendanceTeacher,dispatch)
        
    }
}

export default connect(mapStateToProps,mapDispatchToProps)(WrappedCourseManage);