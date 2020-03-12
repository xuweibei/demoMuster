import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { message, Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, InputNumber } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind, timestampToTime } from '@/utils';
import { getRoleFunList, getFunctionList } from '@/actions/admin';
import { searchFormItemLayout,searchFormItemLayout24} from '@/utils/componentExt';
import ContentBox from '@/components/ContentBox';

const FormItem = Form.Item;
const TreeNode = Tree.TreeNode;
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
class HomeView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel || {},//数据模型
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
                this.props.viewCallback({ ...this.state.dataModel, ...values });//合并保存数据
            }
        });
    }
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}首页模块`;
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
                        <FormItem
                            {...searchFormItemLayout}
                            label='功能模块名称'
                        >
                            {getFieldDecorator('moduleName', {
                                initialValue: this.state.dataModel.moduleName,
                                rules: [{
                                    required: true, message: `请输入功能模块名称!`,
                                }],
                            })(
                                <Input placeholder='请输入功能模块名称'/>
                                )}
                        </FormItem>
                        <FormItem {...searchFormItemLayout} label={'所属区域'} >
                            {getFieldDecorator('moduleType', { 
                                initialValue: dataBind(this.state.dataModel.moduleType),
                                rules: [{
                                    required: true, message: `请选择所属区域!`,
                                }],
                            })(
                              <Select>
                                  <Option value='' key=''>--请选择--</Option>
                                  <Option value='1' key='1'>总部</Option>
                                  <Option value='2' key='2'>大区</Option>
                                  <Option value='3' key='3'>分部</Option>
                              </Select>
                            )}
                        </FormItem>
                        <FormItem {...searchFormItemLayout} label={'模块路径'} >
                            {getFieldDecorator('moduleUrl', { 
                                initialValue: this.state.dataModel.moduleUrl,
                                rules: [{
                                    required: true, message: `请输入模块路径!`,
                                }],
                            })(
                              <Input placeholder='请输入模块路径'/>
                            )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="显示顺序"
                        >
                            {getFieldDecorator('orderNo', {
                                initialValue: this.state.dataModel.orderNo,
                                rules: [{
                                    required: true, message: '请输入显示顺序!',
                                }],
                            })(
                                <InputNumber min={1} max={500} />
                                )}
                        </FormItem>
                        <FormItem
                            {...searchFormItemLayout}
                            label="状态"
                        >
                            {getFieldDecorator('state', { 
                                initialValue: dataBind(this.state.dataModel.state),
                                rules: [{
                                    required: true, message: `请选择状态!`,
                                }],
                             })(
                                <Select>
                                    {this.props.dic_Status.map((item, index) => {
                                        return <Option value={item.value} key={index}>{item.title}</Option>
                                    })}
                                </Select>
                            )}
                        </FormItem>
                        {/* {this.renderBtnControl()} */}
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
            // <Card title={title} extra={<a onClick={() => { this.onCancel() }}><Icon type="rollback" />返回列表</a>}>
            //     {block_editModeView}
            // </Card>

        );
    }
}

const WrappedHomeView = Form.create()(HomeView);

export default WrappedHomeView;
