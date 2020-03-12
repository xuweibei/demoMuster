import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import SelectItemCourseCategory from '@/components/BizSelect/SelectItemCourseCategory';
import PicZipUploader from '@/components/PicZipUploader';
import {
    searchFormItemLayout, searchFormItemLayout24,
} from '@/utils/componentExt';
//业务接口方法引入
import { getCourseCategoryList } from '@/actions/base';
import { env } from '@/api/env';

const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class CourseView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            dic_courseCategory: [],//科目字典
            isUpload: true
        };
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {

                if(!this.state.isUpload){
                    message.error('请等待文件上传完成后再试！');
                    return;
                }

                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({ courseId: this.state.dataModel.courseId, ...values });//合并保存数据
            }
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}课程`;
    }
    onUploadFile = (flag) => {
        this.setState({
            isUpload: flag
        })
      }
    //表单按钮处理
    renderBtnControl() {
        if (this.props.editMode != 'View') {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button type="primary" loading={this.state.loading} icon="save" onClick={this.onSubmit}>{getViewEditModeTitle(this.props.editMode)}</Button><span className="split_button"></span><Button icon="rollback" onClick={this.onCancel} >取消</Button>
            </FormItem>
        }
        else {
            return <FormItem
                className='btnControl'
                {...btnformItemLayout}
            >
                <Button onClick={this.onCancel} icon="rollback">返回</Button>
            </FormItem>
        }
    }
    //多种模式视图处理
    renderEditModeOfView() {
        let block_content = <div></div>
        const { getFieldDecorator } = this.props.form;
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form >
                        <Row gutter={24}>

                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="所属项目"
                                >
                                    {getFieldDecorator('itemId', {
                                        initialValue: dataBind(this.state.dataModel.itemId),
                                        rules: [{
                                            required: true, message: '请选择所属项目!',
                                        }],
                                    })(
                                        <SelectItem
                                            scope={'all'}
                                            hideAll={true}
                                            onSelectChange={(value) => {
                                                this.state.dataModel.courseCategoryId = '';
                                                this.state.dataModel.itemId = value;
                                                this.setState({ dataModel: this.state.dataModel });
                                                setTimeout(() => {
                                                    {/* 重新重置才能绑定这个科目值 */ }
                                                    this.props.form.resetFields(['courseCategoryId']);
                                                }, 500);
                                            }} />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="所属科目"
                                >
                                    {getFieldDecorator('courseCategoryId', {
                                        initialValue: dataBind(this.state.dataModel.courseCategoryId),
                                        rules: [{
                                            required: true, message: '请选择所属科目!',
                                        }],
                                    })(
                                        <SelectItemCourseCategory itemId={this.state.dataModel.itemId} hideAll={true} />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="课程名称"
                                >
                                    {getFieldDecorator('courseName', {
                                        initialValue: this.state.dataModel.courseName,
                                        rules: [{
                                            required: true, message: '请输入课程名称!',
                                        }],
                                    })(
                                        <Input placeholder='课程名称' />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="授课类型"
                                >
                                    {getFieldDecorator('courseType', {
                                        initialValue: dataBind(this.state.dataModel.courseType),
                                        rules: [{
                                            required: true, message: '请选择授课类型!',
                                        }],
                                    })(
                                        <Select>
                                            <Option value=''>--请选择授课类型--</Option>
                                            {this.props.coursetype.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>

                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="课程来源"
                                >
                                    {getFieldDecorator('courseSource', {
                                        initialValue: dataBind(this.state.dataModel.courseSource),
                                        rules: [{
                                            required: true, message: '请选择课程来源!',
                                        }],
                                    })(
                                        <Select>
                                            <Option value=''>--请选择课程来源--</Option>
                                            {this.props.coursesource.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>

                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="状态"
                                >
                                    {getFieldDecorator('courseStatus', {
                                        initialValue: dataBind(this.state.dataModel.courseStatus),
                                        rules: [{
                                            required: true, message: '请选择状态!',
                                        }],
                                    })(
                                        <Select>
                                            <Option value=''>--请选择状态--</Option>
                                            {this.props.dic_Status.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="是否为公开课"
                                >
                                    {getFieldDecorator('isPublic', {
                                        initialValue: dataBind(this.state.dataModel.isPublic),
                                        rules: [{
                                            required: true, message: '请选择是否为公开课!',
                                        }],
                                    })(
                                        <Select>
                                             <Option value=''>--请选择是否为公开课--</Option>
                                            {this.props.dic_YesNo.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={24}></Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout}
                                    label='课程封面图'
                                    extra={this.state.dataModel.originalPic && <a href={env.serverURL+this.state.dataModel.originalPic} target='_Blank'>查看已上传的课程封面图</a>}>
                                    {getFieldDecorator('originalPic', {
                                      initialValue: dataBind(this.state.dataModel.originalPic)
                                    })(
                                      <PicZipUploader type="pic" onUploadFile={this.onUploadFile}/>
                                    )}
                                    <p style={{paddingTop:10}}>请上传400px*216px的图片</p>
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="备注"
                                >
                                    {getFieldDecorator('remark', { initialValue: this.state.dataModel.remark })(
                                        <TextArea placeholder='请输入备注' rows={4} />
                                    )}
                                </FormItem>
                            </Col>
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
        return (
            <ContentBox titleName={title} bottomButton={this.renderBtnControl()}>
                <div className="dv_split"></div>
                {block_editModeView}
                <div className="dv_split"></div>
            </ContentBox>
        );
    }
}

const WrappedCourseView = Form.create()(CourseView);

const mapStateToProps = (state) => {
    return {};
};

function mapDispatchToProps(dispatch) {
    return {
        getCourseCategoryList: bindActionCreators(getCourseCategoryList, dispatch),
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedCourseView);
