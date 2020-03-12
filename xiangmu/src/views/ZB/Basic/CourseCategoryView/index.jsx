import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Radio } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
import { searchFormItemLayout, searchFormItemLayout24 } from '@/utils/componentExt';
const FormItem = Form.Item;
const { TextArea } = Input;
const RadioGroup = Radio.Group;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class CourseCategoryView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
    }
    onCancel = () => {
        this.props.viewCallback();
    }
    onSubmit = () => {
        //表单验证后，合并数据提交
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({ loading: true });
                setTimeout(() => {
                    this.setState({ loading: false });
                }, 3000);//合并保存数据
                this.props.viewCallback({ courseCategoryId: this.state.dataModel.courseCategoryId, ...values });//合并保存数据
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}科目`;
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
                                    label="科目标识"
                                >
                                    {getFieldDecorator('name', {
                                        initialValue: this.state.dataModel.name,
                                        rules: [{
                                            required: true, message: '请输入科目标识!',
                                        }],
                                    })(
                                        <Input placeholder='请输入科目标识' />
                                        )}
                                </FormItem>
                            </Col>
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
                                        <SelectItem scope='all' hideAll={false} />
                                        )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="科目名称"
                                >
                                    {getFieldDecorator('courseCategoryFullname', {
                                        initialValue: this.state.dataModel.courseCategoryFullname,
                                        rules: [{
                                            required: true, message: '请输入科目名称!',
                                        }],
                                    })(
                                        <Input placeholder='请输入科目名称' />
                                        )}
                                </FormItem>


                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="科目关键词"
                                >
                                    {getFieldDecorator('metaKeywords', { initialValue: this.state.dataModel.metaKeywords })(
                                        <Input placeholder='请输入科目关键词' />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="状态"
                                >
                                    {getFieldDecorator('courseCategoryStatus', { initialValue: dataBind(this.state.dataModel.courseCategoryStatus) })(
                                        <Select>
                                            <Option value=''>--请选择状态--</Option>
                                            {this.props.dic_Status.map((item, index) => {
                                                return <Option value={item.value} key={index}>{item.title}</Option>
                                            })}
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            {
                                this.props.editMode == 'Edit' && <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="是否核心科目">
                                  {getFieldDecorator('isMain', {
                                    initialValue: this.state.dataModel.isMain?'1':'0',
                                    rules: [{
                                        required: true, message: '请选择核心科目!',
                                    }],
                                  })(
                                    <RadioGroup value={this.state.dataModel.isMain} hasFeedback>
                                      {this.props.dic_YesNo.map((item, index) => {
                                        return <Radio value={item.value} key={index}>{item.title}</Radio>
                                      })}
                                    </RadioGroup>
                                    )}
                                </FormItem>
                              </Col>
                            }

                            {
                                this.props.editMode == 'Create' && <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="是否核心科目">
                                  {getFieldDecorator('isMain', {
                                    initialValue: '1',
                                    rules: [{
                                        required: true, message: '请选择核心科目!',
                                    }],
                                  })(
                                    <RadioGroup value={this.state.dataModel.isMain} hasFeedback>
                                      {this.props.dic_YesNo.map((item, index) => {
                                        return <Radio value={item.value} key={index}>{item.title}</Radio>
                                      })}
                                    </RadioGroup>
                                    )}
                                </FormItem>
                              </Col>
                            }
                            
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="科目描述"
                                >
                                    {getFieldDecorator('metaDescription', { initialValue: this.state.dataModel.metaDescription })(
                                        <TextArea 　placeholder='请输入科目描述' rows={4} />
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

const WrappedCourseCategoryView = Form.create()(CourseCategoryView);
export default WrappedCourseCategoryView;
