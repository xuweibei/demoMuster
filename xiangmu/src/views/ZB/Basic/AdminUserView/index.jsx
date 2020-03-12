import React from 'react';
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { Modal, Form, Row, Col, Input, Select, Button, Icon, Table, Pagination, Tree, Card, Checkbox } from 'antd';

import { getDictionaryTitle, getViewEditModeTitle, dataBind } from '@/utils';
import ContentBox from '@/components/ContentBox';
import SelectItem from '@/components/BizSelect/SelectItem';
//业务接口方法引入
import { searchFormItemLayout,searchFormItemLayout24 } from '@/utils/componentExt';

const FormItem = Form.Item;
const { TextArea } = Input;
const btnformItemLayout = {
    wrapperCol: { span: 24 },
};

const CheckboxGroup = Checkbox.Group;
/*
必要属性输入
editMode [Create/Edit/View/Delete]
currentDataModel [数据模型]
viewCallback [回调]
*/
class AdminUserView extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            dataModel: props.currentDataModel,//数据模型
            dic_Items: [],//项目字典
            itemIds: [],//选中的项目
            indeterminate: true,
            checkAll: false,
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
               
                this.props.viewCallback({ userIds: this.state.dataModel.userIds.join(','),...values,itemIds: Array.isArray(values.itemIds)?values.itemIds.join(','):values.itemIds });//合并保存数据
            }
        });
    }
   
    
    //标题
    getTitle() {
        let op = getViewEditModeTitle(this.props.editMode);
        return `${op}用户负责项目管理`;
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
        JSON.stringify(this.state.dataModel)
        switch (this.props.editMode) {
            case "Create":
            case "Edit":
                block_content = (
                    <Form >
                        <Row>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="姓名"
                                >  
                                  {/* 查找批量选择的人的姓名 */}
                                    {this.state.dataModel.userIds.map((item) => {
                                        let userInfo = this.state.dataModel.data.find(a => a.adminUserId == item);
                                        return userInfo.user.realName;
                                    }).join(' , ')
                                    }
                                </FormItem>

                            </Col>
                        </Row>
                        <Row gutter={24}>
                            <Col span={24}>
                                <FormItem
                                    {...searchFormItemLayout}
                                    label="选择负责项目"
                                >
                                    {getFieldDecorator('itemIds', {
                                        initialValue: this.state.dataModel.itemList.map(a => a.itemId.toString()),
                                    })(
                                          <SelectItem scope='all' hideAll={false} showCheckBox={true} />
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

const WrappedAdminUserView = Form.create()(AdminUserView);

const mapStateToProps = (state) => {
    return {};
};

function mapDispatchToProps(dispatch) {
    return {
       
    };
}
//redux 组件 封装
export default connect(mapStateToProps, mapDispatchToProps)(WrappedAdminUserView);
