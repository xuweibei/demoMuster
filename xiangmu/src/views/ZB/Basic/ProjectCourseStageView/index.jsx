import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Radio, Button, Icon, Table, Pagination, Tree, Card } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import { searchFormItemLayout } from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
const FormItem = Form.Item;
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
class ProjectCourseStageView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
        };
    }
    componentWillMount() {
        
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
                if (this.props.editMode == 'Edit') {
                    this.props.viewCallback({itemStageId: this.state.dataModel.itemStageId, ...values });//合并保存数据
                } else {
                    this.props.viewCallback({ ...values });//合并保存数据
                }
                
            }
        });
    }

    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}项目课程阶段`;
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
                    <Form>
                        <Row gutter={24}>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="项目" >
                                    {getFieldDecorator('itemId', { 
                                        initialValue: this.state.dataModel.itemId?this.state.dataModel.itemId:'',
                                        rules: [{
                                            required: true, message: '请选择具体项目名称!',
                                        }]
                                    })(
                                        <SelectItem scope='my' hideAll={true}/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="课程阶段"
                                >
                                    {getFieldDecorator('itemStageName', { 
                                        initialValue: this.state.dataModel.itemStageName,
                                        rules: [{
                                            required: true, message: '请输入课程阶段!',
                                        }],
                                    })(
                                        <Input  placeholder="请输入课程阶段"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="是否结课阶段">
                                    {getFieldDecorator('isFinal', {
                                        initialValue: dataBind(this.state.dataModel.isFinal),
                                        rules: [{
                                            required: true, message: '请选择是否结课阶段!',
                                        }]
                                    })(
                                    <RadioGroup hasFeedback>
                                        {this.props.dic_YesNo.map((item, index) => { 
                                        return <Radio value={item.value} key={index}>{item.title}</Radio>
                                        })}
                                    </RadioGroup>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem {...searchFormItemLayout} label="状态">
                                {getFieldDecorator('state', {
                                    initialValue: dataBind(this.state.dataModel.state),
                                    rules: [{
                                        required: true, message: '请选择状态!',
                                    }]
                                })(
                                    <RadioGroup value={dataBind(this.state.dataModel.state)} hasFeedback>
                                    {this.props.dic_Status.map((item, index) => {
                                        return <Radio value={item.value} key={index}>{item.title}</Radio>
                                    })}
                                    </RadioGroup>
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

const WrappedProjectCourseStageView = Form.create()(ProjectCourseStageView);
export default WrappedProjectCourseStageView;
